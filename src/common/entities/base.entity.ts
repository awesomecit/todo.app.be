import { ApiProperty } from '@nestjs/swagger';
import { Exclude } from 'class-transformer';
import {
  CreateDateColumn,
  DeleteDateColumn,
  PrimaryGeneratedColumn,
  BaseEntity as TypeOrmBaseEntity,
  UpdateDateColumn,
  VersionColumn,
} from 'typeorm';

/**
 * Base entity that contains common fields for all system entities
 * Provides basic functionality like ID, timestamps, soft delete and versioning
 */
export abstract class BaseEntity extends TypeOrmBaseEntity {
  @ApiProperty({
    description: 'Unique entity identifier',
    example: 1,
  })
  @PrimaryGeneratedColumn()
  id: number;

  @ApiProperty({
    description: 'Entity creation date and time',
    example: '2025-09-13T10:30:00.000Z',
  })
  @CreateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    name: 'created_at',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'Entity last update date and time',
    example: '2025-09-13T11:45:00.000Z',
  })
  @UpdateDateColumn({
    type: 'timestamp',
    default: () => 'CURRENT_TIMESTAMP(6)',
    onUpdate: 'CURRENT_TIMESTAMP(6)',
    name: 'updated_at',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'Entity logical deletion date and time (soft delete)',
    example: null,
    required: false,
  })
  @DeleteDateColumn({
    type: 'timestamp',
    nullable: true,
    name: 'deleted_at',
  })
  @Exclude({ toPlainOnly: true })
  deletedAt?: Date;

  @ApiProperty({
    description: 'Entity version for optimistic concurrency control',
    example: 1,
  })
  @VersionColumn({
    name: 'version',
    default: 1,
  })
  @Exclude({ toPlainOnly: true })
  version: number;

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
}
