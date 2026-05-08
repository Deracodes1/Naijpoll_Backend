import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { Poll } from 'src/poll/entities/poll.entity';
import { PollOption } from 'src/poll/entities/poll-option.entity';

@Entity()
export class Vote {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  @Index()
  userId!: string;

  @ManyToOne(() => User, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'userId' })
  user!: User;

  @Column()
  @Index()
  pollId!: string;

  @ManyToOne(() => Poll, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'pollId' })
  poll!: Poll;

  @Column()
  @Index()
  optionId!: string;

  @ManyToOne(() => PollOption, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'optionId' })
  option!: PollOption;

  @Column()
  state!: string;

  @CreateDateColumn()
  votedAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
