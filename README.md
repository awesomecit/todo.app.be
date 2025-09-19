# todo.app.be

🚀 **Backend NestJS con Automated Release Management**

Un backend API moderno costruito con NestJS che include un sistema completo di release automation basato su Conventional Commits e Semantic Versioning.

## 🏗️ Stack Tecnologico

- **Framework**: NestJS
- **Language**: TypeScript
- **Testing**: Jest con coverage enforcement
- **Code Quality**: ESLint + SonarJS + Prettier
- **Git Hooks**: Husky + Commitlint
- **Release Management**: Automated con Semantic Versioning

## 🚀 Quick Start

```bash
# Installazione dipendenze (development)
npm install

# Installazione dipendenze (production/CI)
npm ci

# Sviluppo
npm run start:dev

# Test con coverage
npm run test:coverage

# Build
npm run build

# Verifica qualità codice
npm run quality
```

## 📦 Package Management

Questo progetto utilizza **npm** con `package-lock.json` per garantire riproducibilità enterprise:

- ✅ **Sviluppo**: `npm install` per aggiungere dipendenze
- ✅ **CI/CD**: `npm ci` per installazioni deterministiche
- ✅ **Security**: `npm audit` per controlli di sicurezza
- ✅ **Updates**: `npm outdated` per verificare aggiornamenti

📖 **[Guida completa Package Management](docs/development/PACKAGE-MANAGEMENT.md)**

## 📋 Script Disponibili

### Sviluppo

- `npm start` - Avvia il server
- `npm run start:dev` - Avvia in modalità watch
- `npm run start:debug` - Avvia con debugger

### Testing

- `npm test` - Esegue i test unitari
- `npm run test:watch` - Test unitari in modalità watch
- `npm run test:coverage` - Test unitari con coverage report
- `npm run test:tdd` - Modalità TDD interattiva

### Testing Avanzato (Database Integration)

- `npm run test:integration` - Test di integrazione database
- `npm run test:integration:watch` - Test integrazione in modalità watch
- `npm run test:integration:cov` - Test integrazione con coverage
- `npm run test:integration:safe` - Test integrazione con auto-start database
- `npm run test:e2e` - Test end-to-end completi
- `npm run test:e2e:watch` - Test E2E in modalità watch
- `npm run test:e2e:safe` - Test E2E con auto-start database
- `npm run test:safe` - Tutti i test con protezioni ambiente

### Database Management per Test

```bash
# Auto-start database per test (raccomandato)
./scripts/ensure-database.sh

# Oppure manuale
docker compose up -d todo-database

# Verifica stato database
npm run db:status

# Gestione database
npm run db:start    # Avvia container
npm run db:stop     # Ferma container
npm run db:restart  # Riavvia container

# Verifica connettività
npm run test:integration:guard
```

### Qualità Codice

- `npm run lint` - Linting con fix automatico
- `npm run quality` - Controllo completo qualità
- `npm run analyze` - Analisi complessità cognitiva

### Controllo Ambiente

- `npm run env:check` - Verifica completa ambiente sviluppo
- `npm run env:validate` - Validazione ambiente (output minimale)
- `npm run env:check:ci` - Formato CI/CD compatible

### 🎯 Release Management (NUOVO!)

- `npm run release:analyze` - Analizza se è necessario un release
- `npm run release:auto` - Release automatico completo
- `npm run release:auto:dry-run` - Test release senza modifiche
- `npm run release:auto:force` - Forza release anche se non necessario

## 🔄 Automated Release System

Questo progetto include un sistema completo di release automation che:

### ✅ Funzionalità Implementate

- **Analisi Automatica**: Rileva automaticamente se è necessario un release
- **Semantic Versioning**: Calcola automaticamente major/minor/patch
- **Conventional Commits**: Validazione formato commit obbligatoria
- **Git Tagging**: Creazione automatica tag annotati
- **Changelog**: Generazione automatica note di rilascio
- **Safety Features**: Backup, rollback, dry-run mode
- **CI/CD Ready**: Integrazione completa per pipeline

### 🎯 Workflow Automatico

1. **Commit** → Validazione formato conventional commits
2. **Push** → Analisi automatica necessità release
3. **Release** → Processo automatico end-to-end:
   - Analisi commit e calcolo versione
   - Test e build automatici
   - Update package.json
   - Generazione changelog
   - Commit, tag e push automatici

### 📖 Conventional Commits

Usa il formato standard per i commit:

```text
<type>(<scope>): <description>

[optional body]

[optional footer(s)]
```

**Tipi supportati:**

- `feat` → Minor version bump (nuove funzionalità)
- `fix` → Patch version bump (bug fix)
- `BREAKING CHANGE` → Major version bump
- `docs`, `style`, `refactor`, `test`, `chore` → No version bump

**Esempi:**

```bash
feat(auth): add user authentication system
fix(api): resolve timeout issues in user endpoints
docs: update API documentation
BREAKING CHANGE: modify user schema structure
```

## 📁 Struttura Progetto

```text
src/
├── common/           # Componenti condivisi
│   ├── controllers/  # Controller base
│   ├── entities/     # Entità base
│   ├── filters/      # Exception filters
│   ├── interceptors/ # Interceptors
│   ├── logger/       # Sistema logging
│   ├── middleware/   # Middleware custom
│   └── validators/   # Validatori DTO
├── config/           # Configurazione applicazione
├── health/          # Health check endpoints
└── swagger/         # Configurazione API docs

scripts/             # Release automation scripts
├── release-analyzer.js    # Analisi commit per release
├── version-calculator.js  # Calcolo semantic versioning
└── auto-release.js       # Processo release completo

.husky/             # Git hooks
├── commit-msg      # Validazione commit format
└── pre-push       # Controlli pre-push + release auto
```

## 🛡️ Code Quality Standards

Il progetto applica standard rigorosi di qualità:

- **Cognitive Complexity**: Max 10 per funzione
- **Function Length**: Max 50 righe
- **Parameters**: Max 4 per funzione
- **Nesting Depth**: Max 3 livelli
- **Test Coverage**: Enforcement automatico

## 🔧 Configurazione

### Environment Variables

Copia `.env.example` in `.env` e configura:

```bash
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=todo_app
DB_USERNAME=postgres
DB_PASSWORD=password

# Logging
LOG_LEVEL=info
LOG_TIMEZONE=Europe/Rome
```

### Development Setup

```bash
# Installa dependencies
npm install

# Setup git hooks
npm run prepare

# Avvia database (Docker)
docker-compose up -d

# Avvia sviluppo
npm run start:dev
```

## 📚 Documentazione Completa

### Per Sviluppatori

- **[🚀 Development Setup](docs/development/NESTJS_GUIDE.md)** - Setup ambiente di sviluppo
- **[🔀 Merge Workflow](docs/development/MERGE_WORKFLOW.md)** - Guida completa merge e release
- **[📝 Git Commit Guide](docs/development/GIT_COMMIT_GUIDE.md)** - Convenzioni commit
- **[📦 Package Management](docs/development/PACKAGE-MANAGEMENT.md)** - Gestione dipendenze
- **[🧪 Testing Strategy](docs/testing/TDD_COVERAGE_GUIDE.md)** - TDD e copertura test
- **[🗄️ Database Integration](docs/testing/DATABASE_INTEGRATION_GUIDE.md)** - Test database PostgreSQL
- **[⚡ SonarJS Usage](docs/development/SONARJS_USAGE_GUIDE.md)** - Analisi qualità codice

### Per Release Automation

Per informazioni dettagliate sul sistema di release automation:

- **[📋 Overview Completo](./docs/release/README.md)** - Architettura e funzionalità del sistema
- **[🚀 Quick Start Guide](./docs/release/QUICKSTART.md)** - Setup e primi passi
- **[⚙️ Configuration Guide](./docs/release/CONFIGURATION.md)** - Configurazione avanzata e personalizzazioni
- **[❓ FAQ](./docs/release/FAQ.md)** - Domande frequenti e best practices
- **[🔧 Troubleshooting](./docs/release/TROUBLESHOOTING.md)** - Risoluzione problemi comuni

## 🚨 Emergency Bypass Commands

### ⚠️ Per Situazioni di Emergenza - Bypassano i Controlli di Qualità

#### 🔄 Commit senza controlli Husky

```bash
# Bypass pre-commit hooks (salta linting/testing/coverage)
git commit --no-verify -m "emergency fix"

# Bypass commitlint validation
git commit --no-verify -m "any commit message format"
```

#### 📤 Push senza controlli Husky

```bash
# Bypass pre-push hooks (salta tutti i controlli automatici)
git push --no-verify origin <branch-name>

# Esempi pratici
git push --no-verify origin main
git push --no-verify origin feat/task1_1_1

# Force push bypassando tutte le protezioni
git push --force --no-verify origin main
```

#### 🔧 Altri bypass utili

```bash
# Bypass pre-push hooks con variabile ambiente
SKIP_PRE_PUSH_HOOK=true git push origin main

# Release senza quality gates
npm run release:auto -- --force

# Husky disable temporaneo (per sessione corrente)
export HUSKY=0
git commit -m "commit without hooks"
git push origin main
unset HUSKY
```

**⚠️ Quando usare i bypass:**

- ✅ **Hotfix critici** in produzione
- ✅ **Modifiche solo documentazione**
- ✅ **Fix pipeline CI/CD**
- ❌ **Mai per sviluppo feature regolari**

> 💡 **Tip**: I comandi di bypass sono documentati qui per trasparenza, ma il workflow normale dovrebbe sempre rispettare i controlli di qualità per mantenere la stabilità del progetto.

## 🔀 Workflow Branch → Main Merge

### 📋 Procedura Completa Merge su Main

#### 1️⃣ **Pre-Check: Verifica Stato Branch**

```bash
# Verifica branch corrente
git branch --show-current

# Verifica stato clean working directory
git status

# Verifica ultimi commit
git log --oneline -5

# Verifica diferenze con main
git log main..HEAD --oneline
```

#### 2️⃣ **Update e Sincronizzazione**

```bash
# Fetch ultimo stato da remoto
git fetch origin

# Aggiorna main locale
git checkout main
git pull origin main

# Ritorna al tuo branch feature
git checkout feat/your-feature

# Verifica se ci sono conflitti potenziali
git log HEAD..main --oneline
```

#### 3️⃣ **Rebase/Merge su Main (Opzione A - Rebase)**

```bash
# Rebase del tuo branch su main aggiornato
git rebase main

# Se ci sono conflitti:
# 1. Risolvi i conflitti nei file
# 2. git add <file-risolti>
# 3. git rebase --continue

# Verifica che tutto sia ok
npm run test && npm run test:integration && npm run build
```

#### 3️⃣ **Merge su Main (Opzione B - Merge Commit)**

```bash
# Passa a main
git checkout main

# Merge del branch feature
git merge feat/your-feature

# Oppure merge senza fast-forward (preserva storia branch)
git merge --no-ff feat/your-feature
```

#### 4️⃣ **Pre-Push Final Check**

```bash
# Test completo prima del push
npm run test:coverage
npm run test:integration
npm run test:e2e
npm run build
npm run quality

# Verifica commit message format
git log --oneline -3
```

#### 5️⃣ **Push su Main con Release Automation**

```bash
# Push che triggera automaticamente il sistema di release
git push origin main

# Il sistema farà automaticamente:
# ✅ Pre-push checks (test + build)
# ✅ Analisi commit per release
# ✅ Calcolo versione semantica
# ✅ Release automation se necessario
```

#### 6️⃣ **Post-Merge Cleanup**

```bash
# Cancella branch locale (se merge completato)
git branch -d feat/your-feature

# Cancella branch remoto
git push origin --delete feat/your-feature

# Aggiorna main locale dopo release automation
git pull origin main

# Verifica tag creati automaticamente
git tag --sort=-version:refname | head -5
```

### 🔧 **Comandi Utili per Merge**

#### Verifica Pre-Merge

```bash
# Vedi cosa cambierà con il merge
git diff main...HEAD

# Verifica commit che saranno mergiati
git log main..HEAD --oneline --no-merges

# Test merge simulation (dry-run)
git merge --no-commit --no-ff feat/your-feature
git merge --abort  # annulla simulazione
```

#### Merge Troubleshooting

```bash
# Se merge fallisce, abort
git merge --abort

# Se rebase fallisce, abort
git rebase --abort

# Backup prima di operazioni rischiose
git tag backup-$(date +%Y%m%d-%H%M%S) HEAD

# Reset a stato precedente (ATTENZIONE: distruttivo)
git reset --hard HEAD~1
```

### 🚨 **Merge con Bypass (Solo Emergenze)**

```bash
# Se ci sono problemi con pre-push hooks
SKIP_PRE_PUSH_HOOK=true git push origin main

# Push forzato bypassando tutti i controlli
git push --force --no-verify origin main
```

## 🤝 Contributing

1. **Fork** il repository
2. **Crea branch** per la feature: `git checkout -b feat/amazing-feature`
3. **Commit** usando conventional commits: `git commit -m 'feat: add amazing feature'`
4. **Push** al branch: `git push origin feat/amazing-feature`
5. **Segui procedura merge** descritta sopra
6. **Apri Pull Request** (se necessario)

Il sistema di release automation si occuperà automaticamente di:

- Validare il formato dei commit
- Analizzare se è necessario un release
- Gestire versioning e tagging automatico

---

🚀 **Powered by Automated Release Management** - Sistema intelligente per rilasci sicuri e automatici!
