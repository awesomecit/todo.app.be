# 🔧 Troubleshooting Guide - Release Management

Guida alla risoluzione dei problemi più comuni del sistema di release automation.

## 🚨 Errori Comuni

### 1. Commit Message Validation Failed

**Errore:**

```
❌ Commit message format is invalid
Expected format: <type>(<scope>): <description>
```

**Soluzioni:**

```bash
# ❌ Sbagliato
git commit -m "fix something"
git commit -m "add new feature"

# ✅ Corretto
git commit -m "fix(api): resolve timeout issue"
git commit -m "feat(auth): add user authentication"
```

**Fix commit precedente:**

```bash
# Correggi ultimo commit
git commit --amend -m "feat(api): add user endpoint"

# Per commit più vecchi
git rebase -i HEAD~3  # Modifica ultimi 3 commit
```

### 2. No Release Needed

**Errore:**

```
📝 No release needed - no significant changes found
```

**Cause:**

- Solo commit `docs`, `style`, `chore`, `test`
- Nessun commit `feat` o `fix` dall'ultimo release

**Soluzioni:**

```bash
# Forza release comunque
npm run release:auto:force

# Oppure aggiungi commit significativo
git commit -m "feat(core): improve performance"
```

### 3. Tests Failed During Release

**Errore:**

```
❌ Tests failed during release process
Command failed: npm run test:coverage:check
```

**Soluzioni:**

```bash
# 1. Fix i test
npm run test:coverage
# Correggi i test che falliscono

# 2. Skip test temporaneamente (sconsigliato)
npm run release:auto -- --skip-tests

# 3. Debug specifico
npm run test:watch  # Test interattivi
```

### 4. Build Failed During Release

**Errore:**

```
❌ Build failed during release process
Command failed: npm run build
```

**Soluzioni:**

```bash
# 1. Test build locale
npm run build

# 2. Controlla errori TypeScript
npm run lint:check

# 3. Skip build temporaneamente
npm run release:auto -- --skip-build
```

### 5. Git Push Failed

**Errore:**

```
❌ Failed to push changes and tags
Permission denied or branch protection
```

**Soluzioni:**

```bash
# 1. Verifica permessi git
git push origin main  # Test manuale

# 2. Branch protection rules
# Disabilita temporaneamente su GitHub/GitLab

# 3. Force push (attenzione!)
git push --force-with-lease origin main
```

### 6. Tag Already Exists

**Errore:**

```
❌ Git tag v0.2.0 already exists
```

**Soluzioni:**

```bash
# 1. Rimuovi tag esistente
git tag -d v0.2.0                # Locale
git push origin --delete v0.2.0  # Remoto

# 2. Oppure forza versione specifica
node scripts/version-calculator.js patch --force
```

## 🐛 Debug Mode

### Attivare Debug Dettagliato

```bash
# Modalità verbose per tutti gli script
DEBUG=* npm run release:auto:dry-run

# Debug specifico release
node scripts/auto-release.js --dry-run --verbose

# Log completi analisi
npm run release:analyze:save
cat release-analysis.json
```

### File di Log

Il sistema genera vari file di debug:

```bash
release-analysis.json     # Analisi commit dettagliata
package.json.backup-*     # Backup automatici
CHANGELOG.md.backup-*     # Backup changelog
```

## 🔍 Problemi di Configurazione

### 1. Husky Hooks Non Funzionano

**Verifica:**

```bash
# Controlla installazione Husky
ls -la .husky/

# Reinstalla hooks
npm run prepare

# Permessi file
chmod +x .husky/commit-msg
chmod +x .husky/pre-push
```

### 2. Commitlint Non Valida

**Verifica configurazione:**

```bash
# Test manuale commitlint
echo "feat(test): test message" | npx commitlint

# Controlla configurazione
cat commitlint.config.js
```

### 3. Script Release Non Trovati

**Verifica:**

```bash
# Controlla presenza script
ls -la scripts/

# Permessi esecuzione
chmod +x scripts/*.js

# Test diretto
node scripts/release-analyzer.js
```

## 🔄 Operazioni di Recovery

### Rollback Release Fallito

Se un release si interrompe, il sistema tenta rollback automatico. Se necessario manuale:

```bash
# 1. Ripristina package.json
cp package.json.backup-* package.json

# 2. Ripristina changelog
cp CHANGELOG.md.backup-* CHANGELOG.md

# 3. Rimuovi commit release (se creato)
git reset --hard HEAD~1

# 4. Rimuovi tag (se creato)
git tag -d v0.2.0

# 5. Pulisci backup
rm *.backup-*
```

### Reset Completo Sistema Release

```bash
# 1. Reset git stato
git reset --hard origin/main
git clean -fd

# 2. Reinstalla dependencies
rm -rf node_modules package-lock.json
npm install

# 3. Reinstalla hooks
npm run prepare

# 4. Verifica sistema
npm run release:analyze:dry-run
```

## 📊 Verifiche di Salute Sistema

### Health Check Completo

```bash
#!/bin/bash
echo "🔍 Health Check Release System"

# 1. Git hooks
echo "📋 Checking Git Hooks..."
test -f .husky/commit-msg && echo "✅ commit-msg hook" || echo "❌ commit-msg missing"
test -f .husky/pre-push && echo "✅ pre-push hook" || echo "❌ pre-push missing"

# 2. Scripts
echo "📋 Checking Release Scripts..."
test -f scripts/release-analyzer.js && echo "✅ release-analyzer" || echo "❌ analyzer missing"
test -f scripts/version-calculator.js && echo "✅ version-calculator" || echo "❌ calculator missing"
test -f scripts/auto-release.js && echo "✅ auto-release" || echo "❌ auto-release missing"

# 3. Dependencies
echo "📋 Checking Dependencies..."
npm list @commitlint/cli >/dev/null 2>&1 && echo "✅ commitlint" || echo "❌ commitlint missing"
npm list husky >/dev/null 2>&1 && echo "✅ husky" || echo "❌ husky missing"

# 4. Configuration
echo "📋 Checking Configuration..."
test -f commitlint.config.js && echo "✅ commitlint config" || echo "❌ commitlint config missing"

# 5. Test functionality
echo "📋 Testing Core Functions..."
npm run release:analyze >/dev/null 2>&1 && echo "✅ analysis works" || echo "❌ analysis failed"

echo "🎉 Health check completed!"
```

### Performance Monitoring

```bash
# Tempo esecuzione release
time npm run release:auto:dry-run

# Dimensione repository post-release
du -sh .git/

# Numero commit analizzati
npm run release:analyze:json | jq '.analysis.summary.total'
```

## 🆘 Supporto e Risorse

### Log Errors Comuni

Raccolta degli errori più frequenti e soluzioni:

```bash
# Crea log errori per analisi
npm run release:auto:dry-run 2>&1 | tee release-debug.log

# Analizza errori
grep -i "error\|failed\|❌" release-debug.log
```

### Contatti Team

Per problemi complessi:

- Crea issue su repository con log completi
- Include output `npm run release:analyze:json`
- Specifica versione Node.js e npm

---

💡 **Tip**: Usa sempre `dry-run` per test e debugging sicuri!
