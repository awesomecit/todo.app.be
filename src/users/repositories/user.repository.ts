import { Injectable } from '@nestjs/common';
import { DataSource, IsNull } from 'typeorm';
import { BaseRepository } from '../../common/repositories/base.repository';
import { User, UserRole } from '../entities/user.entity';

/**
 * User-specific repository extending the generic BaseRepository.
 * Provides additional user-specific database operations beyond basic CRUD.
 */
@Injectable()
export class UserRepository extends BaseRepository<User> {
  constructor(dataSource: DataSource) {
    super(dataSource, User);
  }

  /**
   * Find user by email address.
   * Email is unique in the system, so this should return at most one user.
   */
  async findByEmail(email: string): Promise<User | null> {
    this.logger.debug(`Finding user by email: ${email}`);

    try {
      const user = await this.repository.findOne({
        where: { email: email.toLowerCase().trim() },
      });

      if (user) {
        this.logger.debug(`User found with email: ${email}`);
      } else {
        this.logger.debug(`No user found with email: ${email}`);
      }

      return user;
    } catch (error) {
      this.logger.error(`Error finding user by email ${email}:`, error);
      throw error;
    }
  }

  /**
   * Find active users (both BaseEntity.isActive and User.isActiveUser must be true).
   */
  async findActiveUsers(): Promise<User[]> {
    this.logger.debug('Finding all active users');

    try {
      const users = await this.repository.find({
        where: {
          deletedAt: IsNull(), // Not soft deleted (BaseEntity)
          isActiveUser: true, // User-specific active flag
        },
      });

      this.logger.debug(`Found ${users.length} active users`);
      return users;
    } catch (error) {
      this.logger.error('Error finding active users:', error);
      throw error;
    }
  }

  /**
   * Find users by role.
   */
  async findByRole(role: UserRole): Promise<User[]> {
    this.logger.debug(`Finding users with role: ${role}`);

    try {
      const users = await this.repository.find({
        where: {
          role,
          deletedAt: IsNull(), // Exclude soft deleted users
        },
      });

      this.logger.debug(`Found ${users.length} users with role: ${role}`);
      return users;
    } catch (error) {
      this.logger.error(`Error finding users by role ${role}:`, error);
      throw error;
    }
  }

  /**
   * Check if email already exists (for uniqueness validation).
   */
  async emailExists(email: string): Promise<boolean> {
    this.logger.debug(`Checking if email exists: ${email}`);

    try {
      const count = await this.repository.count({
        where: { email: email.toLowerCase().trim() },
      });

      const exists = count > 0;
      this.logger.debug(`Email ${email} exists: ${exists}`);
      return exists;
    } catch (error) {
      this.logger.error(`Error checking email existence ${email}:`, error);
      throw error;
    }
  }

  /**
   * Soft delete user by setting both BaseEntity.deletedAt and User.isActiveUser to false.
   * Override the base method to add user-specific deactivation.
   */
  async remove(id: string): Promise<void> {
    this.logger.debug(`Soft deleting user with id: ${id}`);

    try {
      // First, set user-specific active flag to false
      await this.repository.update(id, {
        isActiveUser: false,
        updatedAt: new Date(),
      });

      // Then call the base soft delete method
      await super.remove(id);

      this.logger.debug(`User ${id} soft deleted successfully`);
    } catch (error) {
      this.logger.error(`Error soft deleting user ${id}:`, error);
      throw error;
    }
  }
}
