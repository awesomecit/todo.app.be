import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  BeforeInsert,
  BeforeUpdate,
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity as TypeOrmBaseEntity,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * Enhanced Base entity with dual identification, timezone support, division management, and record deprecation
 * Provides enterprise-grade functionality for temporal tracking and organizational structure
 *
 * Features:
 * - Dual identification: UUID (primary) + incremental ID (for human readability)
 * - PostgreSQL timestamptz support with timezone context
 * - Division-based data organization
 * - Record deprecation (validity_end) without data loss
 * - Automatic timezone detection and storage
 * - Enhanced optimistic locking for concurrency control
 */
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @ApiProperty({
    description: 'Unique UUID identifier (primary key)',
    example: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
  })
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({
    description: 'Sequential incremental ID for human-readable references',
    example: 1001,
  })
  @Column({
    type: 'bigint',
    name: 'sequential_id',
    unique: true,
    generated: 'increment',
  })
  sequentialId: number;

  @ApiProperty({
    description: 'Entity creation date and time in UTC with timezone context',
    example: '2025-09-17T10:30:00.000Z',
  })
  @CreateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'created_at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User ID who created this entity',
    example: 'user-550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({
    type: 'varchar',
    length: 255,
    name: 'created_by',
  })
  createdBy: string;

  @ApiProperty({
    description:
      'Entity last update date and time in UTC with timezone context',
    example: '2025-09-17T11:45:00.000Z',
  })
  @UpdateDateColumn({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    onUpdate: 'CURRENT_TIMESTAMP',
    name: 'updated_at',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User ID who last updated this entity',
    example: 'user-550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({
    type: 'varchar',
    length: 255,
    name: 'updated_by',
  })
  updatedBy: string;

  @ApiProperty({
    description: 'Entity logical deletion date and time (soft delete)',
    example: null,
    required: false,
  })
  @DeleteDateColumn({
    type: 'timestamptz',
    nullable: true,
    name: 'deleted_at',
  })
  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Record validity start date - when this record becomes valid',
    example: '2025-09-17T00:00:00.000Z',
  })
  @Column({
    type: 'timestamptz',
    default: () => 'CURRENT_TIMESTAMP',
    name: 'validity_start',
  })
  validityStart: Date;

  @ApiProperty({
    description:
      'Record deprecation date - when this record becomes invalid without deletion',
    example: null,
    required: false,
  })
  @Column({
    type: 'timestamptz',
    nullable: true,
    name: 'validity_end',
  })
  validityEnd: Date | null = null; // Initialize with null

  @ApiProperty({
    description: 'User timezone context when entity was created/modified',
    example: 'Europe/Rome',
  })
  @Column({
    type: 'varchar',
    length: 50,
    default: 'UTC',
    name: 'timezone',
  })
  timezone: string;

  @ApiProperty({
    description: 'Division ID for organizational data separation',
    example: 'div-550e8400-e29b-41d4-a716-446655440000',
  })
  @Column({
    type: 'uuid',
    name: 'division_id',
    default: () => "'default-division-id'", // Will be replaced by actual default division
  })
  divisionId: string = 'default-division-id'; // Initialize with default value

  @ApiProperty({
    description: 'Entity version for enhanced optimistic concurrency control',
    example: 1,
  })
  @VersionColumn({
    name: 'version',
    type: 'bigint',
    default: 1,
  })
  @Exclude({ toPlainOnly: true })
  version: number; /**
   * Lifecycle hook - sets timezone context and default division before insert
   */
  @BeforeInsert()
  async beforeInsert(): Promise<void> {
    // Set default timezone if not provided
    if (!this.timezone) {
      this.timezone = 'UTC';
    }

    // Set default division if not provided
    if (!this.divisionId) {
      this.divisionId = 'default-division-id'; // Will be replaced by DivisionManager
    }
  }

  /**
   * Lifecycle hook - updates timezone context before update
   */
  @BeforeUpdate()
  async beforeUpdate(): Promise<void> {
    // Update timezone context if needed
    if (!this.timezone) {
      this.timezone = 'UTC';
    }
  }

  /**
   * Sets timezone context for this entity
   * @param timezone IANA timezone identifier (e.g., 'Europe/Rome')
   */
  setTimezoneContext(timezone: string): void {
    this.timezone = timezone;
  }

  /**
   * Gets the timezone context for this entity
   * @returns IANA timezone identifier
   */
  getTimezoneContext(): string {
    return this.timezone;
  }

  /**
   * Deprecates this record by setting validity_end to current timestamp
   * @param _reason Optional reason for deprecation (unused in current implementation)
   */
  deprecate(_reason?: string): void {
    this.validityEnd = new Date();
    // Note: In full implementation, reason would be stored in audit log
  }

  /**
   * Checks if the entity is currently active (not deprecated and not deleted)
   * @returns true if entity is active
   */
  isActive(): boolean {
    const now = new Date();
    return !this.deletedAt && (!this.validityEnd || this.validityEnd > now);
  }

  /**
   * Checks if the entity has been logically deleted
   */
  get isDeleted(): boolean {
    return this.deletedAt !== null && this.deletedAt !== undefined;
  }

  /**
   * Checks if the entity has been recently modified (last 5 minutes)
   */
  get isRecentlyModified(): boolean {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    return this.updatedAt > fiveMinutesAgo;
  }

  /**
   * Returns the time elapsed since creation in milliseconds
   */
  get ageInMs(): number {
    return Date.now() - this.createdAt.getTime();
  }

  /**
   * Checks if the entity is deprecated (validity_end has passed)
   * @returns true if entity is deprecated
   */
  get isDeprecated(): boolean {
    return (
      this.validityEnd !== null &&
      this.validityEnd !== undefined &&
      this.validityEnd <= new Date()
    );
  }
}
