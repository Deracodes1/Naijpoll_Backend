import {
  IsEmail,
  IsString,
  MinLength,
  IsOptional,
  IsIn,
} from 'class-validator';

export class CreateUserDto {
  @IsString()
  @MinLength(2)
  name!: string;

  @IsEmail()
  email!: string;

  @IsString()
  @MinLength(8)
  password!: string;

  @IsString()
  @IsOptional()
  state?: string = 'active';

  @IsString()
  @IsOptional()
  @IsIn(['user', 'admin', 'moderator'])
  role?: string = 'user';
}
