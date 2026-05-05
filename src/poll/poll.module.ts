import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PollsService } from './poll.service';
import { PollsController } from './poll.controller';
import { Poll } from './entities/poll.entity';
import { PollOption } from './entities/poll-option.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Poll, PollOption])],
  controllers: [PollsController],
  providers: [PollsService],
  exports: [PollsService],
})
export class PollsModule {}
