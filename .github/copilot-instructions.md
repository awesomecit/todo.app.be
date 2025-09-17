# Copilot Instructions for todo.app.be

## Overview

This is a backend application built with NestJS. The codebase is organized for modularity and maintainability, with a focus on clean architecture and explicit configuration. The main entry point is `src/main.ts`, and the core module is `src/app.module.ts`.

## Key Architectural Patterns

- **Modular Structure:** Features and shared logic are separated into subfolders under `src/`, e.g., `common/`, `config/`, `health/`, and `swagger/`.
- **Validation:** Environment variables are validated using Joi in `src/config/validation.schema.ts`. Example: `JWT_SECRET` must be a string of at least 32 characters.
- **Controllers & Services:** Controllers are in `src/app.controller.ts` and `src/health/health.controller.ts`. Services are in `src/app.service.ts` and `common/`.
- **Custom Middleware, Filters, Interceptors:** See `src/common/middleware/`, `src/common/filters/`, and `src/common/interceptors/` for custom request handling and error management.

## Developer Workflows

- **Build:** Use `npm run build` (if defined in `package.json`).
- **Test:** Use `npm test` for unit tests. Integration tests are in `src/health/health.controller.integration.spec.ts`.
- **Lint:** Use `npm run lint` for code style checks.
- **SonarJS Analysis:**
  - Cognitive Complexity: `npm run analyze:cognitive`
  - Security: `npm run analyze:security`
  - Full Analysis: `npm run analyze`
  - Reports: `npm run analyze:report`

## Project-Specific Conventions

- **Logging:** Configurable via environment variables (see `LOG_LEVEL`, `LOG_MAX_FILES`, `LOG_MAX_SIZE`, `LOG_TIMEZONE` in `validation.schema.ts`).
- **Default Values:** Many config options have sensible defaults for local development.
- **Database:** Use `localhost` for local development, `todo-database` for Docker environments.
- **Environment Files:** `.env` for local development, `.env.example` as template with Docker-friendly defaults.

## Integration Points

- **Swagger:** API documentation is configured in `src/swagger/swagger.config.ts`.
- **Health Checks:** Implemented in `src/health/`.
- **Environment Validation:** All required environment variables are validated at startup.
- **Database:** PostgreSQL with TypeORM integration. Use Docker Compose for local development.

## Examples

- To add a new controller, place it in `src/common/controllers/` and update `app.module.ts`.
- To add a new environment variable, update `validation.schema.ts` and ensure it is set in your `.env` file.

## References

- Main entry: `src/main.ts`
- App module: `src/app.module.ts`
- Validation: `src/config/validation.schema.ts`
- Custom logic: `src/common/`
- Swagger: `src/swagger/`
- Health: `src/health/`

---

_If any section is unclear or missing, please provide feedback to improve these instructions._
