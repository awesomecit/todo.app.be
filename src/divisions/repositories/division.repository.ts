import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
import { DivisionQueryDto } from '../dto/division.dto';
import { Division } from '../entities/division.entity';

/**
 * Division Repository - Data access layer for Division entities
 * Provides specialized query methods and business logic integration
 */
@Injectable()
export class DivisionRepository {
  constructor(
    @InjectRepository(Division)
    private readonly repository: Repository<Division>,
  ) {}

  /**
   * Find division by UUID
   */
  async findById(id: string): Promise<Division | null> {
    return this.repository.findOne({
      where: { id },
      relations: ['parent'],
    });
  }

  /**
   * Find division by sequential ID
   */
  async findBySequentialId(sequentialId: number): Promise<Division | null> {
    return this.repository.findOne({
      where: { sequentialId },
      relations: ['parent'],
    });
  }

  /**
   * Find division by business code
   */
  async findByCode(code: string): Promise<Division | null> {
    return this.repository.findOne({
      where: { code: code.toUpperCase() },
    });
  }

  /**
   * Find the default division
   */
  async findDefault(): Promise<Division | null> {
    return this.repository.findOne({
      where: { isDefault: true },
    });
  }

  /**
   * Find all root divisions (no parent)
   */
  async findRootDivisions(): Promise<Division[]> {
    return this.repository.find({
      where: { parentDivisionId: IsNull() },
      order: { code: 'ASC' },
    });
  }

  /**
   * Find child divisions of a parent
   */
  async findChildDivisions(parentId: string): Promise<Division[]> {
    return this.repository.find({
      where: { parentDivisionId: parentId },
      order: { code: 'ASC' },
    });
  }

  /**
   * Find divisions with query filters and pagination
   */
  async findWithQuery(query: DivisionQueryDto): Promise<{
    divisions: Division[];
    total: number;
    page: number;
    limit: number;
  }> {
    const { page = 1, limit = 20, activeOnly = true, ...filters } = query;

    const queryBuilder = this.repository.createQueryBuilder('division');

    // Apply filters
    if (filters.code) {
      queryBuilder.andWhere('UPPER(division.code) LIKE :code', {
        code: `%${filters.code.toUpperCase()}%`,
      });
    }

    if (filters.description) {
      queryBuilder.andWhere('LOWER(division.description) LIKE :description', {
        description: `%${filters.description.toLowerCase()}%`,
      });
    }

    if (filters.parentDivisionId) {
      queryBuilder.andWhere('division.parentDivisionId = :parentId', {
        parentId: filters.parentDivisionId,
      });
    }

    if (typeof filters.isDefault === 'boolean') {
      queryBuilder.andWhere('division.isDefault = :isDefault', {
        isDefault: filters.isDefault,
      });
    }

    // Active only filter (not deleted and within validity)
    if (activeOnly) {
      queryBuilder
        .andWhere('division.deletedAt IS NULL')
        .andWhere('division.validityStart <= :now', { now: new Date() })
        .andWhere(
          '(division.validityEnd IS NULL OR division.validityEnd > :now)',
          { now: new Date() },
        );
    }

    // Pagination
    const offset = (page - 1) * limit;
    queryBuilder.skip(offset).take(limit);

    // Order by code
    queryBuilder.orderBy('division.code', 'ASC');

    // Execute query
    const [divisions, total] = await queryBuilder.getManyAndCount();

    return {
      divisions,
      total,
      page,
      limit,
    };
  }

  /**
   * Save division entity
   */
  async save(division: Division): Promise<Division> {
    return this.repository.save(division);
  }

  /**
   * Create new division
   */
  async create(divisionData: Partial<Division>): Promise<Division> {
    const division = this.repository.create(divisionData);
    return this.repository.save(division);
  }

  /**
   * Update division
   */
  async update(id: string, updateData: Partial<Division>): Promise<Division> {
    await this.repository.update(id, updateData);
    const updatedDivision = await this.findById(id);
    if (!updatedDivision) {
      throw new Error(`Division with ID ${id} not found after update`);
    }
    return updatedDivision;
  }

  /**
   * Soft delete division
   */
  async softDelete(id: string): Promise<boolean> {
    const result = await this.repository.softDelete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Hard delete division (permanent)
   */
  async remove(id: string): Promise<boolean> {
    const result = await this.repository.delete(id);
    return (result.affected ?? 0) > 0;
  }

  /**
   * Check if division has active child divisions
   */
  async hasActiveChildren(parentId: string): Promise<boolean> {
    const count = await this.repository.count({
      where: {
        parentDivisionId: parentId,
        deletedAt: IsNull(),
        validityEnd: IsNull(),
      },
    });
    return count > 0;
  }

  /**
   * Check if code is unique (excluding current division for updates)
   */
  async isCodeUnique(code: string, excludeId?: string): Promise<boolean> {
    const queryBuilder = this.repository
      .createQueryBuilder('division')
      .where('UPPER(division.code) = :code', { code: code.toUpperCase() });

    if (excludeId) {
      queryBuilder.andWhere('division.id != :excludeId', { excludeId });
    }

    const count = await queryBuilder.getCount();
    return count === 0;
  }

  /**
   * Get division hierarchy (breadcrumb path)
   */
  async getHierarchyPath(divisionId: string): Promise<Division[]> {
    const path: Division[] = [];
    let currentId: string | undefined = divisionId;

    while (currentId) {
      const division = await this.repository.findOne({
        where: { id: currentId },
        select: ['id', 'code', 'description', 'parentDivisionId'],
      });

      if (!division) break;

      path.unshift(division);
      currentId = division.parentDivisionId;
    }

    return path;
  }

  /**
   * Get all descendants of a division
   */
  async getDescendants(parentId: string): Promise<Division[]> {
    const descendants: Division[] = [];
    const queue: string[] = [parentId];

    while (queue.length > 0) {
      const currentParentId = queue.shift();
      if (!currentParentId) continue;

      const children = await this.findChildDivisions(currentParentId);

      descendants.push(...children);
      queue.push(...children.map(child => child.id));
    }

    return descendants;
  }

  /**
   * Validate hierarchy doesn't create cycles
   */
  async validateNoCycles(
    divisionId: string,
    newParentId: string,
  ): Promise<boolean> {
    if (divisionId === newParentId) {
      return false; // Self-reference
    }

    const descendants = await this.getDescendants(divisionId);
    return !descendants.some(desc => desc.id === newParentId);
  }

  /**
   * Count active divisions
   */
  async countActive(): Promise<number> {
    return this.repository.count({
      where: {
        deletedAt: IsNull(),
        validityStart: Not(IsNull()), // Must have validity start
        // validityEnd can be null (no end) or in the future
      },
    });
  }

  /**
   * Find divisions by settings criteria
   */
  async findBySettings(
    settingsQuery: Record<string, any>,
  ): Promise<Division[]> {
    const queryBuilder = this.repository.createQueryBuilder('division');

    Object.entries(settingsQuery).forEach(([key, value], index) => {
      queryBuilder.andWhere(`division.settings->>'${key}' = :value${index}`, {
        [`value${index}`]: String(value),
      });
    });

    return queryBuilder.getMany();
  }
}
