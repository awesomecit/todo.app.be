# Test-Driven Development (TDD) & Coverage Guide

## 📋 Panoramica

Questo progetto implementa un approccio **Test-Driven Development (TDD)** rigoroso con enforcing automatico della coverage tramite Git hooks. La configurazione assicura che ogni sviluppatore segua le best practice di qualità del codice.

## 🎯 Soglie Coverage Minime

### Globali (Applicate a tutto il codebase)

- **Statements**: ≥ 80%
- **Branches**: ≥ 75%
- **Functions**: ≥ 80%
- **Lines**: ≥ 80%

### Specifiche per Moduli Critici

- **Logger Service**: ≥ 90% (statements, functions, lines), ≥ 85% (branches)
- **Exception Filters**: ≥ 85% (statements, functions, lines), ≥ 80% (branches)
- **Health Endpoints**: ≥ 95% (statements, functions, lines), ≥ 90% (branches)

## 🚦 Workflow TDD Enforciato

### Pre-Commit Hook

```bash
# Automaticamente eseguito ad ogni commit
1. Lint staged files
2. Test suite con validazione coverage
3. Blocco commit se coverage < soglie minime
```

### Pre-Push Hook

```bash
# Automaticamente eseguito ad ogni push
1. Full test suite con coverage enforcement
2. Build verification
3. Blocco push se fallimenti
```

## 🛠️ Comandi NPM Disponibili

### Comandi Base

```bash
# Test standard (senza coverage)
npm test

# Test in modalità watch
npm run test:watch

# Coverage completo con report
npm run test:coverage

# Coverage check silenzioso (per CI/CD)
npm run test:coverage:check

# Apri report HTML coverage
npm run test:coverage:open

# TDD mode (watch + coverage + verbose)
npm run test:tdd
```

### Comandi Specializzati

```bash
# Coverage per CI/CD con reporter JUnit
npm run test:coverage:ci

# Test di integrazione
npm run test:integration:e2e

# Test di integrazione con coverage
npm run test:integration:e2e:cov
```

## 📊 Report Coverage

### Formati Disponibili

- **Console**: Output in tempo reale durante test
- **HTML**: Report navigabile in `coverage/lcov-report/index.html`
- **LCOV**: Per integrazioni CI/CD in `coverage/lcov.info`
- **JSON**: Metriche programmatiche in `coverage/coverage-summary.json`

### Struttura Directory Coverage

```
coverage/
├── lcov-report/          # Report HTML navigabile
│   ├── index.html        # Panoramica generale
│   └── [files]/          # Report per singoli file
├── lcov.info            # Formato LCOV per CI
├── coverage-final.json  # Raw coverage data
└── coverage-summary.json # Metriche aggregate
```

## 🔄 Processo TDD Raccomandato

### 1. Red Phase (Test Fallimento)

```bash
# Scrivi test che fallisce
npm run test:tdd  # Watch mode con coverage
```

### 2. Green Phase (Implementazione Minima)

```bash
# Implementa codice minimo per passare test
# Il watch mode mostra coverage in tempo reale
```

### 3. Refactor Phase (Miglioramento)

```bash
# Refactoring mantenendo test verdi
# Monitora coverage per non degradare qualità
```

### 4. Commit/Push

```bash
git add .
git commit -m "feat: implement feature X with TDD"
# Hook pre-commit: valida coverage automaticamente
git push
# Hook pre-push: full validation prima del deploy
```

## 📈 Analisi Coverage Attuale

### Stato Globale

- **Statements**: 51.06% → Target 80% ❌
- **Branches**: 61.53% → Target 75% ❌
- **Functions**: 45.58% → Target 80% ❌
- **Lines**: 52.32% → Target 80% ❌

### Aree da Migliorare (0% Coverage)

1. **Controllers**: `app.controller.ts`, `wildcard.controller.ts`
2. **Core Module**: `app.module.ts`, `app.service.ts`
3. **Entities**: `base.entity.ts`
4. **Middleware**: `security.middleware.ts`
5. **Validators**: `dto-validator.service.ts`

### Aree Eccellenti (>90% Coverage)

1. **Exception Filters**: 94.44% statements
2. **Swagger Configuration**: 100% coverage
3. **Transform Interceptors**: 100% coverage

## 🏆 Best Practice TDD

### Test Naming Convention

```typescript
describe('FeatureName', () => {
  describe('methodName', () => {
    it('should do something when condition', () => {
      // Test implementation
    });
  });
});
```

### Coverage Guidelines

1. **Non testare configurazioni statiche** (escluse con `!src/**/*.dto.ts`)
2. **Focus su business logic** e edge cases
3. **Mock dependencies esterne** (database, API, etc.)
4. **Test error paths** per coverage branches
5. **Verificare side effects** (logging, events, etc.)

### Esclusioni Coverage

```javascript
// File automaticamente esclusi:
- src/**/*.spec.ts      // File di test
- src/**/*.test.ts      // File di test alternativi
- src/main.ts          // Bootstrap application
- src/test/**          // Utilities di test
- src/**/*.interface.ts // Type definitions
- src/**/*.enum.ts     // Enumerations
- src/**/*.dto.ts      // Data Transfer Objects
```

## 🚨 Troubleshooting

### Coverage Threshold Failure

```bash
# Errore: Coverage threshold not met
Jest: Coverage threshold for statements (80%) not met: 51.06%

# Soluzioni:
1. Aggiungere test per aumentare coverage
2. Verificare esclusioni in jest.config.js
3. Rivedere soglie se troppo restrittive per codebase esistente
```

### Hook Pre-commit Bloccato

```bash
# Bypass temporaneo (SCONSIGLIATO)
git commit --no-verify

# Soluzione corretta:
1. Fixare failing tests
2. Aumentare coverage dove necessario
3. Commit normale
```

### Performance Test Lenti

```bash
# Disabilita coverage per sviluppo locale
npm test  # Invece di npm run test:coverage

# Per debugging specifico
npm run test:debug
```

## 📚 Risorse Aggiuntive

- [Jest Coverage Configuration](https://jestjs.io/docs/configuration#collectcoveragefrom-array)
- [TDD Best Practices](https://testdriven.io/blog/modern-tdd/)
- [Husky Git Hooks](https://typicode.github.io/husky/#/)
- [NestJS Testing Guide](https://docs.nestjs.com/fundamentals/testing)

## 🔗 Integrazione CI/CD

### GitHub Actions Example

```yaml
- name: Run tests with coverage
  run: npm run test:coverage:ci

- name: Upload coverage to Codecov
  uses: codecov/codecov-action@v3
  with:
    file: ./coverage/lcov.info
```

### Quality Gates

- **Coverage**: Minimum 80% per merge
- **Tests**: All passing
- **Build**: Successful compilation
- **Linting**: No violations

---

**Ricorda**: Il TDD non è solo testing, è un approccio di design che porta a codice più pulito, modulare e manutenibile. La coverage enforcement garantisce che questo standard sia mantenuto nel tempo.
