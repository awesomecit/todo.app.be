// ================================
// USER ENTITY TDD TEST STRUCTURE
// npm test -- src/users/entities/user.entity.spec.ts
// ================================

import * as dotenv from 'dotenv';
import {
  DataSource,
  DataSourceOptions,
  In,
  QueryFailedError,
  Repository,
} from 'typeorm';
import { User } from './user.entity';

// Carica variabili d'ambiente da .env.test
dotenv.config({ path: '.env.test' });

/**
 * Strategia TDD per Entità: Integration Behavior Testing
 *
 * Focus sui comportamenti critici che aggiungono valore:
 * - Persistenza corretta nel database
 * - Constraint di univocità
 * - Validazioni custom
 * - Trasformazioni di dati
 * - Relazioni tra entità
 *
 * NON testiamo:
 * - Sintassi TypeORM base (già testata dal framework)
 * - Funzionalità TypeORM standard
 */

describe('User Entity - TDD Integration Tests', () => {
  let dataSource: DataSource;
  let userRepository: Repository<User>;

  beforeAll(async () => {
    // Configurazione database utilizzando variabili d'ambiente
    const datasourceConfig = {
      type: 'postgres',
      host: process.env.DATABASE_HOST,
      port: process.env.DATABASE_PORT,
      username: process.env.DATABASE_USERNAME,
      password: process.env.DATABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      entities: [User],
      synchronize: true, // Solo per test, non in produzione
      dropSchema: true, // DROP completo del schema prima della sincronizzazione
      logging: false,
    } as unknown as DataSourceOptions;

    dataSource = new DataSource(datasourceConfig);
    await dataSource.initialize();
    userRepository = dataSource.getRepository(User);
  });

  beforeEach(async () => {
    // Clean database state per ogni test
    // Questo garantisce test isolati e ripetibili
    await userRepository.clear();

    // Reset the ID sequence to start from 1
    await dataSource.query(`ALTER SEQUENCE user_id_seq RESTART WITH 1`);
  });

  afterAll(async () => {
    // Cleanup database connection
    if (dataSource && dataSource.isInitialized) {
      await dataSource.destroy();
    }
  });

  // ================================
  // TEST SERIE 1: BASIC ENTITY CREATION
  // Obiettivo: Verificare che l'entità possa essere creata e persistita
  // ================================

  describe('Basic Entity Creation', () => {
    /**
     * TEST 1: Verifica creazione entità base
     * Questo test definisce il comportamento minimo: un'entità User può essere
     * creata con campi obbligatori e salvata nel database,
     * Testa che generi automaticamente id, createdAt, updatedAt
     */
    it(`should create and persist a User entity with required fields
      and auto-generate id, createdAt, and updatedAt fields`, async () => {
      // Arrange: Dati minimi validi per creazione User
      // Act: Creazione e salvataggio entità
      // Assert: Entità salvata correttamente con uuid e id generati e timestamps
      const user = new User();
      user.uuid = '123e4567-e89b-12d3-a456-426614174000';
      user.email = 'test1@example.com';
      user.username = 'testuser1';
      user.firstName = 'Test';
      user.lastName = 'User';
      user.password = 'securepassword';
      user.birthDate = new Date('2000-01-01');

      const savedUser = await userRepository.save(user);
      expect(savedUser).toBeDefined();
      expect(savedUser.uuid).toBe(user.uuid);
      expect(savedUser.uuid).toBeDefined();
      expect(savedUser.id).toBe(1);
      expect(savedUser.createdAt).toBeInstanceOf(Date);
      expect(savedUser.updatedAt).toBeInstanceOf(Date);
      expect(savedUser.deletedAt).toBeNull();
    });

    /**
     * TEST 2: Verifica aggiornamento timestamps
     * Testa che updatedAt cambi quando l'entità viene modificata
     */
    it('should update updatedAt timestamp when entity is modified', async () => {
      // Arrange: User salvato esistente
      // Act: Modifica campo e salva nuovamente
      // Assert: updatedAt è cambiato, createdAt rimane uguale

      const user = new User();
      user.uuid = '123e4567-e89b-12d3-a456-426614174001';
      user.email = 'test2@example.com';
      user.username = 'testuser2';
      user.firstName = 'Test';
      user.lastName = 'User';
      user.password = 'securepassword';
      user.birthDate = new Date('2000-01-01');

      const savedUser = await userRepository.save(user);
      const originalCreatedAt = savedUser.createdAt;
      const originalUpdatedAt = savedUser.updatedAt;

      // Simula attesa per garantire differenza di timestamp
      await new Promise(resolve => setTimeout(resolve, 1000));

      // Modifica entità
      savedUser.active = false;
      const updatedUser = await userRepository.save(savedUser);

      expect(updatedUser.updatedAt).toBeInstanceOf(Date);
      expect(updatedUser.updatedAt.getTime()).toBeGreaterThan(
        originalUpdatedAt.getTime(),
      );
      expect(updatedUser.createdAt.getTime()).toBe(originalCreatedAt.getTime());
      expect(updatedUser.active).toBe(false);
      expect(updatedUser.deletedAt).toBeNull();
    });
  });

  // ================================
  // TEST SERIE 2: FIELD VALIDATION
  // Obiettivo: Verificare validazioni dei campi e constraint
  // ================================

  describe('Field Validation and Constraints', () => {
    /**
     * Verifica email unique constraint
     * Testa che due utenti non possano avere la stessa email
     */
    it('should enforce unique constraint on email field', async () => {
      // Arrange: Due User con stessa email
      // Act: Tentativo di salvare entrambi
      // Assert: Secondo salvataggio fallisce con constraint violation
      const user1 = new User();
      user1.uuid = '123e4567-e89b-12d3-a456-426614174002';
      user1.email = 'test3@example.com';
      user1.username = 'uniqueuser';
      user1.firstName = 'Test';
      user1.lastName = 'User';
      user1.password = 'securepassword';
      user1.birthDate = new Date('2000-01-01');

      await userRepository.save(user1);

      const user2 = new User();
      user2.uuid = '123e4567-e89b-12d3-a456-426614174003';
      user2.email = 'test3@example.com';
      user2.username = 'anotheruser';
      user2.firstName = 'Test';
      user2.lastName = 'User';
      user2.password = 'securepassword';
      user2.birthDate = new Date('2000-01-01');
      await expect(userRepository.save(user2)).rejects.toThrow();

      await userRepository.delete({
        uuid: In([
          '123e4567-e89b-12d3-a456-426614174002',
          '123e4567-e89b-12d3-a456-426614174003',
        ]),
      });

      const user3 = new User();
      user3.uuid = '123e4567-e89b-12d3-a456-426614174004';
      user3.email = 'test3@example.com';
      user3.username = 'uniqueuser2';
      user3.firstName = 'Test';
      user3.lastName = 'User';
      user3.password = 'securepassword';
      user3.birthDate = new Date('2000-01-01');

      await userRepository.save(user3);

      const user4 = new User();
      user4.uuid = '123e4567-e89b-12d3-a456-426614174005';
      user4.email = 'test3@example.com';
      user4.username = 'uniqueuser3';
      user4.firstName = 'Test';
      user4.lastName = 'User';
      user4.password = 'securepassword';
      user4.birthDate = new Date('2000-01-01');

      let caughtError: any;

      try {
        await userRepository.save(user2);
        // Se arriviamo qui, il test dovrebbe fallire perché ci aspettavamo un errore
        fail(
          'Expected save operation to throw an error due to unique constraint violation',
        );
      } catch (error) {
        caughtError = error;
      }

      // Verifica specifica che sia il tipo di errore corretto
      expect(caughtError).toBeInstanceOf(QueryFailedError);

      // Verifica che sia specificamente una violazione di unique constraint
      expect(caughtError.code).toBe('23505'); // PostgreSQL unique constraint violation

      // Verifica che l'errore menzioni l'email duplicata
      expect(caughtError.detail).toContain('test3@example.com');

      // code: '23505',
      // detail: 'Key (email)=(test3@example.com) already exists.',
      // UQ_e12875dfb3b1d92d7d7c5377e22
      // TODO:
      // portare in un helper che sulla duplicazione di chiave unica
      // estragga il campo e il valore duplicato per asserirlo nei test
      // function extractUniqueConstraintViolationFormatted(error: any): string | null {
      //   if (error?.code === '23505' && error?.detail) {
      //     const match = error.detail.match(/\(([^)]+)\)=\(([^)]+)\)/);
      //     if (match) {
      //       return `DUPLICATE_${match[1].toUpperCase()}`;
      //     }
      //   }
      //   return null;
      // }
    });

    it('should enforce unique constraint on username field', async () => {
      // Arrange: Due User con stessa username
      // Act: Tentativo di salvare entrambi
      // Assert: Secondo salvataggio fallisce con constraint violation
      const user1 = new User();
      user1.uuid = '123e4567-e89b-12d3-a456-426614174006';
      user1.email = 'test4@example.com';
      user1.username = 'uniqueuser';
      user1.firstName = 'Test';
      user1.lastName = 'User';
      user1.password = 'securepassword';
      user1.birthDate = new Date('2000-01-01');
      await userRepository.save(user1);
      const user2 = new User();
      user2.uuid = '123e4567-e89b-12d3-a456-426614174007';
      user2.email = 'test5@example.com';
      user2.username = 'uniqueuser';
      user2.firstName = 'Test';
      user2.lastName = 'User';
      user2.password = 'securepassword';
      user2.birthDate = new Date('2000-01-01');
      await expect(userRepository.save(user2)).rejects.toThrow();

      await userRepository.delete({
        uuid: In([
          '123e4567-e89b-12d3-a456-426614174006',
          '123e4567-e89b-12d3-a456-426614174007',
        ]),
      });

      const user3 = new User();
      user3.uuid = '123e4567-e89b-12d3-a456-426614174008';
      user3.email = 'test6@example.com';
      user3.username = 'uniqueuser';
      user3.firstName = 'Test';
      user3.lastName = 'User';
      user3.password = 'securepassword';
      user3.birthDate = new Date('2000-01-01');
      await userRepository.save(user3);

      const user4 = new User();
      user4.uuid = '123e4567-e89b-12d3-a456-426614174009';
      user4.email = 'test7@example.com';
      user4.username = 'uniqueuser';
      user4.firstName = 'Test';
      user4.lastName = 'User';
      user4.password = 'securepassword';
      user4.birthDate = new Date('2000-01-01');

      let caughtError: any;

      try {
        await userRepository.save(user2);
        // Se arriviamo qui, il test dovrebbe fallire perché ci aspettavamo un errore
        fail(
          'Expected save operation to throw an error due to unique constraint violation',
        );
      } catch (error) {
        caughtError = error;
      }

      // Verifica specifica che sia il tipo di errore corretto
      expect(caughtError).toBeInstanceOf(QueryFailedError);

      // Verifica che sia specificamente una violazione di unique constraint
      expect(caughtError.code).toBe('23505'); // PostgreSQL unique constraint violation

      // Verifica che l'errore menzioni l'username duplicata
      expect(caughtError.detail).toContain('uniqueuser');

      // code: '23505',
      // detail: 'Key (username)=(uniqueuser) already exists.',
      // UQ_78a916df40e02a9deb1c4b75edb
    });

    // TOCHECK: should add more validation tests if custom validations are added
    //e.g. charrs length, formats, ranges, etc.

    it('should map all camelCase properties to snake_case database columns', async () => {
      // Arrange: User con firstName specifico
      // Act: Salvataggio e query SQL diretta
      // Assert: Valore presente in colonna first_name
      const user = new User();
      user.uuid = '123e4567-e89b-12d3-a456-426614174010';
      user.email = 'test8@example.com';
      user.username = 'testuser8';
      user.firstName = 'CamelCase';
      user.lastName = 'Mapping';
      user.password = 'securepassword';
      user.birthDate = new Date('2000-01-01');

      await userRepository.save(user);
      const rawResult = await dataSource.query(
        'SELECT * FROM "user" WHERE uuid = $1',
        [user.uuid],
      );
      expect(rawResult[0]).toHaveProperty('first_name');
      expect(rawResult[0]).toHaveProperty('last_name');
      expect(rawResult[0]).toHaveProperty('birth_date');
      expect(rawResult[0]).toHaveProperty('created_at');
      expect(rawResult[0]).toHaveProperty('updated_at');
      expect(rawResult[0]).toHaveProperty('deleted_at');
    });
  });

  // ================================
  // TEST SERIE 6: ENTITY RELATIONSHIPS
  // Obiettivo: Testare relazioni con altre entità (quando esistono)
  // ================================

  // describe('Entity Relationships', () => {

  //   /**
  //    * RED TEST 18: Verifica caricamento relazioni lazy
  //    * Testa che le relazioni vengano caricate correttamente quando richiesto
  //    * (Questo test è applicabile solo se User ha relazioni con altre entità)
  //    */
  //   it('should load related entities when explicitly requested', async () => {
  //     // Arrange: User con entità correlate
  //     // Act: Caricamento con relations specificate
  //     // Assert: Entità correlate sono caricate correttamente
  //   });

  //   /**
  //    * RED TEST 19: Verifica cascade operations
  //    * Testa che le operazioni cascade funzionino correttamente
  //    * (Applicabile solo se configurate)
  //    */
  //   it('should handle cascade operations correctly', async () => {
  //     // Arrange: User con entità correlate che supportano cascade
  //     // Act: Operazione sul User parent
  //     // Assert: Operazione si propaga correttamente alle entità correlate
  //   });

  // });

  // ================================
  // TEST SERIE 7: SERIALIZATION/DESERIALIZATION
  // Obiettivo: Verificare che l'entità si serializzi correttamente
  // ================================

  // describe('Serialization Behavior', () => {

  //   /**
  //    * RED TEST 20: Verifica serializzazione JSON
  //    * Testa che l'entità possa essere serializzata in JSON senza perdita dati
  //    */
  //   it('should serialize to JSON correctly', async () => {
  //     // Arrange: User completo salvato nel database
  //     // Act: Retrieval e JSON.stringify
  //     // Assert: JSON contiene tutti i campi attesi nel formato corretto
  //   });

  //   /**
  //    * RED TEST 21: Verifica deserializzazione da plain object
  //    * Testa che TypeORM possa ricostruire l'entità da dati del database
  //    */
  //   it('should deserialize from database row correctly', async () => {
  //     // Arrange: Dati User inseriti direttamente nel database
  //     // Act: Query attraverso TypeORM repository
  //     // Assert: Entità ricostruita ha tutti i tipi e valori corretti
  //   });

  // });

  // ================================
  // TEST SERIE 8: PERFORMANCE AND INDEXING
  // Obiettivo: Verificare che gli indici funzionino come previsto
  // ================================

  // describe('Database Performance and Indexing', () => {

  //   /**
  //    * RED TEST 22: Verifica performance query by email
  //    * Testa che le query per email siano veloci (utilizzano indice unique)
  //    */
  //   it('should perform fast lookups by email using unique index', async () => {
  //     // Arrange: Database con molti User records
  //     // Act: Query by email con misurazione tempo
  //     // Assert: Query completa entro soglia di performance accettabile
  //   });

  //   /**
  //    * RED TEST 23: Verifica performance query by role
  //    * Testa che le query per role siano veloci (utilizzano indice su role)
  //    */
  //   it('should perform fast lookups by role using role index', async () => {
  //     // Arrange: Database con molti User records di ruoli diversi
  //     // Act: Query by role con misurazione tempo
  //     // Assert: Query completa entro soglia di performance accettabile
  //   });

  // });

  // ================================
  // TEST HELPER METHODS
  // Metodi di supporto per la creazione di dati di test
  // ================================

  /**
   * Factory method per creare User validi per i test
   * Centralizza la creazione di dati di test consistenti
   */
  // function createValidUserData(overrides?: Partial<User>): Partial<User> {
  //   // Return oggetto con dati User validi base + overrides
  // }

  /**
   * Factory method per creare User con dati non validi
   * Utile per testare validazioni e constraint violations
   */
  // function createInvalidUserData(invalidField: string, invalidValue: any): Partial<User> {
  //   // Return oggetto User con campo specifico non valido
  // }

  /**
   * Helper per eseguire query SQL dirette durante i test
   * Utile per verificare mapping colonne e stato database
   */
  // async function executeRawQuery(sql: string, parameters?: any[]): Promise<any[]> {
  //   // Execute raw SQL query e return risultati
  // }
});
