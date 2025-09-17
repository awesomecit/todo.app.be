# SonarJS Usage Guide

## Overview

Questa guida fornisce istruzioni complete su come utilizzare gli strumenti di analisi della complessità cognitiva basati su SonarJS nel progetto todo.app.be.

## Strumenti Disponibili

### Scripts NPM di Analisi

Il progetto include diversi script per l'analisi della qualità del codice:

```bash
# Analisi completa
npm run analyze

# Analisi specifica per complessità cognitiva
npm run analyze:cognitive

# Analisi complessità ciclomatica
npm run analyze:complexity

# Analisi lunghezza funzioni
npm run analyze:functions

# Analisi sicurezza
npm run analyze:security

# Generazione report
npm run analyze:report
```

### Configurazione ESLint

Il progetto utilizza il plugin `@typescript-eslint/eslint-plugin` con regole SonarJS:

```javascript
// eslint.config.mjs
{
  rules: {
    '@typescript-eslint/cognitive-complexity': ['error', 15],
    'complexity': ['error', { max: 20 }],
    'max-lines-per-function': ['error', { max: 80, skipBlankLines: true, skipComments: true }]
  }
}
```

## Soglie di Qualità

### Complessità Cognitiva (Cognitive Complexity)

- **Soglia**: 15
- **Scopo**: Misura la difficoltà di comprensione del codice
- **Fattori**: Nesting, loops, conditions, switches

### Complessità Ciclomatica (Cyclomatic Complexity)

- **Soglia**: 20
- **Scopo**: Misura il numero di percorsi linearmente indipendenti
- **Fattori**: Decision points, branches

### Lunghezza Funzioni

- **Soglia**: 80 linee (esclusi commenti e righe vuote)
- **Scopo**: Promuove funzioni focalizzate e testabili

## Workflow di Sviluppo

### 1. Analisi Pre-Commit

Prima di ogni commit, esegui l'analisi completa:

```bash
npm run analyze
```

### 2. Risoluzione Violazioni

Se vengono rilevate violazioni, applica le seguenti strategie:

#### Per Complessità Cognitiva Alta:

1. **Estrazione di funzioni helper**
2. **Riduzione del nesting** con early returns
3. **Semplificazione delle condizioni** logiche
4. **Decomposizione di switch/case** complessi

#### Per Funzioni Troppo Lunghe:

1. **Estrazione di metodi**
2. **Separazione delle responsabilità**
3. **Creazione di factory functions**
4. **Uso di composition patterns**

### 3. Refactoring Patterns

#### Extract Method Pattern

```typescript
// ❌ Complesso
function processUser(user: User) {
  if (user.isActive && user.hasPermissions && user.isVerified) {
    // logica complessa qui...
  }
}

// ✅ Refactored
function processUser(user: User) {
  if (isEligibleUser(user)) {
    handleUserProcessing(user);
  }
}

function isEligibleUser(user: User): boolean {
  return user.isActive && user.hasPermissions && user.isVerified;
}
```

#### Configuration Object Pattern

```typescript
// ❌ Molti parametri
function createLogger(env, level, timezone, maxFiles, maxSize) {
  // implementazione
}

// ✅ Configuration object
interface LoggerConfig {
  environment: string;
  level: string;
  timezone: string;
  maxFiles: number;
  maxSize: string;
}

function createLogger(config: LoggerConfig) {
  // implementazione
}
```

## Integrazione con VS Code

### Configurazione Workspace

Aggiungi al file `.vscode/settings.json`:

```json
{
  "eslint.validate": ["typescript"],
  "eslint.run": "onType",
  "typescript.preferences.includePackageJsonAutoImports": "on"
}
```

### Extensions Consigliate

- ESLint (`dbaeumer.vscode-eslint`)
- SonarLint (`SonarSource.sonarlint-vscode`)
- Prettier (`esbenp.prettier-vscode`)

## Automazione CI/CD

### GitHub Actions Integration

```yaml
# .github/workflows/quality.yml
name: Code Quality
on: [push, pull_request]

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run analyze
      - run: npm run test:coverage
```

## Metriche e Reporting

### Report Generation

Il comando `npm run analyze:report` genera:

1. **HTML Report**: Visualizzazione interattiva delle metriche
2. **JSON Report**: Dati strutturati per automazione
3. **Markdown Summary**: Report leggibile per PR reviews

### Interpretazione Metriche

#### Complessità Cognitiva

- **0-10**: Semplice e leggibile
- **11-15**: Accettabile, monitorare
- **16+**: Richiede refactoring

#### Complessità Ciclomatica

- **1-10**: Semplice
- **11-20**: Moderata
- **21+**: Complessa, richiede semplificazione

## Best Practices

### 1. Principi SOLID

- **Single Responsibility**: Una funzione, una responsabilità
- **Open/Closed**: Estendibile senza modifiche
- **Liskov Substitution**: Sostituibilità delle implementazioni
- **Interface Segregation**: Interfacce specifiche
- **Dependency Inversion**: Dipendenze verso astrazioni

### 2. Clean Code Principles

- **Meaningful Names**: Nomi descrittivi e chiari
- **Small Functions**: Funzioni brevi e focalizzate
- **Single Level of Abstraction**: Un livello di astrazione per funzione
- **Error Handling**: Gestione errori esplicita

### 3. Testing Strategy

- **Unit Tests**: Test per ogni funzione estratta
- **Integration Tests**: Test per i flussi complessi
- **Regression Tests**: Verifica che il refactoring non rompa nulla

## Troubleshooting

### Problemi Comuni

#### False Positives

Se una regola genera falsi positivi, puoi:

```typescript
// Disabilitare per riga specifica
// eslint-disable-next-line @typescript-eslint/cognitive-complexity
function complexButNecessary() {
  // implementazione complessa ma necessaria
}

// Disabilitare per blocco
/* eslint-disable @typescript-eslint/cognitive-complexity */
function unavoidableComplexity() {
  // logica complessa inevitabile
}
/* eslint-enable @typescript-eslint/cognitive-complexity */
```

#### Performance Issues

Per progetti grandi, ottimizza l'analisi:

```bash
# Analizza solo file modificati
npm run analyze -- --cache
```

## Continuous Improvement

### Monthly Reviews

1. Analizza trend delle metriche
2. Identifica pattern di violazioni ricorrenti
3. Aggiorna soglie se necessario
4. Condividi lessons learned con il team

### Training Materials

- [Clean Code Principles](https://cleancoders.com)
- [SOLID Principles](https://en.wikipedia.org/wiki/SOLID)
- [Cognitive Complexity](https://www.sonarsource.com/docs/CognitiveComplexity.pdf)

## References

- [SonarJS Documentation](https://github.com/SonarSource/SonarJS)
- [ESLint Cognitive Complexity](https://typescript-eslint.io/rules/cognitive-complexity/)
- [Clean Code by Robert Martin](https://www.amazon.com/Clean-Code-Handbook-Software-Craftsmanship/dp/0132350882)
