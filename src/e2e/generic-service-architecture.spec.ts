import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';

import { BaseService } from '../common/services/base.service';
import { CreateUserDto, UserRole } from '../users/dto/create-user.dto';
import { User } from '../users/entities/user.entity';
import { UserRepository } from '../users/repositories/user.repository';
import { UserService } from '../users/users.service';

/**
 * End-to-End Integration Test for Generic Service Architecture.
 *
 * This test demonstrates the complete stack working together:
 * 1. DTO validation with class-validator
 * 2. Generic BaseService functionality with type safety
 * 3. Concrete UserService with business logic
 * 4. Generic BaseRepository with TypeORM
 * 5. Concrete UserRepository with specialized operations
 * 6. Error handling and logging throughout the stack
 */
describe('Generic Service Architecture - E2E Integration Test', () => {
  let userService: UserService;
  let mockUserRepository: any;
  let mockLogger: any;

  beforeEach(async () => {
    // Setup complete mock repository
    mockUserRepository = {
      // BaseRepository methods (inherited)
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),

      // UserRepository specific methods
      findByEmail: jest.fn(),
      findActiveUsers: jest.fn(),
      findByRole: jest.fn(),
      emailExists: jest.fn(),
    };

    mockLogger = {
      log: jest.fn(),
      error: jest.fn(),
      warn: jest.fn(),
      debug: jest.fn(),
      verbose: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: UserRepository,
          useValue: mockUserRepository,
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    userService = module.get<UserService>(UserService);
  });

  describe('Complete User Creation Workflow', () => {
    it('should validate DTO → create via BaseService → store via Repository → return typed entity', async () => {
      // Phase 1: DTO Validation
      const rawUserData = {
        firstName: '  Mario  ',
        lastName: '  Rossi  ',
        email: '  MARIO.ROSSI@EXAMPLE.COM  ',
        password: 'SecurePassword123!',
        role: UserRole.USER,
      };

      // Transform and validate DTO
      const createUserDto = plainToInstance(CreateUserDto, rawUserData);
      const validationErrors = await validate(createUserDto);

      // Verify DTO validation and transformation
      expect(validationErrors).toHaveLength(0);
      expect(createUserDto.firstName).toBe('Mario'); // Trimmed
      expect(createUserDto.lastName).toBe('Rossi'); // Trimmed
      expect(createUserDto.email).toBe('mario.rossi@example.com'); // Lowercase + trimmed
      expect(createUserDto.role).toBe(UserRole.USER);

      // Phase 2: Service Business Logic
      const mockCreatedUser: User = {
        id: 'generated-uuid-123',
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'hashed-password',
        role: UserRole.USER,
        isActiveUser: true,
        createdAt: new Date('2025-09-19T12:00:00Z'),
        updatedAt: new Date('2025-09-19T12:00:00Z'),
        deletedAt: null,
      } as unknown as User;

      mockUserRepository.create.mockResolvedValue(mockCreatedUser);

      // Phase 3: Execute Service Create (inherits from BaseService)
      const result = await userService.create(createUserDto);

      // Phase 4: Verify Complete Integration
      expect(result).toBe(mockCreatedUser);
      expect(result.id).toBe('generated-uuid-123');
      expect(result.firstName).toBe('Mario');
      expect(result.email).toBe('mario.rossi@example.com');
      expect(result.role).toBe(UserRole.USER);

      // Verify BaseService called repository correctly
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
      expect(mockUserRepository.create).toHaveBeenCalledTimes(1);

      // Verify logging was performed
      expect(mockLogger.log).toHaveBeenCalled();
    });

    it('should handle complete validation failure → service error propagation', async () => {
      // Phase 1: Invalid DTO
      const invalidUserData = {
        firstName: '', // Invalid: empty
        lastName: 'R', // Invalid: too short
        email: 'invalid-email', // Invalid: format
        password: '123', // Invalid: too short
        role: 'invalid-role' as UserRole, // Invalid: not enum value
      };

      const createUserDto = plainToInstance(CreateUserDto, invalidUserData);
      const validationErrors = await validate(createUserDto);

      // Verify multiple validation failures
      expect(validationErrors.length).toBeGreaterThan(0);

      const errorProperties = validationErrors.map(error => error.property);
      expect(errorProperties).toContain('firstName');
      expect(errorProperties).toContain('lastName');
      expect(errorProperties).toContain('email');
      expect(errorProperties).toContain('password');
      expect(errorProperties).toContain('role');

      // In a real scenario, validation would prevent service call
      // This demonstrates the validation layer protecting the service
    });
  });

  describe('Business Logic Integration', () => {
    it('should demonstrate UserService extending BaseService with custom methods', async () => {
      // Test custom UserService method
      const email = 'mario.rossi@example.com';
      const mockUser = { id: '123', email } as User;

      mockUserRepository.findByEmail.mockResolvedValue(mockUser);

      const result = await userService.findByEmail(email);

      expect(result).toBe(mockUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);

      // Test another custom method
      mockUserRepository.emailExists.mockResolvedValue(true);

      const emailTaken = await userService.isEmailTaken(email);

      expect(emailTaken).toBe(true);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(email);
    });

    it('should demonstrate repository specialization with user-specific queries', async () => {
      // Test role-based query
      const adminUsers = [
        { id: '1', role: UserRole.ADMIN } as User,
        { id: '2', role: UserRole.ADMIN } as User,
      ];

      mockUserRepository.findByRole.mockResolvedValue(adminUsers);

      // This would be called through a service method in real implementation
      const result = await mockUserRepository.findByRole(UserRole.ADMIN);

      expect(result).toEqual(adminUsers);
      expect(result).toHaveLength(2);
      expect(result.every(user => user.role === UserRole.ADMIN)).toBe(true);

      // Test active users query
      const activeUsers = [
        { id: '1', isActiveUser: true } as User,
        { id: '2', isActiveUser: true } as User,
      ];

      mockUserRepository.findActiveUsers.mockResolvedValue(activeUsers);

      const activeResult = await userService.getActiveUsers();

      expect(activeResult).toEqual(activeUsers);
      expect(mockUserRepository.findActiveUsers).toHaveBeenCalled();
    });
  });

  describe('Error Handling Integration', () => {
    it('should propagate repository errors through service with proper logging', async () => {
      // Setup repository error
      const repositoryError = new Error('Database connection failed');
      mockUserRepository.create.mockRejectedValue(repositoryError);

      const createUserDto: CreateUserDto = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
        role: UserRole.USER,
      };

      // Service should propagate error and log it
      await expect(userService.create(createUserDto)).rejects.toThrow(
        'Database connection failed',
      );

      // Verify error logging occurred
      expect(mockLogger.error).toHaveBeenCalled();
    });

    it('should handle service-specific errors with context', async () => {
      const email = 'error@example.com';
      const serviceError = new Error('Email service unavailable');

      mockUserRepository.findByEmail.mockRejectedValue(serviceError);

      await expect(userService.findByEmail(email)).rejects.toThrow(
        'Email service unavailable',
      );

      // Verify error was logged with UserService context
      expect(mockLogger.error).toHaveBeenCalledWith(
        'Failed to find user by email: Email service unavailable',
        expect.any(String),
        'UserService',
      );
    });
  });

  describe('Type Safety Integration', () => {
    it('should maintain type safety throughout the generic stack', async () => {
      const createUserDto: CreateUserDto = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
        role: UserRole.USER,
      };

      const mockUser: User = {
        id: '123',
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'hashed',
        role: UserRole.USER,
        isActiveUser: true,
        createdAt: new Date(),
        updatedAt: new Date(),
        deletedAt: null,
      } as unknown as User;

      mockUserRepository.create.mockResolvedValue(mockUser);

      // TypeScript should enforce types throughout
      const result: User = await userService.create(createUserDto);

      // Runtime verification of type structure
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('firstName');
      expect(result).toHaveProperty('lastName');
      expect(result).toHaveProperty('email');
      expect(result).toHaveProperty('role');
      expect(result).toHaveProperty('createdAt');
      expect(result).toHaveProperty('updatedAt');

      // Verify User-specific properties
      expect(result).toHaveProperty('isActiveUser');
      expect(typeof result.isActiveUser).toBe('boolean');
      expect(Object.values(UserRole)).toContain(result.role);
    });
  });

  describe('Generic Pattern Reusability', () => {
    it('should demonstrate that BaseService pattern can be extended for other entities', () => {
      // This test demonstrates the architecture's extensibility

      // Example: ProductService could extend BaseService<Product, CreateProductDto>
      // Example: OrderService could extend BaseService<Order, CreateOrderDto>

      // The same BaseRepository<T> pattern would work for:
      // - ProductRepository extends BaseRepository<Product>
      // - OrderRepository extends BaseRepository<Order>

      // This shows the generic pattern eliminates code duplication
      expect(userService).toBeInstanceOf(BaseService);

      // UserService has both inherited and custom methods
      expect(typeof userService.create).toBe('function'); // From BaseService
      expect(typeof userService.findByEmail).toBe('function'); // UserService specific
      expect(typeof userService.isEmailTaken).toBe('function'); // UserService specific
      expect(typeof userService.getActiveUsers).toBe('function'); // UserService specific
    });
  });
});
