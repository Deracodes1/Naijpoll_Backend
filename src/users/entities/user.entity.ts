import {
  Column,
  CreateDateColumn,
  Entity,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
  Index,
} from 'typeorm';

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

  // // Helper method to safely return user without sensitive data
  // toJSON() {
  //   delete this.password;
  //   return this;
  // }
}
