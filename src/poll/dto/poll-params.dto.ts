import { IsEnum, IsOptional, IsInt, Min } from 'class-validator';
import { Type } from 'class-transformer';
import { PollStatus } from '../entities/poll.entity';

export class PollParamsDto {
  @IsEnum(PollStatus)
  @IsOptional()
  status?: PollStatus;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  page?: number = 1;

  @Type(() => Number)
  @IsInt()
  @Min(1)
  @IsOptional()
  limit?: number = 10;
}
