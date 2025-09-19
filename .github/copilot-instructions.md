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

## Task Generation Guidelines

- **Code Implementation Policy:** When generating task files from provided sources, **NEVER implement actual production code**. Instead:
  - **Use Pseudo-code:** Provide clear algorithmic descriptions using pseudo-code syntax
  - **Use Mermaid Diagrams:** Create flowcharts, sequence diagrams, and architecture diagrams to visualize logic flow
  - **Use PlantUML-style Notation:** For complex system interactions and data flow
  - **Provide Structure Templates:** Show file organization, import statements, and class signatures without implementation
  - **Focus on Test Cases:** Provide comprehensive test scenario descriptions without actual test implementations
- **Documentation Focus:** Emphasize:
  - Clear acceptance criteria
  - Step-by-step implementation approach
  - Architecture and design patterns
  - Dependencies and integration points
  - Validation and error handling strategies
- **Visual Communication:** Use Mermaid for:
  - System architecture diagrams
  - Data flow and process workflows
  - Database entity relationships
  - API interaction sequences
  - TDD cycle visualization

## Integration Points

- **Swagger:** API documentation is configured in `src/swagger/swagger.config.ts`.
- **Health Checks:** Implemented in `src/health/`.
- **Environment Validation:** All required environment variables are validated at startup.
- **Database:** PostgreSQL with TypeORM integration. Use Docker Compose for local development.
- **Authentication:** JWT with Passport.js strategies (`passport-jwt`, `passport-local`) integrated with NestJS Guards.

## Examples

- To add a new controller, place it in `src/common/controllers/` and update `app.module.ts`.
- To add a new environment variable, update `validation.schema.ts` and ensure it is set in your `.env` file.
- **TDD Example for New Feature:**
  1. **Red:** Write test in `*.spec.ts` that calls non-existent method/endpoint
  2. **Green:** Create minimal implementation to make test pass
  3. **Refactor:** Apply SOLID principles and improve design
  4. **Integration:** Add integration tests after unit tests are complete

## References

- Main entry: `src/main.ts`
- App module: `src/app.module.ts`
- Validation: `src/config/validation.schema.ts`
- Custom logic: `src/common/`
- Swagger: `src/swagger/`
- Health: `src/health/`

---

_If any section is unclear or missing, please provide feedback to improve these instructions._
