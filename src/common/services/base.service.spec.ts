import {
  BadRequestException,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { GenericRepository } from '../repositories/generic.repository';
import { BaseService } from './base.service';

// Simple base entity interface for testing
interface SimpleBaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Simple test entity for testing purposes
interface TestEntity extends SimpleBaseEntity {
  name: string;
  email: string;
}

// Test DTO for creating entities
interface CreateTestEntityDto {
  name: string;
  email: string;
}

describe('BaseService', () => {
  let service: BaseService<TestEntity, CreateTestEntityDto>;
  let mockRepository: jest.Mocked<GenericRepository<TestEntity>>;
  let mockLogger: jest.Mocked<Logger>;

  beforeEach(async () => {
    // Create mock repository
    mockRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
    };

    // Create mock logger
    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        {
          provide: BaseService,
          useFactory: () => new BaseService(mockRepository, mockLogger),
        },
      ],
    }).compile();

    service =
      module.get<BaseService<TestEntity, CreateTestEntityDto>>(BaseService);
  });

  describe('create', () => {
    it('should create a new entity successfully', async () => {
      // Given - Arrange
      const createDto: CreateTestEntityDto = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const expectedEntity: TestEntity = {
        id: '123e4567-e89b-12d3-a456-426614174000',
        name: 'Test User',
        email: 'test@example.com',
        createdAt: new Date('2025-09-19T12:00:00Z'),
        updatedAt: new Date('2025-09-19T12:00:00Z'),
      };

      mockRepository.create.mockResolvedValue(expectedEntity);

      // When - Act
      const result = await service.create(createDto);

      // Then - Assert
      expect(mockRepository.create).toHaveBeenCalledWith(createDto);
      expect(mockRepository.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedEntity);
      expect(mockLogger.log).toHaveBeenCalledWith(
        'BaseService initialized',
        'BaseService',
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        'Creating new entity with data: {"name":"Test User","email":"test@example.com"}',
        'BaseService',
      );
      expect(mockLogger.log).toHaveBeenCalledWith(
        `Successfully created entity with id: ${expectedEntity.id}`,
        'BaseService',
      );
    });

    it('should log error and throw when repository create fails', async () => {
      // Given - Arrange
      const createDto: CreateTestEntityDto = {
        name: 'Test User',
        email: 'test@example.com',
      };

      const error = new Error('Database connection failed');
      mockRepository.create.mockRejectedValue(error);

      // When & Then - Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        InternalServerErrorException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'Failed to create entity: Database connection failed',
      );
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to create entity: Database connection failed',
        error.stack,
        'BaseService',
      );
    });

    it('should validate that createDto is not null or undefined', async () => {
      // Given - Arrange
      const createDto = null as any;

      // When & Then - Act & Assert
      await expect(service.create(createDto)).rejects.toThrow(
        BadRequestException,
      );
      await expect(service.create(createDto)).rejects.toThrow(
        'CreateDto cannot be null or undefined',
      );
      expect(mockRepository.create).not.toHaveBeenCalled();
      expect(mockLogger.error).toHaveBeenCalledWith(
        'CreateDto cannot be null or undefined',
        '',
        'BaseService',
      );
    });
  });
});
