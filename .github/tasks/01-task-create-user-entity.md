## TASK 1: Creazione delle Strutture Dati Base "User"

**Obiettivo**: Creare le entità e DTO fondamentali senza logica business, solo strutture dati.

**Perché questo task**: Prima di scrivere test, abbiamo bisogno delle strutture dati di base. Questo non è vero TDD, ma è una base necessaria che ci permette di scrivere test significativi nei task successivi.

**Istruzioni per Copilot**:

Crea i seguenti file nella cartella `src/users/`:

1. **user.entity.ts**: Entity TypeORM con campi id (UUID), email (unique), firstName, lastName, password, createdAt, updatedAt

2. **dto/create-user.dto.ts**: DTO con validazioni class-validator per email (must be valid email), firstName (required string), lastName (required string), password (minimum 8 characters, required string). Tutti i messaggi di errore devono essere in UPPER_CASE_WITH_UNDERSCORES

3. **dto/user-response.dto.ts**: DTO response che esclude la password, include tutti gli altri campi dell'entity

4. **exceptions/custom-exceptions.ts**: Crea EntityAlreadyExistsException che prende entityName, field, value e genera messaggio "ENTITY_ALREADY_EXISTS: {entityName} with {field}={value}"

5. **naming-strategy.ts**: Implementa una naming strategy personalizzata per convertire camelCase in snake_case per i nomi delle colonne e delle tabelle nel database
   Nel codice TypeScript, mantieni camelCase per le proprietà delle entity. TypeORM offre un meccanismo elegante per gestire questa traduzione automaticamente attraverso la configurazione namingStrategy.

**Criteri di successo**: Files creati, compilazione TypeScript successful, no business logic implementata.
