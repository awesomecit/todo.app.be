import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { User, UserRole } from '../entities/user.entity';
import { UserRepository } from './user.repository';

describe('UserRepository', () => {
  let userRepository: UserRepository;
  let mockDataSource: jest.Mocked<DataSource>;
  let mockRepository: any;

  beforeEach(async () => {
    // Given - Mock TypeORM repository
    mockRepository = {
      findOne: jest.fn(),
      find: jest.fn(),
      count: jest.fn(),
      update: jest.fn(),
      save: jest.fn(),
      findOneBy: jest.fn(),
      remove: jest.fn(),
    };

    // Mock DataSource
    mockDataSource = {
      getRepository: jest.fn().mockReturnValue(mockRepository),
    } as any;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserRepository,
        {
          provide: DataSource,
          useValue: mockDataSource,
        },
      ],
    }).compile();

    userRepository = module.get<UserRepository>(UserRepository);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('findByEmail', () => {
    it('should find user by email successfully', async () => {
      // Given
      const email = 'MARIO.ROSSI@EXAMPLE.COM';
      const expectedUser = {
        id: '123',
        email: 'mario.rossi@example.com',
        firstName: 'Mario',
        lastName: 'Rossi',
      } as User;

      mockRepository.findOne.mockResolvedValue(expectedUser);

      // When
      const result = await userRepository.findByEmail(email);

      // Then
      expect(result).toBe(expectedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'mario.rossi@example.com' }, // Should be lowercase and trimmed
      });
    });

    it('should return null when user not found by email', async () => {
      // Given
      const email = 'nonexistent@example.com';
      mockRepository.findOne.mockResolvedValue(null);

      // When
      const result = await userRepository.findByEmail(email);

      // Then
      expect(result).toBeNull();
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: email.toLowerCase().trim() },
      });
    });

    it('should handle email with whitespace correctly', async () => {
      // Given
      const emailWithWhitespace = '  mario.rossi@example.com  ';
      const expectedUser = {
        id: '123',
        email: 'mario.rossi@example.com',
      } as User;

      mockRepository.findOne.mockResolvedValue(expectedUser);

      // When
      const result = await userRepository.findByEmail(emailWithWhitespace);

      // Then
      expect(result).toBe(expectedUser);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'mario.rossi@example.com' },
      });
    });
  });

  describe('findActiveUsers', () => {
    it('should find all active users', async () => {
      // Given
      const expectedUsers = [
        { id: '1', isActiveUser: true, deletedAt: null },
        { id: '2', isActiveUser: true, deletedAt: null },
      ] as unknown as User[];

      mockRepository.find.mockResolvedValue(expectedUsers);

      // When
      const result = await userRepository.findActiveUsers();

      // Then
      expect(result).toEqual(expectedUsers);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          deletedAt: expect.anything(), // IsNull() call
          isActiveUser: true,
        },
      });
    });

    it('should return empty array when no active users found', async () => {
      // Given
      mockRepository.find.mockResolvedValue([]);

      // When
      const result = await userRepository.findActiveUsers();

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('findByRole', () => {
    it('should find users by specific role', async () => {
      // Given
      const role = UserRole.ADMIN;
      const expectedUsers = [
        { id: '1', role: UserRole.ADMIN },
        { id: '2', role: UserRole.ADMIN },
      ] as unknown as User[];

      mockRepository.find.mockResolvedValue(expectedUsers);

      // When
      const result = await userRepository.findByRole(role);

      // Then
      expect(result).toEqual(expectedUsers);
      expect(mockRepository.find).toHaveBeenCalledWith({
        where: {
          role,
          deletedAt: expect.anything(), // IsNull() call
        },
      });
    });

    it('should return empty array when no users found with role', async () => {
      // Given
      const role = UserRole.MODERATOR;
      mockRepository.find.mockResolvedValue([]);

      // When
      const result = await userRepository.findByRole(role);

      // Then
      expect(result).toEqual([]);
    });
  });

  describe('emailExists', () => {
    it('should return true when email exists', async () => {
      // Given
      const email = 'existing@example.com';
      mockRepository.count.mockResolvedValue(1);

      // When
      const result = await userRepository.emailExists(email);

      // Then
      expect(result).toBe(true);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { email: email.toLowerCase().trim() },
      });
    });

    it('should return false when email does not exist', async () => {
      // Given
      const email = 'nonexistent@example.com';
      mockRepository.count.mockResolvedValue(0);

      // When
      const result = await userRepository.emailExists(email);

      // Then
      expect(result).toBe(false);
    });

    it('should handle email case and whitespace correctly', async () => {
      // Given
      const email = '  EXISTING@EXAMPLE.COM  ';
      mockRepository.count.mockResolvedValue(1);

      // When
      const result = await userRepository.emailExists(email);

      // Then
      expect(result).toBe(true);
      expect(mockRepository.count).toHaveBeenCalledWith({
        where: { email: 'existing@example.com' },
      });
    });
  });

  describe('remove', () => {
    it('should soft delete user by deactivating and calling parent remove', async () => {
      // Given
      const userId = '123';
      mockRepository.update.mockResolvedValue({ affected: 1 });

      // Mock the inherited remove method call
      const parentRemoveSpy = jest
        .spyOn(
          Object.getPrototypeOf(Object.getPrototypeOf(userRepository)),
          'remove',
        )
        .mockResolvedValue(undefined);

      // When
      await userRepository.remove(userId);

      // Then
      expect(mockRepository.update).toHaveBeenCalledWith(userId, {
        isActiveUser: false,
        updatedAt: expect.any(Date),
      });
      expect(parentRemoveSpy).toHaveBeenCalledWith(userId);
    });

    it('should throw error when update fails', async () => {
      // Given
      const userId = '123';
      const updateError = new Error('Update failed');
      mockRepository.update.mockRejectedValue(updateError);

      // When & Then
      await expect(userRepository.remove(userId)).rejects.toThrow(
        'Update failed',
      );
    });
  });
});
