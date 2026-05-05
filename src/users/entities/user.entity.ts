import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  OneToMany,
  Index,
} from 'typeorm';
import { Poll } from 'src/poll/entities/poll.entity';
@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column({ unique: true })
  @Index()
  email!: string;

  @Column({ select: false })
  password!: string;

  @Column()
  state!: string;

  @Column({ default: 'user' })
  role!: string;

  @CreateDateColumn()
  joinedDate!: Date;

  @UpdateDateColumn()
  updatedAt!: Date;

  @OneToMany(() => Poll, (poll) => poll.createdBy)
  polls!: Poll[];
}
