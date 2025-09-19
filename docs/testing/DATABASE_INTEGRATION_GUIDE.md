# 🧪 Test Strategy - Database Integration & E2E

Documentazione completa per i test di integrazione e end-to-end del progetto.

## 📋 Panoramica Test Suite

### 🔬 **Test Unitari**

- **File**: `src/**/*.spec.ts`
- **Config**: `jest.config.js`
- **Comando**: `npm test`
- **Focus**: Logica business, service, controller isolati

### 🔗 **Test Integrazione**

- **File**: `test/**/*.integration.spec.ts`
- **Config**: `jest.integration.config.js`
- **Comando**: `npm run test:integration`
- **Focus**: Connettività database, ConfigService, TypeORM

### 🌐 **Test E2E**

- **File**: `test/**/*.e2e.spec.ts`
- **Config**: `jest.e2e.config.js`
- **Comando**: `npm run test:e2e`
- **Focus**: Flussi applicazione completi, API endpoints

## 🚀 Quick Start

### Pre-requisiti

1. **Database PostgreSQL attivo**:

   ```bash
   docker compose up -d todo-database
   ```

2. **Variabili ambiente test configurate** (`.env.test`):

   ```env
   NODE_ENV=test
   DATABASE_HOST=localhost
   DATABASE_PORT=5432
   DATABASE_USERNAME=todo_user
   DATABASE_PASSWORD=secure_password_change_me
   DATABASE_NAME=todo_app_db
   ```

### Esecuzione Test

```bash
# Test integrazione database
npm run test:integration

# Test E2E completi
npm run test:e2e

# Tutti i test insieme
npm run test:integration && npm run test:e2e

# Con watch mode per sviluppo
npm run test:integration:watch
npm run test:e2e:watch
```

## 📊 Coverage e Qualità

### Soglie Coverage Integration Tests

- **Statements**: 80%
- **Branches**: 75%
- **Functions**: 85%
- **Lines**: 80%

### Comando Coverage

```bash
npm run test:integration:cov
```

## 🏗️ Architettura Test

### Database Module Integration

- ✅ Connessione TypeORM PostgreSQL
- ✅ ConfigService namespace `database.*`
- ✅ Validazione Joi variabili ambiente
- ✅ Gestione errori configurazione

### Application E2E Tests

- ✅ Caricamento completo AppModule
- ✅ Health check endpoints
- ✅ Connettività database end-to-end

## ⚠️ Best Practices

### Gestione Database Test

1. **Isolamento**: Ogni test usa transazioni isolate
2. **Cleanup**: Automatic cleanup tra test suite
3. **Resilience**: Retry logic per connessioni instabili

### Performance

- **Sequential**: Test eseguiti sequenzialmente (`maxWorkers: 1`)
- **Timeout**: 60s per test integration, 30s per E2E
- **Memory**: Gestione memory leaks con `detectOpenHandles`

### Environment Safety

- **NODE_ENV=test**: Obbligatorio per test integration
- **Separate Config**: `.env.test` per isolamento
- **Validation**: Controllo ambiente prima esecuzione

## 🔧 Troubleshooting

### Problemi Comuni

1. **Database Connection Error**

   ```bash
   # Verifica stato container
   docker compose ps

   # Restart se necessario
   docker compose restart todo-database
   ```

2. **Port già in uso**

   ```bash
   # Trova processo che usa porta 5432
   lsof -i :5432

   # Kill se necessario
   kill -9 <PID>
   ```

3. **Memory Issues**

   ```bash
   # Increase memory limit per test
   export NODE_OPTIONS="--max-old-space-size=4096"
   ```

## 📈 CI/CD Integration

### Pre-commit Hooks

I test vengono eseguiti automaticamente via Husky:

- **Pre-commit**: Test unitari + lint
- **Pre-push**: Test integration + E2E + build

### Pipeline Configuration

```yaml
# Example GitHub Actions
- name: Integration Tests
  run: |
    docker compose up -d todo-database
    npm run test:integration

- name: E2E Tests
  run: npm run test:e2e
```

## 📝 Writing New Tests

### Test Integration Pattern

```typescript
describe('Feature Integration', () => {
  describe('GIVEN proper setup', () => {
    beforeAll(async () => {
      // Setup TestingModule
    });

    describe('WHEN action performed', () => {
      it('THEN expected outcome', async () => {
        // Arrange-Act-Assert
      });
    });
  });
});
```

### Test E2E Pattern

```typescript
describe('Feature E2E', () => {
  beforeAll(async () => {
    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('should handle complete workflow', async () => {
    const response = await request(app.getHttpServer())
      .post('/endpoint')
      .expect(201);
  });
});
```

---

**📖 Per maggiori dettagli vedere**:

- [TDD Coverage Guide](TDD_COVERAGE_GUIDE.md)
- [Coverage Strategy](COVERAGE_STRATEGY.md)
