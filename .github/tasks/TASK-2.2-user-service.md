---
title: 'User Service & Repository Pattern'
epic: 'EPIC-002-users-management'
story: 'STORY-002-users-module'
task_id: 'TASK-2.2'
status: 'todo'
priority: 'high'
estimated_hours: 4
tags: ['service', 'repository', 'crud', 'validation', 'tdd']
assignee: 'developer'
created_date: '2025-09-17'
depends_on: ['TASK-2.1']
---

# TASK-2.2: User Service & Repository Pattern

**Epic**: [EPIC-002] Users Management System
**Story**: [STORY-002] Users Module Implementation
**Duration**: 4 hours
**Prerequisites**: User entity created, TypeORM repository configured

## 🎯 Objective

Implement enterprise-grade User service following Repository pattern with comprehensive CRUD operations, validation, error handling, and business logic following SOLID principles.

## ✅ Acceptance Criteria

- [ ] UserService implements all CRUD operations
- [ ] Custom UserRepository with advanced queries
- [ ] Comprehensive input validation with DTOs
- [ ] Error handling with custom exceptions
- [ ] Transaction support for complex operations
- [ ] Service layer business logic separation
- [ ] Test coverage 85%+ with TDD approach
- [ ] Integration tests with database

## 🔧 Implementation Steps (TDD Approach)

### 1. 🔴 Red Phase: Service Tests First

Create `src/users/users.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { getRepositoryToken } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Repository } from 'typeorm';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: Repository<User>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: getRepositoryToken(User),
          useValue: {
            create: jest.fn(),
            save: jest.fn(),
            find: jest.fn(),
            findOne: jest.fn(),
            update: jest.fn(),
            delete: jest.fn(),
            createQueryBuilder: jest.fn(),
          },
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<Repository<User>>(getRepositoryToken(User));
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      // GIVEN: Valid user data
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'password123',
        firstName: 'John',
        lastName: 'Doe',
      };

      const savedUser = { id: '1', ...createUserDto };
      jest.spyOn(repository, 'create').mockReturnValue(savedUser as User);
      jest.spyOn(repository, 'save').mockResolvedValue(savedUser as User);

      // WHEN: Creating user
      const result = await service.create(createUserDto);

      // THEN: User should be created without password
      expect(result).toBeDefined();
      expect(result.email).toBe(createUserDto.email);
      expect(result.password).toBeUndefined(); // Password should be excluded
    });

    it('should throw ConflictException for duplicate email', async () => {
      // GIVEN: Duplicate email
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'password123',
      };

      jest.spyOn(repository, 'save').mockRejectedValue({ code: '23505' });

      // WHEN & THEN: Should throw conflict exception
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      // Test pagination logic
    });
  });

  describe('findByEmail', () => {
    it('should find user by email', async () => {
      // Test email lookup
    });
  });
});
```

### 2. 🟢 Green Phase: Service Implementation

Create `src/users/dto/create-user.dto.ts`:

```typescript
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsOptional,
  IsEnum,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { UserRole } from '../entities/user.entity';

export class CreateUserDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password (minimum 8 characters)',
    example: 'SecurePass123!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, number/special character',
  })
  password: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  @IsOptional()
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  @IsOptional()
  lastName?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    default: UserRole.USER,
    required: false,
  })
  @IsOptional()
  @IsEnum(UserRole, { message: 'Role must be a valid user role' })
  role?: UserRole;
}
```

Create `src/users/dto/update-user.dto.ts`:

```typescript
import { PartialType, OmitType } from '@nestjs/swagger';
import { CreateUserDto } from './create-user.dto';

export class UpdateUserDto extends PartialType(
  OmitType(CreateUserDto, ['password'] as const),
) {}

export class ChangePasswordDto {
  @IsNotEmpty({ message: 'Current password is required' })
  currentPassword: string;

  @IsNotEmpty({ message: 'New password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  @Matches(/((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/, {
    message:
      'Password must contain uppercase, lowercase, number/special character',
  })
  newPassword: string;
}
```

Create `src/users/dto/index.ts`:

```typescript
export * from './create-user.dto';
export * from './update-user.dto';
export * from './user-response.dto';
```

Create `src/users/users.service.ts`:

```typescript
import {
  Injectable,
  ConflictException,
  NotFoundException,
  BadRequestException,
  InternalServerErrorException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, QueryFailedError } from 'typeorm';
import { User, UserStatus } from './entities/user.entity';
import { CreateUserDto, UpdateUserDto, ChangePasswordDto } from './dto';
import { classToPlain } from 'class-transformer';

export interface PaginationOptions {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'ASC' | 'DESC';
}

export interface PaginatedResult<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<Omit<User, 'password'>> {
    try {
      const user = this.userRepository.create(createUserDto);
      const savedUser = await this.userRepository.save(user);

      // Remove password from response
      return classToPlain(savedUser) as Omit<User, 'password'>;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException('User with this email already exists');
      }
      throw new InternalServerErrorException('Failed to create user');
    }
  }

  async findAll(
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Omit<User, 'password'>>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const skip = (page - 1) * limit;

    const [users, total] = await this.userRepository.findAndCount({
      skip,
      take: limit,
      order: { [sortBy]: sortOrder },
      where: { status: UserStatus.ACTIVE },
    });

    const usersWithoutPassword = users.map(user => classToPlain(user)) as Omit<
      User,
      'password'
    >[];

    return {
      data: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string): Promise<Omit<User, 'password'>> {
    const user = await this.userRepository.findOne({
      where: { id, status: UserStatus.ACTIVE },
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    return classToPlain(user) as Omit<User, 'password'>;
  }

  async findByEmail(
    email: string,
    includePassword = false,
  ): Promise<User | null> {
    const user = await this.userRepository.findOne({
      where: { email, status: UserStatus.ACTIVE },
    });

    if (!user) {
      return null;
    }

    if (!includePassword) {
      return classToPlain(user) as User;
    }

    return user;
  }

  async update(
    id: string,
    updateUserDto: UpdateUserDto,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.findOne(id);

    try {
      await this.userRepository.update(id, updateUserDto);
      const updatedUser = await this.findOne(id);
      return updatedUser;
    } catch (error) {
      if (
        error instanceof QueryFailedError &&
        error.driverError?.code === '23505'
      ) {
        throw new ConflictException('Email already exists');
      }
      throw new InternalServerErrorException('Failed to update user');
    }
  }

  async changePassword(
    id: string,
    changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    const user = await this.userRepository.findOne({ where: { id } });

    if (!user) {
      throw new NotFoundException(`User with ID ${id} not found`);
    }

    const isCurrentPasswordValid = await user.comparePassword(
      changePasswordDto.currentPassword,
    );
    if (!isCurrentPasswordValid) {
      throw new BadRequestException('Current password is incorrect');
    }

    user.password = changePasswordDto.newPassword;
    await this.userRepository.save(user);
  }

  async deactivate(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.update(id, { status: UserStatus.INACTIVE });
  }

  async remove(id: string): Promise<void> {
    const user = await this.findOne(id);
    await this.userRepository.delete(id);
  }

  // Advanced query methods
  async searchUsers(
    searchTerm: string,
    options: PaginationOptions = {},
  ): Promise<PaginatedResult<Omit<User, 'password'>>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'DESC',
    } = options;

    const skip = (page - 1) * limit;

    const queryBuilder = this.userRepository.createQueryBuilder('user');

    queryBuilder
      .where('user.status = :status', { status: UserStatus.ACTIVE })
      .andWhere(
        '(user.email ILIKE :searchTerm OR user.firstName ILIKE :searchTerm OR user.lastName ILIKE :searchTerm)',
        { searchTerm: `%${searchTerm}%` },
      )
      .orderBy(`user.${sortBy}`, sortOrder)
      .skip(skip)
      .take(limit);

    const [users, total] = await queryBuilder.getManyAndCount();

    const usersWithoutPassword = users.map(user => classToPlain(user)) as Omit<
      User,
      'password'
    >[];

    return {
      data: usersWithoutPassword,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    };
  }

  async updateLastLoginAt(id: string): Promise<void> {
    await this.userRepository.update(id, { lastLoginAt: new Date() });
  }
}
```

### 3. 🔄 Refactor Phase: Advanced Features

Add custom repository with advanced queries:

```typescript
// src/users/repositories/user.repository.ts
import { Repository } from 'typeorm';
import { User } from '../entities/user.entity';

export interface IUserRepository extends Repository<User> {
  findActiveUsers(): Promise<User[]>;
  findByEmailWithPassword(email: string): Promise<User | null>;
  countByRole(role: string): Promise<number>;
}

export class CustomUserRepository
  extends Repository<User>
  implements IUserRepository
{
  async findActiveUsers(): Promise<User[]> {
    return this.createQueryBuilder('user')
      .where('user.status = :status', { status: 'active' })
      .getMany();
  }

  async findByEmailWithPassword(email: string): Promise<User | null> {
    return this.createQueryBuilder('user')
      .addSelect('user.password')
      .where('user.email = :email', { email })
      .getOne();
  }

  async countByRole(role: string): Promise<number> {
    return this.createQueryBuilder('user')
      .where('user.role = :role', { role })
      .getCount();
  }
}
```

## 🧪 Testing & Validation

### Integration Tests

Create `src/users/users.service.integration.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { DatabaseTestHelper } from '../test/database-test-helper';

describe('UsersService (Integration)', () => {
  let service: UsersService;
  let dbHelper: DatabaseTestHelper;

  beforeAll(async () => {
    dbHelper = new DatabaseTestHelper();
    await dbHelper.setup();

    const module: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot(dbHelper.getConfig()),
        TypeOrmModule.forFeature([User]),
      ],
      providers: [UsersService],
    }).compile();

    service = module.get<UsersService>(UsersService);
  });

  afterAll(async () => {
    await dbHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.clearDatabase();
  });

  it('should create and retrieve user', async () => {
    // GIVEN: Valid user data
    const createUserDto = {
      email: 'test@example.com',
      password: 'Password123!',
      firstName: 'John',
      lastName: 'Doe',
    };

    // WHEN: Creating user
    const createdUser = await service.create(createUserDto);

    // THEN: User should be retrievable
    const foundUser = await service.findOne(createdUser.id);
    expect(foundUser.email).toBe(createUserDto.email);
    expect(foundUser.password).toBeUndefined();
  });
});
```

## 📋 Definition of Done

- ✅ UsersService implements all CRUD operations
- ✅ Custom repository with advanced queries
- ✅ DTOs with comprehensive validation
- ✅ Error handling with appropriate HTTP status codes
- ✅ Password security (exclusion from responses)
- ✅ Pagination and search functionality
- ✅ Unit tests with 85%+ coverage
- ✅ Integration tests with real database
- ✅ Transaction support for complex operations

## 🔗 Related Tasks

- **Previous**: [TASK-2.1] User Entity & Database Schema
- **Next**: [TASK-2.3] User Controller & API Endpoints
- **Enables**: [TASK-2.4] Authentication Service & JWT

## 📝 Notes

### Performance Considerations

- Use pagination for large datasets
- Implement query optimization with proper indexes
- Consider caching for frequently accessed data
- Use select queries to avoid loading unnecessary data

### Security Best Practices

- Never expose password in API responses
- Validate all input data with DTOs
- Use parameterized queries to prevent SQL injection
- Implement proper error handling without exposing sensitive information

## 🐛 Troubleshooting

**Issue**: Service not injecting repository
**Solution**: Ensure TypeOrmModule.forFeature([User]) is imported in module

**Issue**: Password still visible in responses
**Solution**: Check class-transformer configuration and @Exclude decorator

**Issue**: Validation not working
**Solution**: Ensure ValidationPipe is configured globally in main.ts

**Issue**: Database connection errors in tests
**Solution**: Use separate test database configuration
