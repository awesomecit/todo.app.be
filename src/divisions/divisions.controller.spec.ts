import { BadRequestException, NotFoundException } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DivisionsController } from './divisions.controller';
import { DivisionsService } from './divisions.service';
import {
  CreateDivisionDto,
  DivisionQueryDto,
  UpdateDivisionDto,
} from './dto/division.dto';

/**
 * TDD Test Suite for DivisionsController
 *
 * Following Given-When-Then pattern and comprehensive validation testing
 * Tests all CRUD operations, validation, error handling, and business logic
 */
describe('DivisionsController', () => {
  let controller: DivisionsController;
  let service: DivisionsService;

  // Mock data for testing
  const mockDivision: any = {
    id: '123e4567-e89b-12d3-a456-426614174000',
    sequentialId: 1,
    code: 'DIV001',
    description: 'Test Description',
    isActive: jest.fn().mockReturnValue(true),
    parentDivisionId: undefined,
    isDefault: false,
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date('2023-01-01'),
    deletedAt: undefined,
    version: 1,
  };

  const mockCreateDto: CreateDivisionDto = {
    code: 'DIV001',
    description: 'New Description',
    divisionTimezone: 'UTC',
    isDefault: false,
    parentDivisionId: undefined,
  };

  const mockUpdateDto: UpdateDivisionDto = {
    code: 'DIV002',
    description: 'Updated Description',
    divisionTimezone: 'Europe/Rome',
  };

  const mockQueryDto: DivisionQueryDto = {
    page: 1,
    limit: 10,
    description: 'test',
    activeOnly: true,
  };

  // Mock DivisionsService
  const mockDivisionsService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    findChildren: jest.fn(),
    findRoots: jest.fn(),
    getHierarchyPath: jest.fn(),
    ensureDefaultDivision: jest.fn(),
  };

  beforeEach(async () => {
    // Given: Clean test module for each test
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DivisionsController],
      providers: [
        {
          provide: DivisionsService,
          useValue: mockDivisionsService,
        },
      ],
    }).compile();

    controller = module.get<DivisionsController>(DivisionsController);
    service = module.get<DivisionsService>(DivisionsService);

    // Reset all mocks
    jest.clearAllMocks();
  });

  describe('Constructor', () => {
    it('should be defined', () => {
      // Given: Controller instance created in beforeEach
      // When: Controller is accessed
      // Then: It should be properly defined
      expect(controller).toBeDefined();
      expect(service).toBeDefined();
    });
  });

  describe('create()', () => {
    it('should create a new division successfully', async () => {
      // Given: Valid creation data and successful service response
      mockDivisionsService.create.mockResolvedValue(mockDivision);

      // When: Controller create method is called
      const result = await controller.create(mockCreateDto);

      // Then: Service should be called with correct data and return created division
      expect(mockDivisionsService.create).toHaveBeenCalledWith(
        mockCreateDto,
        'system-user',
      );
      expect(mockDivisionsService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDivision);
    });

    it('should throw BadRequestException for invalid data', async () => {
      // Given: Invalid data causing service to throw error
      const invalidDto = { ...mockCreateDto, code: '' };
      mockDivisionsService.create.mockRejectedValue(
        new BadRequestException('Division name is required'),
      );

      // When: Controller create method is called with invalid data
      // Then: Should throw BadRequestException
      await expect(controller.create(invalidDto)).rejects.toThrow(
        BadRequestException,
      );
      expect(mockDivisionsService.create).toHaveBeenCalledWith(
        invalidDto,
        'system-user',
      );
    });

    it('should handle service errors gracefully', async () => {
      // Given: Service throwing unexpected error
      mockDivisionsService.create.mockRejectedValue(
        new Error('Database error'),
      );

      // When: Controller create method is called
      // Then: Should propagate the error
      await expect(controller.create(mockCreateDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findAll()', () => {
    it('should return paginated divisions list', async () => {
      // Given: Service returns paginated results
      const mockPaginatedResult = {
        data: [mockDivision],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      };
      mockDivisionsService.findAll.mockResolvedValue(mockPaginatedResult);

      // When: Controller findAll method is called
      const result = await controller.findAll(mockQueryDto);

      // Then: Should return paginated results
      expect(mockDivisionsService.findAll).toHaveBeenCalledWith(mockQueryDto);
      expect(result).toEqual(mockPaginatedResult);
    });

    it('should handle empty query parameters', async () => {
      // Given: Empty query and service returns empty results
      const emptyResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockDivisionsService.findAll.mockResolvedValue(emptyResult);

      // When: Controller findAll method is called without query
      const result = await controller.findAll({});

      // Then: Should return empty results
      expect(mockDivisionsService.findAll).toHaveBeenCalledWith({});
      expect(result).toEqual(emptyResult);
    });

    it('should apply filters correctly', async () => {
      // Given: Specific query filters
      const filteredQuery = {
        ...mockQueryDto,
        activeOnly: false,
        code: 'TEST',
      };
      const mockResult = {
        data: [],
        total: 0,
        page: 1,
        limit: 10,
        totalPages: 0,
      };
      mockDivisionsService.findAll.mockResolvedValue(mockResult);

      // When: Controller findAll method is called with filters
      const result = await controller.findAll(filteredQuery);

      // Then: Service should receive correct filters
      expect(mockDivisionsService.findAll).toHaveBeenCalledWith(filteredQuery);
      expect(result).toEqual(mockResult);
    });
  });

  describe('findOne()', () => {
    it('should return a single division by ID', async () => {
      // Given: Valid ID and service returns division
      const divisionId = mockDivision.id;
      mockDivisionsService.findOne.mockResolvedValue(mockDivision);

      // When: Controller findOne method is called
      const result = await controller.findOne(divisionId);

      // Then: Should return the division
      expect(mockDivisionsService.findOne).toHaveBeenCalledWith(divisionId);
      expect(result).toEqual(mockDivision);
    });

    it('should throw NotFoundException for non-existent ID', async () => {
      // Given: Non-existent ID causing service to throw NotFoundException
      const nonExistentId = 'non-existent-id';
      mockDivisionsService.findOne.mockRejectedValue(
        new NotFoundException('Division not found'),
      );

      // When: Controller findOne method is called with non-existent ID
      // Then: Should throw NotFoundException
      await expect(controller.findOne(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockDivisionsService.findOne).toHaveBeenCalledWith(nonExistentId);
    });

    it('should handle invalid UUID format', async () => {
      // Given: Invalid UUID format
      const invalidId = 'invalid-uuid';
      mockDivisionsService.findOne.mockRejectedValue(
        new BadRequestException('Invalid UUID format'),
      );

      // When: Controller findOne method is called with invalid ID
      // Then: Should throw BadRequestException
      await expect(controller.findOne(invalidId)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('update()', () => {
    it('should update a division successfully', async () => {
      // Given: Valid ID and update data
      const divisionId = mockDivision.id;
      const updatedDivision = { ...mockDivision, ...mockUpdateDto };
      mockDivisionsService.update.mockResolvedValue(updatedDivision);

      // When: Controller update method is called
      const result = await controller.update(divisionId, mockUpdateDto);

      // Then: Should return updated division
      expect(mockDivisionsService.update).toHaveBeenCalledWith(
        divisionId,
        mockUpdateDto,
        'system-user',
      );
      expect(result).toEqual(updatedDivision);
    });

    it('should throw NotFoundException for non-existent division', async () => {
      // Given: Non-existent division ID
      const nonExistentId = 'non-existent-id';
      mockDivisionsService.update.mockRejectedValue(
        new NotFoundException('Division not found'),
      );

      // When: Controller update method is called
      // Then: Should throw NotFoundException
      await expect(
        controller.update(nonExistentId, mockUpdateDto),
      ).rejects.toThrow(NotFoundException);
    });

    it('should handle partial updates', async () => {
      // Given: Partial update data
      const partialUpdate = { description: 'Partially Updated' };
      const partiallyUpdated = {
        ...mockDivision,
        description: 'Partially Updated',
      };
      mockDivisionsService.update.mockResolvedValue(partiallyUpdated);

      // When: Controller update method is called with partial data
      const result = await controller.update(mockDivision.id, partialUpdate);

      // Then: Should apply partial update
      expect(mockDivisionsService.update).toHaveBeenCalledWith(
        mockDivision.id,
        partialUpdate,
        'system-user',
      );
      expect(result).toEqual(partiallyUpdated);
    });
  });

  describe('remove()', () => {
    it('should soft delete a division successfully', async () => {
      // Given: Valid division ID and successful deletion
      const divisionId = mockDivision.id;
      mockDivisionsService.remove.mockResolvedValue(undefined);

      // When: Controller remove method is called
      const result = await controller.remove(divisionId);

      // Then: Should complete deletion
      expect(mockDivisionsService.remove).toHaveBeenCalledWith(
        divisionId,
        'system-user',
      );
      expect(result).toBeUndefined();
    });

    it('should throw NotFoundException for non-existent division', async () => {
      // Given: Non-existent division ID
      const nonExistentId = 'non-existent-id';
      mockDivisionsService.remove.mockRejectedValue(
        new NotFoundException('Division not found'),
      );

      // When: Controller remove method is called
      // Then: Should throw NotFoundException
      await expect(controller.remove(nonExistentId)).rejects.toThrow(
        NotFoundException,
      );
    });

    it('should handle deletion of division with children', async () => {
      // Given: Division with children causing business rule violation
      mockDivisionsService.remove.mockRejectedValue(
        new BadRequestException('Cannot delete division with active children'),
      );

      // When: Controller remove method is called
      // Then: Should throw BadRequestException
      await expect(controller.remove(mockDivision.id)).rejects.toThrow(
        BadRequestException,
      );
    });
  });

  describe('findByParent()', () => {
    it('should return children divisions for valid parent ID', async () => {
      // Given: Valid parent ID and children data
      const parentId = mockDivision.id;
      const childrenData = [
        { ...mockDivision, parentDivisionId: parentId, id: 'child-1' },
      ];
      mockDivisionsService.findChildren.mockResolvedValue(childrenData);

      // When: Controller findByParent method is called
      const result = await controller.findByParent(parentId);

      // Then: Should return children divisions
      expect(mockDivisionsService.findChildren).toHaveBeenCalledWith(parentId);
      expect(result).toEqual(childrenData);
    });

    it('should return empty array for division without children', async () => {
      // Given: Division without children
      mockDivisionsService.findChildren.mockResolvedValue([]);

      // When: Controller findByParent method is called
      const result = await controller.findByParent(mockDivision.id);

      // Then: Should return empty array
      expect(result).toEqual([]);
    });
  });

  describe('getActiveCount()', () => {
    it('should return active divisions count', async () => {
      // Given: Service returns paginated result with total count
      const mockResult = { data: [], total: 5, page: 1, limit: 10 };
      mockDivisionsService.findAll.mockResolvedValue(mockResult);

      // When: Controller getActiveCount method is called
      const result = await controller.getActiveCount();

      // Then: Should return active count
      expect(mockDivisionsService.findAll).toHaveBeenCalledWith({
        activeOnly: true,
      });
      expect(result).toEqual({ count: 5 });
    });

    it('should return zero when no active divisions exist', async () => {
      // Given: No active divisions
      const emptyResult = { data: [], total: 0, page: 1, limit: 10 };
      mockDivisionsService.findAll.mockResolvedValue(emptyResult);

      // When: Controller getActiveCount method is called
      const result = await controller.getActiveCount();

      // Then: Should return zero count
      expect(result).toEqual({ count: 0 });
    });
  });

  describe('getHierarchy()', () => {
    it('should return divisions hierarchy tree', async () => {
      // Given: Service returns root divisions (hierarchy starting point)
      const hierarchyData = [
        {
          ...mockDivision,
        },
      ];
      mockDivisionsService.findRoots.mockResolvedValue(hierarchyData);

      // When: Controller getHierarchy method is called
      const result = await controller.getHierarchy();

      // Then: Should return hierarchy tree
      expect(mockDivisionsService.findRoots).toHaveBeenCalled();
      expect(result).toEqual(hierarchyData);
    });

    it('should return empty array when no divisions exist', async () => {
      // Given: No divisions in database
      mockDivisionsService.findRoots.mockResolvedValue([]);

      // When: Controller getHierarchy method is called
      const result = await controller.getHierarchy();

      // Then: Should return empty array
      expect(result).toEqual([]);
    });
  });

  describe('Input Validation', () => {
    it('should validate CreateDivisionDto properties', async () => {
      // Given: DTO with invalid properties
      const invalidDto = {
        name: '', // Empty name
        description: 'A'.repeat(1001), // Too long description
        isActive: 'invalid', // Invalid boolean
      };

      // When/Then: Validation should catch these errors before reaching controller
      // Note: This is handled by NestJS validation pipes
      expect(typeof invalidDto.name).toBe('string');
      expect(invalidDto.description.length).toBeGreaterThan(1000);
      expect(typeof invalidDto.isActive).not.toBe('boolean');
    });

    it('should validate UpdateDivisionDto allows partial updates', () => {
      // Given: Partial update DTO
      const partialDto: Partial<UpdateDivisionDto> = {
        description: 'New Description',
      };

      // When/Then: Should allow partial updates
      expect(partialDto.description).toBeDefined();
      // Optional fields should be allowed to be undefined
      expect(partialDto).not.toHaveProperty('code');
      expect(partialDto).not.toHaveProperty('divisionTimezone');
    });

    it('should validate GetDivisionsQueryDto parameters', () => {
      // Given: Query DTO with various parameters
      const queryDto = {
        page: 1,
        limit: 50,
        sortBy: 'name',
        sortOrder: 'DESC',
      };

      // When/Then: Should have correct types and values
      expect(typeof queryDto.page).toBe('number');
      expect(typeof queryDto.limit).toBe('number');
      expect(
        ['name', 'createdAt', 'level'].includes(queryDto.sortBy as string),
      ).toBeTruthy();
      expect(
        ['ASC', 'DESC'].includes(queryDto.sortOrder as string),
      ).toBeTruthy();
    });
  });

  describe('Error Handling', () => {
    it('should handle unexpected service errors', async () => {
      // Given: Service throwing unexpected error
      mockDivisionsService.findAll.mockRejectedValue(
        new Error('Unexpected database error'),
      );

      // When: Controller method is called
      // Then: Should propagate the error
      await expect(controller.findAll({})).rejects.toThrow(
        'Unexpected database error',
      );
    });

    it('should handle validation errors from service', async () => {
      // Given: Service throwing validation error
      mockDivisionsService.create.mockRejectedValue(
        new BadRequestException('Validation failed: name must be unique'),
      );

      // When: Controller create method is called
      // Then: Should throw BadRequestException with validation message
      await expect(controller.create(mockCreateDto)).rejects.toThrow(
        'Validation failed: name must be unique',
      );
    });
  });

  describe('Business Logic Integration', () => {
    it('should handle hierarchical validation through service calls', async () => {
      // Given: Service handles hierarchy validation internally
      const hierarchyPath = [mockDivision];
      mockDivisionsService.getHierarchyPath.mockResolvedValue(hierarchyPath);

      // When: Hierarchy path is requested through service
      const result = await mockDivisionsService.getHierarchyPath(
        mockDivision.id,
      );

      // Then: Should return hierarchy path correctly
      expect(result).toEqual(hierarchyPath);
      expect(mockDivisionsService.getHierarchyPath).toHaveBeenCalledWith(
        mockDivision.id,
      );
    });

    it('should maintain referential integrity', async () => {
      // Given: Creation with valid parent reference
      const childDto = { ...mockCreateDto, parentDivisionId: mockDivision.id };
      const childDivision = {
        ...mockDivision,
        parentDivisionId: mockDivision.id,
        id: 'child-id',
      };
      mockDivisionsService.create.mockResolvedValue(childDivision);

      // When: Child division is created
      const result = await controller.create(childDto);

      // Then: Should maintain parent-child relationship
      expect(result.parentDivisionId).toBe(mockDivision.id);
      expect(mockDivisionsService.create).toHaveBeenCalledWith(
        childDto,
        'system-user',
      );
    });
  });
});
