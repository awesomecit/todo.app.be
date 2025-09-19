/**
 * Generic repository interface for CRUD operations.
 * All entity repositories should implement this interface.
 *
 * @template T - Entity type that has id, createdAt, updatedAt
 */
export interface GenericRepository<
  T extends { id: string; createdAt: Date; updatedAt: Date },
> {
  /**
   * Creates a new entity in the data store.
   * @param entityData - Data for creating the entity (without id, createdAt, updatedAt)
   * @returns Promise resolving to the created entity with all fields populated
   */
  create(entityData: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;

  /**
   * Finds an entity by its unique identifier.
   * @param id - The unique identifier of the entity
   * @returns Promise resolving to the entity if found, null otherwise
   */
  findById(id: string): Promise<T | null>;

  /**
   * Updates an existing entity.
   * @param id - The unique identifier of the entity to update
   * @param updateData - Partial data to update the entity
   * @returns Promise resolving to the updated entity
   */
  update(id: string, updateData: Partial<T>): Promise<T>;

  /**
   * Removes an entity from the data store.
   * @param id - The unique identifier of the entity to remove
   * @returns Promise resolving when the entity is removed
   */
  remove(id: string): Promise<void>;

  /**
   * Finds all entities matching the given criteria.
   * @param criteria - Optional criteria for filtering entities
   * @returns Promise resolving to an array of matching entities
   */
  findAll(criteria?: Partial<T>): Promise<T[]>;
}
