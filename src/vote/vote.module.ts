import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { VotesService } from './vote.service';
import { VotesController } from './vote.controller';
import { Vote } from './entities/vote.entity';
import { Poll } from 'src/poll/entities/poll.entity';
import { PollOption } from 'src/poll/entities/poll-option.entity';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [TypeOrmModule.forFeature([Vote, Poll, PollOption]), UsersModule],
  controllers: [VotesController],
  providers: [VotesService],
  exports: [VotesService],
})
export class VotesModule {}
