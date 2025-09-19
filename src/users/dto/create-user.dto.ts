import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsEmail,
  IsEnum,
  IsNotEmpty,
  IsOptional,
  IsString,
  MaxLength,
  MinLength,
} from 'class-validator';
import { ERROR_MESSAGES } from '../../common/constants/error-messages.constants';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

export class CreateUserDto {
  @ApiProperty({
    description: 'User first name',
    example: 'Mario',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: ERROR_MESSAGES.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.IS_NOT_EMPTY })
  @MinLength(2, { message: ERROR_MESSAGES.MIN_LENGTH })
  @MaxLength(50, { message: ERROR_MESSAGES.MAX_LENGTH })
  @Transform(({ value }) => value?.trim())
  readonly firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Rossi',
    minLength: 2,
    maxLength: 50,
  })
  @IsString({ message: ERROR_MESSAGES.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.IS_NOT_EMPTY })
  @MinLength(2, { message: ERROR_MESSAGES.MIN_LENGTH })
  @MaxLength(50, { message: ERROR_MESSAGES.MAX_LENGTH })
  @Transform(({ value }) => value?.trim())
  readonly lastName: string;

  @ApiProperty({
    description: 'User email address',
    example: 'mario.rossi@example.com',
  })
  @IsEmail({}, { message: ERROR_MESSAGES.IS_EMAIL })
  @IsNotEmpty({ message: ERROR_MESSAGES.IS_NOT_EMPTY })
  @Transform(({ value }) => value?.toLowerCase()?.trim())
  readonly email: string;

  @ApiProperty({
    description: 'User password',
    example: 'SecurePassword123!',
    minLength: 8,
    maxLength: 100,
  })
  @IsString({ message: ERROR_MESSAGES.IS_STRING })
  @IsNotEmpty({ message: ERROR_MESSAGES.IS_NOT_EMPTY })
  @MinLength(8, { message: ERROR_MESSAGES.MIN_LENGTH })
  @MaxLength(100, { message: ERROR_MESSAGES.MAX_LENGTH })
  readonly password: string;

  @ApiPropertyOptional({
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
    example: UserRole.USER,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: ERROR_MESSAGES.IS_ENUM })
  readonly role?: UserRole = UserRole.USER;
}
