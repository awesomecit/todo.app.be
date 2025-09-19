import { Logger } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { CreateUserDto } from './dto/create-user.dto';
import { User, UserRole } from './entities/user.entity';
import { UserRepository } from './repositories/user.repository';
import { UserService } from './users.service';

describe('UserService - Integration Tests', () => {
  let service: UserService;
  let mockUserRepository: any;
  let mockLogger: any;

  beforeEach(async () => {
    // Create mock UserRepository with all required methods
    mockUserRepository = {
      create: jest.fn(),
      findById: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
      findAll: jest.fn(),
      findByEmail: jest.fn(),
      findActiveUsers: jest.fn(),
      findByRole: jest.fn(),
      emailExists: jest.fn(),
    };

    // Create mock logger
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

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // Given
      const createUserDto: CreateUserDto = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
        role: UserRole.USER,
      };

      const expectedUser: User = {
        id: '123',
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'hashedPassword',
        role: UserRole.USER,
        isActiveUser: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      } as User;

      mockUserRepository.create.mockResolvedValue(expectedUser);

      // When
      const result = await service.create(createUserDto);

      // Then
      expect(result).toBe(expectedUser);
      expect(mockUserRepository.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should throw error when user creation fails', async () => {
      // Given
      const createUserDto: CreateUserDto = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
      };

      const createError = new Error('Database error');
      mockUserRepository.create.mockRejectedValue(createError);

      // When & Then
      await expect(service.create(createUserDto)).rejects.toThrow(
        'Database error',
      );
    });
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      // Given
      const email = 'mario.rossi@example.com';
      const expectedUser: User = {
        id: '123',
        email,
        firstName: 'Mario',
        lastName: 'Rossi',
      } as User;

      mockUserRepository.findByEmail.mockResolvedValue(expectedUser);

      // When
      const result = await service.findByEmail(email);

      // Then
      expect(result).toBe(expectedUser);
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should return null when user not found by email', async () => {
      // Given
      const email = 'nonexistent@example.com';
      mockUserRepository.findByEmail.mockResolvedValue(null);

      // When
      const result = await service.findByEmail(email);

      // Then
      expect(result).toBeNull();
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith(email);
    });

    it('should handle error when finding user by email', async () => {
      // Given
      const email = 'error@example.com';
      const findError = new Error('Database connection failed');
      mockUserRepository.findByEmail.mockRejectedValue(findError);

      // When & Then
      await expect(service.findByEmail(email)).rejects.toThrow(
        'Database connection failed',
      );
    });
  });

  describe('isEmailTaken', () => {
    it('should return true when email exists', async () => {
      // Given
      const email = 'existing@example.com';
      mockUserRepository.emailExists.mockResolvedValue(true);

      // When
      const result = await service.isEmailTaken(email);

      // Then
      expect(result).toBe(true);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(email);
    });

    it('should return false when email does not exist', async () => {
      // Given
      const email = 'available@example.com';
      mockUserRepository.emailExists.mockResolvedValue(false);

      // When
      const result = await service.isEmailTaken(email);

      // Then
      expect(result).toBe(false);
      expect(mockUserRepository.emailExists).toHaveBeenCalledWith(email);
    });
  });

  describe('getActiveUsers', () => {
    it('should return all active users', async () => {
      // Given
      const activeUsers: User[] = [
        {
          id: '1',
          firstName: 'Mario',
          lastName: 'Rossi',
          isActiveUser: true,
        } as User,
        {
          id: '2',
          firstName: 'Anna',
          lastName: 'Verdi',
          isActiveUser: true,
        } as User,
      ];

      mockUserRepository.findActiveUsers.mockResolvedValue(activeUsers);

      // When
      const result = await service.getActiveUsers();

      // Then
      expect(result).toBe(activeUsers);
      expect(mockUserRepository.findActiveUsers).toHaveBeenCalled();
    });

    it('should handle error when retrieving active users', async () => {
      // Given
      const retrieveError = new Error('Database connection lost');
      mockUserRepository.findActiveUsers.mockRejectedValue(retrieveError);

      // When & Then
      await expect(service.getActiveUsers()).rejects.toThrow(
        'Database connection lost',
      );
    });
  });
});
