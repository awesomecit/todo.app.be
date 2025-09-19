import {
  BadRequestException,
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { GenericRepository } from '../repositories/generic.repository';

/**
 * Base service providing common CRUD operations for entities.
 * Follows SOLID principles and provides consistent error handling.
 *
 * @template T - Entity type that has id, createdAt, updatedAt
 * @template CreateDto - DTO type for creating entities
 */
@Injectable()
export class BaseService<
  T extends { id: string; createdAt: Date; updatedAt: Date },
  CreateDto = Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
> {
  /**
   * Creates an instance of BaseService.
   * @param repository - Repository implementation for data access
   * @param logger - Logger instance for logging operations
   */
  constructor(
    protected readonly repository: GenericRepository<T>,
    protected readonly logger: Logger,
  ) {
    this.logger.log('BaseService initialized', this.constructor.name);
  }

  /**
   * Creates a new entity.
   *
   * Validates input, delegates to repository, and handles errors consistently.
   * Follows single responsibility principle by focusing only on orchestration.
   *
   * @param createDto - Data transfer object containing entity creation data
   * @returns Promise resolving to the created entity
   * @throws BadRequestException when createDto is null/undefined
   * @throws InternalServerErrorException when repository operation fails
   */
  async create(createDto: CreateDto): Promise<T> {
    const context = this.constructor.name;

    // Input validation - fail fast principle
    this.validateCreateDto(createDto, context);

    try {
      // Log the operation for audit trail
      this.logger.log(
        `Creating new entity with data: ${this.safeStringify(createDto)}`,
        context,
      );

      // Delegate to repository - separation of concerns
      const createdEntity = await this.repository.create(createDto as any);

      // Log successful operation
      this.logger.log(
        `Successfully created entity with id: ${createdEntity.id}`,
        context,
      );

      return createdEntity;
    } catch (error) {
      // Handle repository errors consistently
      return this.handleRepositoryError(error, 'create', context);
    }
  }

  /**
   * Validates the create DTO input.
   * @private
   * @param createDto - DTO to validate
   * @param context - Context for logging
   * @throws BadRequestException when validation fails
   */
  private validateCreateDto(createDto: CreateDto, context: string): void {
    if (!createDto) {
      const errorMessage = 'CreateDto cannot be null or undefined';
      this.logger.error(errorMessage, '', context);
      throw new BadRequestException(errorMessage);
    }
  }

  /**
   * Handles repository errors consistently.
   * @private
   * @param error - The error that occurred
   * @param operation - The operation that failed
   * @param context - Context for logging
   * @throws InternalServerErrorException
   */
  private handleRepositoryError(
    error: any,
    operation: string,
    context: string,
  ): never {
    const errorMessage = `Failed to ${operation} entity: ${error.message}`;

    this.logger.error(errorMessage, error.stack, context);

    // Convert to appropriate HTTP exception
    throw new InternalServerErrorException(errorMessage);
  }

  /**
   * Safely stringifies objects for logging, handling circular references.
   * @private
   * @param obj - Object to stringify
   * @returns Safe string representation
   */
  private safeStringify(obj: any): string {
    try {
      return JSON.stringify(obj);
    } catch {
      return '[Object with circular reference or non-serializable properties]';
    }
  }
}
