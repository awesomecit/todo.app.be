# Semantic Versioning Guide

## Overview

Questo progetto utilizza **Semantic Versioning (SemVer)** per la gestione delle versioni.

## Formato Versione

Le versioni seguono il formato `MAJOR.MINOR.PATCH`:

- **MAJOR**: Incrementato per cambiamenti incompatibili nell'API
- **MINOR**: Incrementato per nuove funzionalità compatibili con le precedenti
- **PATCH**: Incrementato per bug fixes compatibili

## Convenzioni di Versioning

### 1. Versioni di Sviluppo

- **0.x.y**: Versioni pre-1.0, API non stabile
- **0.1.0**: Prima release funzionale
- **0.2.0**: Seconda iterazione con nuove features

### 2. Versioni Stabili

- **1.0.0**: Prima release stabile
- **1.1.0**: Nuove features compatibili
- **1.0.1**: Bug fixes

### 3. Versioni Pre-release

- **1.0.0-alpha.1**: Versione alpha
- **1.0.0-beta.1**: Versione beta
- **1.0.0-rc.1**: Release candidate

## Automazione con Standard-Version

### Script Disponibili

```bash
# Release automatica (determina tipo automaticamente)
npm run release

# Release specifica
npm run release:patch    # 1.0.0 → 1.0.1
npm run release:minor    # 1.0.0 → 1.1.0
npm run release:major    # 1.0.0 → 2.0.0

# Dry run (simula senza applicare)
npm run release:dry

# Genera solo release notes
npm run release:notes
```

### Configurazione Standard-Version

Il file `.versionrc.json` controlla la generazione automatica:

```json
{
  "types": [
    { "type": "feat", "section": "Features" },
    { "type": "fix", "section": "Bug Fixes" },
    { "type": "chore", "hidden": true },
    { "type": "docs", "hidden": true },
    { "type": "style", "hidden": true },
    { "type": "refactor", "section": "Code Refactoring" },
    { "type": "perf", "section": "Performance Improvements" },
    { "type": "test", "hidden": true }
  ]
}
```

## Workflow di Release

### 1. Preparazione Release

```bash
# Verifica stato del repository
git status
git pull origin main

# Esegui test completi
npm run test:coverage
npm run analyze
```

### 2. Generazione Release

```bash
# Per bug fixes
npm run release:patch

# Per nuove features
npm run release:minor

# Per breaking changes
npm run release:major
```

### 3. Pubblicazione

```bash
# Push delle modifiche e tag
git push --follow-tags origin main

# Deploy su environment di staging/produzione
npm run deploy:staging
```

## Conventional Commits

Il versioning automatico si basa sui **Conventional Commits**:

### Tipi che influenzano la versione:

- **feat**: Incrementa MINOR version
- **fix**: Incrementa PATCH version
- **feat!** o **BREAKING CHANGE**: Incrementa MAJOR version

### Esempi:

```bash
# PATCH: 1.0.0 → 1.0.1
git commit -m "fix(auth): resolve login timeout issue"

# MINOR: 1.0.0 → 1.1.0
git commit -m "feat(api): add user profile endpoint"

# MAJOR: 1.0.0 → 2.0.0
git commit -m "feat(api)!: change authentication to JWT"
```

## Changelog Automatico

### Generazione CHANGELOG.md

Il changelog viene generato automaticamente basandosi sui commit:

```markdown
# Changelog

## [1.1.0](https://github.com/user/repo/compare/v1.0.0...v1.1.0) (2025-09-17)

### Features

- **api**: add user profile endpoint ([abc1234](https://github.com/user/repo/commit/abc1234))

### Bug Fixes

- **auth**: resolve login timeout issue ([def5678](https://github.com/user/repo/commit/def5678))
```

### Script per Release Notes

```bash
# Genera release notes per ultime 2 releases
npm run release:notes

# Output sarà disponibile per GitHub Releases
```

## Tagging Strategy

### Git Tags

```bash
# Tags automatici da standard-version
v1.0.0
v1.1.0
v1.1.1

# Visualizza tutti i tags
git tag -l

# Checkout di una versione specifica
git checkout v1.0.0
```

### Branch Strategy

```bash
# Main branch per releases stabili
main: v1.0.0, v1.1.0, v1.2.0

# Development branch per features
develop: 1.1.0-dev, 1.2.0-dev

# Release branches per preparazione
release/1.1.0
```

## Integrazione CI/CD

### GitHub Actions

```yaml
name: Release
on:
  push:
    branches: [main]

jobs:
  release:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm run test:coverage

      - name: Run quality checks
        run: npm run analyze

      - name: Release
        run: npm run release
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
```

## Package.json Integration

### Version Field

```json
{
  "version": "1.0.0"
}
```

### Dependencies Versioning

```json
{
  "dependencies": {
    "@nestjs/core": "^10.0.0", // Compatible minor updates
    "typescript": "~5.1.0" // Compatible patch updates
  },
  "devDependencies": {
    "jest": "29.5.0" // Exact version
  }
}
```

## Best Practices

### 1. Before 1.0.0

- API può cambiare liberamente
- Usa 0.x.y per indicare instabilità
- Breaking changes incrementano MINOR

### 2. After 1.0.0

- Mantieni backward compatibility
- Breaking changes richiedono MAJOR increment
- Documenta deprecations prima di rimuovere

### 3. Documentation

- Aggiorna README.md con ogni release
- Mantieni CHANGELOG.md aggiornato
- Documenta migration steps per breaking changes

### 4. Testing

- Ogni release deve passare tutti i test
- Include regression tests
- Testa migration paths

## Troubleshooting

### Correggere Version Sbagliata

```bash
# Annulla ultimo release (se non ancora pushato)
git tag -d v1.1.0
git reset --hard HEAD~1

# Re-release con versione corretta
npm run release:patch
```

### Hotfix Emergency

```bash
# Per critical bugs su versione in produzione
git checkout v1.0.0
git checkout -b hotfix/critical-fix
# ... fix the issue ...
git commit -m "fix: critical security vulnerability"
npm run release:patch  # 1.0.0 → 1.0.1
```

## References

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [Standard Version](https://github.com/conventional-changelog/standard-version)
- [Keep a Changelog](https://keepachangelog.com/)
