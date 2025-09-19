import {
  Injectable,
  InternalServerErrorException,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectDataSource } from '@nestjs/typeorm';
import {
  DataSource,
  EntityTarget,
  FindOptionsWhere,
  Repository,
} from 'typeorm';
import { ERROR_MESSAGES } from '../constants/error-messages.constants';
import { BaseEntity } from '../entities/base.entity';
import { GenericRepository } from './generic.repository';

/**
 * Base repository implementation using TypeORM.
 * Provides generic CRUD operations for any entity extending BaseEntity.
 *
 * @template T - Entity type that extends BaseEntity
 */
@Injectable()
export abstract class BaseRepository<T extends BaseEntity>
  implements GenericRepository<T>
{
  protected readonly repository: Repository<T>;
  protected readonly logger: Logger;

  /**
   * Creates an instance of BaseRepository.
   * @param dataSource - TypeORM DataSource for database operations
   * @param entityTarget - The entity class this repository manages
   */
  constructor(
    @InjectDataSource() protected readonly dataSource: DataSource,
    protected readonly entityTarget: EntityTarget<T>,
  ) {
    this.repository = this.dataSource.getRepository(entityTarget);
    this.logger = new Logger(this.constructor.name);
  }

  /**
   * Creates a new entity in the database.
   * Automatically sets id, createdAt, and updatedAt fields.
   *
   * @param entityData - Data for creating the entity (without id, createdAt, updatedAt)
   * @returns Promise resolving to the created entity with all fields populated
   * @throws InternalServerErrorException when database operation fails
   */
  async create(
    entityData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>,
  ): Promise<T> {
    const context = this.constructor.name;

    try {
      this.logger.log(
        `Creating entity with data: ${this.safeStringify(entityData)}`,
        context,
      );

      // Create entity instance - TypeORM will handle id, createdAt, updatedAt via BaseEntity hooks
      const entity = this.repository.create(entityData as any);

      // Save to database - save() with single entity returns the saved entity
      const savedEntity = (await this.repository.save(entity)) as unknown as T;

      this.logger.log(
        `Successfully created entity with id: ${savedEntity.id}`,
        context,
      );

      return savedEntity;
    } catch (error) {
      const errorMessage = `${ERROR_MESSAGES.CREATE_FAILED}: ${error.message}`;
      this.logger.error(errorMessage, error.stack, context);
      throw new InternalServerErrorException(ERROR_MESSAGES.CREATE_FAILED);
    }
  }

  /**
   * Finds an entity by its unique identifier.
   *
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity if found, null otherwise
   */
  async findById(id: string): Promise<T | null> {
    const context = this.constructor.name;

    try {
      this.logger.debug(`Finding entity by id: ${id}`, context);

      const entity = await this.repository.findOne({
        where: { id } as FindOptionsWhere<T>,
      });

      if (entity) {
        this.logger.debug(`Found entity with id: ${id}`, context);
      } else {
        this.logger.debug(`Entity not found with id: ${id}`, context);
      }

      return entity;
    } catch (error) {
      const errorMessage = `Failed to find entity by id ${id}: ${error.message}`;
      this.logger.error(errorMessage, error.stack, context);
      throw new InternalServerErrorException(ERROR_MESSAGES.NOT_FOUND);
    }
  }

  /**
   * Updates an existing entity.
   *
   * @param id - The unique identifier of the entity to update
   * @param updateData - Partial data to update the entity
   * @returns Promise resolving to the updated entity
   * @throws NotFoundException when entity is not found
   * @throws InternalServerErrorException when database operation fails
   */
  async update(id: string, updateData: Partial<T>): Promise<T> {
    const context = this.constructor.name;

    try {
      this.logger.log(
        `Updating entity ${id} with data: ${this.safeStringify(updateData)}`,
        context,
      );

      // First check if entity exists
      const existingEntity = await this.findById(id);
      if (!existingEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      // Update the entity - TypeORM will handle updatedAt via BaseEntity hooks
      await this.repository.update({ id } as any, updateData as any);

      // Return the updated entity
      const updatedEntity = await this.findById(id);
      if (!updatedEntity) {
        throw new InternalServerErrorException(ERROR_MESSAGES.UPDATE_FAILED);
      }

      this.logger.log(`Successfully updated entity with id: ${id}`, context);

      return updatedEntity;
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage = `${ERROR_MESSAGES.UPDATE_FAILED}: ${error.message}`;
      this.logger.error(errorMessage, error.stack, context);
      throw new InternalServerErrorException(ERROR_MESSAGES.UPDATE_FAILED);
    }
  }

  /**
   * Removes an entity from the database.
   *
   * @param id - The unique identifier of the entity to remove
   * @returns Promise resolving when the entity is removed
   * @throws NotFoundException when entity is not found
   * @throws InternalServerErrorException when database operation fails
   */
  async remove(id: string): Promise<void> {
    const context = this.constructor.name;

    try {
      this.logger.log(`Removing entity with id: ${id}`, context);

      // First check if entity exists
      const existingEntity = await this.findById(id);
      if (!existingEntity) {
        throw new NotFoundException(ERROR_MESSAGES.NOT_FOUND);
      }

      // Remove the entity
      await this.repository.remove(existingEntity);

      this.logger.log(`Successfully removed entity with id: ${id}`, context);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }

      const errorMessage = `${ERROR_MESSAGES.DELETE_FAILED}: ${error.message}`;
      this.logger.error(errorMessage, error.stack, context);
      throw new InternalServerErrorException(ERROR_MESSAGES.DELETE_FAILED);
    }
  }

  /**
   * Finds all entities matching the given criteria.
   *
   * @param criteria - Optional criteria for filtering entities
   * @returns Promise resolving to an array of matching entities
   */
  async findAll(criteria?: Partial<T>): Promise<T[]> {
    const context = this.constructor.name;

    try {
      this.logger.debug(
        `Finding all entities with criteria: ${this.safeStringify(criteria)}`,
        context,
      );

      const entities = await this.repository.find({
        where: criteria as FindOptionsWhere<T>,
      });

      this.logger.debug(`Found ${entities.length} entities`, context);

      return entities;
    } catch (error) {
      const errorMessage = `Failed to find entities: ${error.message}`;
      this.logger.error(errorMessage, error.stack, context);
      throw new InternalServerErrorException(ERROR_MESSAGES.NOT_FOUND);
    }
  }

  /**
   * Counts all entities matching the given criteria.
   *
   * @param criteria - Optional criteria for filtering entities
   * @returns Promise resolving to the count of matching entities
   * @throws InternalServerErrorException when database operation fails
   */
  async count(criteria?: Partial<T>): Promise<number> {
    const context = this.constructor.name;

    try {
      this.logger.debug(
        `Counting entities with criteria: ${this.safeStringify(criteria)}`,
        context,
      );

      const count = await this.repository.count({
        where: criteria as FindOptionsWhere<T>,
      });

      this.logger.debug(`Found ${count} entities matching criteria`, context);

      return count;
    } catch (error: any) {
      const errorMessage = `Failed to count entities: ${error.message}`;
      this.logger.error(errorMessage, error.stack, context);
      throw new InternalServerErrorException(
        ERROR_MESSAGES.INTERNAL_SERVER_ERROR,
      );
    }
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
