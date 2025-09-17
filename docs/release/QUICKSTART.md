# 🚀 Quick Start Guide - Release Management

Guida rapida per utilizzare il sistema di release automation.

## ⚡ TL;DR

```bash
# 1. Commit usando conventional commits
git commit -m "feat(api): add user authentication"

# 2. Push (il sistema analizza automaticamente)
git push origin main
# → Se necessario, conferma il release quando richiesto

# 3. Oppure release manuale
npm run release:auto:dry-run  # Test sicuro
npm run release:auto          # Release completo
```

## 📝 Formato Commit Obbligatorio

**SEMPRE usa questo formato:**

```
<type>(<scope>): <description>
```

### ✅ Esempi Corretti

```bash
feat(auth): add JWT authentication
fix(api): resolve timeout issues
docs: update API documentation
chore(deps): update dependencies
```

### ❌ Esempi Sbagliati

```bash
Add new feature          # ❌ Manca type
feat add authentication  # ❌ Manca :
feat(): add auth         # ❌ Scope vuoto
```

## 🎯 Tipi Release

| Commit Type           | Release Type | Versione      |
| --------------------- | ------------ | ------------- |
| `feat`                | Minor        | 0.1.0 → 0.2.0 |
| `fix`                 | Patch        | 0.1.0 → 0.1.1 |
| `BREAKING CHANGE`     | Major        | 0.1.0 → 1.0.0 |
| `docs`, `style`, etc. | Nessuno      | 0.1.0 → 0.1.0 |

## 🔧 Comandi Utili

### Verifica Release

```bash
# Controlla se serve release
npm run release:analyze

# Output:
# ✅ Yes - minor (3 feat, 1 fix commits)
# ❌ No - no significant changes
```

### Test Release (SICURO)

```bash
# Simula tutto senza modificare nulla
npm run release:auto:dry-run

# Output mostra tutto quello che farebbe:
# 🔢 New version: 0.2.0
# 📝 Would update package.json
# 🏷️ Would create Git tag v0.2.0
# 🚀 Would push changes and tags
```

### Release Manuale

```bash
# Release automatico completo
npm run release:auto

# Force release (anche se non necessario)
npm run release:auto:force
```

## 🛡️ Safety Features

### Backup Automatico

- Il sistema crea backup prima di ogni modifica
- Rollback automatico se qualcosa va storto

### Conferme Interactive

```bash
git push origin main
# Output:
# ✅ Release needed: minor
# 🤔 Do you want to create an automated release? (y/N)
```

### Dry-Run Always Available

- Usa `--dry-run` per testare qualsiasi operazione
- Nessun rischio, mostra solo cosa farebbe

## 🚨 Troubleshooting

### "Commit message non valido"

```bash
# ❌ Errore
git commit -m "fix something"

# ✅ Corretto
git commit -m "fix(api): resolve endpoint timeout"
```

### "No release needed"

```bash
# Se hai solo commit docs/style/chore
npm run release:auto:force  # Forza release
```

### "Tests failed"

```bash
# Fix i test prima del release
npm run test:coverage

# O skip in emergenza (sconsigliato)
npm run release:auto -- --skip-tests
```

## 🎯 Workflow Tipico

```bash
# 1. Sviluppo feature
git checkout -b feat/awesome-feature

# 2. Commit (formato corretto!)
git commit -m "feat(core): add awesome functionality"
git commit -m "test(core): add tests for awesome feature"
git commit -m "docs: update README with awesome feature"

# 3. Merge to main
git checkout main
git merge feat/awesome-feature

# 4. Push (release automatico!)
git push origin main
# → Sistema analizza commits
# → Chiede conferma se necessario release
# → Esegue tutto automaticamente
```

## 📊 Cosa Fa il Release Automatico

1. **Analizza** commit dal ultimo release
2. **Calcola** nuova versione (major/minor/patch)
3. **Esegue** test + build
4. **Aggiorna** package.json version
5. **Genera** changelog
6. **Committa** modifiche
7. **Crea** Git tag annotato (es: v0.2.0)
8. **Pusha** commit e tag automaticamente

## 🎉 Risultato

Dopo il release automatico:

- ✅ Nuova versione in package.json
- ✅ Git tag creato (v0.2.0)
- ✅ Changelog aggiornato
- ✅ Tutto pushato su repository
- ✅ Ready per deploy!

---

💡 **Tip**: Usa sempre `npm run release:auto:dry-run` prima del primo release per familiarizzare con il sistema!
