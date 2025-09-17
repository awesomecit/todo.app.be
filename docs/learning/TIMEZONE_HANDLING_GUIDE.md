# 🕒 Gestione Dati Temporali in Backend NestJS/PostgreSQL

## 📋 Guida Completa - Parte 1: Fondamenta e Best Practices

**Target**: Sviluppatore Junior guidato da Senior
**Stack**: NestJS + TypeORM + PostgreSQL + Luxon
**Approccio**: Test-Driven Development (TDD)

---

## 🎯 Executive Summary

Questa guida affronta uno dei problemi più complessi nello sviluppo backend: la gestione corretta dei dati temporali. Copre database schema, timezone management, API serialization e utilities riusabili, tutto con un approccio production-ready e test-driven.

### 🔑 Principi Fondamentali Appresi

1. **Sempre UTC al Database**: Memorizza tutti i timestamp in UTC, converti solo alla presentazione
2. **PostgreSQL timestamptz**: Usa sempre `timestamptz` per timestamp, mai `timestamp` semplice
3. **IANA Timezones**: Usa identificatori geografici (`Europe/Rome`) non offset (`+02:00`)
4. **Validation Early**: Valida e converti le date il prima possibile nel pipeline
5. **Edge Cases Matter**: Gestisci DST, leap seconds, clock skew, e precision loss

---

## 📦 Epic: Sistema di Gestione Temporale Robusto

**Obiettivo**: Implementare un sistema completo per la gestione di dati temporali che garantisca consistenza, precisione e usabilità attraverso tutti i layer dell'applicazione.

### 🗺️ Mappa delle Story e Dipendenze

```
📦 EPIC: Sistema Gestione Temporale
├── 📚 STORY 1: Database Temporal Schema ✅ COMPLETATA
│   ├── ⚙️ TASK 1.1: PostgreSQL Temporal Types
│   └── 🗄️ TASK 1.2: TypeORM Entity Configuration
├── 🌍 STORY 2: Timezone Management ✅ COMPLETATA
│   ├── 🌐 TASK 2.1: Timezone Detection & Storage
│   └── ⏰ TASK 2.2: Timezone Conversion Logic
├── 🔄 STORY 3: Serialization & APIs ✅ COMPLETATA
│   ├── 📡 TASK 3.1: DTO Temporal Handling
│   └── 🔌 TASK 3.2: API Response Formatting
├── 🛠️ STORY 4: Helper Utilities ✅ COMPLETATA
│   ├── 🔧 TASK 4.1: DateHelper Service
│   └── 📐 TASK 4.2: Validation Pipes
└── 🧪 STORY 5: Testing Temporal Logic 🔄 PROSSIMA
    ├── 🧪 TASK 5.1: Temporal Unit Tests
    └── 🎭 TASK 5.2: Timezone Integration Tests
```

---

## 📚 Story 1: Database Temporal Schema Design

### 🎓 Concetti Chiave Appresi

**PostgreSQL Temporal Types**:

- `timestamptz` → Con timezone info (UTC + offset) ✅ Raccomandato per eventi
- `timestamp` → Senza timezone info ❌ Evitare per timestamp applicativi
- `date` → Solo data senza orario → Per compleanni, scadenze giornaliere
- `interval` → Durate/Periodi → Per timeout, SLA tracking

**Best Practice**: Sempre UTC al database, conversione solo per UI.

### 🛠️ Implementazione Chiave

#### Database Configuration

```sql
-- Imposta timezone database
SET timezone = 'UTC';

-- Function validazione date future
CREATE OR REPLACE FUNCTION validate_future_date(date_value timestamptz)
RETURNS boolean AS $$
BEGIN
  RETURN date_value >= CURRENT_TIMESTAMP;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- Indici per performance query temporali
CREATE INDEX CONCURRENTLY idx_tasks_due_date_active
ON tasks (due_date)
WHERE due_date IS NOT NULL AND completed_at IS NULL;
```

#### TypeORM Entity Design

```typescript
// Base entity con timestamp automatici
export abstract class BaseTemporalEntity {
  @CreateDateColumn({ type: 'timestamptz' })
  created_at: Date;

  @UpdateDateColumn({ type: 'timestamptz' })
  updated_at: Date;

  @Column({ type: 'timestamptz', nullable: true })
  deleted_at: Date | null;
}

// Task entity con validazioni temporali
@Entity('tasks')
@Check('due_date >= created_at') // Constraint logica
export class Task extends BaseTemporalEntity {
  @Column({ type: 'timestamptz', nullable: true })
  due_date: Date | null;

  @Column({ type: 'varchar', length: 50, default: 'UTC' })
  user_timezone: string; // Per conversioni UI

  // Virtual properties per calcoli
  get is_overdue(): boolean {
    return this.due_date && !this.completed_at && this.due_date < new Date();
  }
}
```

### 📈 Benefici Ottenuti

- **Consistenza**: Tutti i timestamp in UTC eliminano ambiguità
- **Performance**: Indici ottimizzati per query temporali frequenti
- **Integrità**: Database constraints prevengono dati logicamente inconsistenti
- **Scalabilità**: Schema supporta utenti multi-timezone senza modifiche

---

## 🌍 Story 2: Timezone Management

### 🎓 Concetti Chiave Appresi

**Timezone vs Offset**:

- **Offset**: `+02:00` → Fisso, non gestisce DST
- **IANA Timezone**: `Europe/Rome` → Gestisce DST automaticamente ✅

**Flusso di Conversione**:

```
Client (Local) → Detect Timezone → Convert to UTC → Store Database
Database (UTC) → Read → Convert to User TZ → API Response → Client
```

### 🛠️ Implementazione Chiave

#### Timezone Detection Service

```typescript
@Injectable()
export class TimezoneService {
  detectTimezoneFromRequest(request: any): string {
    // Priorità: header custom → locale → user-agent → UTC fallback
    const methods = [
      () => request.headers['x-timezone'],
      () => this.extractFromLocale(request.headers['accept-language']),
      () => this.extractFromUserAgent(request.headers['user-agent']),
    ];

    // Ritorna primo timezone valido o UTC
    return this.findValidTimezone(methods) || 'UTC';
  }

  convertToUTC(localDate: string, timezone: string): Date {
    return DateTime.fromISO(localDate, { zone: timezone }).toUTC().toJSDate();
  }

  convertToUserTimezone(utcDate: Date, timezone: string): DateTime {
    return DateTime.fromJSDate(utcDate, { zone: 'UTC' }).setZone(timezone);
  }
}
```

#### Automatic Timezone Interceptor

```typescript
@Injectable()
export class TimezoneInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler) {
    const request = context.switchToHttp().getRequest();

    // Auto-detect e inject timezone
    request.body.timezone =
      this.timezoneService.detectTimezoneFromRequest(request);

    return next.handle().pipe(
      // Auto-convert response dates to user timezone
      map(data => this.transformResponseDates(data, request.body.timezone)),
    );
  }
}
```

### 📈 Benefici Ottenuti

- **User Experience**: Date sempre mostrate nel timezone utente
- **Automatismo**: Detection automatica senza configurazione utente
- **Robustezza**: Fallback a UTC se detection fallisce
- **Trasparenza**: Conversioni invisibili al business logic

---

## 🔄 Story 3: Serialization & APIs

### 🎓 Edge Cases Gestiti

1. **JavaScript Date Precision Loss**: Serializzazione come ISO string
2. **DST Transitions**: Orari duplicati/inesistenti durante cambio ora
3. **Database Precision**: PostgreSQL microseconds vs JS Date milliseconds
4. **Client Clock Skew**: Tolleranza 5 minuti per date passate
5. **Leap Seconds**: Gestione tramite Luxon library

### 🛠️ Implementazione Chiave

#### DTO con Validation Automatica

```typescript
export class CreateTaskDto extends TemporalBaseDto {
  @IsOptional()
  @IsDateString()
  @Transform(({ value, obj }) => {
    // Auto-conversione a UTC durante validation
    const timezoneService = new TimezoneService();
    return timezoneService.convertToUTC(value, obj.timezone || 'UTC');
  })
  due_date?: Date;
}
```

#### Response DTO con Campi Calcolati

```typescript
export class TemporalResponseDto {
  @Transform(({ value }) => value?.toISOString() || null)
  due_date: string | null;

  // Campi calcolati per UI
  @Expose()
  get is_overdue(): boolean {
    return (
      this.due_date &&
      !this.completed_at &&
      new Date(this.due_date) < new Date()
    );
  }

  @Expose()
  get time_until_due(): string | null {
    // "5d 3h", "2h", "less than 1 hour", "overdue"
    return this.calculateTimeUntilDue();
  }
}
```

#### Controller con Timezone Support

```typescript
@Controller('tasks')
export class TasksController {
  @Post()
  @TimezoneAware() // Custom decorator
  @ApiHeader({ name: 'X-Timezone', required: false })
  async createTask(@Body() dto: CreateTaskDto) {
    // DTO ha già convertito date a UTC
    const task = await this.tasksService.create(dto);

    // Response automaticamente convertito a user timezone
    return plainToClass(TemporalResponseDto, task);
  }
}
```

### 📈 Benefici Ottenuti

- **Type Safety**: Validation automatica con decorators
- **User Friendly**: Campi calcolati per UI (`is_overdue`, `time_until_due`)
- **API Consistency**: Sempre ISO strings nelle response
- **Error Handling**: Messaggi chiari per errori temporali

---

## 🛠️ Story 4: Helper Utilities

### 🎓 Operazioni Temporali Avanzate

Il `DateHelperService` fornisce operazioni complesse spesso necessarie nelle applicazioni business:

1. **Business Days Calculation**: Esclude weekend e festivi
2. **Business Hours Validation**: Controlla se una data è in orario lavorativo
3. **Next Available Slot**: Trova il prossimo slot di business hour disponibile
4. **Recurring Dates Generation**: Genera serie di date ricorrenti (daily/weekly/monthly)
5. **Duration Formatting**: Converte millisecondi in formato human-readable
6. **Date Range Overlaps**: Verifica sovrapposizioni tra periodi

### 🛠️ Implementazione Chiave

#### Business Days Calculator

```typescript
calculateBusinessDaysBetween(start: Date, end: Date, excludeWeekends = true): number {
  let businessDays = 0;
  let current = DateTime.fromJSDate(start);
  const endDt = DateTime.fromJSDate(end);

  while (current <= endDt) {
    const weekday = current.weekday;
    if (!excludeWeekends || (weekday >= 1 && weekday <= 5)) {
      businessDays++;
    }
    current = current.plus({ days: 1 });
  }

  return businessDays;
}
```

#### Smart Business Hour Finder

```typescript
getNextBusinessHourSlot(fromDate: Date, businessHours: BusinessHours): Date {
  let candidate = DateTime.fromJSDate(fromDate).setZone(businessHours.timezone);

  // Logica intelligente per trovare prossimo slot valido
  // considerando weekend, orari lavorativi, timezone

  for (let i = 0; i < 14; i++) { // Max 14 giorni ricerca
    if (this.isValidBusinessSlot(candidate, businessHours)) {
      return candidate.toJSDate();
    }
    candidate = this.getNextPossibleSlot(candidate, businessHours);
  }

  throw new Error('Could not find slot within 14 days');
}
```

#### Advanced Validation Pipe

```typescript
@Injectable()
export class TemporalValidationPipe implements PipeTransform {
  transform(value: any, metadata: ArgumentMetadata) {
    // Auto-detect campi data e applica validazioni
    const validated = this.validateTemporalFields(value);

    // Business logic validation
    this.validateBusinessLogic(validated); // start < end, due > created, etc.

    return validated;
  }
}
```

### 📈 Benefici Ottenuti

- **Riusabilità**: Helper centralized per operazioni temporali complesse
- **Business Logic**: Supporto per business days, orari lavorativi, ricorrenze
- **Robustezza**: Gestione automatica di edge cases e timezone
- **Validation**: Pipeline automatica per consistenza dati

---

## 🔍 Problemi Risolti e Edge Cases Gestiti

### ✅ Database Level

- **Timezone Consistency**: Sempre UTC, conversioni solo per display
- **Data Integrity**: Database constraints per validazioni logiche
- **Performance**: Indici ottimizzati per query temporali frequenti
- **Precision**: Gestione corretta di microseconds PostgreSQL

### ✅ Application Level

- **Automatic Detection**: Timezone detection da headers/locale/user-agent
- **Transparent Conversion**: Conversioni invisibili al business logic
- **Validation Pipeline**: Controlli automatici su date input
- **Error Handling**: Messaggi chiari e recovery graceful

### ✅ API Level

- **Consistent Format**: Sempre ISO strings nelle response
- **Calculated Fields**: Campi derived per UI (`is_overdue`, `time_until_due`)
- **Documentation**: OpenAPI specs con esempi timezone-aware
- **Backward Compatibility**: Fallback a UTC per client legacy

### ✅ Edge Cases

- **DST Transitions**: Gestione orari duplicati/inesistenti
- **Clock Skew**: Tolleranza per date "nel passato" per errori clock
- **Precision Loss**: Prevenzione via serializzazione ISO string
- **Invalid Timezones**: Validation e fallback automatici
- **Future Limits**: Protezione contro date troppo nel futuro (sanity check)

---

## 🚀 Prossimi Passi

### 🧪 Story 5: Testing Temporal Logic (Prossima)

**Obiettivo**: Implementare suite di test completa per validare tutto il sistema temporale usando approccio TDD.

**Scope**:

- **Unit Tests**: TimezoneService, DateHelperService, ValidationPipe
- **Integration Tests**: Database timezone handling, cross-service interactions
- **E2E Tests**: Complete temporal workflows con diversi timezone
- **Edge Case Tests**: DST transitions, leap years, invalid inputs

**Tecnologie**: Jest + Supertest + MockDate per time manipulation

---

## 📚 Risorse e Documentazione

### 🔗 Link Utili

- [PostgreSQL Date/Time Types](https://www.postgresql.org/docs/current/datatype-datetime.html)
- [Luxon Documentation](https://moment.github.io/luxon/)
- [IANA Time Zone Database](https://www.iana.org/time-zones)
- [NestJS Validation](https://docs.nestjs.com/techniques/validation)

### 📖 Best Practices Learned

1. **Always UTC in Database** - Single source of truth temporale
2. **IANA Timezones** - Mai usare offset fissi per timezone business
3. **Validate Early** - Controlli il prima possibile nel pipeline
4. **Test Edge Cases** - DST, leap seconds, precision loss sono reali
5. **Document Assumptions** - Timezone handling deve essere esplicito in API docs

### 🎯 Key Takeaways

- La gestione temporale è complessa ma gestibile con approccio sistematico
- PostgreSQL + TypeORM + Luxon offrono tutto il necessario per robustezza
- NestJS decorators e interceptors permettono gestione trasparente
- Testing è cruciale per validare comportamento con diversi timezone
- Documentazione API deve essere esplicita su gestione temporal

---

**Status**: ✅ Part 1 Completed - Ready for Story 5 (Testing Implementation)\*\*
**Next**: Implementazione TDD completa con test suite temporal

---

_Questa guida è parte di un progetto più ampio di Task Management API con focus su robustezza production e best practices enterprise._
