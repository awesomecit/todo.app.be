# 🔀 Merge Workflow Guide

## 📋 Guida Completa: Branch → Main Merge

Questa guida copre l'intero processo di merge di un branch feature sul branch main, inclusi controlli di sicurezza, testing e automation.

## 🎯 Pre-Requisiti

- [x] Branch feature completamente sviluppato
- [x] Tutti i test passano (unit, integration, E2E)
- [x] Code quality checks superati
- [x] Commit seguono conventional commits format
- [x] Database PostgreSQL disponibile per integration tests

## 🚀 Procedura Step-by-Step

### 1. Pre-Check: Verifica Stato Branch

```bash
# Verifica branch corrente e stato
git branch --show-current
git status --porcelain

# Visualizza ultimi commit del branch
git log --oneline -5

# Vedi cosa sarà mergiato su main
git log main..HEAD --oneline --no-merges

# Conteggio commit da mergere
git rev-list --count main..HEAD
```

### 2. Sincronizzazione con Main

```bash
# Fetch tutte le modifiche remote
git fetch origin

# Backup del tuo lavoro
git tag backup-$(date +%Y%m%d-%H%M%S) HEAD

# Verifica se main ha nuovi commit
git log HEAD..main --oneline

# Se main ha nuovi commit, considera rebase
git checkout main
git pull origin main
git checkout -  # torna al branch precedente
```

### 3. Pre-Merge Testing Completo

```bash
# Test suite completa PRIMA del merge
npm run test                    # Unit tests
npm run test:integration:safe   # Integration tests con auto DB
npm run test:e2e:safe          # E2E tests con auto DB
npm run build                  # Build verification
npm run quality                # Code quality checks

# Se qualcosa fallisce, NON procedere con il merge
```

### 4A. Opzione Rebase (Recommended)

```bash
# Rebase per storia lineare pulita
git rebase main

# Gestione conflitti (se presenti)
if [ $? -ne 0 ]; then
    echo "🔥 Conflitti rilevati! Risolvi manualmente:"
    git status
    # 1. Risolvi conflitti nei file
    # 2. git add <files-risolti>
    # 3. git rebase --continue
    # 4. Ripeti fino al completamento
fi

# Test post-rebase
npm run test:safe
```

### 4B. Opzione Merge Commit (Alternative)

```bash
# Switch to main
git checkout main

# Merge preservando storia branch
git merge --no-ff feat/your-branch -m "merge: integrate feat/your-branch

- Add feature XYZ
- Include comprehensive tests
- Update documentation"
```

### 5. Final Pre-Push Verification

```bash
# Full quality gate before push
echo "🧪 Running final verification..."

# Test completo
npm run test:coverage          # Unit tests con coverage
npm run test:integration:cov   # Integration tests con coverage
npm run test:e2e              # E2E tests
npm run build                 # Build verification
npm run quality               # Full quality analysis

# Verifica commit format
git log --oneline -3
```

### 6. Push con Release Automation

```bash
# Push triggera automaticamente il sistema di release
echo "🚀 Pushing to main with release automation..."
git push origin main

# Il sistema eseguirà automaticamente:
# ✅ Pre-push hooks (test + build + integration)
# ✅ Release analysis (conventional commits)
# ✅ Version calculation (semantic versioning)
# ✅ Auto-release (se commit richiedono release)
# ✅ Git tagging e changelog generation
```

### 7. Post-Merge Cleanup

```bash
# Cleanup branch locale
git branch -d feat/your-branch

# Cleanup branch remoto
git push origin --delete feat/your-branch

# Update main con eventuali release tags
git pull origin main

# Verifica release automation
git tag --sort=-version:refname | head -5
npm run release:analyze
```

## 🔧 Comandi Utili

### Diagnostica Pre-Merge

```bash
# Simula merge senza eseguirlo
git merge --no-commit --no-ff main
git diff --cached  # vedi cosa cambierebbe
git merge --abort  # annulla simulazione

# Verifica impatto merge
git diff main...HEAD --stat
git diff main...HEAD --name-only

# Analisi commit per release
npm run release:analyze
npm run release:analyze:json
```

### Database Management

```bash
# Gestione database per test
./scripts/ensure-database.sh    # Auto-start con health check
./scripts/test-env-guard.sh all # Verifica ambiente sicuro

# Status e troubleshooting
docker compose ps
docker compose logs todo-database
docker compose restart todo-database
```

### Rollback e Recovery

```bash
# Ripristina backup pre-merge
git reset --hard backup-$(date +%Y%m%d-%H%M%S)

# Undo ultimo commit (mantenendo modifiche)
git reset --soft HEAD~1

# Undo ultimo commit (perdendo modifiche) ⚠️
git reset --hard HEAD~1

# Ripristina file specifico da main
git checkout main -- path/to/file.ts
```

## 🚨 Troubleshooting Comuni

### Conflitti di Merge

```bash
# Durante rebase - step by step
git status                    # vedi conflitti
# Edit files to resolve conflicts
git add <resolved-files>
git rebase --continue

# Se troppi conflitti, abort e usa merge
git rebase --abort
git merge main
```

### Test Falliti

```bash
# Se integration tests falliscono
./scripts/ensure-database.sh
npm run test:integration:watch  # debug interattivo

# Se E2E tests falliscono
npm run test:e2e:watch
docker compose logs todo-database

# Reset database se corrotto
docker compose down todo-database
docker compose up -d todo-database
```

### Pre-Push Hook Failures

```bash
# Debug pre-push issues
echo "🔍 Debugging pre-push hooks..."

# Test manuale componenti hook
npm run test
npm run test:integration:guard
npm run build

# Se necessario bypass (SOLO emergenze)
SKIP_PRE_PUSH_HOOK=true git push origin main
```

## 🚦 Merge Decision Matrix

| Scenario                        | Recommended Action | Command                                     |
| ------------------------------- | ------------------ | ------------------------------------------- |
| Feature branch, no conflicts    | Rebase + push      | `git rebase main && git push origin main`   |
| Feature branch, minor conflicts | Resolve + rebase   | `git rebase main` → resolve → continue      |
| Feature branch, major conflicts | Merge commit       | `git merge --no-ff main`                    |
| Hotfix branch                   | Direct merge       | `git checkout main && git merge hotfix/xyz` |
| Multiple developers             | Merge commit       | `git merge --no-ff feat/xyz`                |

## 📊 Quality Gates Checklist

Prima del merge su main, verifica:

- [ ] **Tests**: Unit (160+), Integration (11+), E2E (3+) passing
- [ ] **Coverage**: >50% statements, functions, lines, branches
- [ ] **Code Quality**: ESLint + SonarJS passing
- [ ] **Build**: `npm run build` successful
- [ ] **Database**: Integration tests with real PostgreSQL connection
- [ ] **Environment**: `.env.test` configured and working
- [ ] **Commits**: All follow conventional commits format
- [ ] **Documentation**: Updated if new features added

## 🔄 Integration with CI/CD

### GitHub Actions Integration

```yaml
# Esempio .github/workflows/main.yml
on:
  push:
    branches: [main]

jobs:
  quality-gate:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_PASSWORD: test_password
          POSTGRES_DB: todo_app_test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
      - run: npm ci
      - run: npm run test:coverage
      - run: npm run test:integration
      - run: npm run test:e2e
      - run: npm run build
      - run: npm run quality
```

## 🎯 Best Practices

### 1. **Always Test First**

```bash
# Mai mergere senza test completo
npm run test:safe && git push origin main
```

### 2. **Keep History Clean**

```bash
# Preferire rebase per storia lineare
git rebase main  # invece di git merge main
```

### 3. **Atomic Commits**

```bash
# Un commit = una modifica logica
git commit -m "feat: add user authentication"
git commit -m "test: add auth integration tests"
git commit -m "docs: update auth documentation"
```

### 4. **Safety First**

```bash
# Sempre backup prima operazioni rischiose
git tag backup-$(date +%Y%m%d-%H%M%S) HEAD
```

### 5. **Leverage Automation**

```bash
# Lascia che il sistema gestisca release
git push origin main  # sistema farà tutto automaticamente
```

---

## 📚 Riferimenti

- [Conventional Commits](https://www.conventionalcommits.org/)
- [Git Rebase vs Merge](https://www.atlassian.com/git/tutorials/merging-vs-rebasing)
- [Semantic Versioning](https://semver.org/)
- [Database Integration Testing Guide](../testing/DATABASE_INTEGRATION_GUIDE.md)
- [TDD Coverage Guide](../testing/TDD_COVERAGE_GUIDE.md)

---

💡 **Tip**: Questo workflow è ottimizzato per il sistema di release automation del progetto. Seguendo questi passi, il merge sarà sicuro e la release automation funzionerà perfettamente!
