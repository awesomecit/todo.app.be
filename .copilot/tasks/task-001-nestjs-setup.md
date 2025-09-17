---
title: 'NestJS Project Setup & TypeScript Configuration'
epic: 'EPIC-001-task-management'
story: 'STORY-001-project-setup'
task_id: 'TASK-001'
status: 'todo' # todo | in-progress | done | blocked
priority: 'high' # low | medium | high | critical
estimated_hours: 2
tags: ['nestjs', 'typescript', 'setup', 'configuration']
assignee: 'developer'
created_date: '2025-09-17'
---

# TASK-001: NestJS Project Setup & TypeScript Configuration

**Epic**: [EPIC-001] Task Management API  
**Story**: [STORY-001] Project Setup & Architecture  
**Duration**: 1-2 hours  
**Prerequisites**: Node.js 18+, npm/yarn

## 🎯 Objective

Set up a production-ready NestJS application with optimized TypeScript configuration, environment management, and health monitoring.

## ✅ Acceptance Criteria

- [ ] NestJS CLI installed and project initialized
- [ ] TypeScript configured with strict mode and path mapping
- [ ] Environment configuration with validation
- [ ] Health check endpoint functional
- [ ] Application starts with `npm run start:dev`
- [ ] Hot reload working
- [ ] Basic tests passing

## 🔧 Implementation Steps

### 1. Project Initialization

```bash
# Install NestJS CLI globally
npm install -g @nestjs/cli

# Create new project
nest new todo.app.be --package-manager npm

# Navigate to project
cd todo.app.be
```

### 2. TypeScript Configuration

Update `tsconfig.json`:

```json
{
  "compilerOptions": {
    "module": "commonjs",
    "declaration": true,
    "removeComments": true,
    "emitDecoratorMetadata": true,
    "experimentalDecorators": true,
    "allowSyntheticDefaultImports": true,
    "target": "ES2023",
    "sourceMap": true,
    "outDir": "./dist",
    "baseUrl": "./",
    "incremental": true,
    "skipLibCheck": true,
    "strictNullChecks": true,
    "forceConsistentCasingInFileNames": true,
    "noImplicitAny": false,
    "strictBindCallApply": false,
    "noFallthroughCasesInSwitch": false,
    "paths": {
      "@/*": ["src/*"],
      "@/config/*": ["src/config/*"],
      "@/common/*": ["src/common/*"]
    }
  }
}
```

### 3. Environment Configuration

Create `src/config/configuration.ts`:

```typescript
import { registerAs } from '@nestjs/config';

export default registerAs('app', () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  environment: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'postgres',
    password: process.env.DATABASE_PASSWORD || 'password',
    name: process.env.DATABASE_NAME || 'todo_app',
  },
}));
```

### 4. Health Check Implementation

Update `src/app.controller.ts`:

```typescript
import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get('health')
  getHealth() {
    return this.appService.getHealth();
  }
}
```

Update `src/app.service.ts`:

```typescript
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHealth() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      environment: process.env.NODE_ENV || 'development',
      version: process.env.npm_package_version || '1.0.0',
    };
  }
}
```

## 🧪 Testing & Validation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Test health endpoint
curl http://localhost:3000/health

# Run tests
npm run test

# Check build
npm run build
```

**Expected health response**:

```json
{
  "status": "ok",
  "timestamp": "2025-09-17T10:30:00.000Z",
  "uptime": 1.234,
  "environment": "development",
  "version": "1.0.0"
}
```

## 📋 Definition of Done

- ✅ Application starts without errors on `npm run start:dev`
- ✅ Health endpoint responds at `/health`
- ✅ TypeScript compiles without warnings
- ✅ Hot reload functions correctly
- ✅ Unit tests pass
- ✅ Code follows project linting rules

## 🔗 Related Tasks

- **Next**: [TASK-002] Project Structure & Folder Organization
- **Depends on**: None (initial task)

## 📝 Notes

- Use strict TypeScript settings for better code quality
- Health endpoint should be excluded from authentication
- Environment variables should have sensible defaults
- Consider using config validation (Joi) for production

## 🐛 Troubleshooting

**Issue**: TypeScript compilation errors  
**Solution**: Check `experimentalDecorators` and `emitDecoratorMetadata` are enabled

**Issue**: Hot reload not working  
**Solution**: Verify file watching is enabled and no syntax errors exist

**Issue**: Health endpoint not accessible  
**Solution**: Check controller registration in `app.module.ts`
