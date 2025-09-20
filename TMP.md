# Copilot Task Guide: TDD CRUD Implementation

## Comprensione del Framework di Task

Questo documento contiene task atomici progettati specificamente per guidare Copilot attraverso un'implementazione TDD rigorosa del sistema CRUD Users. Ogni task è auto-contenuto e segue il principio "una responsabilità, un task" per evitare over-engineering e mantenere focus e chiarezza.

La strategia dietro questi task è costruire dal basso verso l'alto, partendo dai test che definiscono il comportamento desiderato, poi implementando il codice minimo necessario, e infine raffinando il design. Questo approccio garantisce che ogni pezzo del sistema sia testato e funzionale prima di procedere al successivo.

## Prerequisiti Tecnici

Prima di iniziare i task, assicurati di avere configurato:

- NestJS project con TypeORM
- PostgreSQL database connection
- Jest testing framework
- bcrypt per password hashing
- class-validator e class-transformer per validation

---

## TASK 1: Creazione delle Strutture Dati Base

**Obiettivo**: Creare le entità e DTO fondamentali senza logica business, solo strutture dati.

**Perché questo task**: Prima di scrivere test, abbiamo bisogno delle strutture dati di base. Questo non è vero TDD, ma è una base necessaria che ci permette di scrivere test significativi nei task successivi.

**Istruzioni per Copilot**:

Crea i seguenti file nella cartella `src/users/`:

1. **user.entity.ts**: Entity TypeORM con campi id (UUID), email (unique), firstName, lastName, password, createdAt, updatedAt

2. **dto/create-user.dto.ts**: DTO con validazioni class-validator per email (must be valid email), firstName (required string), lastName (required string), password (minimum 8 characters, required string). Tutti i messaggi di errore devono essere in UPPER_CASE_WITH_UNDERSCORES

3. **dto/user-response.dto.ts**: DTO response che esclude la password, include tutti gli altri campi dell'entity

4. **exceptions/custom-exceptions.ts**: Crea EntityAlreadyExistsException che prende entityName, field, value e genera messaggio "ENTITY_ALREADY_EXISTS: {entityName} with {field}={value}"

**Criteri di successo**: Files creati, compilazione TypeScript successful, no business logic implementata.

---

## TASK 2: Test del Repository - Caso Successo (RED Phase)

**Obiettivo**: Scrivere il primo test che fallisce per il metodo createUser del repository.

**Perché questo task**: Iniziamo il vero TDD. Questo test definisce esattamente cosa vogliamo che il repository faccia nel caso di successo, senza preoccuparci di come lo implementeremo.

**Istruzioni per Copilot**:

Crea `src/users/user.repository.spec.ts` con:

1. Setup del test con mock TypeORM repository (mock create e save methods)
2. Un solo test: "should create and save a user successfully"
3. Il test deve verificare che:
   - repository.create viene chiamato con i dati corretti
   - repository.save viene chiamato con l'entità creata
   - viene ritornato l'utente salvato con id e timestamps
4. Usa dati di esempio realistici
5. Non implementare ancora la classe UserRepository

**Criteri di successo**: Test scritto, test fails perché UserRepository non esiste ancora. Questo è esattamente quello che vogliamo nella fase RED.

---

## TASK 3: Implementazione Repository - Caso Successo (GREEN Phase)

**Obiettivo**: Implementare il codice minimo per far passare il test del task precedente.

**Perché questo task**: Fase GREEN del TDD. Scriviamo il codice più semplice possibile che fa passare il test, senza preoccuparci di eleganza o gestione errori.

**Istruzioni per Copilot**:

Crea `src/users/user.repository.ts` con:

1. UserRepository class with @Injectable decorator
2. Constructor che inietta TypeORM Repository<User>
3. Metodo createUser che:
   - Chiama this.repository.create(userData)
   - Chiama this.repository.save(user)
   - Ritorna il risultato
4. Non aggiungere gestione errori, logging, o altre funzionalità

**Criteri di successo**: Test del Task 2 passa. Implementazione minimale e funzionante.

---

## TASK 4: Test Repository - Gestione Errori (RED Phase)

**Obiettivo**: Aggiungere test per gestione errore PostgreSQL unique constraint.

**Perché questo task**: Ora che il caso felice funziona, testiamo il caso d'errore. Questo test definisce come vogliamo gestire errori database senza esporre dettagli PostgreSQL ai layer superiori.

**Istruzioni per Copilot**:

Aggiungi al file `user.repository.spec.ts`:

1. Nuovo test: "should throw EntityAlreadyExistsException when email already exists"
2. Mock TypeORM save per reject con errore PostgreSQL:

   ```javascript
   const postgresError = {
     code: '23505',
     detail: 'Key (email)=(test@example.com) already exists.',
   };
   ```

3. Verifica che viene lanciata EntityAlreadyExistsException con messaggio corretto
4. Non modificare ancora l'implementazione del repository

**Criteri di successo**: Nuovo test fails, test precedente still passa. Siamo in fase RED per la gestione errori.

---

## TASK 5: Repository Error Handling (GREEN Phase)

**Obiettivo**: Implementare gestione errori nel repository per far passare il test del Task 4.

**Perché questo task**: Completiamo la fase GREEN aggiungendo gestione errori. Manteniamo l'implementazione semplice ma funzionale.

**Istruzioni per Copilot**:

Modifica `user.repository.ts`:

1. Wrap il codice createUser in try-catch
2. Nel catch, verifica se error.code === '23505' (PostgreSQL unique constraint)
3. Se l'errore contiene 'email' nel detail, lancia EntityAlreadyExistsException con parametri corretti
4. Per altri errori 23505, lancia EntityAlreadyExistsException con 'unknown_field'
5. Per altri tipi di errore, rilancia l'errore originale

**Criteri di successo**: Entrambi i test del repository passano. Gestione errori implementata.

---

## TASK 6: Refactor Repository (REFACTOR Phase)

**Obiettivo**: Migliorare il design del repository senza cambiare comportamento.

**Perché questo task**: Fase REFACTOR del TDD. Ora che tutti i test passano, possiamo migliorare il design del codice in sicurezza.

**Istruzioni per Copilot**:

Refactor `user.repository.ts`:

1. Estrai la logica di gestione errori in un metodo privato `handleDatabaseError`
2. Il metodo deve prendere error e userData come parametri
3. Return type deve essere `never` perché lancia sempre un'eccezione
4. Mantieni la stessa logica, solo spostala in un metodo separato

**Criteri di successo**: Tutti i test ancora passano, codice più pulito e leggibile.

---

## TASK 7: Test Service - Hashing Password (RED Phase)

**Obiettivo**: Scrivere test per UserService che verifica hashing password e trasformazione DTO.

**Perché questo task**: Iniziamo il TDD per il service layer. Il service deve aggiungere logica business (hashing password) e trasformare i dati per l'output.

**Istruzioni per Copilot**:

Crea `src/users/user.service.spec.ts` con:

1. Setup con mock UserRepository e mock bcrypt
2. Test: "should hash password and return user response DTO"
3. Verifica che:
   - bcrypt.hash viene chiamato con password e salt rounds 12
   - repository.createUser viene chiamato con password hashata
   - risposta non contiene il campo password
   - risposta contiene tutti gli altri campi dell'entity
4. Non implementare UserService ancora

**Criteri di successo**: Test fails perché UserService non esiste. Fase RED per service layer.

---

## TASK 8: Implementazione Service (GREEN Phase)

**Obiettivo**: Implementare UserService per far passare il test del Task 7.

**Perché questo task**: Implementazione minima del service che gestisce hashing password e trasformazione DTO.

**Istruzioni per Copilot**:

Crea `src/users/user.service.ts` con:

1. UserService class con @Injectable decorator
2. Constructor che inietta UserRepository
3. Metodo createUser che:
   - Hash password con bcrypt (salt rounds 12)
   - Chiama repository.createUser con password hashata
   - Rimuove password dal risultato prima di ritornarlo
4. Implementazione diretta senza metodi helper

**Criteri di successo**: Test del Task 7 passa. Service funzionante con logica business base.

---

## TASK 9: Refactor Service (REFACTOR Phase)

**Obiettivo**: Estrarre trasformazione DTO in metodo privato.

**Perché questo task**: Miglioriamo la leggibilità del service separando le responsabilità di trasformazione dati.

**Istruzioni per Copilot**:

Refactor `user.service.ts`:

1. Crea metodo privato `transformToResponseDto(user: User): UserResponseDto`
2. Il metodo usa destructuring per rimuovere password: `{ password, ...userWithoutPassword }`
3. Usa questo metodo nel createUser invece di fare la trasformazione inline

**Criteri di successo**: Test still passa, codice più modulare e riusabile.

---

## TASK 10: Test Controller - Caso Successo (RED Phase)

**Objetivo**: Scrivere test per endpoint HTTP di creazione utente.

**Perché questo task**: Testiamo il layer più esterno, il controller, che gestisce concerns HTTP senza business logic.

**Istruzioni per Copilot**:

Crea `src/users/user.controller.spec.ts` con:

1. Setup con mock UserService
2. Test: "should create user and return response DTO"
3. Verifica che:
   - service.createUser viene chiamato con DTO corretto
   - controller ritorna la response del service senza modifiche
4. Non implementare UserController ancora

**Criteri di successo**: Test fails, pronto per implementazione controller.

---

## TASK 11: Test Controller - Gestione Errori (RED Phase)

**Obiettivo**: Aggiungere test per trasformazione errori business in HTTP exceptions.

**Perché questo task**: Il controller deve trasformare EntityAlreadyExistsException in ConflictException HTTP appropriata.

**Istruzioni per Copilot**:

Aggiungi a `user.controller.spec.ts`:

1. Test: "should throw ConflictException when user already exists"
2. Mock service.createUser per reject con EntityAlreadyExistsException
3. Verifica che controller lancia ConflictException con messaggio appropriato

**Criteri di successo**: Nuovo test ready, definisce gestione errori HTTP.

---

## TASK 12: Implementazione Controller (GREEN Phase)

**Obiettivo**: Implementare UserController con gestione errori HTTP.

**Perché questo task**: Completiamo il layer HTTP con trasformazione appropriata di errori business in HTTP responses.

**Istruzioni per Copilot**:

Crea `src/users/user.controller.ts` con:

1. UserController con @Controller('users') decorator
2. Metodo POST createUser con @Post() decorator
3. Try-catch che:
   - Chiama service.createUser
   - Catch EntityAlreadyExistsException e lancia ConflictException
   - Catch altri errori e lancia InternalServerErrorException
4. Usa messaggi di errore UPPER_CASE_WITH_UNDERSCORES

**Criteri di successo**: Entrambi i test del controller passano.

---

## TASK 13: Aggiunta OpenAPI Decorators (REFACTOR Phase)

**Obiettivo**: Aggiungere documentazione Swagger al controller.

**Perché questo task**: Completiamo il controller con documentazione API appropriata mantenendo type safety.

**Istruzioni per Copilot**:

Refactor `user.controller.ts` aggiungendo:

1. @ApiTags('Users') sulla classe
2. @ApiOperation con summary e description sul metodo
3. @ApiBody con type CreateUserDto
4. @ApiResponse per status 201, 409, 400 con descriptions appropriate
5. Non cambiare la logica, solo aggiungere decorators

**Criteri di successo**: Tutti i test still passano, Swagger documentation completa.

---

## TASK 14: Creazione Module

**Objetivo**: Creare UserModule per dependency injection NestJS.

**Perché questo task**: Completiamo l'implementazione con configurazione DI appropriata.

**Istruzioni per Copilot**:

Crea `src/users/user.module.ts` con:

1. UserModule class con @Module decorator
2. imports: TypeOrmModule.forFeature([User])
3. controllers: [UserController]
4. providers: [UserService, UserRepository]
5. exports: [UserService, UserRepository] per riuso in altri moduli

**Criteri di successo**: Module compilabile, dependency injection configurata.

---

## TASK 15: Integration Test

**Objetivo**: Scrivere test end-to-end per verificare l'intera pipeline.

**Perché questo task**: Verifichiamo che tutti i layer lavorino insieme correttamente.

**Istruzioni per Copilot**:

Crea `src/users/user.integration.spec.ts` con:

1. Setup TestingModule con database in-memory o test database
2. Test completo che:
   - Invia POST request con CreateUserDto valido
   - Verifica response 201 con UserResponseDto
   - Verifica che user è salvato nel database
   - Verifica che password è hashata nel database
3. Test per duplicate email che verifica response 409

**Criteri di successo**: Integration tests passano, sistema completo funzionante.

---

## Prossimi Passi Dopo Completamento

Una volta completati tutti questi task, avrai un'implementazione completa e testata del create user endpoint. Il sistema sarà pronto per:

1. **Estrazione classi base**: Identificare pattern comuni per creare BaseRepository, BaseService, BaseController
2. **Aggiunta altri metodi CRUD**: Implementare find, update, delete seguendo lo stesso pattern TDD
3. **Implementazione altre entità**: Usare le classi base per implementare Product, Order, etc.

La bellezza di questo approccio è che ogni task è verificabile indipendentemente e costruisce su una base solida testata. Copilot può focalizzarsi su una singola responsabilità per volta, riducendo la probabilità di errori e over-engineering.

## Note per l'Utilizzo con Copilot

Quando lavori con Copilot usando questi task:

1. **Esegui un task alla volta**: Non saltare ahead, ogni task costruisce sul precedente
2. **Verifica i test**: Dopo ogni task, assicurati che i test passino prima di procedere
3. **Mantieni il focus**: Se Copilot suggerisce funzionalità extra, rimanda al refactor o task futuri
4. **Documenta deviazioni**: Se devi modificare un task, documenta il perché per task futuri

Questa metodologia ti garantirà un codice robusto, testato e facilmente estendibile.
