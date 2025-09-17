# TASK 1.1.1: NestJS CLI Initialization & TypeScript Configuration

**Epic**: EPIC 1 - Task Management API  
**Story**: STORY 1 - Project Setup & Architecture  
**Parent Task**: TASK 1.1 - Project Structure + Test Setup  
**Duration**: 30-45 minutes

## Acceptance Criteria

- [ ] NestJS CLI installed and project initialized
- [ ] TypeScript configuration optimized for enterprise development
- [ ] Basic NestJS project structure working
- [ ] Environment configuration implemented
- [ ] Health check endpoint functional
- [ ] Application starts with `npm run start:dev`

## Implementation Plan

### Phase 1: Environment Setup

```bash
npm install -g @nestjs/cli
nest new todo.app.be
cd todo.app.be
```

### Phase 2: TypeScript Configuration

**tsconfig.json**:

```json
{
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "target": "ES2020",
    "module": "commonjs",
    "lib": ["ES2020"],
    "baseUrl": "./",
    "paths": {
      "@/*": ["src/*"],
      "@/config/*": ["src/config/*"],
      "@/common/*": ["src/common/*"],
      "@/users/*": ["src/users/*"],
      "@/tasks/*": ["src/tasks/*"]
    },
    "outDir": "./dist",
    "removeComments": true,
    "incremental": true
  }
}
```

### Phase 3: Application Bootstrap

**src/main.ts**:

```typescript
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      whitelist: true,
      forbidNonWhitelisted: true,
    }),
  );

  const port = process.env.PORT || 3000;
  await app.listen(port);

  console.log(`🚀 Application running on: ${await app.getUrl()}`);
}

bootstrap();
```

### Phase 4: Health Check Implementation

**src/app.controller.spec.ts** (TDD - Red):

```typescript
describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('health check', () => {
    it('should return application health status', () => {
      const result = appController.getHealth();
      expect(result).toHaveProperty('status', 'ok');
      expect(result).toHaveProperty('timestamp');
      expect(result).toHaveProperty('uptime');
    });
  });
});
```

**src/app.controller.ts** (TDD - Green):

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

**src/app.service.ts**:

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
    };
  }
}
```

## Validation

```bash
# Install dependencies
npm install

# Start development server
npm run start:dev

# Test health endpoint
curl http://localhost:3000/health

# Run tests
npm run test

# Check TypeScript compilation
npm run build
```

**Expected Response**:

```json
{
  "status": "ok",
  "timestamp": "2024-09-17T10:30:00.000Z",
  "uptime": 1.234,
  "environment": "development"
}
```

## Success Indicators

- ✅ Application starts without errors
- ✅ Health endpoint returns proper JSON
- ✅ Hot reload works on file changes
- ✅ Tests pass
- ✅ TypeScript compiles without warnings

## Next Task

**TASK 1.1.2: Project Structure Creation & Folder Organization** - Create modular folder structure for Users and Tasks resources.
