import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
} from '@nestjs/common';
import {
  ApiOperation,
  ApiParam,
  ApiQuery,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { DivisionsService } from './divisions.service';
import {
  CreateDivisionDto,
  DivisionQueryDto,
  DivisionResponseDto,
  UpdateDivisionDto,
} from './dto/division.dto';

const SYSTEM_USER = 'system-user'; // Placeholder user ID for TDD GREEN phase
const DIVISION_NOT_FOUND_MESSAGE = 'Division not found';
const DIVISION_UUID_DESCRIPTION = 'Division UUID';

/**
 * Controller for Division Management
 *
 * Handles HTTP requests for division CRUD operations and hierarchical queries.
 * Implements comprehensive API documentation and validation.
 *
 * Following TDD approach - minimal implementation to make tests pass (GREEN phase)
 */
@ApiTags('Divisions')
@Controller('divisions')
export class DivisionsController {
  constructor(private readonly divisionsService: DivisionsService) {}

  /**
   * Create a new division
   */
  @Post()
  @ApiOperation({ summary: 'Create a new division' })
  @ApiResponse({ status: 201, description: 'Division created successfully' })
  @ApiResponse({ status: 400, description: 'Invalid input data' })
  async create(
    @Body() createDivisionDto: CreateDivisionDto,
  ): Promise<DivisionResponseDto> {
    // For TDD GREEN phase - use fixed userId until auth is implemented
    const userId = SYSTEM_USER;
    return this.divisionsService.create(createDivisionDto as any, userId);
  }

  /**
   * Get all divisions with pagination and filtering
   */
  @Get()
  @ApiOperation({ summary: 'Get all divisions with pagination and filtering' })
  @ApiResponse({ status: 200, description: 'Divisions retrieved successfully' })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  @ApiQuery({ name: 'search', required: false, type: String })
  @ApiQuery({ name: 'isActive', required: false, type: Boolean })
  async findAll(@Query() query: DivisionQueryDto): Promise<{
    divisions: DivisionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    return this.divisionsService.findAll(query);
  }

  /**
   * Get active divisions count - simplified for TDD GREEN phase
   */
  @Get('active/count')
  @ApiOperation({ summary: 'Get count of active divisions' })
  @ApiResponse({
    status: 200,
    description: 'Active count retrieved successfully',
  })
  async getActiveCount(): Promise<{ count: number }> {
    const result = await this.divisionsService.findAll({ activeOnly: true });
    return { count: result.total };
  }

  /**
   * Get divisions hierarchy - using findRoots for now
   */
  @Get('hierarchy')
  @ApiOperation({ summary: 'Get divisions hierarchy tree' })
  @ApiResponse({ status: 200, description: 'Hierarchy retrieved successfully' })
  async getHierarchy(): Promise<DivisionResponseDto[]> {
    return this.divisionsService.findRoots();
  }

  /**
   * Get division by ID
   */
  @Get(':id')
  @ApiOperation({ summary: 'Get division by ID' })
  @ApiResponse({ status: 200, description: 'Division found' })
  @ApiResponse({ status: 404, description: DIVISION_NOT_FOUND_MESSAGE })
  @ApiParam({ name: 'id', description: DIVISION_UUID_DESCRIPTION })
  async findOne(@Param('id') id: string): Promise<DivisionResponseDto> {
    return this.divisionsService.findOne(id);
  }

  /**
   * Get children divisions by parent ID
   */
  @Get(':id/children')
  @ApiOperation({ summary: 'Get children divisions by parent ID' })
  @ApiResponse({ status: 200, description: 'Children divisions retrieved' })
  @ApiParam({ name: 'id', description: 'Parent division UUID' })
  async findByParent(
    @Param('id') parentId: string,
  ): Promise<DivisionResponseDto[]> {
    return this.divisionsService.findChildren(parentId);
  }

  /**
   * Update division
   */
  @Patch(':id')
  @ApiOperation({ summary: 'Update division' })
  @ApiResponse({ status: 200, description: 'Division updated successfully' })
  @ApiResponse({ status: 404, description: DIVISION_NOT_FOUND_MESSAGE })
  @ApiParam({ name: 'id', description: DIVISION_UUID_DESCRIPTION })
  async update(
    @Param('id') id: string,
    @Body() updateDivisionDto: UpdateDivisionDto,
  ): Promise<DivisionResponseDto> {
    // For TDD GREEN phase - use fixed userId until auth is implemented
    const userId = SYSTEM_USER;
    return this.divisionsService.update(id, updateDivisionDto as any, userId);
  }

  /**
   * Soft delete division
   */
  @Delete(':id')
  @ApiOperation({ summary: 'Soft delete division' })
  @ApiResponse({ status: 200, description: 'Division deleted successfully' })
  @ApiResponse({ status: 404, description: DIVISION_NOT_FOUND_MESSAGE })
  @ApiParam({ name: 'id', description: DIVISION_UUID_DESCRIPTION })
  async remove(@Param('id') id: string): Promise<void> {
    // For TDD GREEN phase - use fixed userId until auth is implemented
    const userId = SYSTEM_USER;
    return this.divisionsService.remove(id, userId);
  }
}
