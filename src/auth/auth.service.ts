import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../users/users.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

export interface TokenPayload {
  sub: string; // User ID (standard JWT claim)
  email: string; // For display/logging
  role: string; // For role-based access control
}

/**
 * Response structure for successful auth
 */
export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
    private readonly configService: ConfigService,
  ) {}

  /**
   * Register new user and immediately return token
   * This creates a seamless "signup and use" experience
   */
  async register(registerDto: RegisterDto): Promise<AuthResponse> {
    // UsersService handles password hashing and duplicate checks
    const user = await this.usersService.create(registerDto);

    const token = await this.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Validate credentials and issue JWT
   */
  async login(loginDto: LoginDto): Promise<AuthResponse> {
    const user = await this.usersService.validateCredentials(
      loginDto.email,
      loginDto.password,
    );

    if (!user) {
      // Generic error message - don't reveal if email exists or password is wrong
      throw new UnauthorizedException('Invalid credentials');
    }

    const token = await this.generateToken({
      sub: user.id,
      email: user.email,
      role: user.role,
    });

    return {
      access_token: token,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    };
  }

  /**
   * Validate JWT payload - called by JwtStrategy on every protected request
   * Returns user if token is valid, throws if not
   */
  async validateTokenPayload(payload: TokenPayload) {
    // Optional: Check if user still exists and is active
    const user = await this.usersService.findOne(payload.sub);

    if (!user) {
      throw new UnauthorizedException('User no longer exists');
    }

    return user;
  }

  async generateToken(payload: TokenPayload): Promise<string> {
    const secret = this.configService.get<string>('JWT_SECRET');
    if (!secret) throw new Error('JWT_SECRET required');

    return this.jwtService.signAsync(payload, {
      secret,
      expiresIn: '15m', // Hardcode or cast from config
    });
  }
}
