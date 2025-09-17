---
title: 'User Controller & API Endpoints'
epic: 'EPIC-002-users-management'
story: 'STORY-002-users-module'
task_id: 'TASK-2.3'
status: 'todo'
priority: 'high'
estimated_hours: 3
tags: ['controller', 'api', 'swagger', 'validation', 'tdd']
assignee: 'developer'
created_date: '2025-09-17'
depends_on: ['TASK-2.2']
---

# TASK-2.3: User Controller & API Endpoints

**Epic**: [EPIC-002] Users Management System
**Story**: [STORY-002] Users Module Implementation
**Duration**: 3 hours
**Prerequisites**: User service and DTOs implemented

## 🎯 Objective

Create RESTful API controller for User management with comprehensive Swagger documentation, proper HTTP status codes, validation, and enterprise-grade error handling.

## ✅ Acceptance Criteria

- [ ] UserController with full CRUD REST endpoints
- [ ] Swagger/OpenAPI documentation complete
- [ ] Request/Response DTOs with validation
- [ ] Proper HTTP status codes and error responses
- [ ] Pagination and filtering support
- [ ] Controller tests with 85%+ coverage
- [ ] E2E tests for API endpoints
- [ ] Rate limiting considerations

## 🔧 Implementation Steps (TDD Approach)

### 1. 🔴 Red Phase: Controller Tests First

Create `src/users/users.controller.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { CreateUserDto, UpdateUserDto } from './dto';
import { ConflictException, NotFoundException } from '@nestjs/common';

describe('UsersController', () => {
  let controller: UsersController;
  let service: UsersService;

  const mockUsersService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
    searchUsers: jest.fn(),
    changePassword: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [
        {
          provide: UsersService,
          useValue: mockUsersService,
        },
      ],
    }).compile();

    controller = module.get<UsersController>(UsersController);
    service = module.get<UsersService>(UsersService);
  });

  describe('create', () => {
    it('should create a new user', async () => {
      // GIVEN: Valid user data
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        password: 'Password123!',
        firstName: 'John',
        lastName: 'Doe',
      };

      const expectedResult = {
        id: '1',
        email: 'test@example.com',
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockUsersService.create.mockResolvedValue(expectedResult);

      // WHEN: Creating user via controller
      const result = await controller.create(createUserDto);

      // THEN: Should return created user without password
      expect(result).toEqual(expectedResult);
      expect(service.create).toHaveBeenCalledWith(createUserDto);
    });

    it('should handle duplicate email error', async () => {
      // GIVEN: Duplicate email
      const createUserDto: CreateUserDto = {
        email: 'existing@example.com',
        password: 'Password123!',
      };

      mockUsersService.create.mockRejectedValue(
        new ConflictException('User with this email already exists'),
      );

      // WHEN & THEN: Should propagate conflict exception
      await expect(controller.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated users', async () => {
      // Test pagination logic
    });
  });

  describe('findOne', () => {
    it('should return user by id', async () => {
      // Test user retrieval
    });

    it('should handle user not found', async () => {
      // Test 404 handling
    });
  });
});
```

### 2. 🟢 Green Phase: Controller Implementation

Create `src/users/dto/user-response.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { UserRole, UserStatus } from '../entities/user.entity';

export class UserResponseDto {
  @ApiProperty({
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  id: string;

  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  email: string;

  @ApiProperty({
    description: 'User first name',
    example: 'John',
    required: false,
  })
  firstName?: string;

  @ApiProperty({
    description: 'User last name',
    example: 'Doe',
    required: false,
  })
  lastName?: string;

  @ApiProperty({
    description: 'User role',
    enum: UserRole,
    example: UserRole.USER,
  })
  role: UserRole;

  @ApiProperty({
    description: 'User status',
    enum: UserStatus,
    example: UserStatus.ACTIVE,
  })
  status: UserStatus;

  @ApiProperty({
    description: 'User creation timestamp',
    example: '2023-09-17T10:30:00.000Z',
  })
  createdAt: Date;

  @ApiProperty({
    description: 'User last update timestamp',
    example: '2023-09-17T10:30:00.000Z',
  })
  updatedAt: Date;

  @ApiProperty({
    description: 'User last login timestamp',
    example: '2023-09-17T10:30:00.000Z',
    required: false,
  })
  lastLoginAt?: Date;

  @ApiProperty({
    description: 'User full name',
    example: 'John Doe',
  })
  fullName: string;
}

export class PaginatedUsersResponseDto {
  @ApiProperty({
    description: 'Array of users',
    type: [UserResponseDto],
  })
  data: UserResponseDto[];

  @ApiProperty({
    description: 'Total number of users',
    example: 100,
  })
  total: number;

  @ApiProperty({
    description: 'Current page number',
    example: 1,
  })
  page: number;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
  })
  limit: number;

  @ApiProperty({
    description: 'Total number of pages',
    example: 10,
  })
  totalPages: number;
}
```

Create `src/users/dto/user-query.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsOptional, IsInt, Min, Max, IsString, IsIn } from 'class-validator';

export class UserQueryDto {
  @ApiProperty({
    description: 'Page number for pagination',
    example: 1,
    minimum: 1,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Page must be an integer' })
  @Min(1, { message: 'Page must be at least 1' })
  page?: number = 1;

  @ApiProperty({
    description: 'Number of items per page',
    example: 10,
    minimum: 1,
    maximum: 100,
    required: false,
  })
  @IsOptional()
  @Type(() => Number)
  @IsInt({ message: 'Limit must be an integer' })
  @Min(1, { message: 'Limit must be at least 1' })
  @Max(100, { message: 'Limit cannot exceed 100' })
  limit?: number = 10;

  @ApiProperty({
    description: 'Field to sort by',
    example: 'createdAt',
    enum: ['createdAt', 'updatedAt', 'email', 'firstName', 'lastName'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['createdAt', 'updatedAt', 'email', 'firstName', 'lastName'])
  sortBy?: string = 'createdAt';

  @ApiProperty({
    description: 'Sort order',
    example: 'DESC',
    enum: ['ASC', 'DESC'],
    required: false,
  })
  @IsOptional()
  @IsString()
  @IsIn(['ASC', 'DESC'])
  sortOrder?: 'ASC' | 'DESC' = 'DESC';

  @ApiProperty({
    description: 'Search term for filtering users',
    example: 'john',
    required: false,
  })
  @IsOptional()
  @IsString()
  search?: string;
}
```

Create `src/users/users.controller.ts`:

```typescript
import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Query,
  HttpCode,
  HttpStatus,
  ParseUUIDPipe,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiOkResponse,
  ApiNotFoundResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
} from '@nestjs/swagger';
import { UsersService } from './users.service';
import {
  CreateUserDto,
  UpdateUserDto,
  ChangePasswordDto,
  UserResponseDto,
  PaginatedUsersResponseDto,
  UserQueryDto,
} from './dto';

@ApiTags('users')
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'Create a new user',
    description: 'Creates a new user account with the provided information',
  })
  @ApiCreatedResponse({
    description: 'User created successfully',
    type: UserResponseDto,
  })
  @ApiConflictResponse({
    description: 'User with this email already exists',
  })
  @ApiBadRequestResponse({
    description: 'Invalid input data',
  })
  async create(@Body() createUserDto: CreateUserDto): Promise<UserResponseDto> {
    return this.usersService.create(createUserDto);
  }

  @Get()
  @ApiOperation({
    summary: 'Get all users',
    description:
      'Retrieves a paginated list of all users with optional filtering',
  })
  @ApiOkResponse({
    description: 'Users retrieved successfully',
    type: PaginatedUsersResponseDto,
  })
  @ApiQuery({
    name: 'page',
    required: false,
    description: 'Page number',
    example: 1,
  })
  @ApiQuery({
    name: 'limit',
    required: false,
    description: 'Items per page',
    example: 10,
  })
  @ApiQuery({
    name: 'search',
    required: false,
    description: 'Search term',
    example: 'john',
  })
  async findAll(
    @Query() query: UserQueryDto,
  ): Promise<PaginatedUsersResponseDto> {
    if (query.search) {
      return this.usersService.searchUsers(query.search, {
        page: query.page,
        limit: query.limit,
        sortBy: query.sortBy,
        sortOrder: query.sortOrder,
      });
    }

    return this.usersService.findAll({
      page: query.page,
      limit: query.limit,
      sortBy: query.sortBy,
      sortOrder: query.sortOrder,
    });
  }

  @Get(':id')
  @ApiOperation({
    summary: 'Get user by ID',
    description: 'Retrieves a specific user by their unique identifier',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async findOne(
    @Param('id', ParseUUIDPipe) id: string,
  ): Promise<UserResponseDto> {
    return this.usersService.findOne(id);
  }

  @Patch(':id')
  @ApiOperation({
    summary: 'Update user',
    description: 'Updates user information (excluding password)',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
  })
  @ApiOkResponse({
    description: 'User updated successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiConflictResponse({
    description: 'Email already exists',
  })
  async update(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() updateUserDto: UpdateUserDto,
  ): Promise<UserResponseDto> {
    return this.usersService.update(id, updateUserDto);
  }

  @Patch(':id/password')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Change user password',
    description: 'Changes the password for a specific user',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Password changed successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  @ApiBadRequestResponse({
    description: 'Invalid current password',
  })
  async changePassword(
    @Param('id', ParseUUIDPipe) id: string,
    @Body() changePasswordDto: ChangePasswordDto,
  ): Promise<void> {
    return this.usersService.changePassword(id, changePasswordDto);
  }

  @Patch(':id/deactivate')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Deactivate user',
    description: 'Deactivates a user account (soft delete)',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deactivated successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async deactivate(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.deactivate(id);
  }

  @Delete(':id')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiOperation({
    summary: 'Delete user',
    description: 'Permanently deletes a user account',
  })
  @ApiParam({
    name: 'id',
    description: 'User unique identifier',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'User deleted successfully',
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async remove(@Param('id', ParseUUIDPipe) id: string): Promise<void> {
    return this.usersService.remove(id);
  }

  @Get('email/:email')
  @ApiOperation({
    summary: 'Get user by email',
    description: 'Retrieves a user by their email address',
  })
  @ApiParam({
    name: 'email',
    description: 'User email address',
    example: 'user@example.com',
  })
  @ApiOkResponse({
    description: 'User retrieved successfully',
    type: UserResponseDto,
  })
  @ApiNotFoundResponse({
    description: 'User not found',
  })
  async findByEmail(@Param('email') email: string): Promise<UserResponseDto> {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
```

### 3. 🔄 Refactor Phase: Module Integration

Create `src/users/users.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User])],
  controllers: [UsersController],
  providers: [UsersService],
  exports: [UsersService], // Export for use in auth module
})
export class UsersModule {}
```

Update `src/app.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { UsersModule } from './users/users.module';
// ... other imports

@Module({
  imports: [
    ConfigModule.forRoot(),
    TypeOrmModule.forRoot({
      // database configuration
    }),
    UsersModule,
    // ... other modules
  ],
})
export class AppModule {}
```

## 🧪 Testing & Validation

### E2E Tests

Create `src/users/users.e2e.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DatabaseTestHelper } from '../test/database-test-helper';

describe('UsersController (e2e)', () => {
  let app: INestApplication;
  let dbHelper: DatabaseTestHelper;

  beforeAll(async () => {
    dbHelper = new DatabaseTestHelper();
    await dbHelper.setup();

    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe({ transform: true }));
    await app.init();
  });

  afterAll(async () => {
    await app.close();
    await dbHelper.cleanup();
  });

  beforeEach(async () => {
    await dbHelper.clearDatabase();
  });

  describe('/users (POST)', () => {
    it('should create a new user', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201)
        .expect(res => {
          expect(res.body.email).toBe('test@example.com');
          expect(res.body.password).toBeUndefined();
          expect(res.body.id).toBeDefined();
        });
    });

    it('should reject invalid email', () => {
      return request(app.getHttpServer())
        .post('/users')
        .send({
          email: 'invalid-email',
          password: 'Password123!',
        })
        .expect(400);
    });
  });

  describe('/users (GET)', () => {
    it('should return paginated users', async () => {
      // Create test users first
      await request(app.getHttpServer()).post('/users').send({
        email: 'user1@example.com',
        password: 'Password123!',
      });

      return request(app.getHttpServer())
        .get('/users?page=1&limit=10')
        .expect(200)
        .expect(res => {
          expect(res.body.data).toBeInstanceOf(Array);
          expect(res.body.total).toBe(1);
          expect(res.body.page).toBe(1);
          expect(res.body.limit).toBe(10);
        });
    });
  });
});
```

## 📋 Definition of Done

- ✅ UserController with full CRUD REST endpoints
- ✅ Comprehensive Swagger/OpenAPI documentation
- ✅ Request/Response DTOs with validation
- ✅ Proper HTTP status codes (201, 200, 404, 409, 400)
- ✅ Pagination and search functionality
- ✅ Unit tests with 85%+ coverage
- ✅ E2E tests for all endpoints
- ✅ Error handling with proper HTTP responses
- ✅ UUID validation for parameters

## 🔗 Related Tasks

- **Previous**: [TASK-2.2] User Service & Repository Pattern
- **Next**: [TASK-2.4] Authentication Service & JWT
- **Enables**: [TASK-3.1] Tasks Module Implementation

## 📝 Notes

### API Design Best Practices

- Use proper HTTP methods (GET, POST, PATCH, DELETE)
- Implement consistent error responses
- Use pagination for list endpoints
- Include comprehensive API documentation
- Follow RESTful naming conventions

### Security Considerations

- Validate all input parameters
- Use UUID validation for route parameters
- Never expose sensitive data in responses
- Implement rate limiting for production
- Consider API versioning strategy

## 🐛 Troubleshooting

**Issue**: Validation not working on query parameters
**Solution**: Use @Transform() decorator and ValidationPipe with transform: true

**Issue**: Swagger documentation not showing
**Solution**: Ensure SwaggerModule is properly configured in main.ts

**Issue**: UUID validation failing
**Solution**: Check ParseUUIDPipe is imported and used correctly

**Issue**: Pagination not working correctly
**Solution**: Verify Type() decorator on numeric query parameters
