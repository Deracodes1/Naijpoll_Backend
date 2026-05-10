import {
  Injectable,
  ConflictException,
  NotFoundException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Vote } from './entities/vote.entity';
import { Poll, PollStatus } from 'src/poll/entities/poll.entity';
import { PollOption } from 'src/poll/entities/poll-option.entity';
import { UsersService } from '../users/users.service';

export interface VoteResult {
  optionId: string;
  optionText: string;
  count: number;
}

export interface StateResult {
  state: string;
  totalVotes: number;
  optionBreakdown: {
    optionId: string;
    optionText: string;
    count: number;
  }[];
}
interface RawVoteResult {
  optionId: string;
  optionText: string;
  count: string;
}

interface RawStateResult {
  state: string;
  optionId: string;
  optionText: string;
  count: string;
}
@Injectable()
export class VotesService {
  constructor(
    @InjectRepository(Vote)
    private readonly voteRepository: Repository<Vote>,
    @InjectRepository(Poll)
    private readonly pollRepository: Repository<Poll>,
    @InjectRepository(PollOption)
    private readonly optionRepository: Repository<PollOption>,
    private readonly usersService: UsersService,
  ) {}

  async create(
    userId: string,
    pollId: string,
    optionId: string,
  ): Promise<Vote> {
    const poll = await this.pollRepository.findOne({
      where: { id: pollId },
      relations: ['options'],
    });

    if (!poll) {
      throw new NotFoundException('Poll not found');
    }

    if (poll.status !== PollStatus.ACTIVE) {
      throw new ForbiddenException('Poll is not active');
    }

    const optionExists = poll.options.some((o) => o.id === optionId);
    if (!optionExists) {
      throw new NotFoundException('Option not found for this poll');
    }

    const existingVote = await this.voteRepository.findOne({
      where: { userId, pollId },
    });

    if (existingVote) {
      throw new ConflictException('You have already voted in this poll');
    }

    const user = await this.usersService.findOne(userId);

    const vote = this.voteRepository.create({
      userId,
      pollId,
      optionId,
      state: user.state,
    });

    return this.voteRepository.save(vote);
  }
  async getResults(
    pollId: string,
    stateFilter?: string,
  ): Promise<VoteResult[]> {
    // If filtering by state, check if ANY votes exist from that state first
    if (stateFilter) {
      const stateVoteCount = await this.voteRepository
        .createQueryBuilder('vote')
        .where('vote.pollId = :pollId', { pollId })
        .andWhere('vote.state = :state', { state: stateFilter })
        .getCount();

      if (stateVoteCount === 0) {
        return []; // No participation from this state
      }
    }

    // Get all options for this poll
    const options = await this.optionRepository.find({
      where: { pollId },
      select: ['id', 'optionText'],
    });

    // Get vote counts (filtered by state if provided)
    const voteQuery = this.voteRepository
      .createQueryBuilder('vote')
      .select('vote.optionId', 'optionId')
      .addSelect('COUNT(vote.id)', 'count')
      .where('vote.pollId = :pollId', { pollId })
      .groupBy('vote.optionId');

    if (stateFilter) {
      voteQuery.andWhere('vote.state = :state', { state: stateFilter });
    }

    const voteResults = await voteQuery.getRawMany<RawVoteResult>();
    const voteMap = new Map(
      voteResults.map((v) => [v.optionId, parseInt(v.count, 10)]),
    );

    // Merge: all options shown, zero votes = 0
    return options.map((option) => ({
      optionId: option.id,
      optionText: option.optionText,
      count: voteMap.get(option.id) || 0,
    }));
  }
  async getStateBreakdown(pollId: string): Promise<StateResult[]> {
    const raw = await this.voteRepository
      .createQueryBuilder('vote')
      .select('vote.state', 'state')
      .addSelect('vote.optionId', 'optionId')
      .addSelect('option.optionText', 'optionText')
      .addSelect('COUNT(*)', 'count')
      .innerJoin('vote.option', 'option')
      .where('vote.pollId = :pollId', { pollId })
      .groupBy('vote.state')
      .addGroupBy('vote.optionId')
      .addGroupBy('option.optionText')
      .getRawMany<RawStateResult>();

    const grouped: Record<string, StateResult> = {};

    for (const row of raw) {
      if (!grouped[row.state]) {
        grouped[row.state] = {
          state: row.state,
          totalVotes: 0,
          optionBreakdown: [],
        };
      }

      grouped[row.state].totalVotes += parseInt(row.count, 10);
      grouped[row.state].optionBreakdown.push({
        optionId: row.optionId,
        optionText: row.optionText,
        count: parseInt(row.count, 10),
      });
    }

    return Object.values(grouped);
  }
}
