import {
  Injectable,
  ConflictException,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from './entities/user.entity';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  // Helper: Strip password from any user object
  private sanitizeUser(user: User): Omit<User, 'password'> {
    const { password: _password, ...sanitized } = user;
    return sanitized;
  }

  // Helper: Strip password from array - note the parentheses around Omit
  private sanitizeUsers(users: User[]): Omit<User, 'password'>[] {
    return users.map((user) => this.sanitizeUser(user));
  }

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    const existingUser = await this.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new ConflictException('Email already registered');
    }

    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);
    const user = this.userRepository.create({
      ...createUserDto,
      password: hashedPassword,
    });

    const savedUser = await this.userRepository.save(user);
    return this.sanitizeUser(savedUser);
  }

  // Fixed: Parentheses around Omit<..., ...>
  async findAll(): Promise<Omit<User, 'password'>[]> {
    const users = await this.userRepository.find();
    return this.sanitizeUsers(users);
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({ where: { id } });
    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
    return this.sanitizeUser(user);
  }

  async findByEmail(
    email: string,
    withPassword: boolean = false,
  ): Promise<User | null> {
    const query = this.userRepository
      .createQueryBuilder('user')
      .where('user.email = :email', { email });

    if (withPassword) {
      query.addSelect('user.password');
    }

    return query.getOne();
  }

  async validateCredentials(
    email: string,
    plainPassword: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.findByEmail(email, true);

    if (!user) {
      return null;
    }

    const isMatch = await bcrypt.compare(plainPassword, user.password);

    if (!isMatch) {
      return null;
    }

    return this.sanitizeUser(user);
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    if (updateUserDto.password) {
      updateUserDto.password = await bcrypt.hash(updateUserDto.password, 10);
    }

    await this.userRepository.update(id, updateUserDto);
    return this.findOne(id);
  }

  async remove(id: string): Promise<void> {
    const result = await this.userRepository.delete(id);
    if (result.affected === 0) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }
  }
}
