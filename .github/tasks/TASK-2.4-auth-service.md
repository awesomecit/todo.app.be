---
title: 'Authentication Service & JWT Integration'
epic: 'EPIC-002-users-management'
story: 'STORY-002-users-module'
task_id: 'TASK-2.4'
status: 'todo'
priority: 'high'
estimated_hours: 4
tags: ['authentication', 'jwt', 'security', 'guards', 'tdd']
assignee: 'developer'
created_date: '2025-09-17'
depends_on: ['TASK-2.3']
---

# TASK-2.4: Authentication Service & JWT Integration

**Epic**: [EPIC-002] Users Management System
**Story**: [STORY-002] Users Module Implementation
**Duration**: 4 hours
**Prerequisites**: Users module with controller and service implemented

## 🎯 Objective

Implement enterprise-grade authentication system with JWT tokens, password verification, session management, and security guards following NestJS best practices and security standards.

## ✅ Acceptance Criteria

- [ ] Authentication service with login/logout functionality
- [ ] JWT token generation and validation
- [ ] Password verification and security
- [ ] JWT strategy and passport integration
- [ ] Authentication guards (JWT Guard, Role Guard)
- [ ] Auth controller with login/register endpoints
- [ ] Refresh token mechanism
- [ ] Test coverage 85%+ with security focus
- [ ] Integration with existing Users module

## 🔧 Implementation Steps (TDD Approach)

### 1. 🔴 Red Phase: Authentication Tests First

Create `src/auth/auth.service.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import { UnauthorizedException, BadRequestException } from '@nestjs/common';
import { User, UserRole, UserStatus } from '../users/entities/user.entity';
import * as bcrypt from 'bcrypt';

describe('AuthService', () => {
  let service: AuthService;
  let usersService: UsersService;
  let jwtService: JwtService;

  const mockUsersService = {
    findByEmail: jest.fn(),
    create: jest.fn(),
    updateLastLoginAt: jest.fn(),
  };

  const mockJwtService = {
    sign: jest.fn(),
    verify: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    usersService = module.get<UsersService>(UsersService);
    jwtService = module.get<JwtService>(JwtService);
  });

  describe('validateUser', () => {
    it('should validate user with correct credentials', async () => {
      // GIVEN: Valid user with correct password
      const email = 'test@example.com';
      const password = 'password123';
      const hashedPassword = await bcrypt.hash(password, 12);

      const user = {
        id: '1',
        email,
        password: hashedPassword,
        role: UserRole.USER,
        status: UserStatus.ACTIVE,
        comparePassword: jest.fn().mockResolvedValue(true),
      } as any;

      mockUsersService.findByEmail.mockResolvedValue(user);

      // WHEN: Validating user
      const result = await service.validateUser(email, password);

      // THEN: Should return user without password
      expect(result).toBeDefined();
      expect(result.email).toBe(email);
      expect(result.password).toBeUndefined();
    });

    it('should return null for invalid credentials', async () => {
      // GIVEN: User with wrong password
      const email = 'test@example.com';
      const password = 'wrongpassword';

      const user = {
        id: '1',
        email,
        comparePassword: jest.fn().mockResolvedValue(false),
      } as any;

      mockUsersService.findByEmail.mockResolvedValue(user);

      // WHEN: Validating user
      const result = await service.validateUser(email, password);

      // THEN: Should return null
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    it('should generate access and refresh tokens', async () => {
      // GIVEN: Valid user
      const user = {
        id: '1',
        email: 'test@example.com',
        role: UserRole.USER,
      };

      mockJwtService.sign
        .mockReturnValueOnce('access_token')
        .mockReturnValueOnce('refresh_token');

      // WHEN: User logs in
      const result = await service.login(user);

      // THEN: Should return tokens
      expect(result.access_token).toBe('access_token');
      expect(result.refresh_token).toBe('refresh_token');
      expect(result.user.email).toBe(user.email);
    });
  });
});
```

### 2. 🟢 Green Phase: Authentication Implementation

Install required dependencies:

```bash
npm install @nestjs/jwt @nestjs/passport passport passport-jwt passport-local
npm install -D @types/passport-jwt @types/passport-local
```

Create `src/auth/dto/login.dto.ts`:

```typescript
import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator';

export class LoginDto {
  @ApiProperty({
    description: 'User email address',
    example: 'user@example.com',
  })
  @IsEmail({}, { message: 'Please provide a valid email address' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @ApiProperty({
    description: 'User password',
    example: 'Password123!',
    minLength: 8,
  })
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters long' })
  password: string;
}

export class RegisterDto extends LoginDto {
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
}

export class AuthResponseDto {
  @ApiProperty({
    description: 'JWT access token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  access_token: string;

  @ApiProperty({
    description: 'JWT refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  refresh_token: string;

  @ApiProperty({
    description: 'Token expiration time in seconds',
    example: 3600,
  })
  expires_in: number;

  @ApiProperty({
    description: 'Token type',
    example: 'Bearer',
  })
  token_type: string;

  @ApiProperty({
    description: 'User information',
    type: 'object',
  })
  user: {
    id: string;
    email: string;
    role: string;
    firstName?: string;
    lastName?: string;
  };
}

export class RefreshTokenDto {
  @ApiProperty({
    description: 'Refresh token',
    example: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...',
  })
  @IsNotEmpty({ message: 'Refresh token is required' })
  refresh_token: string;
}
```

Create `src/auth/auth.service.ts`:

```typescript
import {
  Injectable,
  UnauthorizedException,
  BadRequestException,
  ConflictException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { User } from '../users/entities/user.entity';
import { LoginDto, RegisterDto, AuthResponseDto } from './dto';
import { CreateUserDto } from '../users/dto';

export interface JwtPayload {
  sub: string; // user id
  email: string;
  role: string;
  iat?: number;
  exp?: number;
}

@Injectable()
export class AuthService {
  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async validateUser(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'> | null> {
    const user = await this.usersService.findByEmail(email, true); // Include password for comparison

    if (!user) {
      return null;
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return null;
    }

    // Remove password from user object
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  }

  async login(user: Omit<User, 'password'>): Promise<AuthResponseDto> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
    };

    const accessToken = this.jwtService.sign(payload, {
      expiresIn: '15m', // Short-lived access token
    });

    const refreshToken = this.jwtService.sign(
      { sub: user.id },
      {
        expiresIn: '7d', // Long-lived refresh token
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      },
    );

    // Update last login timestamp
    await this.usersService.updateLastLoginAt(user.id);

    return {
      access_token: accessToken,
      refresh_token: refreshToken,
      expires_in: 900, // 15 minutes in seconds
      token_type: 'Bearer',
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async register(registerDto: RegisterDto): Promise<AuthResponseDto> {
    try {
      const createUserDto: CreateUserDto = {
        email: registerDto.email,
        password: registerDto.password,
        firstName: registerDto.firstName,
        lastName: registerDto.lastName,
      };

      const user = await this.usersService.create(createUserDto);
      return this.login(user);
    } catch (error) {
      if (error instanceof ConflictException) {
        throw error;
      }
      throw new BadRequestException('Failed to register user');
    }
  }

  async refreshToken(
    refreshToken: string,
  ): Promise<Pick<AuthResponseDto, 'access_token' | 'expires_in'>> {
    try {
      const payload = this.jwtService.verify(refreshToken, {
        secret: process.env.JWT_REFRESH_SECRET || 'refresh-secret',
      });

      const user = await this.usersService.findOne(payload.sub);

      const newPayload: JwtPayload = {
        sub: user.id,
        email: user.email,
        role: user.role,
      };

      const accessToken = this.jwtService.sign(newPayload, {
        expiresIn: '15m',
      });

      return {
        access_token: accessToken,
        expires_in: 900,
      };
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async validateJwtPayload(
    payload: JwtPayload,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
```

### 3. JWT Strategy Implementation

Create `src/auth/strategies/jwt.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AuthService, JwtPayload } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: process.env.JWT_SECRET || 'your-secret-key',
    });
  }

  async validate(payload: JwtPayload): Promise<Omit<User, 'password'>> {
    const user = await this.authService.validateJwtPayload(payload);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}
```

Create `src/auth/strategies/local.strategy.ts`:

```typescript
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AuthService } from '../auth.service';
import { User } from '../../users/entities/user.entity';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  constructor(private readonly authService: AuthService) {
    super({
      usernameField: 'email',
      passwordField: 'password',
    });
  }

  async validate(
    email: string,
    password: string,
  ): Promise<Omit<User, 'password'>> {
    const user = await this.authService.validateUser(email, password);
    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }
    return user;
  }
}
```

### 4. Guards Implementation

Create `src/auth/guards/jwt-auth.guard.ts`:

```typescript
import { Injectable, ExecutionContext } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Reflector } from '@nestjs/core';
import { IS_PUBLIC_KEY } from '../decorators/public.decorator';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  constructor(private reflector: Reflector) {
    super();
  }

  canActivate(context: ExecutionContext) {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    return super.canActivate(context);
  }
}
```

Create `src/auth/guards/roles.guard.ts`:

```typescript
import { Injectable, CanActivate, ExecutionContext } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '../../users/entities/user.entity';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles) {
      return true;
    }

    const { user } = context.switchToHttp().getRequest();
    return requiredRoles.some(role => user.role?.includes(role));
  }
}
```

### 5. Decorators

Create `src/auth/decorators/public.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);
```

Create `src/auth/decorators/roles.decorator.ts`:

```typescript
import { SetMetadata } from '@nestjs/common';
import { UserRole } from '../../users/entities/user.entity';

export const ROLES_KEY = 'roles';
export const Roles = (...roles: UserRole[]) => SetMetadata(ROLES_KEY, roles);
```

### 6. Auth Controller

Create `src/auth/auth.controller.ts`:

```typescript
import {
  Controller,
  Post,
  Body,
  HttpCode,
  HttpStatus,
  UseGuards,
  Request,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
} from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { LoginDto, RegisterDto, AuthResponseDto, RefreshTokenDto } from './dto';
import { Public } from './decorators/public.decorator';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Public()
  @Post('login')
  @HttpCode(HttpStatus.OK)
  @UseGuards(AuthGuard('local'))
  @ApiOperation({
    summary: 'User login',
    description: 'Authenticates user and returns JWT tokens',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Login successful',
    type: AuthResponseDto,
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid credentials',
  })
  async login(
    @Request() req,
    @Body() loginDto: LoginDto,
  ): Promise<AuthResponseDto> {
    return this.authService.login(req.user);
  }

  @Public()
  @Post('register')
  @HttpCode(HttpStatus.CREATED)
  @ApiOperation({
    summary: 'User registration',
    description: 'Creates a new user account and returns JWT tokens',
  })
  @ApiResponse({
    status: HttpStatus.CREATED,
    description: 'Registration successful',
    type: AuthResponseDto,
  })
  @ApiConflictResponse({
    description: 'User already exists',
  })
  async register(@Body() registerDto: RegisterDto): Promise<AuthResponseDto> {
    return this.authService.register(registerDto);
  }

  @Public()
  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({
    summary: 'Refresh access token',
    description: 'Generates a new access token using refresh token',
  })
  @ApiResponse({
    status: HttpStatus.OK,
    description: 'Token refreshed successfully',
  })
  @ApiUnauthorizedResponse({
    description: 'Invalid refresh token',
  })
  async refresh(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshToken(refreshTokenDto.refresh_token);
  }

  @Post('logout')
  @HttpCode(HttpStatus.NO_CONTENT)
  @ApiBearerAuth()
  @ApiOperation({
    summary: 'User logout',
    description: 'Invalidates current session (client should discard tokens)',
  })
  @ApiResponse({
    status: HttpStatus.NO_CONTENT,
    description: 'Logout successful',
  })
  async logout(): Promise<void> {
    // In a stateless JWT system, logout is handled client-side
    // For enterprise applications, consider implementing token blacklisting
    return;
  }
}
```

### 7. Auth Module

Create `src/auth/auth.module.ts`:

```typescript
import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UsersModule } from '../users/users.module';
import { JwtStrategy } from './strategies/jwt.strategy';
import { LocalStrategy } from './strategies/local.strategy';

@Module({
  imports: [
    UsersModule,
    PassportModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get<string>('JWT_SECRET') || 'your-secret-key',
        signOptions: {
          expiresIn: '15m',
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtStrategy, LocalStrategy],
  exports: [AuthService],
})
export class AuthModule {}
```

## 🧪 Testing & Validation

### E2E Authentication Tests

Create `src/auth/auth.e2e.spec.ts`:

```typescript
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, ValidationPipe } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../app.module';
import { DatabaseTestHelper } from '../test/database-test-helper';

describe('AuthController (e2e)', () => {
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

  describe('/auth/register (POST)', () => {
    it('should register a new user and return tokens', () => {
      return request(app.getHttpServer())
        .post('/auth/register')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
          firstName: 'John',
          lastName: 'Doe',
        })
        .expect(201)
        .expect(res => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.refresh_token).toBeDefined();
          expect(res.body.user.email).toBe('test@example.com');
        });
    });
  });

  describe('/auth/login (POST)', () => {
    it('should login existing user', async () => {
      // First register a user
      await request(app.getHttpServer()).post('/auth/register').send({
        email: 'test@example.com',
        password: 'Password123!',
      });

      // Then login
      return request(app.getHttpServer())
        .post('/auth/login')
        .send({
          email: 'test@example.com',
          password: 'Password123!',
        })
        .expect(200)
        .expect(res => {
          expect(res.body.access_token).toBeDefined();
          expect(res.body.refresh_token).toBeDefined();
        });
    });
  });
});
```

## 📋 Definition of Done

- ✅ Authentication service with login/logout/register
- ✅ JWT token generation and validation
- ✅ Password verification with bcrypt
- ✅ JWT and Local strategies with Passport
- ✅ Authentication and role-based guards
- ✅ Refresh token mechanism
- ✅ Auth controller with proper endpoints
- ✅ Comprehensive test coverage (85%+)
- ✅ Security decorators (@Public, @Roles)
- ✅ Integration with Users module

## 🔗 Related Tasks

- **Previous**: [TASK-2.3] User Controller & API Endpoints
- **Completes**: [STORY-002] Users Module Implementation
- **Enables**: [TASK-3.1] Tasks Module with Auth Protection

## 📝 Notes

### Security Best Practices

- Use short-lived access tokens (15 minutes)
- Implement refresh token rotation
- Store JWT secrets in environment variables
- Use bcrypt for password hashing
- Implement rate limiting on auth endpoints

### Production Considerations

- Implement token blacklisting for logout
- Add session management
- Consider OAuth2/OpenID Connect integration
- Implement account lockout after failed attempts
- Add audit logging for authentication events

## 🐛 Troubleshooting

**Issue**: JWT strategy not working
**Solution**: Ensure JWT_SECRET is properly configured in environment

**Issue**: Guards not protecting routes
**Solution**: Check if JwtAuthGuard is applied globally or per route

**Issue**: Refresh token validation failing
**Solution**: Verify JWT_REFRESH_SECRET is different from main JWT_SECRET

**Issue**: Local strategy authentication failing
**Solution**: Check username field is set to 'email' in strategy configuration
