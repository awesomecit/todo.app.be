import { ApiProperty } from '@nestjs/swagger';
import { Transform, Type } from 'class-transformer';
import {
  IsBoolean,
  IsIn,
  IsNumber,
  IsOptional,
  IsString,
  IsUUID,
  Max,
  Min,
} from 'class-validator';

/**
 * DTO for querying divisions with pagination and filtering
 */
export class GetDivisionsQueryDto {
  @ApiProperty({
    description: 'Page number',
    example: 1,
    default: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    default: 10,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  @Max(100)
  readonly limit?: number = 10;

  @ApiProperty({
    description: 'Sort field',
    example: 'name',
    default: 'name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['name', 'createdAt', 'level', 'updatedAt'])
  readonly sortBy?: string = 'name';

  @ApiProperty({
    description: 'Sort order',
    example: 'ASC',
    default: 'ASC',
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  readonly sortOrder?: 'ASC' | 'DESC' = 'ASC';

  @ApiProperty({
    description: 'Search term for name or description',
    example: 'marketing',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly search?: string;

  @ApiProperty({
    description: 'Filter by active status',
    example: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  readonly isActive?: boolean;

  @ApiProperty({
    description: 'Filter by hierarchy level',
    example: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  @Min(1)
  readonly level?: number;

  @ApiProperty({
    description: 'Filter by parent division ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  readonly parentId?: string;
}
