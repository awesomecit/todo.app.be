# TypeScript per Senior Developer: Guida Mirata per Colloqui

## Introduzione Strategica

Questa guida è ottimizzata per dimostrare competenze avanzate TypeScript in un contesto senior developer, con focus particolare su NestJS. Gli argomenti sono organizzati per priorità di importanza nel colloquio.

**Filosofia TypeScript**: Non è "JavaScript con tipi aggiunti" ma un linguaggio che sposta la verifica degli errori dal runtime al compile-time, abilitando refactoring sicuro, documentazione vivente e architetture più robuste.

---

## 🚀 PRIORITÀ MASSIMA - Argomenti Fondamentali per Senior

### Generics: Il Cuore della Programmazione Type-Safe

Per comprendere davvero i Generics, iniziamo con il problema fondamentale che risolvono. Immagina di voler creare una funzione che può lavorare con qualsiasi tipo di dato, mantenendo però la sicurezza dei tipi. Senza Generics, avresti solo due scelte: creare versioni specifiche per ogni tipo (duplicazione del codice) oppure usare `any` (perdendo completamente la type safety).

I Generics rappresentano la soluzione elegante: permettono di scrivere codice che è generico nella struttura ma specifico nel tipo quando viene utilizzato. Pensa ai Generics come a "variabili per i tipi" - proprio come le variabili rappresentano valori che non conosciamo a priori, i Generics rappresentano tipi che non conosciamo fino al momento dell'uso.

#### Il Problema Che i Generics Risolvono

Consideriamo un esempio concreto. Supponiamo di voler creare una funzione per wrappare le risposte API con metadati standardizzati:

```typescript
// APPROCCIO SENZA GENERICS - Problematico
function createUserResponse(user: User): UserApiResponse {
  return { data: user, timestamp: new Date().toISOString(), success: true };
}

function createOrderResponse(order: Order): OrderApiResponse {
  return { data: order, timestamp: new Date().toISOString(), success: true };
}

// Devi creare una funzione per ogni tipo! Duplicazione enorme.
```

La duplicazione è evidente, e ogni volta che aggiungi un nuovo tipo di dato, devi creare una nuova funzione. Inoltre, se cambi la struttura del wrapper, devi modificare tutte le funzioni.

```typescript
// APPROCCIO CON ANY - Perde Type Safety
function createResponse(data: any): any {
  return { data, timestamp: new Date().toISOString(), success: true };
}

const userResponse = createResponse(user);
// TypeScript non sa che userResponse.data è un User!
// Perdi autocomplete, controlli di tipo, refactoring sicuro
```

Con `any` risolvi la duplicazione ma perdi tutti i vantaggi di TypeScript. Non sai più che tipo di dato contiene la risposta, il che porta a errori runtime e rende il codice fragile.

#### La Soluzione: Generics Come Variabili di Tipo

I Generics introducono il concetto di "parametro di tipo". Proprio come una funzione può accettare parametri che rappresentano valori sconosciuti, può anche accettare parametri che rappresentano tipi sconosciuti:

```typescript
// Generic function - la soluzione elegante
function createResponse<T>(data: T, message: string): ApiResponse<T> {
  return {
    data, // TypeScript sa che questo è di tipo T
    message,
    timestamp: new Date().toISOString(),
    success: true,
  };
}

// Usage - TypeScript inferisce automaticamente il tipo
const userResponse = createResponse(user, 'User retrieved');
// userResponse è di tipo ApiResponse<User>
// userResponse.data è definitivamente di tipo User

const orderResponse = createResponse(order, 'Order processed');
// orderResponse è di tipo ApiResponse<Order>
// orderResponse.data è definitivamente di tipo Order
```

La magia sta nel fatto che `T` è come una "variabile di tipo" che viene "riempita" quando chiami la funzione. TypeScript è abbastanza intelligente da inferire automaticamente il tipo basandosi su quello che passi come parametro.

#### Perché i Generics Sono Fondamentali in NestJS

In NestJS, i Generics sono ovunque perché permettono di creare componenti riutilizzabili mantenendo la type safety. Il framework stesso ne fa un uso massiccio:

```typescript
// Dependency injection con type safety
@Injectable()
export class GenericService<T> {
  // Il servizio può lavorare con qualsiasi tipo T
  // ma mantiene la type safety per quel tipo specifico

  async processData(items: T[]): Promise<T[]> {
    // TypeScript sa esattamente che tipo stiamo processando
    return items.map(item => this.transform(item));
  }

  private transform(item: T): T {
    // Possiamo lavorare con T senza sapere cosa sia esattamente
    // Ma TypeScript ci garantisce type safety
    return item;
  }
}

// Quando lo usi, diventa specifico
@Injectable()
export class UserService extends GenericService<User> {
  // Ora GenericService<User> sa che T = User
  // Tutti i metodi sono type-safe per User
  async processUsers(users: User[]): Promise<User[]> {
    return this.processData(users); // Type-safe!
  }
}
```

Il potere di questo approccio è che puoi scrivere la logica una volta sola nel `GenericService`, ma quando lo usi con `User`, diventa completamente type-safe per gli utenti. Se domani hai bisogno di processare `Order`, puoi creare `OrderService extends GenericService<Order>` senza riscrivere nulla.

#### Generic Constraints: Limitare i Tipi Possibili per Maggiore Sicurezza

Una volta che comprendi i Generics base, ti scontri rapidamente con un nuovo problema: spesso vuoi che il tipo generico abbia certe caratteristiche. Ad esempio, potresti voler accedere a una proprietà specifica del tipo generico, ma TypeScript non può saperlo a priori.

Immagina di voler creare un servizio CRUD generico. Senza constraints, non puoi assumere che il tipo T abbia una proprietà `id`, anche se tutti i tuoi entities ce l'hanno:

```typescript
// PROBLEMA: TypeScript non sa se T ha una proprietà 'id'
class CrudService<T> {
  private items: T[] = [];

  findById(id: string): T | undefined {
    // ERROR! TypeScript non sa che T ha una proprietà 'id'
    return this.items.find(item => item.id === id);
    //                           ^^^ Property 'id' does not exist on type 'T'
  }
}
```

L'errore ha perfettamente senso: T potrebbe essere `string` o `number` o qualsiasi altro tipo che non ha una proprietà `id`. TypeScript ti sta proteggendo da un possibile errore runtime.

Le **constraints** risolvono questo problema permettendoti di dire: "T può essere qualsiasi tipo, purché abbia certe caratteristiche". È come dire "accetto qualsiasi veicolo, purché abbia le ruote".

```typescript
// SOLUZIONE: Constraint che garantisce la presenza di 'id'
interface HasId {
  id: string | number;
}

class CrudService<T extends HasId> {
  private items: T[] = [];

  // Ora TypeScript SA che T ha sicuramente una proprietà 'id'
  findById(id: string | number): T | undefined {
    return this.items.find(item => item.id === id); // ✓ Nessun errore!
  }

  // Possiamo anche usare 'id' per altre operazioni
  update(entity: T): T {
    const index = this.items.findIndex(item => item.id === entity.id);
    if (index !== -1) {
      this.items[index] = entity;
    }
    return entity;
  }
}
```

La constraint `T extends HasId` crea un "contratto": qualsiasi tipo che usi con questo Generic deve implementare l'interfaccia `HasId`. Questo ti dà il meglio di entrambi i mondi: flessibilità (T può essere User, Order, Product, qualsiasi cosa) ma anche sicurezza (sai che T ha sempre una proprietà `id`).

#### Perché le Constraints Sono Cruciali in NestJS

In NestJS, le constraints diventano fondamentali per creare componenti riutilizzabili ma type-safe. Considera un repository generico:

```typescript
// Entity base che tutti i tuoi entities estendono
interface BaseEntity {
  id: string;
  createdAt: Date;
  updatedAt: Date;
}

// Repository generico con constraint
@Injectable()
export class GenericRepository<T extends BaseEntity> {
  async findById(id: string): Promise<T | null> {
    // TypeScript sa che T ha sicuramente id, createdAt, updatedAt
    // Questo ci permette di scrivere query generiche ma type-safe
    return await this.orm.findOne({
      where: { id }, // ✓ Sappiamo che T ha 'id'
      order: { createdAt: -1 }, // ✓ Sappiamo che T ha 'createdAt'
    });
  }

  async save(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T> {
    const now = new Date();
    // Possiamo sicuramente aggiungere questi campi perché T extends BaseEntity
    const entityWithMetadata = {
      ...entity,
      id: generateId(),
      createdAt: now,
      updatedAt: now,
    } as T;

    return await this.orm.save(entityWithMetadata);
  }
}

// Usage - ogni entity che estende BaseEntity può usare il repository
interface User extends BaseEntity {
  name: string;
  email: string;
}

interface Order extends BaseEntity {
  userId: string;
  total: number;
}

// Entrambi funzionano perché User e Order estendono BaseEntity
@Injectable()
export class UserRepository extends GenericRepository<User> {
  // Eredita tutti i metodi type-safe per User
}

@Injectable()
export class OrderRepository extends GenericRepository<Order> {
  // Eredita tutti i metodi type-safe per Order
}
```

Senza constraints, non potresti mai creare un repository così generico perché TypeScript non saprebbe che ogni entity ha `id`, `createdAt`, e `updatedAt`. Con le constraints, puoi scrivere la logica una volta sola e riutilizzarla per tutti i tuoi entities mantenendo la completa type safety.

#### Advanced Generic Constraints: Multiple Constraints e Conditional Types

Man mano che le tue applicazioni diventano più complesse, potresti aver bisogno di constraints più sofisticate:

```typescript
// Multiple constraints - T deve soddisfare ENTRAMBE le condizioni
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface Identifiable {
  id: string;
}

class AdvancedService<T extends Identifiable & Timestamped> {
  // T deve avere sia id che createdAt/updatedAt
  async updateWithTimestamp(entity: T): Promise<T> {
    return {
      ...entity,
      updatedAt: new Date(), // ✓ Garantito dal constraint Timestamped
    };
  }
}
```

#### Constraints con Keyof: Operazioni su Proprietà Specifiche

Un pattern avanzato ma molto potente è usare `keyof` nelle constraints per operare su proprietà specifiche:

```typescript
// Generic function che può ordinare array per qualsiasi proprietà
function sortBy<T, K extends keyof T>(items: T[], property: K): T[] {
  return items.sort((a, b) => {
    const aValue = a[property]; // TypeScript sa che questo esiste
    const bValue = b[property]; // TypeScript sa che questo esiste

    if (aValue < bValue) return -1;
    if (aValue > bValue) return 1;
    return 0;
  });
}

// Usage - completamente type-safe
const users: User[] = [
  { id: '1', name: 'Mario', email: 'mario@test.com', createdAt: new Date() },
  { id: '2', name: 'Luigi', email: 'luigi@test.com', createdAt: new Date() },
];

const sortedByName = sortBy(users, 'name'); // ✓ OK
const sortedByEmail = sortBy(users, 'email'); // ✓ OK
const sortedById = sortBy(users, 'id'); // ✓ OK
const invalid = sortBy(users, 'nonexistent'); // ❌ TypeScript ERROR
```

Il constraint `K extends keyof T` dice: "K deve essere una delle chiavi effettive di T". Questo garantisce che non puoi mai tentare di ordinare per una proprietà che non esiste, il che elimina una classe intera di errori runtime.

### Union e Intersection Types: Gestione Avanzata dei Tipi

Per comprendere veramente Union e Intersection types, devi prima capire che rappresentano due filosofie completamente diverse di combinazione dei tipi. Sono quasi opposti concettuali: Union types creano "ampiezza" (più possibilità), mentre Intersection types creano "profondità" (più requisiti).

#### Union Types: "O Questo O Quello" - Gestire la Variabilità

I Union types nascono da una necessità pratica: spesso nel mondo reale, una variabile può essere di diversi tipi. Pensa a una funzione che deve gestire input da fonti diverse, o a una API che può ritornare risultati di tipi differenti a seconda del contesto.

Il problema senza Union types sarebbe dover creare overload separati per ogni possibilità, creando duplicazione e complessità:

```typescript
// SENZA UNION TYPES - Approccio verboso
function processStringInput(input: string): string {
  /* ... */
}
function processNumberInput(input: number): string {
  /* ... */
}
function processBooleanInput(input: boolean): string {
  /* ... */
}

// Ogni volta che aggiungi un tipo, devi creare una nuova funzione
```

I Union types permettono di esprimere elegantemente "questo parametro può essere uno qualsiasi di questi tipi":

```typescript
// CON UNION TYPES - Approccio elegante
type ProcessableInput = string | number | boolean;

function processInput(input: ProcessableInput): string {
  // TypeScript ci aiuta a gestire tutti i casi possibili
  if (typeof input === 'string') {
    return input.toUpperCase(); // TypeScript sa che qui input è string
  } else if (typeof input === 'number') {
    return input.toString(); // TypeScript sa che qui input è number
  } else {
    return input ? 'true' : 'false'; // TypeScript sa che qui input è boolean
  }
}
```

Il potere dei Union types sta nel fatto che TypeScript "restringe" automaticamente il tipo dentro ogni branch condizionale. Questo è chiamato **type narrowing** ed è uno dei meccanismi più potenti di TypeScript.

#### Perché Union Types Sono Fondamentali per le API

In applicazioni reali, specialmente con NestJS, i Union types diventano indispensabili per modellare risposte API che possono variare:

```typescript
// Modelling API responses che possono essere successo o errore
type ApiResponse<T> =
  | { success: true; data: T; error?: never }
  | { success: false; error: string; data?: never };

// Il 'never' type è cruciale qui: dice a TypeScript che se success è true,
// error non può mai esistere, e viceversa. Questo elimina stati impossibili.

@Controller('users')
export class UserController {
  @Get(':id')
  async getUser(@Param('id') id: string): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.findById(id);
      if (!user) {
        // TypeScript verifica che stiamo ritornando la shape corretta
        return { success: false, error: 'User not found' };
      }
      // TypeScript verifica che stiamo ritornando la shape corretta
      return { success: true, data: user };
    } catch (error) {
      return { success: false, error: error.message };
    }
  }
}
```

Quando il client consuma questa API, ottiene automaticamente type safety:

```typescript
const response = await userService.getUser('123');

if (response.success) {
  // TypeScript SA che response.data esiste ed è di tipo User
  // TypeScript SA che response.error NON esiste (è never)
  console.log(`Hello ${response.data.name}!`);
} else {
  // TypeScript SA che response.error esiste ed è di tipo string
  // TypeScript SA che response.data NON esiste (è never)
  console.error(`Error: ${response.error}`);
}
```

Questo pattern elimina completamente la possibilità di accedere a proprietà che non dovrebbero esistere in un determinato stato, prevenendo errori runtime comuni.

#### Intersection Types: "Sia Questo Che Quello" - Combinare Comportamenti

Se Union types rappresentano "OR" logico, Intersection types rappresentano "AND" logico. Dicono: "questo oggetto deve avere TUTTE queste caratteristiche contemporaneamente".

Il caso d'uso classico è quando vuoi combinare multiple interfacce per creare oggetti più complessi:

```typescript
// Componenti separati che possono essere combinati
interface UserIdentity {
  id: string;
  email: string;
}

interface UserMetadata {
  createdAt: Date;
  updatedAt: Date;
  lastLogin?: Date;
}

interface UserPreferences {
  theme: 'light' | 'dark';
  notifications: boolean;
  language: string;
}

// Intersection type: l'oggetto deve avere TUTTE queste proprietà
type FullUser = UserIdentity & UserMetadata & UserPreferences;

// Un FullUser deve avere id, email, createdAt, updatedAt, theme, etc.
const completeUser: FullUser = {
  id: '123',
  email: 'user@example.com',
  createdAt: new Date(),
  updatedAt: new Date(),
  theme: 'dark',
  notifications: true,
  language: 'en',
  // Se manca anche solo una proprietà, TypeScript da errore
};
```

#### Intersection Types per Composizione di Comportamenti

Un pattern avanzato è usare Intersection types per comporre comportamenti:

```typescript
// Mixin pattern con intersection types
interface Timestamped {
  createdAt: Date;
  updatedAt: Date;
}

interface SoftDeletable {
  deletedAt?: Date;
  isDeleted: boolean;
}

interface Auditable {
  createdBy: string;
  updatedBy: string;
}

// Entity che combina tutti questi comportamenti
type AuditableEntity<T> = T & Timestamped & SoftDeletable & Auditable;

// Usage in NestJS
interface User {
  id: string;
  name: string;
  email: string;
}

// UserEntity ha tutte le proprietà di User + tutti i mixin
type UserEntity = AuditableEntity<User>;

@Injectable()
export class UserService {
  async create(userData: User, createdBy: string): Promise<UserEntity> {
    const now = new Date();

    // TypeScript sa esattamente che proprietà deve avere UserEntity
    return {
      ...userData,
      createdAt: now,
      updatedAt: now,
      deletedAt: undefined,
      isDeleted: false,
      createdBy,
      updatedBy: createdBy,
    };
  }

  async softDelete(user: UserEntity, deletedBy: string): Promise<UserEntity> {
    // TypeScript sa che user ha tutti i campi necessari
    return {
      ...user,
      deletedAt: new Date(),
      isDeleted: true,
      updatedBy: deletedBy,
    };
  }
}
```

#### Advanced Union Pattern: Discriminated Unions per State Management

Uno dei pattern più potenti che combina Union types con type narrowing è quello delle **Discriminated Unions**. Questo pattern è perfetto per modellare stati applicativi complessi:

```typescript
// Modelling di stati asincroni - pattern molto comune in frontend
type AsyncState<T> =
  | { status: 'idle' }
  | { status: 'loading' }
  | { status: 'success'; data: T }
  | { status: 'error'; error: string };

// La proprietà 'status' è il "discriminant" - permette a TypeScript
// di capire esattamente in quale stato ci troviamo

@Injectable()
export class DataService {
  private state$ = new BehaviorSubject<AsyncState<User[]>>({ status: 'idle' });

  async loadUsers(): Promise<void> {
    // Transition to loading state
    this.state$.next({ status: 'loading' });

    try {
      const users = await this.userRepository.findAll();
      // TypeScript verifica che stiamo fornendo 'data' quando status è 'success'
      this.state$.next({ status: 'success', data: users });
    } catch (error) {
      // TypeScript verifica che stiamo fornendo 'error' quando status è 'error'
      this.state$.next({ status: 'error', error: error.message });
    }
  }

  getCurrentData(): User[] | null {
    const state = this.state$.value;

    // Type narrowing in action
    switch (state.status) {
      case 'success':
        // TypeScript SA che state.data esiste ed è User[]
        return state.data;
      case 'error':
        // TypeScript SA che state.error esiste
        console.error('Error loading users:', state.error);
        return null;
      case 'loading':
      case 'idle':
        return null;
      default:
        // Exhaustiveness check - garantisce che gestiamo tutti i casi
        const _exhaustive: never = state;
        throw new Error(`Unhandled state: ${JSON.stringify(_exhaustive)}`);
    }
  }
}
```

Il potere di questo pattern sta nel fatto che TypeScript ti impedisce di accedere a proprietà che non dovrebbero esistere in un determinato stato. Non puoi mai tentare di accedere a `state.data` quando lo stato è 'error', perché TypeScript sa che in quello stato la proprietà `data` semplicemente non esiste.

### Type Guards e Discriminated Unions: Runtime Type Safety

Uno dei concetti più importanti ma spesso fraintesi in TypeScript è la differenza tra **compile-time** e **runtime**. TypeScript ti aiuta enormemente a compile-time, ma a runtime sei di nuovo in territorio JavaScript normale. I Type Guards sono il ponte che collega questi due mondi, permettendo di portare la type safety di TypeScript anche nel runtime.

#### Il Problema Fondamentale: Runtime vs Compile-time

Considera questo scenario comune in NestJS: ricevi dati da una API esterna o dall'input utente. TypeScript non può sapere a compile-time se questi dati rispettano davvero la struttura che ti aspetti:

```typescript
// TypeScript pensa che questo sia un User, ma lo è davvero?
async function getUserFromAPI(id: string): Promise<User> {
  const response = await fetch(`/api/users/${id}`);
  const userData = await response.json();

  // TypeScript assumes userData is a User, but what if the API changed?
  // What if it returns { error: "User not found" } instead?
  return userData; // Potenziale bomba a orologeria!
}

// Later in your code...
const user = await getUserFromAPI('123');
console.log(user.name); // Runtime error se userData non ha 'name'!
```

Il problema è che TypeScript verifica i tipi solo a compile-time. A runtime, `userData` potrebbe essere qualsiasi cosa, ma TypeScript lo tratta come se fosse garantito essere un `User`. Questo gap tra compile-time safety e runtime reality è dove nascono molti bug difficili da debuggare.

#### Type Guards: Verifiche Runtime Type-Safe

I Type Guards risolvono questo problema permettendo di verificare a runtime se un valore rispetta davvero una certa struttura, e comunicando questa informazione al sistema di tipi di TypeScript:

```typescript
// Type guard function - verifica a runtime E informa TypeScript
function isUser(obj: any): obj is User {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.name === 'string' &&
    typeof obj.email === 'string'
  );
}

// Ora possiamo usarla per sicurezza runtime
async function getUserFromAPI(id: string): Promise<User | null> {
  try {
    const response = await fetch(`/api/users/${id}`);
    const userData = await response.json();

    // Verifica runtime: è davvero un User?
    if (isUser(userData)) {
      // TypeScript ora SA che userData è User
      return userData;
    } else {
      // Log dettagliato per debugging
      console.error('API returned invalid user data:', userData);
      return null;
    }
  } catch (error) {
    console.error('API call failed:', error);
    return null;
  }
}

// Usage è ora completamente sicuro
const user = await getUserFromAPI('123');
if (user) {
  // TypeScript sa che user è definitivamente User
  console.log(`Hello ${user.name}!`); // Guaranteed safe!
} else {
  console.log('User not found or invalid data');
}
```

La magia del type guard sta nella sintassi `obj is User`. Questa non è solo una dichiarazione per noi sviluppatori - è un'istruzione specifica a TypeScript: "se questa funzione ritorna true, allora il parametro è davvero di tipo User".

#### Type Guards Avanzati per Validazione Complessa

In applicazioni reali, i type guards diventano più sofisticati. Considera un sistema di validazione per API input in NestJS:

```typescript
// Interfacce per dati complessi
interface CreateUserRequest {
  name: string;
  email: string;
  age: number;
  preferences: {
    theme: 'light' | 'dark';
    notifications: boolean;
  };
}

// Type guard sofisticato con validazione annidata
function isCreateUserRequest(obj: any): obj is CreateUserRequest {
  return (
    obj &&
    typeof obj.name === 'string' &&
    obj.name.length > 0 &&
    typeof obj.email === 'string' &&
    obj.email.includes('@') &&
    typeof obj.age === 'number' &&
    obj.age > 0 &&
    obj.age < 150 &&
    obj.preferences &&
    typeof obj.preferences === 'object' &&
    (obj.preferences.theme === 'light' || obj.preferences.theme === 'dark') &&
    typeof obj.preferences.notifications === 'boolean'
  );
}

// NestJS Guard che usa type guards per validazione
@Injectable()
export class CreateUserValidationGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const body = request.body;

    if (!isCreateUserRequest(body)) {
      throw new BadRequestException({
        message: 'Invalid user data format',
        received: typeof body,
        expected: 'CreateUserRequest',
      });
    }

    // A questo punto TypeScript SA che body è CreateUserRequest
    // Possiamo aggiungere il dato validato al request per i successivi handlers
    request.validatedBody = body;
    return true;
  }
}

// Controller che si fida della validazione
@Controller('users')
export class UserController {
  @Post()
  @UseGuards(CreateUserValidationGuard)
  async create(@Req() req: Request): Promise<User> {
    // req.validatedBody è garantito essere CreateUserRequest
    const userData = req.validatedBody as CreateUserRequest;

    return this.userService.create({
      name: userData.name, // Type-safe
      email: userData.email, // Type-safe
      age: userData.age, // Type-safe
      theme: userData.preferences.theme, // Type-safe, anche nested!
    });
  }
}
```

#### Discriminated Unions: Type Guards Automatici

Le Discriminated Unions rappresentano un pattern ancora più potente che combina Union types con type guards automatici. L'idea è avere una proprietà "discriminante" che permette a TypeScript di capire automaticamente in quale variant dell'union ci troviamo.

Il pattern nasce da una necessità pratica: spesso hai oggetti che condividono alcune proprietà ma differiscono in altre, a seconda di un "tipo" o "stato". Senza Discriminated Unions, dovresti gestire questi casi manualmente con type guards multipli.

```typescript
// PROBLEMA: Union type senza discriminant
type Shape = Circle | Rectangle | Triangle;

interface Circle {
  radius: number;
}

interface Rectangle {
  width: number;
  height: number;
}

interface Triangle {
  base: number;
  height: number;
}

function calculateArea(shape: Shape): number {
  // Come fa TypeScript a sapere quale tipo di Shape è?
  // Devi controllare manualmente l'esistenza delle proprietà
  if ('radius' in shape) {
    return Math.PI * shape.radius ** 2; // TypeScript inferisce Circle
  } else if ('width' in shape) {
    return shape.width * shape.height; // TypeScript inferisce Rectangle
  } else {
    return (shape.base * shape.height) / 2; // TypeScript inferisce Triangle
  }
}
```

Questo approccio funziona ma è fragile: se Rectangle e Triangle avessero entrambe una proprietà `height`, la distinzione diventerebbe ambigua.

```typescript
// SOLUZIONE: Discriminated Union con proprietà discriminante
type Shape =
  | { type: 'circle'; radius: number }
  | { type: 'rectangle'; width: number; height: number }
  | { type: 'triangle'; base: number; height: number };

function calculateArea(shape: Shape): number {
  // TypeScript usa la proprietà 'type' per discriminare automaticamente
  switch (shape.type) {
    case 'circle':
      // TypeScript SA che shape ha radius
      return Math.PI * shape.radius ** 2;

    case 'rectangle':
      // TypeScript SA che shape ha width e height
      return shape.width * shape.height;

    case 'triangle':
      // TypeScript SA che shape ha base e height
      return (shape.base * shape.height) / 2;

    default:
      // Exhaustiveness check - TypeScript verifica che tutti i casi siano gestiti
      const _exhaustive: never = shape;
      throw new Error(`Unhandled shape type: ${JSON.stringify(_exhaustive)}`);
  }
}
```

La proprietà `type` è il "discriminant" - dice a TypeScript esattamente quale variant dell'union stiamo gestendo. Questo elimina l'ambiguità e rende il code completion e la verifica dei tipi molto più precisa.

#### Discriminated Unions per Event Sourcing in NestJS

Uno dei pattern più potenti per le Discriminated Unions è nel modeling degli eventi per Event Sourcing:

```typescript
// Event system con discriminated unions
type UserEvent =
  | {
      type: 'UserRegistered';
      userId: string;
      email: string;
      registrationDate: Date;
    }
  | { type: 'EmailVerified'; userId: string; verificationDate: Date }
  | {
      type: 'ProfileUpdated';
      userId: string;
      changes: Partial<UserProfile>;
      updatedAt: Date;
    }
  | {
      type: 'AccountSuspended';
      userId: string;
      reason: string;
      suspendedAt: Date;
    }
  | { type: 'AccountReactivated'; userId: string; reactivatedAt: Date };

@Injectable()
export class UserEventHandler {
  async handleEvent(event: UserEvent): Promise<void> {
    // TypeScript discrimina automaticamente basandosi su 'type'
    switch (event.type) {
      case 'UserRegistered':
        // TypeScript sa che event ha email e registrationDate
        await this.sendWelcomeEmail(event.userId, event.email);
        await this.logRegistration(event.userId, event.registrationDate);
        break;

      case 'EmailVerified':
        // TypeScript sa che event ha verificationDate
        await this.activateAccount(event.userId);
        await this.logVerification(event.userId, event.verificationDate);
        break;

      case 'ProfileUpdated':
        // TypeScript sa che event ha changes e updatedAt
        await this.updateSearchIndex(event.userId, event.changes);
        await this.notifyFollowers(event.userId, event.changes);
        break;

      case 'AccountSuspended':
        // TypeScript sa che event ha reason e suspendedAt
        await this.revokeUserSessions(event.userId);
        await this.notifyModerators(event.userId, event.reason);
        break;

      case 'AccountReactivated':
        // TypeScript sa che event ha reactivatedAt
        await this.restoreUserAccess(event.userId);
        await this.logReactivation(event.userId, event.reactivatedAt);
        break;

      default:
        // Exhaustiveness check garantisce che gestiamo tutti i tipi di eventi
        const _exhaustive: never = event;
        throw new Error(`Unhandled event type: ${JSON.stringify(_exhaustive)}`);
    }
  }

  // Helper method che mostra come consumare eventi specifici
  async processRegistrationEvents(events: UserEvent[]): Promise<void> {
    for (const event of events) {
      if (event.type === 'UserRegistered') {
        // TypeScript automatic narrowing - sa che è UserRegistered
        console.log(
          `New user registered: ${event.email} at ${event.registrationDate}`,
        );

        // Possiamo accedere safely a tutte le proprietà specifiche
        await this.setupUserDefaults(event.userId, event.email);
      }
    }
  }
}
```

La potenza di questo pattern sta nel fatto che quando aggiungi un nuovo tipo di evento, TypeScript ti forzerà ad aggiornare tutti gli switch che gestiscono eventi, garantendo che nessun caso venga dimenticato. L'`exhaustiveness check` con `never` è cruciale: garantisce che se aggiungi un nuovo tipo di evento ma dimentichi di gestirlo, otterrai un errore a compile-time piuttosto che un bug silenzioso a runtime.

### Utility Types: Strumenti per Trasformazione Tipi

Gli Utility Types rappresentano uno dei concetti più pratici e immediatamente utili di TypeScript avanzato. Nascono da un'osservazione semplice: spesso vuoi creare un nuovo tipo che è una variazione di un tipo esistente. Senza Utility Types, dovresti duplicare definizioni o usare workaround complessi.

#### Il Problema: Duplicazione e Inconsistenza dei Tipi

Considera un'applicazione NestJS tipica dove hai un'entità User completa, ma devi creare versioni diverse per diversi contesti:

```typescript
// Entity completa
interface User {
  id: string;
  email: string;
  password: string; // Sensibile - non dovrebbe mai essere esposto
  name: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLoginAt?: Date;
}

// SENZA UTILITY TYPES - Approccio problematico
// Per creare un nuovo utente (senza id, dates, etc)
interface CreateUserRequest {
  email: string;
  password: string;
  name: string;
  dateOfBirth: Date;
  // Se aggiungi un campo a User, devi ricordarti di aggiungerlo anche qui
}

// Per update parziali
interface UpdateUserRequest {
  email?: string;
  name?: string;
  dateOfBirth?: Date;
  // Di nuovo, devi mantenere sincronizzato manualmente
}

// Per response pubbliche (senza password)
interface PublicUserProfile {
  id: string;
  email: string;
  name: string;
  dateOfBirth: Date;
  createdAt: Date;
  isActive: boolean;
  lastLoginAt?: Date;
  // Se rimuovi password da User, devi ricordarti di rimuoverla anche da qui
}
```

Questo approccio presenta problemi seri:

1. **Duplicazione massiccia**: Stai ripetendo le stesse definizioni di proprietà
2. **Inconsistenza inevitabile**: Quando modifichi User, devi ricordarti di modificare tutti gli altri tipi correlati
3. **Errori silenti**: Se dimentichi di aggiornare un tipo, non ricevi errori a compile-time
4. **Manutenzione costosa**: Ogni change richiede modifiche in luoghi multipli

#### La Soluzione: Utility Types per Trasformazioni Dichiarative

Gli Utility Types ti permettono di esprimere le trasformazioni in modo dichiarativo: "voglio un tipo come User ma con tutti i campi opzionali" o "voglio un tipo come User but senza password".

```typescript
// CON UTILITY TYPES - Approccio elegante e DRY
interface User {
  id: string;
  email: string;
  password: string;
  name: string;
  dateOfBirth: Date;
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
  lastLoginAt?: Date;
}

// Tutte le derivazioni sono automatiche e sempre sincronizzate
type CreateUserRequest = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
// Automaticamente: email, password, name, dateOfBirth, isActive, lastLoginAt?

type UpdateUserRequest = Partial<Pick<User, 'email' | 'name' | 'dateOfBirth'>>;
// Automaticamente: email?, name?, dateOfBirth? (tutti opzionali)

type PublicUserProfile = Omit<User, 'password'>;
// Automaticamente: tutto come User eccetto password

type UserSummary = Pick<User, 'id' | 'name' | 'email' | 'isActive'>;
// Automaticamente: solo i campi specificati
```

La differenza è drammatica. Ora quando modifichi `User`, tutti i tipi derivati si aggiornano automaticamente. Aggiungi un campo? Compare automaticamente in `CreateUserRequest`. Rinomini un campo? TypeScript ti segnala tutti i punti che devono essere aggiornati.

#### Built-in Utility Types: Il Toolkit Essenziale

TypeScript offre un set di utility types built-in che coprono la maggior parte dei casi d'uso comuni:

**Partial\<T\>** - Rende tutti i campi opzionali. Perfetto per update parziali:

```typescript
// Partial<User> equivale a:
type PartialUser = {
  id?: string;
  email?: string;
  password?: string;
  name?: string;
  // ... tutti gli altri campi con ?
}

// Usage in NestJS
@Patch(':id')
async updateUser(
  @Param('id') id: string,
  @Body() updates: Partial<User>
): Promise<User> {
  // updates può contenere qualsiasi subset di proprietà User
  return this.userService.update(id, updates);
}
```

**Required\<T\>** - Rende tutti i campi obbligatori. Utile quando hai interfacce con molti campi opzionali ma in certi contesti li vuoi tutti:

```typescript
// Per configurazioni che sono opzionali ma quando presenti devono essere complete
interface ConfigOptions {
  database?: DatabaseConfig;
  redis?: RedisConfig;
  logging?: LoggingConfig;
}

type CompleteConfig = Required<ConfigOptions>;
// Ora database, redis, e logging sono tutti obbligatori
```

**Pick\<T, K\>** - Seleziona solo specifiche proprietà. Essenziale per creare tipi focalizzati:

```typescript
// Per API responses che espongono solo certi campi
type UserLoginResponse = Pick<User, 'id' | 'name' | 'email' | 'lastLoginAt'>;

@Post('login')
async login(@Body() credentials: LoginDto): Promise<UserLoginResponse> {
  const user = await this.authService.validateUser(credentials);
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    lastLoginAt: user.lastLoginAt
  }; // TypeScript verifica che stai fornendo esattamente questi campi
}
```

**Omit\<T, K\>** - Esclude specifiche proprietà. Complementare a Pick:

```typescript
// Per creare DTOs che escludono campi sensibili o auto-generati
type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt' | 'password'>;

// Il controller non può mai ricevere questi campi nell'input
@Post()
async create(@Body() userData: CreateUserDto): Promise<PublicUserProfile> {
  // userData non ha mai id, password, o date fields
  const hashedPassword = await this.hashPassword(userData.password); // Error! No password field
  // Devi gestire password separatamente per sicurezza
}
```

**Record\<K, T\>** - Crea oggetti con chiavi di tipo K e valori di tipo T:

```typescript
// Per mapping e lookup tables type-safe
type UserRolePermissions = Record<UserRole, Permission[]>;

const rolePermissions: UserRolePermissions = {
  admin: ['read', 'write', 'delete', 'manage_users'],
  user: ['read'],
  moderator: ['read', 'write', 'moderate_content'],
  // TypeScript forza a definire tutti i ruoli
};

// Usage in guards
@Injectable()
export class PermissionGuard {
  hasPermission(userRole: UserRole, requiredPermission: Permission): boolean {
    const userPermissions = rolePermissions[userRole];
    return userPermissions.includes(requiredPermission);
  }
}
```

#### Advanced Utility Types: Combinare Trasformazioni

Il vero potere emerge quando combini utility types per trasformazioni complesse:

```typescript
// Combination per DTOs sofisticati
type CreateUserDto = Omit<User, 'id' | 'createdAt' | 'updatedAt'>;
type UpdateUserDto = Partial<Pick<CreateUserDto, 'name' | 'email' | 'dateOfBirth'>>;

// Questo crea automaticamente:
// type UpdateUserDto = {
//   name?: string;
//   email?: string;
//   dateOfBirth?: Date;
// }

// Per response types che combinano multiple entità
type UserWithOrderSummary = Pick<User, 'id' | 'name' | 'email'> & {
  orderSummary: Pick<Order, 'totalOrders' | 'totalSpent' | 'lastOrderDate'>;
};

@Get('users-with-orders')
async getUsersWithOrderSummary(): Promise<UserWithOrderSummary[]> {
  // Implementation che combina User e Order data
}
```

#### Custom Utility Types: Creazione di Strumenti Specifici

Quando i built-in utility types non bastano, puoi crearne di personalizzati per esigenze specifiche:

```typescript
// Deep Partial - rende opzionali anche proprietà annidate
type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Useful per configurazioni complesse
interface AppConfig {
  database: {
    host: string;
    port: number;
    credentials: {
      username: string;
      password: string;
    };
  };
  redis: {
    host: string;
    port: number;
  };
}

// Regular Partial<AppConfig> rende opzionale solo il primo livello
// DeepPartial<AppConfig> rende opzionale tutto, anche nested
type ConfigOverrides = DeepPartial<AppConfig>;

const developmentOverrides: ConfigOverrides = {
  database: {
    host: 'localhost', // port e credentials possono essere omessi
  },
  // redis può essere completamente omesso
};
```

### Conditional Types: Logica Avanzata nei Tipi

I Conditional Types rappresentano uno dei concetti più potenti e complessi di TypeScript. Ti permettono di creare tipi che si comportano come istruzioni if-else, adattandosi dinamicamente basandosi su altre condizioni di tipo. È come avere un linguaggio di programmazione completo che opera sui tipi invece che sui valori.

#### Il Problema: Tipi che Devono Adattarsi al Contesto

Immagina di voler creare un sistema che gestisce diverse API con strutture di risposta diverse. Alcuni endpoint ritornano dati singoli, altri arrays, altri ancora Promise. Vorresti un tipo che si adatta automaticamente:

```typescript
// PROBLEMA: Senza conditional types, devi creare overload multipli
interface ApiClient {
  get(endpoint: '/user'): Promise<User>;
  get(endpoint: '/users'): Promise<User[]>;
  get(endpoint: '/user/profile'): Promise<UserProfile>;
  get(endpoint: '/orders'): Promise<Order[]>;
  // Per ogni endpoint, devi definire esplicitamente il tipo di ritorno
}
```

Questo approccio non scala. Ogni volta che aggiungi un endpoint, devi aggiornare l'interfaccia. Inoltre, se cambi la struttura di una risposta, devi ricordarti di aggiornare il tipo corrispondente.

#### La Soluzione: Conditional Types per Inferenza Dinamica

I Conditional Types ti permettono di creare logica che opera sui tipi:

```typescript
// Definizione di una mapping table
type EndpointResponseMap = {
  '/user': User;
  '/users': User[];
  '/user/profile': UserProfile;
  '/orders': Order[];
  '/order': Order;
};

// Conditional type che inferisce il tipo di ritorno basandosi sull'endpoint
type ApiResponse<T extends keyof EndpointResponseMap> =
  T extends keyof EndpointResponseMap ? Promise<EndpointResponseMap[T]> : never;

// Ora l'interfaccia è generica ma completamente type-safe
interface ApiClient {
  get<T extends keyof EndpointResponseMap>(endpoint: T): ApiResponse<T>;
}

// Usage è completamente type-safe e auto-inferito
const client: ApiClient = createApiClient();

const user = await client.get('/user'); // Type: User
const users = await client.get('/users'); // Type: User[]
const profile = await client.get('/user/profile'); // Type: UserProfile
const invalid = await client.get('/invalid'); // TypeScript Error!
```

La sintassi `T extends keyof EndpointResponseMap ? Promise<EndpointResponseMap[T]> : never` è un conditional type. Dice: "se T è una delle chiavi valide nella mapping table, ritorna Promise del tipo corrispondente, altrimenti ritorna never (che causerà un errore)".

#### Advanced Conditional Types: Unwrapping e Type Extraction

Uno dei pattern più utili è "unwrapping" tipi complessi. Ad esempio, estrarre il tipo contenuto in una Promise:

```typescript
// Built-in utility che usa conditional types
type Awaited<T> = T extends Promise<infer U> ? U : T;

// Come funziona:
// - Se T è Promise<SomeType>, inferisce SomeType e lo ritorna
// - Se T non è Promise, ritorna T così com'è

type Example1 = Awaited<Promise<string>>; // string
type Example2 = Awaited<Promise<User[]>>; // User[]
type Example3 = Awaited<string>; // string (non è Promise)

// Practical usage in NestJS
class DataService {
  async fetchUser(id: string): Promise<User> {
    /* ... */
  }

  getUserSync(id: string): User {
    /* ... */
  }
}

// Extract return types automatically
type AsyncUserResult = Awaited<ReturnType<DataService['fetchUser']>>; // User
type SyncUserResult = Awaited<ReturnType<DataService['getUserSync']>>; // User
```

La keyword `infer` è magica: dice a TypeScript "qualunque cosa ci sia qui, chiamala U e rendila disponibile nella parte then del conditional". È come catturare una variabile in una regex.

#### Conditional Types per API Design Intelligente

Un pattern avanzato è creare API che si comportano diversamente basandosi sui parametri di tipo:

```typescript
// Smart API response che cambia basandosi sul metodo HTTP
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

type SmartApiResponse<Method extends HttpMethod, Data> = Method extends 'GET'
  ? { data: Data; total?: number; page?: number }
  : Method extends 'POST'
    ? { data: Data; created: true; id: string }
    : Method extends 'PUT'
      ? { data: Data; updated: true }
      : Method extends 'DELETE'
        ? { deleted: true; id: string }
        : never;

// Generic controller che adatta le risposte automaticamente
export class SmartController<Entity> {
  get<T extends Entity[]>(query: any): SmartApiResponse<'GET', T> {
    // TypeScript sa che il return type deve avere data, total?, page?
    return {
      data: [] as T,
      total: 0,
      page: 1,
    };
  }

  post<T extends Entity>(entity: Omit<T, 'id'>): SmartApiResponse<'POST', T> {
    // TypeScript sa che il return type deve avere data, created, id
    return {
      data: { ...entity, id: 'generated-id' } as T,
      created: true,
      id: 'generated-id',
    };
  }

  delete(id: string): SmartApiResponse<'DELETE', never> {
    // TypeScript sa che il return type deve avere solo deleted e id
    return {
      deleted: true,
      id,
    };
  }
}
```

#### Distributed Conditional Types: Quando i Conditional Types si Applicano a Union

Un comportamento speciale accade quando applichi conditional types a union types - si "distribuiscono" automaticamente:

```typescript
type ToArray<T> = T extends any ? T[] : never;

// Quando applichi ToArray a un union type:
type Result = ToArray<string | number | boolean>;
// Equivale a: string[] | number[] | boolean[]
// Non (string | number | boolean)[]

// Practical example: converting API response types
type ApiData = User | Order | Product;
type ApiArrayResponse = ToArray<ApiData>;
// Result: User[] | Order[] | Product[]

// Usage in generic API handlers
function processApiArrayResponse<T extends ApiData>(response: ToArray<T>): T[] {
  return response; // TypeScript sa che response è T[]
}
```

Questo comportamento di distribuzione è spesso quello che vuoi, ma a volte devi prevenirlo usando tuple types:

```typescript
// Prevent distribution with tuple wrapper
type ToArrayNonDistributive<T> = [T] extends [any] ? T[] : never;

type NonDistributed = ToArrayNonDistributive<string | number>;
// Result: (string | number)[]
// Non: string[] | number[]
```

La comprensione dei Conditional Types ti apre possibilità enormi per creare API type-safe e flessibili, specialmente in framework come NestJS dove la genericità combinata con la type safety è cruciale per architetture scalabili.

---

## 🔥 PRIORITÀ ALTA - Concetti Importanti per Senior

### Function Types e Overloading

```typescript
// Function overloading per API flessibili
interface UserService {
  // Overload signatures
  find(id: string): Promise<User | null>;
  find(filter: UserFilter): Promise<User[]>;
  find(ids: string[]): Promise<User[]>;
}

@Injectable()
export class UserService {
  // Implementation signature (deve gestire tutti i casi)
  async find(
    criteria: string | UserFilter | string[],
  ): Promise<User | User[] | null> {
    if (typeof criteria === 'string') {
      return this.findById(criteria);
    } else if (Array.isArray(criteria)) {
      return this.findByIds(criteria);
    } else {
      return this.findByFilter(criteria);
    }
  }
}
```

### Interfacce Avanzate

```typescript
// Interface merging per estensibilità
interface ApiConfig {
  baseUrl: string;
  timeout: number;
}

interface ApiConfig {
  retries?: number; // Merged with above
}

// Index signatures per oggetti dinamici
interface FlexibleConfig {
  [key: string]: unknown;
  required: string;
}

// Generic interfaces per dependency injection
interface Service<T> {
  process(data: T): Promise<T>;
}

@Injectable()
export class UserService implements Service<User> {
  async process(user: User): Promise<User> {
    // Implementation
    return user;
  }
}
```

---

## ⚡ PRIORITÀ MEDIA - Concetti Base Solidi

### Tipi Primitivi e Configurazione

```typescript
// tsconfig.json essentials per NestJS
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "strict": true,
    "esModuleInterop": true,
    "experimentalDecorators": true,
    "emitDecoratorMetadata": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}

// Strict typing
let userId: string; // Solo string
let count: number; // Solo number
let isActive: boolean; // Solo boolean
let data: unknown; // Tipo sicuro per dati sconosciuti
let config: Record<string, any>; // Oggetto con chiavi string
```

### Enum e Literal Types

```typescript
// String enum (preferito per NestJS)
enum UserRole {
  ADMIN = 'admin',
  USER = 'user',
  MODERATOR = 'moderator',
}

// Literal types
type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';
type Environment = 'development' | 'staging' | 'production';

// Usage in NestJS
@Controller('admin')
@UseGuards(RoleGuard(UserRole.ADMIN))
export class AdminController {}
```

### Classes e Access Modifiers

```typescript
// NestJS service con TypeScript classes
@Injectable()
export class UserService {
  private readonly users: Map<string, User> = new Map();
  protected logger = new Logger(UserService.name);

  public async create(userData: CreateUserDto): Promise<User> {
    // Implementation
  }

  private validateUser(user: User): boolean {
    // Private method
    return true;
  }
}
```

---

## 📋 PRIORITÀ BASSA - Menzione Rapida

**Type Assertions**: `value as Type` o `<Type>value` - usare con cautela, preferire type guards.

**Module Augmentation**: Estendere tipi di librerie esterne quando necessario.

**Declaration Files**: `.d.ts` per tipizzare librerie JavaScript.

**Ambient Declarations**: `declare` per variabili globali e moduli senza tipi.

---

## 🎯 Edge Cases Critici per Colloquio

### 1. Generic Constraints Edge Case

```typescript
// PROBLEMA: Generic constraint troppo permissivo
function bad<T extends object>(obj: T): T {
  return { ...obj, modified: true }; // Error! T potrebbe non permettere 'modified'
}

// SOLUZIONE: Intersection type
function good<T extends object>(obj: T): T & { modified: boolean } {
  return { ...obj, modified: true }; // OK!
}
```

### 2. Union Type Narrowing Edge Case

```typescript
// PROBLEMA: Type guard non exhaustivo
function isError(result: Success | Error): result is Error {
  return 'error' in result; // Potrebbe essere inaccurato se Success ha anche 'error'
}

// SOLUZIONE: Discriminated union con never
type Result =
  | { success: true; data: any; error?: never }
  | { success: false; error: string; data?: never };

function isError(
  result: Result,
): result is Extract<Result, { success: false }> {
  return !result.success;
}
```

### 3. Promise Type Inference Edge Case

```typescript
// PROBLEMA: Promise.all con mixed types
const mixed = await Promise.all([
  fetch('/api/users'), // Promise<Response>
  Promise.resolve('string'), // Promise<string>
  42, // number (not Promise)
]);
// mixed è (Response | string | number)[] - potrebbe non essere quello che vuoi

// SOLUZIONE: Explicit typing
const [response, message, count] = await Promise.all([
  fetch('/api/users') as Promise<Response>,
  Promise.resolve('string') as Promise<string>,
  Promise.resolve(42) as Promise<number>,
]);
```

---

## 🔧 Cheat Sheet per Colloquio

### Pattern Comuni NestJS + TypeScript

```typescript
// 1. DTO Pattern
export class CreateUserDto {
  @IsEmail() email: string;
  @IsString() @MinLength(2) name: string;
}

// 2. Repository Pattern
interface Repository<T, ID = string> {
  findById(id: ID): Promise<T | null>;
  save(entity: Omit<T, 'id'>): Promise<T>;
}

// 3. Service Pattern con Generics
@Injectable()
export class CrudService<T extends { id: string }> {
  async update(id: string, updates: Partial<T>): Promise<T> {
    // Implementation
  }
}

// 4. Guard Pattern con Type Guards
@Injectable()
export class AdminGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const user = context.switchToHttp().getRequest().user;
    return this.isAdmin(user);
  }

  private isAdmin(user: any): user is AdminUser {
    return user && user.role === 'admin';
  }
}
```

### Quick Reference Utility Types

- `Partial<T>` - Tutti i campi opzionali
- `Required<T>` - Tutti i campi obbligatori
- `Pick<T, K>` - Seleziona solo campi K
- `Omit<T, K>` - Esclude campi K
- `Record<K, T>` - Oggetto con chiavi K e valori T
- `Exclude<T, U>` - Rimuove U da T
- `Extract<T, U>` - Estrae U da T
- `NonNullable<T>` - Rimuove null/undefined
- `ReturnType<T>` - Tipo di ritorno di funzione T
- `Parameters<T>` - Parametri di funzione T come tuple

### Domande Frequenti e Risposte

**Q: "Differenza tra interface e type alias?"**
**A**: Interface può essere extended e merged, type alias è più flessibile per union/intersection types. In NestJS si usano interface per contracts e type per trasformazioni complesse.

**Q: "Come gestisci la validazione runtime con TypeScript?"**
**A**: Usando class-validator in NestJS per DTOs, combinato con type guards custom per logica complessa e discriminated unions per state management.

**Q: "Quando usi any vs unknown?"**
**A**: Mai `any` in produzione. `unknown` è type-safe e richiede type guards prima dell'uso. `any` disabilita completamente il type checking.

**Q: "Come gestisci gli errori async in modo type-safe?"**
**A**: Using Result types (discriminated unions) o Either monad pattern invece di try/catch quando possibile, per rendere gli errori espliciti nel tipo.

---

## 🎪 Esempi Pratici Completi per Dimostrare Competenza

### 1. Advanced Generic Service Pattern

```typescript
interface EntityWithId {
  id: string;
}

interface Repository<T extends EntityWithId> {
  findById(id: string): Promise<T | null>;
  findMany(filter: Partial<T>): Promise<T[]>;
  save(entity: Omit<T, 'id' | 'createdAt' | 'updatedAt'>): Promise<T>;
  update(id: string, updates: Partial<T>): Promise<T>;
  delete(id: string): Promise<void>;
}

@Injectable()
export class GenericCrudService<
  Entity extends EntityWithId,
  CreateDto extends Omit<Entity, 'id' | 'createdAt' | 'updatedAt'>,
  UpdateDto extends Partial<CreateDto>,
> {
  constructor(private repository: Repository<Entity>) {}

  async create(createDto: CreateDto): Promise<Entity> {
    return this.repository.save(createDto);
  }

  async update(id: string, updateDto: UpdateDto): Promise<Entity> {
    const existing = await this.repository.findById(id);
    if (!existing) {
      throw new NotFoundException(`Entity with id ${id} not found`);
    }
    return this.repository.update(id, updateDto);
  }
}

// Usage
@Injectable()
export class UserService extends GenericCrudService<
  User,
  CreateUserDto,
  UpdateUserDto
> {
  constructor(userRepository: UserRepository) {
    super(userRepository);
  }
}
```

### 2. Type-Safe Event System

```typescript
// Event registry con type safety
interface EventMap {
  'user.created': { user: User };
  'user.updated': { user: User; changes: Partial<User> };
  'user.deleted': { userId: string };
  'order.placed': { order: Order; user: User };
}

type EventName = keyof EventMap;
type EventPayload<T extends EventName> = EventMap[T];

interface EventHandler<T extends EventName> {
  handle(payload: EventPayload<T>): Promise<void> | void;
}

@Injectable()
export class EventBus {
  private handlers = new Map<EventName, EventHandler<any>[]>();

  register<T extends EventName>(eventName: T, handler: EventHandler<T>): void {
    if (!this.handlers.has(eventName)) {
      this.handlers.set(eventName, []);
    }
    this.handlers.get(eventName)!.push(handler);
  }

  async emit<T extends EventName>(
    eventName: T,
    payload: EventPayload<T>,
  ): Promise<void> {
    const handlers = this.handlers.get(eventName) || [];
    await Promise.all(handlers.map(handler => handler.handle(payload)));
  }
}

// Usage
@Injectable()
export class UserCreatedHandler implements EventHandler<'user.created'> {
  async handle(payload: EventPayload<'user.created'>): Promise<void> {
    // TypeScript sa che payload ha { user: User }
    console.log(`Welcome ${payload.user.name}!`);
  }
}
```

### 3. Advanced API Response Builder

```typescript
// Conditional response types
type SuccessResponse<T> = {
  success: true;
  data: T;
  meta: {
    timestamp: string;
    requestId: string;
  };
};

type ErrorResponse = {
  success: false;
  error: {
    code: string;
    message: string;
    details?: unknown;
  };
  meta: {
    timestamp: string;
    requestId: string;
  };
};

type ApiResponse<T> = SuccessResponse<T> | ErrorResponse;

// Generic response builder
export class ResponseBuilder {
  static success<T>(data: T, requestId: string): SuccessResponse<T> {
    return {
      success: true,
      data,
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
  }

  static error(
    code: string,
    message: string,
    requestId: string,
    details?: unknown,
  ): ErrorResponse {
    return {
      success: false,
      error: { code, message, details },
      meta: {
        timestamp: new Date().toISOString(),
        requestId,
      },
    };
  }
}

// NestJS Controller con type-safe responses
@Controller('users')
export class UserController {
  @Get(':id')
  async findOne(
    @Param('id') id: string,
    @Req() req: Request,
  ): Promise<ApiResponse<User>> {
    try {
      const user = await this.userService.findById(id);
      if (!user) {
        return ResponseBuilder.error(
          'USER_NOT_FOUND',
          'User not found',
          req.id,
        );
      }
      return ResponseBuilder.success(user, req.id);
    } catch (error) {
      return ResponseBuilder.error(
        'INTERNAL_ERROR',
        'Internal server error',
        req.id,
        error,
      );
    }
  }
}
```

Questa guida ti fornisce tutto quello che serve per dimostrare competenza TypeScript senior in un colloquio, con focus particolare sui pattern che userai quotidianamente con NestJS. Concentrati sui concetti ad alta priorità e usa gli esempi pratici per mostrare la tua esperienza con architetture scalabili e type-safe.
