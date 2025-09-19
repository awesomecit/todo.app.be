import { PartialType } from '@nestjs/swagger';
import { CreateDivisionDto } from './create-division.dto';

/**
 * DTO for updating an existing division
 * All fields are optional for partial updates
 */
export class UpdateDivisionDto extends PartialType(CreateDivisionDto) {}
