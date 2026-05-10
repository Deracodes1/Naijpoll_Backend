import {
  Column,
  CreateDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { PollOption } from './poll-option.entity';
import { Vote } from 'src/vote/entities/vote.entity';
export enum PollStatus {
  ACTIVE = 'active',
  DRAFT = 'draft',
  PUBLISHED = 'published',
  CLOSED = 'closed',
}

@Entity()
export class Poll {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ type: 'text' })
  description!: string;

  @Column({
    type: 'enum',
    enum: PollStatus,
    default: PollStatus.ACTIVE,
  })
  status!: PollStatus;

  @Column({ type: 'timestamptz', nullable: true })
  endsAt!: Date | null;

  @Column()
  @Index() // Heavily queried for ownership checks
  createdById!: string;

  @ManyToOne(() => User, (user) => user.polls)
  @JoinColumn({ name: 'createdById' })
  createdBy!: User;

  @OneToMany(() => PollOption, (option) => option.poll, { cascade: true })
  options!: PollOption[];

  @OneToMany(() => Vote, (vote) => vote.poll)
  votes!: Vote[];

  @CreateDateColumn()
  createdAt!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;
}
