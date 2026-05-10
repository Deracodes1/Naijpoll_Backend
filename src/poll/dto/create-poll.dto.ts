import {
  IsString,
  MinLength,
  IsArray,
  ArrayMinSize,
  ArrayMaxSize,
  IsEnum,
  IsOptional,
  IsDateString,
} from 'class-validator';
import { PollStatus } from '../entities/poll.entity';

export class CreatePollDto {
  @IsString()
  @MinLength(3)
  name!: string;

  @IsString()
  @MinLength(10)
  description!: string;

  @IsEnum(PollStatus)
  @IsOptional()
  status?: PollStatus = PollStatus.ACTIVE;

  @IsDateString()
  @IsOptional()
  endsAt?: string;

  @IsArray()
  @ArrayMinSize(2)
  @ArrayMaxSize(4)
  @IsString({ each: true })
  @MinLength(1, { each: true })
  options!: string[];
}
