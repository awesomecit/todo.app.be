# ❓ FAQ - Release Management System

Domande frequenti sul sistema di release automation.

## 🔍 Funzionalità di Base

### Q: Come funziona il sistema di versioning automatico?

**A:** Il sistema utilizza **Semantic Versioning** basato sui commit messages:

```bash
feat:     # MINOR version (0.1.0 → 0.2.0)
fix:      # PATCH version (0.1.0 → 0.1.1)
BREAKING: # MAJOR version (0.1.0 → 1.0.0)
docs:     # Nessun bump di versione
```

### Q: Quando viene creato automaticamente un release?

**A:** Un release viene creato quando:

- Push su branch `main`/`master`
- Almeno un commit di tipo `feat` o `fix` dall'ultimo release
- Tutti i test passano
- Build è successful

### Q: Posso vedere cosa farà il release prima di eseguirlo?

**A:** Sì! Usa la modalità dry-run:

```bash
npm run release:auto:dry-run  # Simula senza modifiche
npm run release:analyze       # Mostra solo analisi
```

## 🎯 Workflow e Branching

### Q: Su quali branch funziona il sistema?

**A:** Configurazione attuale:

- **Automatico**: `main`, `master`
- **Manuale**: tutti gli altri branch
- **Protetto**: branch con protezioni GitHub/GitLab

### Q: Come gestisco feature branch?

**A:** Best practice:

```bash
# Su feature branch
git checkout -b feature/new-auth
git commit -m "feat(auth): add OAuth support"

# Test release potenziale
npm run release:analyze:dry-run

# Merge su main (triggerà release automatico)
git checkout main
git merge feature/new-auth
git push origin main  # ← Qui scatta il release
```

### Q: Posso bloccare release temporaneamente?

**A:** Sì, diverse opzioni:

```bash
# 1. Usa [skip ci] nel commit
git commit -m "fix(api): hotfix [skip ci]"

# 2. Disabilita hook temporaneamente
git push --no-verify origin main

# 3. Usa solo commit che non triggerano release
git commit -m "docs: update README"
```

## 📝 Commit Messages

### Q: Quali sono tutti i tipi di commit supportati?

**A:** Lista completa:

```text
feat:     ✅ Nuova funzionalità (MINOR)
fix:      ✅ Bug fix (PATCH)
docs:     📚 Solo documentazione
style:    💄 Formattazione, whitespace
refactor: ♻️  Refactoring senza nuove funzioni
test:     🧪 Aggiunta/modifica test
chore:    🔧 Build, task maintenance
perf:     ⚡ Miglioramenti performance (PATCH)
ci:       👷 Modifica CI/CD
build:    📦 Sistema build/dependencies
revert:   ⏪ Revert commit precedente
```

### Q: Come scrivo commit multi-scope?

**A:** Esempi:

```bash
feat(api,auth): add JWT token refresh
fix(ui): resolve button alignment on mobile
docs(api,readme): update installation guide
```

### Q: Come indico BREAKING CHANGES?

**A:** Diverse sintassi supportate:

```bash
# Metodo 1: Footer
feat(api): add new endpoint

BREAKING CHANGE: API v1 deprecated

# Metodo 2: ! nel type
feat(api)!: restructure user model

# Metodo 3: Nel body
feat(api): add authentication

This is a breaking change that requires...
```

## 🏷️ Tagging e Versioning

### Q: Come vengono creati i tag Git?

**A:** Processo automatico:

```bash
# Il sistema crea:
git tag -a v0.2.0 -m "Release v0.2.0

feat: add user authentication
fix: resolve memory leak
"

# E pusha:
git push origin v0.2.0
```

### Q: Posso personalizzare il formato dei tag?

**A:** Attualmente usa `v{MAJOR}.{MINOR}.{PATCH}`. Per personalizzare:

```javascript
// In scripts/auto-release.js, modifica:
const tagName = `v${newVersion}`; // ← Personalizza qui
```

### Q: Come gestisco pre-release (alpha, beta)?

**A:** Work in progress, attualmente non supportato. Roadmap:

```bash
# Futuro supporto pianificato:
npm run release:prerelease alpha  # v0.2.0-alpha.1
npm run release:prerelease beta   # v0.2.0-beta.1
```

## 📊 Changelog e Documentazione

### Q: Come viene generato il CHANGELOG.md?

**A:** Automaticamente durante release:

```markdown
## [0.2.0] - 2024-01-15

### ✨ Features

- **auth**: add user authentication (#123)
- **api**: new endpoint for data export (#124)

### 🐛 Bug Fixes

- **ui**: resolve mobile button alignment (#125)

### 📚 Documentation

- update installation guide
```

### Q: Posso personalizzare il formato changelog?

**A:** Sì, modifica `scripts/auto-release.js`:

```javascript
// Personalizza template in generateChangelog()
const template = `## [${version}] - ${date}

### 🚀 What's New
${features}

### 🔧 Bug Fixes
${fixes}
`;
```

### Q: Come aggiungo link a issue/PR nel changelog?

**A:** Usa riferimenti nei commit:

```bash
feat(auth): add OAuth support (#123)
fix(api): resolve timeout issue (closes #124)
```

## 🔧 Configurazione e Personalizzazione

### Q: Posso cambiare i branch protetti?

**A:** Modifica configurazione in `scripts/auto-release.js`:

```javascript
const PROTECTED_BRANCHES = ['main', 'master', 'develop'];
```

### Q: Come disabilito completamente l'automazione?

**A:** Rimuovi hook pre-push:

```bash
# Temporaneo
rm .husky/pre-push

# Permanente
npm uninstall husky
git config --unset core.hooksPath
```

### Q: Posso integrare con CI/CD diversi?

**A:** Sì, esempi:

```yaml
# GitHub Actions
- name: Auto Release
  run: |
    if [[ "$GITHUB_REF" == "refs/heads/main" ]]; then
      npm run release:auto
    fi

# GitLab CI
release:
  script:
    - npm run release:auto
  only:
    - main
```

## ❗ Problemi e Limitazioni

### Q: Cosa fare se il release fallisce a metà?

**A:** Il sistema ha rollback automatico, ma se necessario:

```bash
# 1. Verifica stato
git status
git log --oneline -5

# 2. Rollback manuale se necessario
npm run release:rollback  # Se script disponibile
# OPPURE ripristina backup automatici
```

### Q: Perché alcuni commit non triggerano release?

**A:** Motivi comuni:

- Commit type non è `feat` o `fix`
- Branch non è protetto (main/master)
- Test falliscono
- Build fallisce
- Nessun cambio significativo

### Q: Come gestisco hotfix urgenti?

**A:** Workflow hotfix:

```bash
# 1. Hotfix diretto su main
git checkout main
git commit -m "fix(critical): resolve security issue"
git push origin main  # ← Release automatico

# 2. Oppure forza release manuale
npm run release:auto:force
```

## 📈 Monitoring e Analytics

### Q: Come vedo statistiche dei release?

**A:** Analisi disponibili:

```bash
# Commits dall'ultimo release
npm run release:analyze

# Storia versioni
git tag -l | sort -V

# Frequenza release
git log --tags --simplify-by-decoration --oneline
```

### Q: Come monitoro la salute del sistema?

**A:** Health check:

```bash
# Verifica configurazione
npm run release:health-check

# Test completo
npm run release:test:all

# Analisi performance
time npm run release:auto:dry-run
```

---

💡 **Non trovi la risposta?** Consulta il [Troubleshooting Guide](./TROUBLESHOOTING.md) o crea una issue.
