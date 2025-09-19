import { ApiProperty } from '@nestjs/swagger';
import { Column, Entity } from 'typeorm';
import { BaseEntity } from '../../common/entities/base.entity';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin',
  MODERATOR = 'moderator',
}

/**
 * User entity representing a user in the system.
 * Extends BaseEntity to inherit common fields like id, createdAt, updatedAt, etc.
 */
@Entity('users')
export class User extends BaseEntity {
  @ApiProperty({
    description: 'User first name',
    example: 'Mario',
    maxLength: 50,
  })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'first_name',
  })
  firstName: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Rossi',
    maxLength: 50,
  })
  @Column({
    type: 'varchar',
    length: 50,
    nullable: false,
    name: 'last_name',
  })
  lastName: string;

  @ApiProperty({
    description: 'User password (hashed)',
    maxLength: 100,
  })
  @Column({
    type: 'varchar',
    length: 100,
    nullable: false,
  })
  password: string;

  @ApiProperty({
    description: 'User email address',
    example: 'john.doe@example.com',
    maxLength: 255,
  })
  @Column({
    type: 'varchar',
    length: 255,
    nullable: false,
    unique: true,
  })
  email: string;

  @ApiProperty({
    description: 'User age',
    example: 30,
    minimum: 1,
    maximum: 150,
    required: false,
  })
  @Column({
    type: 'int',
    nullable: true,
  })
  age?: number;

  @ApiProperty({
    description: 'Whether the user account is active',
    example: true,
    default: true,
  })
  @Column({
    type: 'boolean',
    default: true,
    name: 'is_active_user', // Different from BaseEntity's isActive to avoid conflicts
  })
  isActiveUser: boolean;

  @ApiProperty({
    description: 'User role in the system',
    example: UserRole.USER,
    enum: UserRole,
    default: UserRole.USER,
  })
  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  role: UserRole;

  /**
   * Get full name for display
   */
  getFullName(): string {
    return `${this.firstName} ${this.lastName}`;
  }

  /**
   * Custom method to get full user information for display
   */
  getDisplayInfo(): string {
    return `${this.getFullName()} (${this.email}) - ${this.role}`;
  }

  /**
   * Check if user has admin privileges
   */
  isAdmin(): boolean {
    return this.role === UserRole.ADMIN;
  }

  /**
   * Check if user has moderator privileges
   */
  isModerator(): boolean {
    return this.role === UserRole.MODERATOR;
  }

  /**
   * Check if user account is both active in BaseEntity and User-specific active
   */
  isFullyActive(): boolean {
    return this.isActive() && this.isActiveUser;
  }
}
