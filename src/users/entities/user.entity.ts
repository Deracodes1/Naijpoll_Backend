import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn('uuid')
  id!: string;

  @Column()
  name!: string;

  @Column()
  email!: string;

  @Column()
  password!: string;

  @Column()
  state!: string;

  @Column({ default: 'user' })
  role!: string;

  @CreateDateColumn()
  joinedDate!: string;

  @UpdateDateColumn()
  updatedAt!: string;
}
