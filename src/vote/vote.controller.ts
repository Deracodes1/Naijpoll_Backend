import {
  Controller,
  Post,
  Get,
  Param,
  Body,
  Query,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { CreateVoteDto } from './dto/create-vote.dto';
import { JwtAuthGuard } from 'src/Guards/jwt-auth.guard';
import { StateResult, VotesService, VoteResult } from './vote.service';
import { CurrentUser } from 'src/Decorators/current-user.decorator';
import type { AuthUser } from 'src/auth/types/auth-user.type';
import { Vote } from './entities/vote.entity';

@Controller({ path: 'polls/:pollId/votes', version: '1' })
export class VotesController {
  constructor(private readonly votesService: VotesService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.CREATED)
  async create(
    @Param('pollId') pollId: string,
    @Body() dto: CreateVoteDto,
    @CurrentUser() user: AuthUser,
  ): Promise<Vote> {
    return this.votesService.create(user.id, pollId, dto.optionId);
  }

  @Get('results')
  async getResults(
    @Param('pollId') pollId: string,
    @Query('state') state?: string,
  ): Promise<VoteResult[]> {
    return this.votesService.getResults(pollId, state);
  }

  @Get('results/by-state')
  async getStateBreakdown(
    @Param('pollId') pollId: string,
  ): Promise<StateResult[]> {
    return this.votesService.getStateBreakdown(pollId);
  }
}
