import { Injectable, Logger } from '@nestjs/common';
import { BaseService } from '../common/services/base.service';
import { CreateUserDto } from './dto/create-user.dto';
import { User } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';

/**
 * User service that extends BaseService to inherit common CRUD operations.
 * Uses real User entity, CreateUserDto, and UserRepository for database operations.
 */
@Injectable()
export class UserService extends BaseService<User, CreateUserDto> {
  constructor(
    private readonly userRepository: UserRepository,
    logger: Logger,
  ) {
    super(userRepository, logger);
  }

  /**
   * Find user by email address (business-specific method).
   * Uses the UserRepository's specialized findByEmail method.
   */
  async findByEmail(email: string): Promise<User | null> {
    this.logger.log(`Finding user by email: ${email}`, UserService.name);

    try {
      return await this.userRepository.findByEmail(email);
    } catch (error) {
      this.logger.error(
        `Failed to find user by email: ${error.message}`,
        error.stack,
        UserService.name,
      );
      throw error;
    }
  }

  /**
   * Check if email is already registered in the system.
   */
  async isEmailTaken(email: string): Promise<boolean> {
    this.logger.log(`Checking if email is taken: ${email}`, UserService.name);

    try {
      return await this.userRepository.emailExists(email);
    } catch (error) {
      this.logger.error(
        `Failed to check email existence: ${error.message}`,
        error.stack,
        UserService.name,
      );
      throw error;
    }
  }

  /**
   * Get all active users in the system.
   */
  async getActiveUsers(): Promise<User[]> {
    this.logger.log('Retrieving all active users', UserService.name);

    try {
      return await this.userRepository.findActiveUsers();
    } catch (error) {
      this.logger.error(
        `Failed to get active users: ${error.message}`,
        error.stack,
        UserService.name,
      );
      throw error;
    }
  }
}
