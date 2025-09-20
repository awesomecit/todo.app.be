# Copilot Instructions for todo.app.be

## Overview

This is a backend application built with NestJS. The codebase is organized for modularity and maintainability, with a focus on clean architecture and explicit configuration. The main entry point is `src/main.ts`, and the core module is `src/app.module.ts`.

## Key Architectural Patterns

- **Modular Structure:** Features and shared logic are separated into subfolders under `src/`, e.g., `common/`, `config/`, `health/`, and `swagger/`.
- **SOLID Principles Compliance:**
  - **Single Responsibility:** Each class/service has one reason to change
  - **Open/Closed:** Components are open for extension, closed for modification
  - **Liskov Substitution:** Derived classes must be substitutable for their base classes
  - **Interface Segregation:** Use specific interfaces rather than monolithic ones
  - **Dependency Inversion:** Depend on abstractions, not concretions
- **Clean Code Standards:**
  - **Cognitive Complexity:** Functions must not exceed complexity of 10
  - **Function Length:** Maximum 50 lines per function (excluding comments/blanks)
  - **Parameter Limit:** Maximum 4 parameters per function
  - **Nesting Depth:** Maximum 3 levels of nesting
  - **Comments Philosophy:** When adding comments, explain the WHY, not the HOW. Focus on business logic, domain context, and reasoning behind decisions rather than describing what the code is doing.
- **Testing Standards:**
  - **Test Structure:** Always use Given-When-Then pattern (or Arrange-Act-Assert). Make the pattern immediately clear through comments or logical test organization
  - **Test Readability:** Each test should clearly show what is being set up (Given), what action is performed (When), and what outcome is expected (Then)
- **TDD Workflow (Test-Driven Development):**
  - **🔴 Red Phase:** Write a failing test first that describes the desired functionality. Test should fail for the right reason (missing implementation, not syntax errors)
  - **🟢 Green Phase:** Write the minimal code necessary to make the test pass. Focus on making it work, not making it perfect
  - **🔧 Refactor Phase:** Improve code quality while keeping all tests green. Apply SOLID principles, extract methods, improve naming
  - **TDD Rules:** Never write production code without a failing test. Never write more test code than necessary to fail. Never write more production code than necessary to pass
  - **NestJS TDD Patterns:**
    - Controllers: Test endpoint behavior, HTTP responses, and request validation before implementation
    - Services: Test business logic and dependencies through mocked interfaces
    - Guards/Interceptors: Test middleware behavior with various request scenarios
    - Integration: Test end-to-end workflows after unit tests are green
- **Validation:** Environment variables are validated using Joi in `src/config/validation.schema.ts`. Example: `JWT_SECRET` must be a string of at least 32 characters.
- **Controllers & Services:** Controllers are in `src/app.controller.ts` and `src/health/health.controller.ts`. Services are in `src/app.service.ts` and `common/`.
- **Custom Middleware, Filters, Interceptors:** See `src/common/middleware/`, `src/common/filters/`, and `src/common/interceptors/` for custom request handling and error management.

## Development Standards & Conventions

- **DTOs & Validation:**
  - **Always use DTOs** at controller level for all input/output data
  - **Always add API decorators** at controller level using `@ApiProperty`, `@ApiResponse`, etc.
  - **Use class-transform and class-validator** for validation and transformation
  - **Extend related DTOs** instead of code duplication when possible
  - **Class order in DTO files:** Base/extended classes must be declared before DTOs that use them
  - **Controller validation tests:** Always include validation tests for all controller endpoints
- **Error Handling:**
  - **Error messages format:** Use `ERROR_MESSAGE` constants (e.g., `USER_NOT_FOUND`, `INVALID_CREDENTIALS`)
  - **Uppercase format:** All error messages and validation messages must be in UPPERCASE_ENGLISH_WITH_UNDERSCORES format
  - **Consistent messaging:** Use centralized constants for all error and validation messages throughout the application
  - **English only:** All variables, messages, and code comments must be in English
- **Testing Strategy:**
  - **TEST-FIRST MANDATORY:** Always implement tests BEFORE writing any production code. No exceptions.
  - **TDD Red-Green-Refactor:** For every new file, function, or feature: 1) Write failing test (Red), 2) Minimal implementation (Green), 3) Improve code quality (Refactor)
  - **Unit tests first:** Every service, controller, and utility function must have comprehensive unit tests before implementation
  - **E2E tests required:** Always implement E2E tests for business logic/feature integration
  - **Validation testing:** Include comprehensive validation tests for all controller endpoints
  - **Test coverage:** Aim for 100% test coverage on all business logic and critical paths
- **Environment Management:**
  - **Single environment loader:** Use only one centralized point to load environment variables
  - **Environment support:** Handle `development`, `production`, `test`, `staging` environments
  - **Configuration validation:** All environment variables must be validated at startup
- **Database Management:**
  - **Migrations required:** Always implement migrations when entities are modified
  - **Entity changes:** Never modify entities without corresponding migration files
- **Naming Conventions:**
  - **Database Schema**: Use `snake_case` for all database columns and table names
  - **TypeScript Code**: Use `camelCase` for all properties and method names
  - **Automatic Conversion**: Implement utilities to convert between `snake_case` (database) and `camelCase` (code)
  - **Entity Properties**: Database columns in `snake_case` should automatically map to `camelCase` properties in TypeScript entities
- **Logging Standards:**
  - **Use Logger service only:** Never use `console.log` - always use the Logger service
  - **Appropriate log levels:** Use correct log levels (`debug`, `info`, `warn`, `error`)
  - **Context logging:** Include meaningful context in log messages
- **TypeScript Strong Typing:**
  - **Mandatory strong typing:** All functions, objects, and variables MUST have explicit, strong TypeScript typing
  - **Function signatures:** Every function must have:
    - **Explicit parameter types:** All parameters must be explicitly typed (no `any`, prefer specific interfaces or types)
    - **Explicit return types:** All functions must declare their return type explicitly
    - **Generic constraints:** Use generic type constraints where applicable to ensure type safety
  - **Safe typing practices:**
    - **No `any` type:** Never use `any` type - use `unknown` with type guards or specific types instead
    - **Strict null checks:** Handle `null` and `undefined` explicitly using union types (`| null`, `| undefined`)
    - **Type guards:** Implement proper type guard functions for runtime type checking
    - **Utility types:** Leverage TypeScript utility types (`Partial<T>`, `Required<T>`, `Pick<T, K>`, `Omit<T, K>`, etc.)
  - **Interface and type definitions:**
    - **Prefer interfaces:** Use interfaces for object shapes and contracts
    - **Discriminated unions:** Use discriminated unions for type-safe state management
    - **Readonly properties:** Use `readonly` modifier for immutable properties where appropriate
    - **Index signatures:** Use proper index signatures with specific key and value types
  - **Examples of proper typing:**

    ```typescript
    // ✅ Good: Strong typing with explicit types
    interface CreateUserRequest {
      readonly name: string;
      readonly email: string;
      readonly age: number | null;
    }

    interface UserRepository {
      findById(id: string): Promise<User | null>;
      create(data: CreateUserRequest): Promise<User>;
      update(
        id: string,
        data: Partial<CreateUserRequest>,
      ): Promise<User | null>;
    }

    function processUser<T extends CreateUserRequest>(
      userData: T,
      validator: (data: T) => boolean,
    ): Promise<User | null> {
      // Implementation with proper type safety
    }

    // ❌ Bad: Weak typing
    function processData(data: any): any {
      // Avoid this pattern
    }
    ```

  - **Type safety enforcement:**
    - **Strict TypeScript config:** Ensure `strict: true` in tsconfig.json
    - **No implicit returns:** Functions must explicitly return values with proper types
    - **Exhaustive type checking:** Use `never` type for exhaustiveness checks in switch statements
    - **Error handling:** Typed error handling using Result<T, E> pattern or similar type-safe error handling

## Developer Workflows

- **TDD Development Cycle:**
  1. **Red:** `npm test` - Write failing test and verify it fails for the right reason
  2. **Green:** Implement minimal code to pass the test
  3. **Refactor:** `npm run quality` - Improve code while keeping tests green
  4. **Repeat:** Continue cycle for next feature increment
- **Build:** Use `npm run build` (if defined in `package.json`).
- **Test:** Use `npm test` for unit tests. Integration tests are in `src/health/health.controller.integration.spec.ts`.
- **Code Quality:**
  - `npm run quality` - Run complete quality check (format + lint + analyze)
  - `npm run quality:fix` - Automatically fix formatting and linting issues
  - `npm run analyze` - Full complexity analysis
  - `npm run format` - Auto-format code according to Prettier standards
- **Lint:** Use `npm run lint` for code style checks.
- **SonarJS Analysis:**
  - Cognitive Complexity: `npm run analyze:cognitive`
  - Security: `npm run analyze:security`
  - Full Analysis: `npm run analyze`
  - Reports: `npm run analyze:report`

## Project-Specific Conventions

- **Entity Naming:** All entity classes must use **singular names** (e.g., `Division`, `User`, `Product`)
- **Resource Naming:** All NestJS resources (services, controllers, modules, repositories) must use **plural names** (e.g., `DivisionsService`, `DivisionsController`, `DivisionsModule`, `DivisionsRepository`)
- **File Naming:** Entity files use singular (e.g., `division.entity.ts`), resource files use plural (e.g., `divisions.service.ts`)
- **Database Tables:** Use plural names in snake_case (e.g., `divisions`, `users`, `products`)
- **Logging:** Configurable via environment variables (see `LOG_LEVEL`, `LOG_MAX_FILES`, `LOG_MAX_SIZE`, `LOG_TIMEZONE` in `validation.schema.ts`).
- **Default Values:** Many config options have sensible defaults for local development.
- **Database:** PostgreSQL with TypeORM integration. Use `localhost` for local development, `todo-database` for Docker environments.
- **Authentication:** JWT with Passport.js integration. Use `@nestjs/passport`, `passport-jwt`, and `passport-local` strategies.
- **Environment Files:** `.env` for local development, `.env.example` as template with Docker-friendly defaults.
- **DTOs:** All controller endpoints must use DTOs with proper validation decorators and API documentation.
- **Error Messages:** Use standardized `ERROR_MESSAGE` constants throughout the application.
- **Language:** All code, variables, and messages must be in English only.

## Task Management Structure

This project uses a structured task management system to organize work into epics, stories, and tasks. Each task follows a standardized format optimized for GitHub Copilot integration.

### Directory Structure

- `/epics/` - High-level project objectives (weeks/months)
- `/stories/` - User-focused features (days/weeks)
- `/tasks/` - Specific implementation steps (hours/days)
- `/templates/` - Reusable templates for consistency

### Naming Convention

- **Epics**: `epic-{number}-{short-name}.md` (e.g., `epic-001-task-management.md`)
- **Stories**: `story-{number}-{short-name}.md` (e.g., `story-001-project-setup.md`)
- **Tasks**: `task-{number}-{short-name}.md` (e.g., `task-001-nestjs-setup.md`)

### Status Tracking

Each file includes frontmatter with status, assignee, and metadata for easy filtering and project management.

## Task Template Guide

This section provides a standardized template for creating tasks in the project. It ensures consistency and clarity across all tasks.

### Template Structure

Each task file should follow this structure:

````markdown
---
title: 'Task Title'
epic: 'EPIC-XXX'
story: 'STORY-XXX'
task_id: 'TASK-XXX'
status: 'todo' # todo | in-progress | done | blocked
priority: 'medium' # low | medium | high | critical
estimated_hours: 0
estimated_story_points: 0
tags: []
assignee: ''
created_date: ''
---

# TASK-XXX: [Task Title]

**Epic**: [EPIC-XXX] Epic Name
**Story**: [STORY-XXX] Story Name
**Duration**: X hours
**Prerequisites**: List any required setup

## 🎯 Objective

Brief description of what this task achieves and why it's important.

## ✅ Acceptance Criteria

- [ ] Specific, measurable criteria
- [ ] Each criterion should be testable
- [ ] Use checkboxes for tracking

## 🔧 Implementation Steps

### 1. Step Name

```bash
# Commands or code examples
```
````

Description of what this step accomplishes.

### 2. Next Step

Detailed implementation instructions with code examples.

## 🧪 Testing & Validation

```bash
# Commands to verify the implementation
```

Expected output or behavior.

## 📋 Definition of Done

- ✅ All acceptance criteria met
- ✅ Code reviewed and tested
- ✅ Documentation updated

## 🔗 Related Tasks

- **Next**: [TASK-XXX] Task Name
- **Depends on**: [TASK-XXX] Task Name
- **Blocks**: [TASK-XXX] Task Name

## 📝 Notes

Additional context, considerations, or references.

## 🐛 Troubleshooting

**Issue**: Common problem
**Solution**: How to resolve it

````

### Usage Guidelines

1. **Frontmatter**: Use the frontmatter section to define metadata like task ID, status, priority, and assignee.
2. **Objective**: Clearly state the purpose of the task.
3. **Acceptance Criteria**: Define measurable and testable criteria for task completion.
4. **Implementation Steps**: Break down the task into actionable steps with examples.
5. **Testing & Validation**: Include commands or methods to validate the implementation.
6. **Definition of Done**: Ensure all criteria are met before marking the task as complete.
7. **Related Tasks**: Link to other tasks that are dependent, blocked, or related.

---

**Reminder**: Always follow this template for creating new tasks to maintain consistency and clarity across the project.

## GitHub Copilot Guide

### Principles for Effective Usage

1. **Atomic Tasks**: Each request should have a single clear objective.
   - ❌ BAD: "Create authentication, database, and tests."
   - ✅ GOOD: "Create JWT authentication middleware to secure API routes."

2. **Context Before Action**: Always provide context before requesting changes.
   - ✅ GOOD: "In `src/auth/auth.service.ts`, I have a `validateUser()` method that checks username/password. I want to add support for email-based authentication instead of username."

3. **Specificity vs. Creativity**: Be specific about technical details but leave room for creativity.
   - ✅ GOOD: "Create a NestJS interceptor that automatically logs all HTTP requests, including method, URL, client IP, user-agent, and response time."

### Structuring Atomic Tasks

#### Example 1: Specific Feature

```markdown
**Objective**: Implement email validation in the registration DTO.

**Context**:
- File: `src/auth/dto/register.dto.ts`
- Framework: NestJS with `class-validator`
- Requirement: Email must be valid and unique in the database.

**Acceptance Criteria**:
- [ ] Apply `@IsEmail()` decorator to the `email` field.
- [ ] Add custom validation for email uniqueness.
- [ ] Provide an error message localized in Italian.
- [ ] Write unit tests for validation.
````

#### Example 2: Targeted Refactoring

```markdown
**Objective**: Extract password hashing logic into a dedicated service.

**Context**:

- Currently in: `src/auth/auth.service.ts` (lines 45-62)
- Pattern: Dependency Injection in NestJS
- Crypto: Use `bcrypt` for hashing.

**Expected Output**:

- New file: `src/auth/password.service.ts`
- Methods: `hashPassword()`, `comparePassword()`
- Update `AuthService` to use the new service.
```

### Prompt Engineering Techniques

1. **STAR Template**: Situation, Task, Action, Result.
   - **Situation**: "I have a NestJS controller handling file uploads."
   - **Task**: "Add validation for max file size (5MB)."
   - **Action**: "Implement a custom decorator `@MaxFileSize()`."
   - **Result**: "The decorator should reject files >5MB with HTTP 413 error."

2. **Progressive Context**: Build context step-by-step.
   - "I'm working on a NestJS API for task management."
   - "I have a `Task` entity with a Many-to-One relationship to `User`."
   - "I want to implement soft delete for tasks."
   - "Soft delete should preserve relationships and be transparent in queries."

3. **Input/Output Examples**: Provide concrete examples.
   - **Input**:
     ```json
     {
       "title": "Complete documentation",
       "description": "Update README with new features",
       "dueDate": "2025-09-20T10:00:00Z"
     }
     ```
   - **Output**:
     ```json
     {
       "id": 123,
       "title": "Complete documentation",
       "status": "pending",
       "createdAt": "2025-09-17T11:30:00Z"
     }
     ```

### Anti-Patterns to Avoid

1. **Tasks Too Large**:
   - ❌ BAD: "Create the entire authentication module."
   - ✅ GOOD:
     1. "Create base `AuthModule` with imports/exports."
     2. "Implement JWT strategy for Passport."
     3. "Create `AuthGuard` to secure routes."
     4. "Add refresh token mechanism."

2. **Insufficient Context**:
   - ❌ BAD: "Fix the error in the code."
   - ✅ GOOD: "In `UserService.updateProfile()` line 34, the `email` field is not validated before update. Add validation to ensure the email is unique and valid."

3. **Ambiguous Requests**:
   - ❌ BAD: "Improve performance."
   - ✅ GOOD: "Optimize the `getUsersWithTasks()` query using JOIN instead of N+1 queries. Currently takes 1.2s for 100 users."

---

**Reminder**: GitHub Copilot works best with clear, structured, and specific instructions. 🚀
