---
title: 'User Entity & Database Schema'
epic: 'EPIC-002-users-management'
story: 'STORY-002-users-module'
task_id: 'TASK-2.1'
status: 'todo'
priority: 'high'
estimated_hours: 3
tags: ['entity', 'database', 'typeorm', 'tdd']
assignee: 'developer'
created_date: '2025-09-17'
depends_on: ['TASK-001']
---

# TASK-2.1: User Entity & Database Schema

**Epic**: [EPIC-002] Users Management System
**Story**: [STORY-002] Users Module Implementation
**Duration**: 3 hours
**Prerequisites**: TypeORM configured, database connection established

## 🎯 Objective

Create a robust User entity with TypeORM decorators, implementing proper validation, security constraints, and database relationships following enterprise standards.

## ✅ Acceptance Criteria

- [ ] User entity created with TypeORM decorators
- [ ] Password field with bcrypt hashing (BeforeInsert/BeforeUpdate)
- [ ] Email validation and uniqueness constraint
- [ ] Proper timestamp fields (createdAt, updatedAt)
- [ ] User roles/permissions enumeration
- [ ] Comprehensive test suite with 80%+ coverage
- [ ] Migration file generated for database schema

## 🔧 Implementation Steps (TDD Approach)

### 1. 🔴 Red Phase: Create Failing Tests

Create `src/users/entities/user.entity.spec.ts`:

```typescript
// GIVEN-WHEN-THEN pattern tests
describe('User Entity', () => {
  describe('Password Hashing', () => {
    it('should hash password before insert', async () => {
      // GIVEN: A new user with plain text password
      const user = new User();
      user.password = 'plainPassword123';

      // WHEN: BeforeInsert hook is triggered
      await user.hashPassword();

      // THEN: Password should be hashed
      expect(user.password).not.toBe('plainPassword123');
      expect(user.password).toMatch(/^\$2[aby]\$12\$.*/);
    });
  });

  describe('Email Validation', () => {
    it('should validate email format', () => {
      // Test cases for email validation
    });
  });
});
```

### 2. 🟢 Green Phase: Minimal Implementation

Create `src/users/entities/user.entity.ts`:

```typescript
import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  BeforeInsert,
  BeforeUpdate,
  Index,
} from 'typeorm';
import {
  IsEmail,
  IsNotEmpty,
  MinLength,
  IsEnum,
  IsOptional,
} from 'class-validator';
import * as bcrypt from 'bcrypt';
import { Exclude } from 'class-transformer';

export enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

export enum UserStatus {
  ACTIVE = 'active',
  INACTIVE = 'inactive',
  SUSPENDED = 'suspended',
}

@Entity('users')
@Index('IDX_USER_EMAIL', ['email'], { unique: true })
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  @IsEmail({}, { message: 'Invalid email format' })
  @IsNotEmpty({ message: 'Email is required' })
  email: string;

  @Column()
  @IsNotEmpty({ message: 'Password is required' })
  @MinLength(8, { message: 'Password must be at least 8 characters' })
  @Exclude({ toPlainOnly: true }) // Never expose password in responses
  password: string;

  @Column({ nullable: true })
  @IsOptional()
  firstName?: string;

  @Column({ nullable: true })
  @IsOptional()
  lastName?: string;

  @Column({
    type: 'enum',
    enum: UserRole,
    default: UserRole.USER,
  })
  @IsEnum(UserRole)
  role: UserRole;

  @Column({
    type: 'enum',
    enum: UserStatus,
    default: UserStatus.ACTIVE,
  })
  @IsEnum(UserStatus)
  status: UserStatus;

  @CreateDateColumn()
  createdAt: Date;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  lastLoginAt?: Date;

  // Security: Hash password before saving
  @BeforeInsert()
  @BeforeUpdate()
  async hashPassword(): Promise<void> {
    if (this.password) {
      const saltRounds = 12;
      this.password = await bcrypt.hash(this.password, saltRounds);
    }
  }

  // Utility method for password verification
  async comparePassword(plainPassword: string): Promise<boolean> {
    return bcrypt.compare(plainPassword, this.password);
  }

  // Computed property for full name
  get fullName(): string {
    return `${this.firstName || ''} ${this.lastName || ''}`.trim();
  }
}
```

### 3. 🔄 Refactor Phase: Optimization & Clean Code

- Extract password hashing to a separate service for reusability
- Add comprehensive validation with custom decorators
- Implement soft delete functionality if needed
- Add audit fields (createdBy, updatedBy)

### 4. Database Migration

Generate migration:

```bash
npm run migration:generate -- src/migrations/CreateUserTable
```

Expected migration file:

```typescript
import { MigrationInterface, QueryRunner } from 'typeorm';

export class CreateUserTable1695808000000 implements MigrationInterface {
  name = 'CreateUserTable1695808000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "email" character varying NOT NULL,
        "password" character varying NOT NULL,
        "firstName" character varying,
        "lastName" character varying,
        "role" "public"."users_role_enum" NOT NULL DEFAULT 'user',
        "status" "public"."users_status_enum" NOT NULL DEFAULT 'active',
        "createdAt" TIMESTAMP NOT NULL DEFAULT now(),
        "updatedAt" TIMESTAMP NOT NULL DEFAULT now(),
        "lastLoginAt" TIMESTAMP,
        CONSTRAINT "UQ_USER_EMAIL" UNIQUE ("email"),
        CONSTRAINT "PK_USER_ID" PRIMARY KEY ("id")
      )
    `);

    await queryRunner.query(`
      CREATE UNIQUE INDEX "IDX_USER_EMAIL" ON "users" ("email")
    `);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP INDEX "IDX_USER_EMAIL"`);
    await queryRunner.query(`DROP TABLE "users"`);
  }
}
```

## 🧪 Testing & Validation

### Test Coverage Requirements

```bash
# Run specific entity tests
npm run test -- --testPathPattern=user.entity.spec.ts

# Check coverage
npm run test:coverage -- --testPathPattern=users

# Target: 85%+ coverage for entity
```

### Security Validation Tests

```typescript
describe('Security Features', () => {
  it('should not expose password in JSON serialization', () => {
    const user = new User();
    user.password = 'hashedPassword';

    const json = JSON.stringify(user);
    expect(json).not.toContain('hashedPassword');
  });

  it('should enforce email uniqueness at database level', async () => {
    // Test database constraint enforcement
  });
});
```

## 📋 Definition of Done

- ✅ User entity implements all required fields and relationships
- ✅ Password hashing works correctly with bcrypt (salt rounds = 12)
- ✅ Email validation and uniqueness constraints enforced
- ✅ Database migration created and tested
- ✅ Unit tests achieve 85%+ coverage
- ✅ Security features verified (password exclusion, hashing)
- ✅ TypeScript compilation without warnings
- ✅ ESLint and Prettier rules followed

## 🔗 Related Tasks

- **Next**: [TASK-2.2] User Service & Repository Pattern
- **Depends on**: [TASK-001] NestJS Project Setup (✅ completed)
- **Enables**: [TASK-2.3] Authentication Service Implementation

## 📝 Notes

### Security Considerations

- Use bcrypt with salt rounds ≥ 12 for production
- Never log or expose password fields
- Implement rate limiting for password operations
- Consider password complexity requirements

### Performance Considerations

- Index on email for fast lookups
- Use UUID for primary key (better for distributed systems)
- Consider soft delete for audit purposes

### Validation Strategy

- Use class-validator decorators for runtime validation
- Implement custom validators for business rules
- Database constraints as last line of defense

## 🐛 Troubleshooting

**Issue**: BeforeInsert hook not triggering
**Solution**: Ensure entity is saved with TypeORM repository, not plain SQL

**Issue**: Password still visible in API responses
**Solution**: Check @Exclude decorator and ensure class-transformer is configured

**Issue**: Email uniqueness not enforced
**Solution**: Run migration to create unique constraint, check database connection

**Issue**: TypeScript compilation errors with decorators
**Solution**: Verify experimentalDecorators and emitDecoratorMetadata in tsconfig.json
