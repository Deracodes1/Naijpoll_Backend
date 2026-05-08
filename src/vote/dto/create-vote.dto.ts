import { IsUUID } from 'class-validator';

export class CreateVoteDto {
  @IsUUID()
  optionId!: string;
}
