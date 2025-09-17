import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsBoolean, IsOptional, IsString, IsUUID } from 'class-validator';

/**
 * DTO for creating a new division
 */
export class CreateDivisionDto {
  @ApiProperty({ description: 'Division name', example: 'Marketing Division' })
  @IsString()
  readonly name: string;

  @ApiProperty({
    description: 'Division description',
    example: 'Handles all marketing activities',
    required: false,
  })
  @IsOptional()
  @IsString()
  readonly description?: string;

  @ApiProperty({
    description: 'Whether the division is active',
    example: true,
    default: true,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => {
    if (value === 'true') return true;
    if (value === 'false') return false;
    return value;
  })
  readonly isActive?: boolean = true;

  @ApiProperty({
    description: 'Parent division ID',
    example: '123e4567-e89b-12d3-a456-426614174000',
    required: false,
  })
  @IsOptional()
  @IsUUID()
  readonly parentId?: string;
}
