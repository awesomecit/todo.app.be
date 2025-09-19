import { plainToInstance } from 'class-transformer';
import { validate } from 'class-validator';
import { CreateUserDto, UserRole } from './create-user.dto';

describe('CreateUserDto', () => {
  describe('Validation Tests', () => {
    it('should pass validation with valid data', async () => {
      // Given
      const validUserData = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
        role: UserRole.USER,
      };

      // When
      const dto = plainToInstance(CreateUserDto, validUserData);
      const errors = await validate(dto);

      // Then
      expect(errors).toHaveLength(0);
      expect(dto.firstName).toBe('Mario');
      expect(dto.lastName).toBe('Rossi');
      expect(dto.email).toBe('mario.rossi@example.com');
      expect(dto.role).toBe(UserRole.USER);
    });

    it('should fail validation with empty firstName', async () => {
      // Given
      const invalidUserData = {
        firstName: '',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
      };

      // When
      const dto = plainToInstance(CreateUserDto, invalidUserData);
      const errors = await validate(dto);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('firstName');
      expect(errors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with invalid email format', async () => {
      // Given
      const invalidUserData = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'invalid-email',
        password: 'SecurePassword123!',
      };

      // When
      const dto = plainToInstance(CreateUserDto, invalidUserData);
      const errors = await validate(dto);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('email');
      expect(errors[0].constraints).toHaveProperty('isEmail');
    });

    it('should fail validation with short password', async () => {
      // Given
      const invalidUserData = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: '123', // Too short
      };

      // When
      const dto = plainToInstance(CreateUserDto, invalidUserData);
      const errors = await validate(dto);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('password');
      expect(errors[0].constraints).toHaveProperty('minLength');
    });

    it('should fail validation with invalid role', async () => {
      // Given
      const invalidUserData = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
        role: 'invalid-role' as UserRole,
      };

      // When
      const dto = plainToInstance(CreateUserDto, invalidUserData);
      const errors = await validate(dto);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('role');
      expect(errors[0].constraints).toHaveProperty('isEnum');
    });

    it('should transform email to lowercase and trim whitespace', async () => {
      // Given
      const userDataWithWhitespace = {
        firstName: '  Mario  ',
        lastName: '  Rossi  ',
        email: '  MARIO.ROSSI@EXAMPLE.COM  ',
        password: 'SecurePassword123!',
      };

      // When
      const dto = plainToInstance(CreateUserDto, userDataWithWhitespace);
      const errors = await validate(dto);

      // Then
      expect(errors).toHaveLength(0);
      expect(dto.firstName).toBe('Mario');
      expect(dto.lastName).toBe('Rossi');
      expect(dto.email).toBe('mario.rossi@example.com');
    });

    it('should use default role when not provided', async () => {
      // Given
      const userDataWithoutRole = {
        firstName: 'Mario',
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
      };

      // When
      const dto = plainToInstance(CreateUserDto, userDataWithoutRole);
      const errors = await validate(dto);

      // Then
      expect(errors).toHaveLength(0);
      expect(dto.role).toBe(UserRole.USER);
    });

    it('should fail validation with firstName too long', async () => {
      // Given
      const invalidUserData = {
        firstName: 'A'.repeat(51), // 51 characters, exceeds maxLength of 50
        lastName: 'Rossi',
        email: 'mario.rossi@example.com',
        password: 'SecurePassword123!',
      };

      // When
      const dto = plainToInstance(CreateUserDto, invalidUserData);
      const errors = await validate(dto);

      // Then
      expect(errors).toHaveLength(1);
      expect(errors[0].property).toBe('firstName');
      expect(errors[0].constraints).toHaveProperty('maxLength');
    });

    it('should fail validation with missing required fields', async () => {
      // Given
      const incompleteUserData = {};

      // When
      const dto = plainToInstance(CreateUserDto, incompleteUserData);
      const errors = await validate(dto);

      // Then
      expect(errors.length).toBeGreaterThan(0);
      const propertyNames = errors.map(error => error.property);
      expect(propertyNames).toContain('firstName');
      expect(propertyNames).toContain('lastName');
      expect(propertyNames).toContain('email');
      expect(propertyNames).toContain('password');
    });
  });
});
