import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import {
  IsBoolean,
  IsObject,
  IsOptional,
  IsString,
  IsUUID,
  Length,
  Matches,
} from 'class-validator';

// Constants to avoid string duplication
const UUID_VALIDATION_MESSAGE = 'must be a valid UUID';
const PARENT_DIVISION_UUID_MESSAGE = `Parent division ID ${UUID_VALIDATION_MESSAGE}`;
const REQUIRED_FALSE = false;
const PARENT_DIVISION_UUID = 'parent-div-uuid';

/**
 * Base Division DTO - Common fields for Division operations
 */
export class BaseDivisionDto {
  @ApiProperty({
    description: 'Division business code',
    example: 'DIV001',
    minLength: 2,
    maxLength: 20,
  })
  @IsString()
  @Length(2, 20)
  @Transform(({ value }) => value?.toString().trim().toUpperCase())
  code: string;

  @ApiProperty({
    description: 'Division description/name',
    example: 'Main Division',
    minLength: 3,
    maxLength: 100,
  })
  @IsString()
  @Length(3, 100)
  @Transform(({ value }) => value?.toString().trim())
  description: string;

  @ApiProperty({
    description: 'Division timezone',
    example: 'Europe/Rome',
    default: 'UTC',
  })
  @IsOptional()
  @Matches(/^[A-Za-z]+\/[A-Za-z_]+$/, { message: 'Invalid timezone format' })
  @Transform(({ value }) => value || 'UTC')
  divisionTimezone?: string = 'UTC';

  @ApiProperty({
    description: 'Division settings as JSON object',
    example: { theme: 'light', notifications: true },
    required: REQUIRED_FALSE,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

/**
 * Create Division DTO - Used for division creation
 */
export class CreateDivisionDto extends BaseDivisionDto {
  @ApiProperty({
    description: 'Parent division UUID for hierarchical organization',
    example: PARENT_DIVISION_UUID,
    required: REQUIRED_FALSE,
  })
  @IsOptional()
  @IsUUID(4, { message: PARENT_DIVISION_UUID_MESSAGE })
  parentDivisionId?: string;

  @ApiProperty({
    description: 'Indicates if this is the default division',
    example: false,
    default: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isDefault?: boolean = false;
}

/**
 * Update Division DTO - Used for division updates
 * All fields are optional for PATCH operations
 */
export class UpdateDivisionDto {
  @ApiProperty({
    description: 'Division business code',
    example: 'DIV001',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(2, 20)
  @Transform(({ value }) => value?.toString().trim().toUpperCase())
  code?: string;

  @ApiProperty({
    description: 'Division description/name',
    example: 'Updated Division Name',
    required: false,
  })
  @IsOptional()
  @IsString()
  @Length(3, 100)
  @Transform(({ value }) => value?.toString().trim())
  description?: string;

  @ApiProperty({
    description: 'Parent division UUID',
    example: PARENT_DIVISION_UUID,
    required: false,
  })
  @IsOptional()
  @IsUUID(4, { message: PARENT_DIVISION_UUID_MESSAGE })
  parentDivisionId?: string;

  @ApiProperty({
    description: 'Division timezone',
    example: 'America/New_York',
    required: false,
  })
  @IsOptional()
  @Matches(/^[A-Za-z]+\/[A-Za-z_]+$/, { message: 'Invalid timezone format' })
  divisionTimezone?: string;

  @ApiProperty({
    description: 'Division settings object',
    example: { allowSubDivisions: false, maxUsers: 500 },
    required: false,
  })
  @IsOptional()
  @IsObject()
  settings?: Record<string, any>;
}

/**
 * Division Response DTO - Used for API responses
 */
export class DivisionResponseDto extends BaseDivisionDto {
  @ApiProperty({
    description: 'Division UUID (primary key)',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'Sequential division ID',
    example: 1001,
  })
  sequentialId: number;

  @ApiProperty({
    description: 'Indicates if this is the default division',
    example: false,
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Parent division UUID',
    example: PARENT_DIVISION_UUID,
    required: false,
  })
  parentDivisionId?: string;

  @ApiProperty({
    description: 'Division version for optimistic locking',
    example: 1,
  })
  version: number;

  @ApiProperty({
    description: 'Division creation timestamp',
    example: '2024-01-15T10:30:00Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Division last update timestamp',
    example: '2024-01-15T14:20:00Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User ID who created the division',
    example: 'user-uuid',
  })
  createdBy: string;

  @ApiProperty({
    description: 'User ID who last updated the division',
    example: 'user-uuid',
  })
  updatedBy: string;

  @ApiProperty({
    description: 'Division validity start date',
    example: '2024-01-15T00:00:00Z',
  })
  validityStart: Date;

  @ApiProperty({
    description: 'Division validity end date',
    example: '2025-01-15T00:00:00Z',
    required: false,
  })
  validityEnd?: Date;

  @ApiProperty({
    description: 'Timezone context for this record',
    example: 'Europe/Rome',
  })
  timezone: string;

  @ApiProperty({
    description: 'Division display name with code',
    example: '[DIV001] Main Division',
  })
  displayName: string;

  @ApiProperty({
    description: 'Indicates if division is a root division',
    example: true,
  })
  isRoot: boolean;
}

/**
 * Division Query DTO - Used for filtering and searching divisions
 */
export class DivisionQueryDto {
  @ApiProperty({
    description: 'Filter by division code (partial match)',
    example: 'DIV',
    required: false,
  })
  @IsOptional()
  @IsString()
  code?: string;

  @ApiProperty({
    description: 'Filter by division description (partial match)',
    example: 'Main',
    required: false,
  })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({
    description: 'Filter by parent division ID',
    example: PARENT_DIVISION_UUID,
    required: false,
  })
  @IsOptional()
  @IsUUID(4)
  parentDivisionId?: string;

  @ApiProperty({
    description: 'Filter only default divisions',
    example: false,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value === true || value === 'true')
  isDefault?: boolean;

  @ApiProperty({
    description: 'Include only active divisions',
    example: true,
    default: true,
    required: false,
  })
  @IsOptional()
  @IsBoolean()
  @Transform(({ value }) => value !== false && value !== 'false')
  activeOnly?: boolean = true;

  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseInt(value) || 1)
  page?: number = 1;

  @ApiProperty({
    description: 'Items per page for pagination',
    example: 20,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Transform(({ value }) => Math.min(parseInt(value) || 20, 100))
  limit?: number = 20;
}
