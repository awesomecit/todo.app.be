🎯 Recap di Questa Sessione

- proper management of timezone in database with timestamptz
- automatic timezone detection from user profile or request headers
- conversion utilities for consistent timezone handling
  save time in timestamp, utc in db, and timezone offset on all records

details timezone:
"Sistema di Gestione Temporale", creando una base solida:
✅ Database Schema - PostgreSQL timestamptz, indici, constraints
✅ Timezone Management - Detection automatica, conversioni trasparenti
✅ API Serialization - DTO validation, edge cases, response formatting
✅ Helper Utilities - Business days, orari lavorativi, ricorrenze
Il documento contiene oltre 60 code snippets pratici e pattern reusabili che puoi applicare immediatamente nei tuoi progetti.
🤔 Prossimo Step: Testing TDD
Ora arriviamo alla parte più interessante: Story 5 - Testing Temporal Logic. Questa è dove il TDD diventa veramente potente perché:

Time Manipulation: Useremo MockDate per testare scenari temporali specifici
Timezone Testing: Simuleremo utenti in diversi fusi orari
Edge Case Testing: DST transitions, leap years, clock skew
Integration Testing: Validazione end-to-end del flusso temporale

- Integrate in Base Entity column validity end (used to know if a record is deprecated)

- Soft Delete use active column (boolean) instead of validity end (timestamp)

- No hard delete implementation, only soft delete

- Add helper repository with generic TypeORM repository methods (findById, findAll, create, update, delete) to improve easy pagination way

- helper proper acid transaction and commit/release/rollback

- use utility class to extend repository with generic type and preserve auto complete typing
