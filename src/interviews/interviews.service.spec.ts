import { Test, TestingModule } from '@nestjs/testing';
import { CustomLogger } from '../common/logger/logger.service';
import { InterviewsService } from './interviews.service';

describe('InterviewsService', () => {
  let service: InterviewsService;
  let loggerService: CustomLogger;

  beforeEach(async () => {
    // Given: Setup test environment
    const mockLoggerService = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InterviewsService,
        {
          provide: CustomLogger,
          useValue: mockLoggerService,
        },
      ],
    }).compile();

    service = module.get<InterviewsService>(InterviewsService);
    loggerService = module.get<CustomLogger>(CustomLogger);
  });

  describe('Service Initialization', () => {
    it('should be defined', () => {
      // Given: Service is instantiated
      // When: Service is checked for existence
      // Then: Service should be defined
      expect(service).toBeDefined();
    });

    it('should have logger service injected', () => {
      // Given: Service is instantiated with logger dependency
      // When: Logger service is checked
      // Then: Logger service should be defined
      expect(loggerService).toBeDefined();
    });
  });

  describe('getAll', () => {
    it('should return an array of interviews', () => {
      // Given: Service is ready to fetch interviews
      // When: getAll method is called
      const result = service.getAll();

      // Then: Should return an array
      expect(result).toBeInstanceOf(Array);
      expect(result).toHaveLength(0); // Initially empty
    });

    it('should log the operation', () => {
      // Given: Service is ready and logger is mocked
      // When: getAll method is called
      service.getAll();

      // Then: Logger should be called with appropriate message
      expect(loggerService.log).toHaveBeenCalledWith(
        'Fetching all interviews',
        'InterviewsService',
      );
    });
  });

  describe('getById', () => {
    it('should return undefined for non-existent interview', () => {
      // Given: Service is ready and no interviews exist
      const nonExistentId = 999;

      // When: getById is called with non-existent id
      const result = service.getById(nonExistentId);

      // Then: Should return undefined
      expect(result).toBeUndefined();
    });

    it('should log the operation with id', () => {
      // Given: Service is ready and logger is mocked
      const testId = 1;

      // When: getById method is called
      service.getById(testId);

      // Then: Logger should be called with appropriate message including id
      expect(loggerService.log).toHaveBeenCalledWith(
        `Fetching interview with id: ${testId}`,
        'InterviewsService',
      );
    });
  });

  describe('create', () => {
    it('should create a new interview with generated id', () => {
      // Given: Service is ready and interview data is provided
      const interviewData = {
        title: 'Frontend Developer Interview',
        description: 'Interview for senior frontend position',
        duration: 60,
      };

      // When: create method is called
      const result = service.create(interviewData);

      // Then: Should return created interview with id
      expect(result).toEqual({
        id: 1,
        ...interviewData,
        createdAt: expect.any(Date),
      });
    });

    it('should increment id for multiple interviews', () => {
      // Given: Service is ready and multiple interview data objects
      const firstInterview = {
        title: 'First Interview',
        description: 'First description',
        duration: 30,
      };
      const secondInterview = {
        title: 'Second Interview',
        description: 'Second description',
        duration: 45,
      };

      // When: create method is called multiple times
      const firstResult = service.create(firstInterview);
      const secondResult = service.create(secondInterview);

      // Then: Should have incremental ids
      expect(firstResult.id).toBe(1);
      expect(secondResult.id).toBe(2);
    });

    it('should log the create operation', () => {
      // Given: Service is ready and interview data is provided
      const interviewData = {
        title: 'Test Interview',
        description: 'Test description',
        duration: 30,
      };

      // When: create method is called
      service.create(interviewData);

      // Then: Logger should be called with appropriate message
      expect(loggerService.log).toHaveBeenCalledWith(
        'Creating new interview',
        'InterviewsService',
      );
    });
  });

  describe('update', () => {
    it('should return undefined for non-existent interview', () => {
      // Given: Service is ready and no interviews exist
      const nonExistentId = 999;
      const updateData = { title: 'Updated Title' };

      // When: update is called with non-existent id
      const result = service.update(nonExistentId, updateData);

      // Then: Should return undefined
      expect(result).toBeUndefined();
    });

    it('should update existing interview', () => {
      // Given: Service has an existing interview
      const originalData = {
        title: 'Original Title',
        description: 'Original description',
        duration: 60,
      };
      const createdInterview = service.create(originalData);
      const updateData = { title: 'Updated Title' };

      // When: update is called with valid id
      const result = service.update(createdInterview.id, updateData);

      // Then: Should return updated interview
      expect(result).toEqual({
        ...createdInterview,
        ...updateData,
      });
    });

    it('should log the update operation', () => {
      // Given: Service is ready
      const testId = 1;
      const updateData = { title: 'Updated Title' };

      // When: update method is called
      service.update(testId, updateData);

      // Then: Logger should be called with appropriate message
      expect(loggerService.log).toHaveBeenCalledWith(
        `Updating interview with id: ${testId}`,
        'InterviewsService',
      );
    });
  });

  describe('delete', () => {
    it('should return false for non-existent interview', () => {
      // Given: Service is ready and no interviews exist
      const nonExistentId = 999;

      // When: delete is called with non-existent id
      const result = service.delete(nonExistentId);

      // Then: Should return false
      expect(result).toBe(false);
    });

    it('should delete existing interview and return true', () => {
      // Given: Service has an existing interview
      const interviewData = {
        title: 'Interview to Delete',
        description: 'This will be deleted',
        duration: 30,
      };
      const createdInterview = service.create(interviewData);

      // When: delete is called with valid id
      const result = service.delete(createdInterview.id);

      // Then: Should return true and interview should be removed
      expect(result).toBe(true);
      expect(service.getById(createdInterview.id)).toBeUndefined();
    });

    it('should log the delete operation', () => {
      // Given: Service is ready
      const testId = 1;

      // When: delete method is called
      service.delete(testId);

      // Then: Logger should be called with appropriate message
      expect(loggerService.log).toHaveBeenCalledWith(
        `Deleting interview with id: ${testId}`,
        'InterviewsService',
      );
    });
  });

  describe('Error Handling', () => {
    it('should handle invalid input gracefully in create', () => {
      // Given: Service is ready and invalid data is provided
      const invalidData = null;

      // When/Then: Should throw error for invalid data
      expect(() => service.create(invalidData as any)).toThrow();
    });

    it('should handle negative ids gracefully', () => {
      // Given: Service is ready
      const negativeId = -1;

      // When: Methods are called with negative id
      const getResult = service.getById(negativeId);
      const updateResult = service.update(negativeId, {});
      const deleteResult = service.delete(negativeId);

      // Then: Should handle gracefully
      expect(getResult).toBeUndefined();
      expect(updateResult).toBeUndefined();
      expect(deleteResult).toBe(false);
    });
  });
});
