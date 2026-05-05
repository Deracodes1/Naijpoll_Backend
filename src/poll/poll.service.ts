import {
  Injectable,
  NotFoundException,
  ForbiddenException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';
import { Poll, PollStatus } from './entities/poll.entity';
import { PollOption } from './entities/poll-option.entity';
import { CreatePollDto } from './dto/create-poll.dto';
import { UpdatePollDto } from './dto/update-poll.dto';
import { PollParamsDto } from './entities/poll-params.dto';

export interface PaginatedPolls {
  data: Poll[];
  meta: {
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

@Injectable()
export class PollsService {
  constructor(
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(PollOption)
    private readonly optionRepository: Repository<PollOption>,
    private readonly dataSource: DataSource,
  ) {}
  // i am using a transaction here cos i want a poll creation to succedd or fail totally.
  // an attempt to create a poll must write to both the poll table and poll options table.
  async create(adminId: string, dto: CreatePollDto): Promise<Poll> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Create poll
      const poll = queryRunner.manager.create(Poll, {
        name: dto.name,
        description: dto.description,
        status: dto.status || PollStatus.DRAFT,
        endsAt: dto.endsAt ? new Date(dto.endsAt) : null,
        createdById: adminId,
      });

      const savedPoll = await queryRunner.manager.save(Poll, poll);

      // Create options
      const options = dto.options.map((text) =>
        queryRunner.manager.create(PollOption, {
          optionText: text,
          pollId: savedPoll.id,
        }),
      );

      await queryRunner.manager.save(PollOption, options);

      await queryRunner.commitTransaction();

      // Return with options loaded
      return this.findOne(savedPoll.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Failed to create poll:${err}`);
    } finally {
      await queryRunner.release();
    }
  }

  async findAll(params: PollParamsDto): Promise<PaginatedPolls> {
    const { status, page = 1, limit = 10 } = params;
    const skip = (page - 1) * limit;

    const query = this.pollRepository
      .createQueryBuilder('poll')
      .leftJoinAndSelect('poll.options', 'options')
      .leftJoinAndSelect('poll.createdBy', 'creator')
      .orderBy('poll.createdAt', 'DESC')
      .skip(skip)
      .take(limit);

    if (status) {
      query.andWhere('poll.status = :status', { status });
    }

    const [data, total] = await query.getManyAndCount();

    return {
      data,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    };
  }

  async findOne(id: string): Promise<Poll> {
    const poll = await this.pollRepository.findOne({
      where: { id },
      relations: ['options', 'createdBy'],
    });

    if (!poll) {
      throw new NotFoundException(`Poll with ID ${id} not found`);
    }

    return poll;
  }

  async update(
    adminId: string,
    pollId: string,
    dto: UpdatePollDto,
  ): Promise<Poll> {
    const poll = await this.findOne(pollId);

    // Ownership check
    if (poll.createdById !== adminId) {
      throw new ForbiddenException('You can only edit polls you created');
    }

    // Can't edit if already closed
    if (poll.status === PollStatus.CLOSED) {
      throw new BadRequestException('Cannot edit a closed poll');
    }

    // Can't change endsAt if already passed
    if (dto.endsAt && poll.endsAt && new Date(dto.endsAt) < new Date()) {
      throw new BadRequestException('End date must be in the future');
    }

    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // Update poll fields
      if (dto.name) poll.name = dto.name;
      if (dto.description) poll.description = dto.description;
      if (dto.status) poll.status = dto.status;
      if (dto.endsAt) poll.endsAt = new Date(dto.endsAt);

      await queryRunner.manager.save(Poll, poll);

      // Update options if provided
      if (dto.options && dto.options.length > 0) {
        // Delete old options
        await queryRunner.manager.delete(PollOption, { pollId: poll.id });

        // Create new ones
        const options = dto.options.map((text) =>
          queryRunner.manager.create(PollOption, {
            optionText: text,
            pollId: poll.id,
          }),
        );

        await queryRunner.manager.save(PollOption, options);
      }

      await queryRunner.commitTransaction();
      return this.findOne(poll.id);
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw new BadRequestException(`Failed to update poll: ${err}`);
    } finally {
      await queryRunner.release();
    }
  }

  async close(adminId: string, pollId: string): Promise<Poll> {
    const poll = await this.findOne(pollId);

    if (poll.createdById !== adminId) {
      throw new ForbiddenException('You can only close polls you created');
    }

    if (poll.status === PollStatus.CLOSED) {
      throw new BadRequestException('Poll is already closed');
    }

    poll.status = PollStatus.CLOSED;
    return this.pollRepository.save(poll);
  }

  async remove(adminId: string, pollId: string): Promise<void> {
    const poll = await this.findOne(pollId);

    if (poll.createdById !== adminId) {
      throw new ForbiddenException('You can only delete polls you created');
    }

    await this.pollRepository.remove(poll);
  }
}
