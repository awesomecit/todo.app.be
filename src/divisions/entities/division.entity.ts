import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity, Index } from 'typeorm';
import { MasterBaseEntity } from '../../common/entities/master-base.entity';

/**
 * Division Entity - Organizational structure for data separation
 * Extends MasterBaseEntity to inherit business entity capabilities
 *
 * Features:
 * - UUID + Sequential ID for dual identification
 * - Business code and description with uniqueness
 * - Hierarchical organization support (parent-child)
 * - Default division management
 * - Timezone and validity management inherited from base
 */
@Entity('divisions')
@Index('idx_divisions_parent', ['parentDivisionId'])
@Index('idx_divisions_active', ['validityEnd', 'deletedAt'])
export class Division extends MasterBaseEntity {
  @ApiProperty({
    description: 'Indicates if this is the default division for the system',
    example: false,
  })
  @Column({
    type: 'boolean',
    default: false,
    name: 'is_default',
  })
  isDefault: boolean;

  @ApiProperty({
    description: 'Parent division UUID for hierarchical organization',
    example: 'parent-div-uuid',
    required: false,
  })
  @Column({
    type: 'uuid',
    nullable: true,
    name: 'parent_division_id',
  })
  parentDivisionId?: string;

  @ApiProperty({
    description: 'Division timezone for localization',
    example: 'Europe/Rome',
    default: 'UTC',
  })
  @Column({
    type: 'varchar',
    length: 50,
    default: 'UTC',
    name: 'division_timezone',
  })
  divisionTimezone: string;

  @ApiProperty({
    description: 'Division settings as JSON object',
    example: { allowSubDivisions: true, maxUsers: 1000 },
    required: false,
  })
  @Column({
    type: 'jsonb',
    nullable: true,
    name: 'settings',
  })
  settings?: Record<string, any>;

  /**
   * Checks if this division can have child divisions
   */
  get canHaveChildren(): boolean {
    return this.settings?.allowSubDivisions !== false;
  }

  /**
   * Gets the division display name with code
   */
  get displayName(): string {
    return `[${this.code}] ${this.description}`;
  }

  /**
   * Checks if this division is a root division (no parent)
   */
  get isRoot(): boolean {
    return !this.parentDivisionId;
  }

  /**
   * Gets the full hierarchy path (for breadcrumbs)
   */
  getHierarchyPath(): string {
    // In full implementation, would recursively build path
    return this.displayName;
  }

  /**
   * Validates if a user can be assigned to this division
   */
  canAssignUser(_userId: string): boolean {
    if (!this.isActive()) {
      return false;
    }

    const maxUsers = this.settings?.maxUsers;
    return typeof maxUsers !== 'number' || maxUsers === -1;
  }

  /**
   * Creates a default division
   */
  static createDefault(): Division {
    const division = new Division();
    division.code = 'DEFAULT';
    division.description = 'Default Division';
    division.isDefault = true;
    division.divisionTimezone = 'UTC';
    division.settings = {
      allowSubDivisions: true,
      maxUsers: -1, // Unlimited
    };
    return division;
  }

  /**
   * Validates division hierarchy to prevent cycles
   */
  async validateHierarchy(): Promise<boolean> {
    // In full implementation, would check for circular references
    return this.parentDivisionId !== this.id;
  }
}
