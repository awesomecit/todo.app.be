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

- `npm test` - Esegue i test
- `npm run test:watch` - Test in modalità watch
- `npm run test:coverage` - Test con coverage report
- `npm run test:tdd` - Modalità TDD interattiva

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

Per informazioni dettagliate sul sistema di release automation:

- **[📋 Overview Completo](./docs/release/README.md)** - Architettura e funzionalità del sistema
- **[🚀 Quick Start Guide](./docs/release/QUICKSTART.md)** - Setup e primi passi
- **[⚙️ Configuration Guide](./docs/release/CONFIGURATION.md)** - Configurazione avanzata e personalizzazioni
- **[❓ FAQ](./docs/release/FAQ.md)** - Domande frequenti e best practices
- **[🔧 Troubleshooting](./docs/release/TROUBLESHOOTING.md)** - Risoluzione problemi comuni

## 🤝 Contributing

1. **Fork** il repository
2. **Crea branch** per la feature: `git checkout -b feat/amazing-feature`
3. **Commit** usando conventional commits: `git commit -m 'feat: add amazing feature'`
4. **Push** al branch: `git push origin feat/amazing-feature`
5. **Apri Pull Request**

Il sistema di release automation si occuperà automaticamente di:

- Validare il formato dei commit
- Analizzare se è necessario un release
- Gestire versioning e tagging automatico

---

🚀 **Powered by Automated Release Management** - Sistema intelligente per rilasci sicuri e automatici!
