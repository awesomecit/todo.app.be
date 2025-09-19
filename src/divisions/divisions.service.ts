import {
  BadRequestException,
  ConflictException,
  Injectable,
  NotFoundException,
} from '@nestjs/common';
import { CaseConverter } from '../common/utils/case-converter.util';
import {
  CreateDivisionDto,
  DivisionQueryDto,
  DivisionResponseDto,
  UpdateDivisionDto,
} from './dto/division.dto';
import { Division } from './entities/division.entity';
import { DivisionRepository } from './repositories/division.repository';

/**
 * Divisions Service - Business logic for Division management
 * Note: Uses PLURAL naming convention for NestJS resources
 */
@Injectable()
export class DivisionsService {
  constructor(private readonly divisionRepository: DivisionRepository) {}

  /**
   * Create a new division
   */
  async create(
    createDto: CreateDivisionDto,
    userId: string,
  ): Promise<DivisionResponseDto> {
    await this.validateCreateRequest(createDto);
    const division = this.buildDivisionEntity(createDto, userId);
    const savedDivision = await this.divisionRepository.save(division);
    return this.toResponseDto(savedDivision);
  }

  /**
   * Validate division creation request
   */
  private async validateCreateRequest(
    createDto: CreateDivisionDto,
  ): Promise<void> {
    await this.validateCodeUniqueness(createDto.code);

    if (createDto.parentDivisionId) {
      await this.validateParentDivision(createDto.parentDivisionId);
    }

    if (createDto.isDefault) {
      await this.validateDefaultDivision();
    }
  }

  /**
   * Validate code uniqueness
   */
  private async validateCodeUniqueness(code: string): Promise<void> {
    const existingCode = await this.divisionRepository.findByCode(code);
    if (existingCode) {
      throw new ConflictException(
        `Division with code '${code}' already exists`,
      );
    }
  }

  /**
   * Validate parent division
   */
  private async validateParentDivision(parentId: string): Promise<void> {
    const parentDivision = await this.divisionRepository.findById(parentId);
    if (!parentDivision) {
      throw new NotFoundException(
        `Parent division with ID '${parentId}' not found`,
      );
    }

    if (!parentDivision.canHaveChildren) {
      throw new BadRequestException(
        'Parent division does not allow child divisions',
      );
    }
  }

  /**
   * Validate default division creation
   */
  private async validateDefaultDivision(): Promise<void> {
    const existingDefault = await this.divisionRepository.findDefault();
    if (existingDefault) {
      throw new ConflictException('A default division already exists');
    }
  }

  /**
   * Build division entity from DTO
   */
  private buildDivisionEntity(
    createDto: CreateDivisionDto,
    userId: string,
  ): Division {
    const division = new Division();
    division.code = createDto.code;
    division.description = createDto.description;
    division.parentDivisionId = createDto.parentDivisionId;
    division.isDefault = createDto.isDefault ?? false;
    division.divisionTimezone = createDto.divisionTimezone ?? 'UTC';
    division.settings = createDto.settings ?? {};
    division.createdBy = userId;
    division.updatedBy = userId;
    division.timezone = createDto.divisionTimezone ?? 'UTC';
    division.validityStart = new Date();
    division.validityEnd = null;
    return division;
  }

  /**
   * Find all divisions with optional filtering and pagination
   */
  async findAll(query: DivisionQueryDto): Promise<{
    divisions: DivisionResponseDto[];
    total: number;
    page: number;
    limit: number;
  }> {
    const result = await this.divisionRepository.findWithQuery(query);

    return {
      divisions: result.divisions.map(division => this.toResponseDto(division)),
      total: result.total,
      page: result.page,
      limit: result.limit,
    };
  }

  /**
   * Find division by UUID
   */
  async findOne(id: string): Promise<DivisionResponseDto> {
    const division = await this.divisionRepository.findById(id);
    if (!division) {
      throw new NotFoundException(`Division with ID '${id}' not found`);
    }
    return this.toResponseDto(division);
  }

  /**
   * Find division by sequential ID
   */
  async findBySequentialId(sequentialId: number): Promise<DivisionResponseDto> {
    const division =
      await this.divisionRepository.findBySequentialId(sequentialId);
    if (!division) {
      throw new NotFoundException(
        `Division with sequential ID '${sequentialId}' not found`,
      );
    }
    return this.toResponseDto(division);
  }

  /**
   * Find division by business code
   */
  async findByCode(code: string): Promise<DivisionResponseDto> {
    const division = await this.divisionRepository.findByCode(code);
    if (!division) {
      throw new NotFoundException(`Division with code '${code}' not found`);
    }
    return this.toResponseDto(division);
  }

  /**
   * Get the default division
   */
  async findDefault(): Promise<DivisionResponseDto> {
    const division = await this.divisionRepository.findDefault();
    if (!division) {
      throw new NotFoundException('No default division found');
    }
    return this.toResponseDto(division);
  }

  /**
   * Get root divisions (no parent)
   */
  async findRoots(): Promise<DivisionResponseDto[]> {
    const divisions = await this.divisionRepository.findRootDivisions();
    return divisions.map(division => this.toResponseDto(division));
  }

  /**
   * Get child divisions of a parent
   */
  async findChildren(parentId: string): Promise<DivisionResponseDto[]> {
    // Verify parent exists
    const parent = await this.divisionRepository.findById(parentId);
    if (!parent) {
      throw new NotFoundException(
        `Parent division with ID '${parentId}' not found`,
      );
    }

    const children = await this.divisionRepository.findChildDivisions(parentId);
    return children.map(division => this.toResponseDto(division));
  }

  /**
   * Update division
   */
  async update(
    id: string,
    updateDto: UpdateDivisionDto,
    userId: string,
  ): Promise<DivisionResponseDto> {
    const division = await this.findDivisionForUpdate(id);
    await this.validateUpdateRequest(updateDto, division, id);
    this.applyUpdates(updateDto, division, userId);
    const updatedDivision = await this.divisionRepository.save(division);
    return this.toResponseDto(updatedDivision);
  }

  /**
   * Find division for update
   */
  private async findDivisionForUpdate(id: string): Promise<Division> {
    const division = await this.divisionRepository.findById(id);
    if (!division) {
      throw new NotFoundException(`Division with ID '${id}' not found`);
    }
    return division;
  }

  /**
   * Validate update request
   */
  private async validateUpdateRequest(
    updateDto: UpdateDivisionDto,
    division: Division,
    id: string,
  ): Promise<void> {
    if (updateDto.code && updateDto.code !== division.code) {
      await this.validateCodeUniqueForUpdate(updateDto.code, id);
    }

    if (
      updateDto.parentDivisionId &&
      updateDto.parentDivisionId !== division.parentDivisionId
    ) {
      await this.validateParentForUpdate(updateDto.parentDivisionId, id);
    }
  }

  /**
   * Validate code uniqueness for update
   */
  private async validateCodeUniqueForUpdate(
    code: string,
    excludeId: string,
  ): Promise<void> {
    const isUnique = await this.divisionRepository.isCodeUnique(
      code,
      excludeId,
    );
    if (!isUnique) {
      throw new ConflictException(
        `Division with code '${code}' already exists`,
      );
    }
  }

  /**
   * Validate parent division for update
   */
  private async validateParentForUpdate(
    parentId: string,
    childId: string,
  ): Promise<void> {
    const parentDivision = await this.divisionRepository.findById(parentId);
    if (!parentDivision) {
      throw new NotFoundException(
        `Parent division with ID '${parentId}' not found`,
      );
    }

    const isValid = await this.divisionRepository.validateNoCycles(
      childId,
      parentId,
    );
    if (!isValid) {
      throw new BadRequestException('Cannot create circular hierarchy');
    }

    if (!parentDivision.canHaveChildren) {
      throw new BadRequestException(
        'Parent division does not allow child divisions',
      );
    }
  }

  /**
   * Apply updates to division entity
   */
  private applyUpdates(
    updateDto: UpdateDivisionDto,
    division: Division,
    userId: string,
  ): void {
    if (updateDto.code !== undefined) division.code = updateDto.code;
    if (updateDto.description !== undefined)
      division.description = updateDto.description;
    if (updateDto.parentDivisionId !== undefined)
      division.parentDivisionId = updateDto.parentDivisionId;
    if (updateDto.divisionTimezone !== undefined) {
      division.divisionTimezone = updateDto.divisionTimezone;
      division.timezone = updateDto.divisionTimezone;
    }
    if (updateDto.settings !== undefined)
      division.settings = updateDto.settings;

    division.updatedBy = userId;
    division.updatedAt = new Date();
  }

  /**
   * Soft delete division
   */
  async remove(id: string, userId: string): Promise<void> {
    const division = await this.divisionRepository.findById(id);
    if (!division) {
      throw new NotFoundException(`Division with ID '${id}' not found`);
    }

    // Check if it's the default division
    if (division.isDefault) {
      throw new BadRequestException('Cannot delete the default division');
    }

    // Check if division has active children
    const hasChildren = await this.divisionRepository.hasActiveChildren(id);
    if (hasChildren) {
      throw new BadRequestException(
        'Cannot delete division with active child divisions',
      );
    }

    // Soft delete
    division.deletedAt = new Date();
    division.updatedBy = userId;
    await this.divisionRepository.save(division);
  }

  /**
   * Get division hierarchy path
   */
  async getHierarchyPath(id: string): Promise<DivisionResponseDto[]> {
    const path = await this.divisionRepository.getHierarchyPath(id);
    return path.map(division => this.toResponseDto(division));
  }

  /**
   * Get all descendants of a division
   */
  async getDescendants(id: string): Promise<DivisionResponseDto[]> {
    const descendants = await this.divisionRepository.getDescendants(id);
    return descendants.map(division => this.toResponseDto(division));
  }

  /**
   * Create or get default division
   */
  async ensureDefaultDivision(): Promise<DivisionResponseDto> {
    try {
      return await this.findDefault();
    } catch {
      // Create default division if not exists
      const defaultDivision = Division.createDefault();
      defaultDivision.createdBy = 'SYSTEM';
      defaultDivision.updatedBy = 'SYSTEM';
      defaultDivision.timezone = 'UTC';
      defaultDivision.validityStart = new Date();

      const savedDivision = await this.divisionRepository.save(defaultDivision);
      return this.toResponseDto(savedDivision);
    }
  }

  /**
   * Convert Division entity to Response DTO
   */
  private toResponseDto(division: Division): DivisionResponseDto {
    const dto = new DivisionResponseDto();

    // Use CaseConverter to convert snake_case to camelCase
    const converted = CaseConverter.toCamelCase({
      id: division.id,
      sequential_id: division.sequentialId,
      code: division.code,
      description: division.description,
      is_default: division.isDefault,
      parent_division_id: division.parentDivisionId,
      division_timezone: division.divisionTimezone,
      settings: division.settings,
      version: division.version,
      created_at: division.createdAt,
      updated_at: division.updatedAt,
      created_by: division.createdBy,
      updated_by: division.updatedBy,
      validity_start: division.validityStart,
      validity_end: division.validityEnd,
      timezone: division.timezone,
    });

    // Map converted properties to DTO
    Object.assign(dto, converted);

    // Add computed properties
    dto.displayName = division.displayName;
    dto.isRoot = division.isRoot;

    return dto;
  }

  /**
   * Count active divisions
   */
  async countActive(): Promise<number> {
    return this.divisionRepository.countActive();
  }
}
