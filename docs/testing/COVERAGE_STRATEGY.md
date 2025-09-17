# Coverage Configuration Strategy

## 📊 Situazione Coverage Attuale vs Target

### Coverage Reale vs Soglie Target

- **Statements**: 51.06% → Target 80% (Gap: -28.94%)
- **Branches**: 61.53% → Target 75% (Gap: -13.47%)
- **Functions**: 45.58% → Target 80% (Gap: -34.42%)
- **Lines**: 52.32% → Target 80% (Gap: -27.68%)

## 🎯 Strategia di Adozione Graduale

### Phase 1: Configurazione Base (Attuale)

Impostiamo soglie realistiche basate sul coverage attuale + 5%:

```javascript
coverageThreshold: {
  global: {
    statements: 55,    // Attuale 51% + 4%
    branches: 65,      // Attuale 61% + 4%
    functions: 50,     // Attuale 45% + 5%
    lines: 55,         // Attuale 52% + 3%
  }
}
```

### Phase 2: Incremento Graduale (2-4 settimane)

Aumentiamo progressivamente ogni 2 settimane:

```javascript
// Week 3-4
global: {
  statements: 65,
  branches: 70,
  functions: 60,
  lines: 65,
}

// Week 5-6
global: {
  statements: 75,
  branches: 75,
  functions: 70,
  lines: 75,
}
```

### Phase 3: Target Finale (6-8 settimane)

```javascript
// Target definitivo
global: {
  statements: 80,
  branches: 75,
  functions: 80,
  lines: 80,
}
```

## 🚦 Raccomandazione per l'Implementazione

1. **Configurare soglie graduali** per evitare blocco completo del team
2. **Identificare quick wins** (file facili da testare)
3. **Priorizzare moduli critici** (health, filters, logger)
4. **Stabilire rituali team** (coverage review in PR)

## 📈 File Prioritari per Quick Wins

### Facili da testare (0% → 80%+)

1. `app.service.ts` - Solo 6 righe, facile
2. `validation.schema.ts` - Schema Joi, test di configurazione
3. `index.ts` files - Esportazioni semplici

### Critici per business logic

1. `app.controller.ts` - Controller principale
2. `security.middleware.ts` - Sicurezza
3. `dto-validator.service.ts` - Validazione input

### Già buoni, da migliorare

1. `all-exceptions.filter.ts` - 94% → 100%
2. `logger.service.ts` - 57% → 90%+
3. `health.controller.ts` - 73% → 95%+

## ⚡ Quick Actions per Team

### Sprint 1: Foundation (2 settimane)

- [ ] Testare `app.service.ts` (6 linee)
- [ ] Testare `validation.schema.ts`
- [ ] Completare `all-exceptions.filter.ts` (6% rimanente)
- [ ] Target: 60% global coverage

### Sprint 2: Core Features (2 settimane)

- [ ] Testare `app.controller.ts`
- [ ] Migliorare `logger.service.ts` coverage
- [ ] Testare `security.middleware.ts`
- [ ] Target: 70% global coverage

### Sprint 3: Completamento (2 settimane)

- [ ] Testare `dto-validator.service.ts`
- [ ] Completare `health.controller.ts`
- [ ] Testare `wildcard.controller.ts`
- [ ] Target: 80% global coverage

---

**Nota**: Una volta raggiunto il target, il sistema TDD enforced garantirà che la qualità non degradi nel tempo.
