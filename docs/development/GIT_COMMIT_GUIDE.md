# Git Commit Guide

## 🚀 Quick Reference per Commit

### Conventional Commits Format

```text
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

### Types più comuni

- **feat**: nuova funzionalità
- **fix**: correzione bug
- **docs**: modifiche documentazione
- **style**: formatting, spazi, etc. (no code changes)
- **refactor**: code refactoring (no feat/fix)
- **test**: aggiunta o modifica test
- **chore**: build, tools, dependencies
- **ci**: continuous integration
- **perf**: performance improvements

### Scopes comuni per questo progetto

- **core**: app principale, module, service
- **config**: configurazioni, validation schema
- **health**: health check endpoints
- **logger**: logging system
- **filters**: exception filters
- **interceptors**: request/response interceptors
- **swagger**: documentazione API
- **test**: configurazione test e coverage
- **docs**: documentazione progetto

### Esempi pratici

#### Feature commits

```bash
git commit -m "feat(core): add user authentication module"
git commit -m "feat(health): implement detailed health checks"
git commit -m "feat(logger): add request correlation ID tracking"
```

#### Fix commits

```bash
git commit -m "fix(config): resolve environment validation errors"
git commit -m "fix(test): correct Jest configuration conflicts"
```

#### Documentation commits

```bash
git commit -m "docs(readme): update installation instructions"
git commit -m "docs(api): add Swagger endpoint documentation"
```

#### Test commits

```bash
git commit -m "test(core): add unit tests for app service"
git commit -m "test(coverage): implement TDD workflow with coverage enforcement"
```

#### Chore commits

```bash
git commit -m "chore(deps): update NestJS to latest version"
git commit -m "chore(lint): fix ESLint warnings"
```

### 📋 Workflow TDD Commit

#### 1. Red Phase

```bash
git add .
git commit -m "test(feature): add failing test for new functionality"
```

#### 2. Green Phase

```bash
git add .
git commit -m "feat(feature): implement minimal code to pass tests"
```

#### 3. Refactor Phase

```bash
git add .
git commit -m "refactor(feature): improve code structure and maintainability"
```

### 🚦 Git Hooks in questo progetto

#### Pre-commit (automatico)

- ✅ Linting staged files
- ✅ Coverage validation
- ❌ Blocca commit se fallisce

#### Pre-push (automatico)

- ✅ Full test suite
- ✅ Coverage enforcement
- ✅ Build verification
- ❌ Blocca push se fallisce

### 💡 Tips

1. **Commit spesso**: Piccoli commit atomici sono meglio
2. **Test first**: Scrivi test prima del codice (TDD)
3. **Coverage check**: Verifica sempre `npm run test:coverage`
4. **Message chiari**: Descrivi COSA e PERCHÉ, non COME
5. **Scope specifico**: Usa scope coerenti con la struttura progetto

### 🆘 Troubleshooting

#### Hook pre-commit fallisce

```bash
# Verifica coverage
npm run test:coverage:check

# Fix linting
npm run lint

# Bypass hook (SCONSIGLIATO)
git commit --no-verify
```

#### Hook pre-push fallisce

```bash
# Verifica build
npm run build

# Verifica test completi
npm test

# Coverage completo
npm run test:coverage
```

### 🔗 Riferimenti

- [Conventional Commits](https://conventionalcommits.org/)
- [Angular Commit Guidelines](https://github.com/angular/angular/blob/main/CONTRIBUTING.md#commit)
- [Commitizen](https://commitizen-tools.github.io/commitizen/)

---

**Esempio comando completo:**

```bash
git add .
git commit -m "feat(test): implement comprehensive TDD workflow with coverage enforcement

- Add Jest coverage thresholds with gradual adoption strategy
- Configure Husky pre-commit and pre-push hooks for quality gates
- Create comprehensive TDD documentation and guides
- Add specialized npm scripts for coverage validation
- Set up HTML, LCOV, and JSON coverage reports

Closes #123"
```
