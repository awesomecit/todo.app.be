# TASK-1.5: HTTP Filtering Helper

## **Overview**

Implement a comprehensive HTTP payload filtering system that enables dynamic querying through REST API requests. The system leverages TypeORM-inspired syntax and entity metadata to provide type-safe, configurable filtering capabilities across all repository layers.

## **Story Points: 5 hours**

## **Objectives**

- Create HTTP payload filtering system with TypeORM-inspired syntax
- Implement entity metadata-driven filter generation
- Provide configurable repository-level filtering interface
- Support one-level relationship filtering with AND logic
- Expose clear controller-level integration patterns

## **Business Value**

- **API Flexibility**: Dynamic filtering reduces custom endpoint proliferation
- **Developer Productivity**: Reusable filtering patterns across all entities
- **Performance**: Optimized queries with proper indexing integration
- **Type Safety**: Compile-time validation of filter structures

## **Acceptance Criteria**

### **Core Filtering Engine**

- [ ] HTTP payload parser that converts request data to TypeORM queries
- [ ] Entity metadata extraction for available filter fields
- [ ] Type-safe filter validation based on entity structure
- [ ] Support for basic data types (string, number, boolean, date)
- [ ] One-level relationship filtering (e.g., `user.profile.name`)
- [ ] AND logic combination of all active filters

### **Repository Integration**

- [ ] `FilterableRepository` interface for custom repositories
- [ ] `getAvailableFilters()` method returning filter schema
- [ ] `applyFilters(payload)` method for query building
- [ ] Configuration options for enabled/disabled filters per repository
- [ ] Integration with existing generic repository patterns

### **Controller Support**

- [ ] `FilterPayloadDto` for request validation
- [ ] Filter schema endpoint for frontend integration
- [ ] Clear documentation patterns for API consumers
- [ ] Error handling for invalid filter combinations

### **Performance & Security**

- [ ] Query optimization with proper JOIN strategies
- [ ] Protection against SQL injection through parameterized queries
- [ ] Configurable query limits and pagination integration
- [ ] Performance monitoring for complex filter queries

## **Technical Implementation**

### **Filter Payload Structure**

```typescript
// HTTP Request Payload Structure
interface FilterPayload {
  // Direct entity fields
  [fieldName: string]: FilterValue;

  // Relationship filtering (one level)
  [relationName: string]: {
    [relationField: string]: FilterValue;
  };
}

interface FilterValue {
  // Basic operators
  eq?: any; // equals
  ne?: any; // not equals
  gt?: number | Date; // greater than
  gte?: number | Date; // greater than or equal
  lt?: number | Date; // less than
  lte?: number | Date; // less than or equal
  like?: string; // SQL LIKE pattern
  in?: any[]; // IN array values
  isNull?: boolean; // IS NULL / IS NOT NULL
}
```

### **Entity Metadata Integration**

```typescript
// Pseudo-code: Entity metadata extraction
class FilterMetadataExtractor {
  extractFilterableFields(entityClass: ClassConstructor): FilterSchema;
  getRelationshipMappings(entityClass: ClassConstructor): RelationshipMap;
  validateFilterPayload(
    payload: FilterPayload,
    schema: FilterSchema,
  ): ValidationResult;
}

// Filter schema for frontend integration
interface FilterSchema {
  fields: {
    [fieldName: string]: {
      type: 'string' | 'number' | 'boolean' | 'date';
      operators: FilterOperator[];
      nullable: boolean;
    };
  };
  relationships: {
    [relationName: string]: FilterSchema;
  };
}
```

### **Repository Integration Pattern**

```typescript
// Pseudo-code: Repository filtering interface
interface FilterableRepository<T> {
  getAvailableFilters(): FilterSchema;
  applyFilters(
    query: SelectQueryBuilder<T>,
    payload: FilterPayload,
  ): SelectQueryBuilder<T>;
  findWithFilters(payload: FilterPayload, options?: FindOptions): Promise<T[]>;
}

// Configuration per repository
class UserRepository
  extends BaseRepository<User>
  implements FilterableRepository<User>
{
  protected filterConfig: FilterConfig = {
    enabledFields: ['name', 'email', 'status'],
    enabledRelations: ['profile'],
    maxQueryComplexity: 10,
  };
}
```

### **Controller Integration Example**

```typescript
// Pseudo-code: Controller usage
@Controller('users')
class UserController {
  @Get()
  async findUsers(
    @Query() filters: FilterPayloadDto,
  ): Promise<UserResponseDto[]> {
    // Repository automatically applies filters
    const users = await this.userRepository.findWithFilters(filters);
    return this.transformToDto(users);
  }

  @Get('filters/schema')
  async getFilterSchema(): Promise<FilterSchema> {
    return this.userRepository.getAvailableFilters();
  }
}
```

## **Implementation Steps**

### **Phase 1: Core Filter Engine (2h)**

1. Create `FilterPayloadDto` with validation decorators
2. Implement `FilterMetadataExtractor` for entity analysis
3. Build `QueryFilterBuilder` for TypeORM query construction
4. Add support for basic operators (eq, ne, gt, lt, like, in, isNull)

### **Phase 2: Repository Integration (2h)**

1. Create `FilterableRepository` interface
2. Implement `BaseFilterableRepository` with common methods
3. Add filter configuration options per repository
4. Integrate with existing generic repository patterns

### **Phase 3: Relationship Filtering (1h)**

1. Implement one-level relationship filtering
2. Add JOIN optimization for relationship queries
3. Validate relationship existence through entity metadata
4. Add relationship field validation

## **Test Strategy (TDD Approach)**

### **Red Phase Tests**

```typescript
// Test examples (pseudo-code)
describe('FilterableRepository', () => {
  describe('getAvailableFilters', () => {
    it('should return schema with enabled fields only');
    it('should include relationship fields when configured');
  });

  describe('applyFilters', () => {
    it('should apply string equality filter');
    it('should apply number range filters');
    it('should apply relationship filters with proper JOINs');
    it('should ignore unconfigured filters');
  });
});
```

### **Integration Tests**

- End-to-end filtering through HTTP requests
- Performance testing with complex filter combinations
- Relationship filtering with multiple entity types
- Error handling for invalid filter payloads

## **Dependencies**

- Enhanced BaseEntity (TASK-1.1)
- Generic Repository (TASK-1.3)
- Transaction Management (TASK-1.4)

## **Deliverables**

- [ ] `FilterPayloadDto` with comprehensive validation
- [ ] `FilterMetadataExtractor` service
- [ ] `FilterableRepository` interface and base implementation
- [ ] Query optimization utilities
- [ ] Controller integration examples
- [ ] Comprehensive test suite (≥85% coverage)
- [ ] API documentation with filter examples

## **Performance Considerations**

- Eager loading optimization for relationship filters
- Query plan analysis for complex filter combinations
- Indexing recommendations for filterable fields
- Pagination integration for large result sets

## **Security Considerations**

- Parameterized query construction to prevent SQL injection
- Field access validation through entity metadata
- Query complexity limits to prevent performance attacks
- Rate limiting for expensive filter operations

## **Success Metrics**

- All repository tests pass with ≥85% coverage
- Filter payload validation catches invalid requests
- Query performance within acceptable limits (<100ms for simple filters)
- Clear integration examples for future entity implementations
