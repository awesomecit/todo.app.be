# Guida Completa a NestJS: Pattern, Architettura e Preparazione al Colloquio

## Introduzione: Perché NestJS Rivoluziona lo Sviluppo Backend in Node.js

Immagina di dover costruire una casa. Potresti iniziare posando mattoni a caso, sperando che tutto si tenga insieme, oppure potresti seguire un progetto architettonico ben definito che ti guida passo dopo passo. NestJS rappresenta esattamente questo progetto architettonico per le applicazioni Node.js: un framework che porta struttura, ordine e best practice a un ecosistema che spesso soffre di mancanza di standardizzazione.

Prima di NestJS, lo sviluppo di applicazioni Node.js di grandi dimensioni spesso si trasformava in un labirinto di callback, middleware concatenati e file di configurazione sparsi ovunque. Gli sviluppatori provenienti da linguaggi come Java o C# si trovavano spiazzati dalla mancanza di strutture familiari come dependency injection, decorators e modularità ben definita.

Kamil Myśliwiec, il creatore di NestJS, riconobbe questo gap e decise di portare i migliori pattern architetturali del mondo enterprise nello sviluppo Node.js. Non si trattava di reinventare la ruota, ma di prendere pattern provati e testatissimi da framework come Angular e Spring, e adattarli elegantemente al mondo backend JavaScript e TypeScript.

Il risultato è un framework che non solo semplifica lo sviluppo di applicazioni complesse, ma lo fa in un modo che risulta familiare agli sviluppatori con esperienza in altri ecosistemi, mantenendo allo stesso tempo tutta la flessibilità e la potenza di Node.js.

## Il Contesto Storico: Dall'Anarchia di Express alla Struttura di NestJS

Per apprezzare veramente il contributo di NestJS, dobbiamo prima comprendere il panorama da cui è emerso. Express.js, per anni il framework dominante per Node.js, è incredibilmente flessibile e potente, ma questa flessibilità può diventare un'arma a doppio taglio quando si tratta di progetti complessi.

Con Express, ogni team deve inventare la propria architettura. Dove mettere la logica di business? Come organizzare le route? Come gestire la validazione? Come strutturare i test? Queste domande non hanno risposte canoniche in Express, il che significa che ogni progetto può sembrare completamente diverso da un altro, anche quando risolve problemi simili.

Questa libertà creativa ha i suoi meriti per progetti piccoli e prototipazione rapida, ma diventa problematica quando si scala a team più grandi o applicazioni più complesse. È come avere una lingua senza grammatica: espressiva, ma difficile da imparare e standardizzare.

NestJS interviene non per limitare questa flessibilità, ma per canalizzarla attraverso pattern architetturali consolidati. È come fornire una grammatica a quella lingua espressiva, mantenendo la ricchezza espressiva ma aggiungendo struttura e prevedibilità.

## I Pattern Fondamentali di NestJS: Le Fondamenta Architetturali

Prima di immergerci nei dettagli tecnici, è essenziale comprendere i pattern architetturali che costituiscono il cuore di NestJS. Questi pattern non sono invenzioni del framework, ma adaptation di principi consolidati dall'architettura software enterprise.

### Dependency Injection Pattern: Il Cuore Pulsante dell'Architettura

Il Dependency Injection (DI) è forse il pattern più importante e distintivo di NestJS. Se non hai mai incontrato questo pattern prima, pensa a come organizzi una cena per amici. Approccio tradizionale: vai al supermercato, compri tutto quello che serve, torni a casa, cucini tutto da solo. Approccio con dependency injection: chiedi a ogni amico di portare un piatto specifico, tu ti occupi solo di coordinare e assemblare il pasto finale.

Nel mondo del software, la dependency injection funziona allo stesso modo. Invece che ogni classe si procuri da sola tutte le dipendenze di cui ha bisogno, c'è un sistema centrale (l'IoC container) che si occupa di fornire a ogni classe esattamente quello di cui ha bisogno, quando ne ha bisogno.

Consideriamo un esempio pratico. In un approccio tradizionale senza DI, potresti avere qualcosa del genere:

```typescript
// ❌ Approccio senza Dependency Injection - rigido e difficile da testare
class OrderService {
  private database: Database;
  private emailService: EmailService;
  private logger: Logger;

  constructor() {
    // La classe è responsabile di creare le proprie dipendenze
    this.database = new PostgreSQLDatabase('localhost', 5432);
    this.emailService = new SMTPEmailService('smtp.gmail.com');
    this.logger = new FileLogger('/var/log/app.log');
  }

  async createOrder(orderData: any): Promise<void> {
    try {
      const order = await this.database.save(orderData);
      await this.emailService.sendConfirmation(order.customerEmail);
      this.logger.info(`Order ${order.id} created successfully`);
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }
}
```

Questo approccio presenta diversi problemi fondamentali. La classe OrderService è strettamente accoppiata alle implementazioni specifiche delle sue dipendenze. Se vogliamo testare questa classe, dobbiamo per forza usare un database PostgreSQL reale, un server SMTP reale, e scrivere su file reali. Se vogliamo cambiare da PostgreSQL a MongoDB, dobbiamo modificare il codice della classe. È come avere un'auto con il motore, la trasmissione e i freni saldati insieme: per cambiare una parte, devi smontare tutto.

Ora vediamo lo stesso esempio con dependency injection:

```typescript
// ✅ Approccio con Dependency Injection - flessibile e testabile
import { Injectable, Inject } from '@nestjs/common';

@Injectable()
export class OrderService {
  constructor(
    @Inject('DATABASE') private database: Database,
    @Inject('EMAIL_SERVICE') private emailService: EmailService,
    @Inject('LOGGER') private logger: Logger
  ) {
    // Le dipendenze vengono iniettate dal container IoC
    // La classe non sa e non deve sapere come vengono create
  }

  async createOrder(orderData: any): Promise<void> {
    try {
      const order = await this.database.save(orderData);
      await this.emailService.sendConfirmation(order.customerEmail);
      this.logger.info(`Order ${order.id} created successfully`);
    } catch (error) {
      this.logger.error(`Failed to create order: ${error.message}`);
      throw error;
    }
  }
}
```

La magia qui non è solo nella sintassi più pulita, ma nel fatto che questa classe ora non sa nulla delle implementazioni specifiche delle sue dipendenze. Possiamo facilmente iniettare implementazioni diverse per ambienti diversi: un database in-memory per i test, un mock email service per il development, un logger diverso per la produzione.

Il decorator `@Injectable()` dice a NestJS che questa classe può essere gestita dal sistema di dependency injection, mentre i decorator `@Inject()` specificano esattamente quali dipendenze devono essere iniettate in ciascun parametro del constructor.

### Module Pattern: Organizzazione e Incapsulamento

Il Module Pattern in NestJS è ispirato direttamente da Angular, e rappresenta il modo in cui l'applicazione viene organizzata in unità logiche coese. Pensa ai moduli come ai dipartimenti di un'azienda: il dipartimento vendite ha le sue responsabilità, i suoi strumenti e le sue persone, ma collabora con altri dipartimenti quando necessario.

Un modulo in NestJS è una classe decorata con `@Module()` che definisce un pezzo coeso dell'applicazione. Ogni modulo può dichiarare:

- **Providers**: i servizi che il modulo fornisce (come OrderService nell'esempio precedente)
- **Controllers**: gli endpoint HTTP che il modulo espone
- **Imports**: altri moduli di cui questo modulo ha bisogno
- **Exports**: i provider che questo modulo rende disponibili ad altri moduli

Vediamo un esempio di come questo si traduce in codice:

```typescript
// users.module.ts - Un modulo completo per la gestione utenti
import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Importiamo il modulo database con l'entity User
    TypeOrmModule.forFeature([User]),
    // Potremmo importare altri moduli, come AuthModule per l'autenticazione
  ],
  controllers: [
    // I controller espongono gli endpoint HTTP
    UsersController,
  ],
  providers: [
    // I provider contengono la logica di business
    UsersService,
    UsersRepository,
    {
      provide: 'USER_VALIDATOR',
      useClass: EmailUserValidator, // Dependency injection configurabile
    },
  ],
  exports: [
    // Rendiamo UsersService disponibile ad altri moduli
    UsersService,
  ],
})
export class UsersModule {}
```

Questa struttura modulare porta benefici enormi. Prima di tutto, incapsula la complessità: tutto quello che riguarda gli utenti è in un posto solo. Secondo, definisce chiaramente le dipendenze: è evidente che questo modulo dipende da TypeORM ma non sa nulla di altri moduli a meno che non li importi esplicitamente. Terzo, facilita il testing: possiamo testare questo modulo in isolamento sostituendo le sue dipendenze esterne.

### Controller Pattern: Gestione delle Richieste HTTP

I Controller in NestJS seguono il pattern Model-View-Controller (MVC), ma si concentrano specificamente sulla gestione delle richieste HTTP in entrata e sulla restituzione delle risposte appropriate. Pensa ai controller come ai receptionist di un hotel: ricevono le richieste dei clienti, capiscono di cosa hanno bisogno, coordinano i vari dipartimenti per soddisfare la richiesta, e forniscono una risposta appropriata.

Un controller ben progettato dovrebbe essere sottile: deve occuparsi solo di parsare la richiesta HTTP, delegare il lavoro vero ai servizi, e formattare la risposta. Non dovrebbe contenere logica di business complessa.

```typescript
// users.controller.ts - Un controller ben strutturato
import { Controller, Get, Post, Body, Param, Query, HttpStatus, HttpException } from '@nestjs/common';

@Controller('users') // Questo controller gestisce tutte le route che iniziano con /users
export class UsersController {
  constructor(
    private readonly usersService: UsersService // DI in azione
  ) {}

  @Get() // GET /users
  async findAll(@Query() queryParams: any) {
    try {
      // Il controller delega tutta la logica al service
      const users = await this.usersService.findAll(queryParams);
      // Ritorna i dati in formato appropriato per HTTP
      return {
        data: users,
        message: 'Users retrieved successfully'
      };
    } catch (error) {
      // Gestione degli errori specifica per HTTP
      throw new HttpException(
        'Failed to retrieve users',
        HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Post() // POST /users
  async create(@Body() createUserDto: CreateUserDto) {
    // Qui vediamo anche l'uso di DTO (Data Transfer Objects)
    const user = await this.usersService.create(createUserDto);
    return {
      data: user,
      message: 'User created successfully'
    };
  }

  @Get(':id') // GET /users/:id
  async findOne(@Param('id') id: string) {
    const user = await this.usersService.findById(id);
    if (!user) {
      throw new HttpException('User not found', HttpStatus.NOT_FOUND);
    }
    return { data: user };
  }
}
```

I decorator come `@Get()`, `@Post()`, `@Body()`, `@Param()` sono la magia che permette a NestJS di mappare automaticamente le richieste HTTP ai metodi appropriati e di estrarre i dati dalle richieste in modo type-safe.

### Service Pattern: La Logica di Business

I Services in NestJS sono il cuore della logica di business dell'applicazione. Se i controller sono i receptionist, i services sono i manager dei vari dipartimenti che sanno effettivamente come fare il lavoro richiesto.

Un service dovrebbe essere indipendente da HTTP: non dovrebbe sapere nulla di richieste, risposte, status code, o header. Questo lo rende facilmente testabile e riutilizzabile in contesti diversi.

```typescript
// users.service.ts - La logica di business centralizzata
import { Injectable, NotFoundException } from '@nestjs/common';

@Injectable()
export class UsersService {
  constructor(
    private readonly usersRepository: UsersRepository,
    @Inject('USER_VALIDATOR') private readonly validator: UserValidator,
    private readonly logger: Logger,
  ) {}

  async create(createUserDto: CreateUserDto): Promise<User> {
    // Prima validiamo i dati
    const validationResult = await this.validator.validate(createUserDto);
    if (!validationResult.isValid) {
      throw new Error(`Validation failed: ${validationResult.errors.join(', ')}`);
    }

    // Poi applichiamo la logica di business
    const existingUser = await this.usersRepository.findByEmail(createUserDto.email);
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    // Creiamo l'utente
    const user = await this.usersRepository.create({
      ...createUserDto,
      createdAt: new Date(),
      isActive: true,
    });

    // Log dell'operazione
    this.logger.info(`User created with ID: ${user.id}`);

    return user;
  }

  async findAll(options?: FindUsersOptions): Promise<User[]> {
    // La logica di business può essere complessa
    const { page = 1, limit = 10, isActive = true } = options || {};

    const users = await this.usersRepository.findWithPagination({
      page,
      limit,
      where: { isActive },
      orderBy: { createdAt: 'DESC' },
    });

    this.logger.debug(`Retrieved ${users.length} users`);
    return users;
  }

  async findById(id: string): Promise<User> {
    const user = await this.usersRepository.findById(id);
    if (!user) {
      throw new NotFoundException('User not found');
    }
    return user;
  }
}
```

Nota come il service non sa nulla di HTTP, ma contiene tutta la logica importante: validazione, regole di business, coordinamento tra repository diversi, logging. Questo design rende il service facilmente testabile e riutilizzabile.

### Decorator Pattern: Metaprogrammazione Elegante

I Decorator in NestJS sono forse l'aspetto più magico del framework, ma anche quello che può confondere di più i newcomer. I decorator non sono un'invenzione di NestJS, ma una feature di TypeScript (ispirata dai decorator di Python e Java) che permette di aggiungere metadata e comportamenti a classi, metodi e proprietà.

Pensa ai decorator come agli adesivi che metti su un pacco per indicare come deve essere trattato: "Fragile", "Questo lato su", "Consegnare entro il...". I decorator dicono a NestJS come deve trattare le varie parti del tuo codice.

```typescript
// Esempi di decorator in azione
import { Controller, Get, Post, UseGuards, UsePipes, UseInterceptors } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse } from '@nestjs/swagger';

@ApiTags('users') // Swagger documentation
@Controller('users') // Questo è un controller per le route /users
@UseGuards(AuthGuard) // Tutte le route richiedono autenticazione
export class UsersController {

  @Get()
  @ApiOperation({ summary: 'Get all users' }) // Documentazione API
  @ApiResponse({ status: 200, description: 'Users retrieved successfully' })
  @UseInterceptors(CacheInterceptor) // Caching automatico
  @UsePipes(ValidationPipe) // Validazione automatica
  async findAll() {
    // Il metodo è semplice, ma i decorator aggiungono tantissime funzionalità
    return await this.usersService.findAll();
  }

  @Post()
  @ApiOperation({ summary: 'Create a new user' })
  @UseGuards(RolesGuard) // Guard aggiuntivo per i ruoli
  @Roles('admin') // Solo gli admin possono creare utenti
  async create(@Body() createUserDto: CreateUserDto) {
    return await this.usersService.create(createUserDto);
  }
}
```

I decorator permettono di implementare cross-cutting concerns (preoccupazioni trasversali) in modo elegante. Invece di dover aggiungere manualmente codice per autenticazione, validazione, caching e logging in ogni metodo, i decorator lo fanno automaticamente.

## L'Architettura Layered di NestJS: Come i Pattern si Integrano

Ora che abbiamo esplorato i pattern individuali, vediamo come si integrano per creare un'architettura coesa. NestJS segue un'architettura layered (a livelli) dove ogni layer ha responsabilità specifiche e comunica con gli altri layer attraverso interfacce ben definite.

### Il Layer di Presentazione: Controllers e DTOs

Il layer più esterno è quello che gestisce l'interfaccia con il mondo esterno. Qui troviamo i controller, che si occupano di ricevere le richieste HTTP, e i DTO (Data Transfer Objects), che definiscono la forma dei dati che entrano ed escono dall'applicazione.

```typescript
// create-user.dto.ts - Definisce la forma dei dati in ingresso
import { IsEmail, IsString, MinLength, MaxLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ description: 'User email address' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'User full name' })
  @IsString()
  @MinLength(2)
  @MaxLength(50)
  fullName: string;

  @ApiProperty({ description: 'User password', minLength: 8 })
  @IsString()
  @MinLength(8)
  password: string;

  @ApiProperty({ description: 'User phone number', required: false })
  @IsOptional()
  @IsString()
  phoneNumber?: string;
}
```

I DTO servono multipli scopi: definiscono chiaramente quali dati sono richiesti, abilitano la validazione automatica, forniscono documentazione per le API, e creano un contratto stabile tra frontend e backend.

### Il Layer di Business Logic: Services e Domain Models

Il layer centrale contiene la logica di business dell'applicazione. Qui risiedono i services, che orchestrano le operazioni complesse, e i domain models, che rappresentano i concetti core del business.

```typescript
// user.entity.ts - Domain model che rappresenta un utente
import { Entity, Column, PrimaryGeneratedColumn, BeforeInsert } from 'typeorm';
import * as bcrypt from 'bcrypt';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  fullName: string;

  @Column()
  password: string;

  @Column({ nullable: true })
  phoneNumber?: string;

  @Column({ default: true })
  isActive: boolean;

  @Column({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  // Business logic può essere inclusa nell'entity
  @BeforeInsert()
  async hashPassword() {
    this.password = await bcrypt.hash(this.password, 10);
  }

  async validatePassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password);
  }
}
```

### Il Layer di Persistenza: Repositories e Database

Il layer più profondo gestisce la persistenza dei dati. NestJS supporta diversi ORM, ma TypeORM è il più comunemente utilizzato.

```typescript
// users.repository.ts - Astrazione per l'accesso ai dati
import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, FindManyOptions } from 'typeorm';
import { User } from './entities/user.entity';

@Injectable()
export class UsersRepository {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
  ) {}

  async create(userData: Partial<User>): Promise<User> {
    const user = this.userRepository.create(userData);
    return await this.userRepository.save(user);
  }

  async findByEmail(email: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { email } });
  }

  async findWithPagination(options: FindManyOptions<User>): Promise<User[]> {
    return await this.userRepository.find(options);
  }

  async update(id: string, updateData: Partial<User>): Promise<User> {
    await this.userRepository.update(id, updateData);
    return await this.findById(id);
  }

  async findById(id: string): Promise<User | undefined> {
    return await this.userRepository.findOne({ where: { id } });
  }
}
```

## Pattern Avanzati: Guards, Interceptors, Pipes e Filters

NestJS introduce anche pattern più avanzati che permettono di gestire cross-cutting concerns in modo elegante e riutilizzabile.

### Guards: Controllo dell'Accesso

I Guards implementano il pattern Strategy per il controllo dell'accesso. Decidono se una richiesta dovrebbe essere processata o meno basandosi su logica arbitraria.

```typescript
// auth.guard.ts - Guard per l'autenticazione
import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(private readonly jwtService: JwtService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest();
    const token = this.extractTokenFromHeader(request);

    if (!token) {
      throw new UnauthorizedException('Token not found');
    }

    try {
      const payload = await this.jwtService.verifyAsync(token);
      // Aggiungiamo l'user al request per i controller successivi
      request.user = payload;
      return true;
    } catch {
      throw new UnauthorizedException('Invalid token');
    }
  }

  private extractTokenFromHeader(request: any): string | undefined {
    const [type, token] = request.headers.authorization?.split(' ') ?? [];
    return type === 'Bearer' ? token : undefined;
  }
}
```

### Interceptors: Aspetto-Oriented Programming

Gli Interceptors implementano il pattern Decorator/Wrapper e permettono di aggiungere logica prima e/o dopo l'esecuzione dei metodi.

```typescript
// logging.interceptor.ts - Interceptor per il logging
import { Injectable, NestInterceptor, ExecutionContext, CallHandler, Logger } from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

@Injectable()
export class LoggingInterceptor implements NestInterceptor {
  private readonly logger = new Logger(LoggingInterceptor.name);

  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const request = context.switchToHttp().getRequest();
    const method = request.method;
    const url = request.url;
    const now = Date.now();

    this.logger.log(`Incoming request: ${method} ${url}`);

    return next.handle().pipe(
      tap(() => {
        const responseTime = Date.now() - now;
        this.logger.log(`Request completed: ${method} ${url} - ${responseTime}ms`);
      })
    );
  }
}
```

### Pipes: Validazione e Trasformazione

I Pipes implementano il pattern Pipeline e si occupano di validare e trasformare i dati in ingresso.

```typescript
// validation.pipe.ts - Pipe personalizzato per validazione
import { PipeTransform, Injectable, ArgumentMetadata, BadRequestException } from '@nestjs/common';
import { validate } from 'class-validator';
import { plainToClass } from 'class-transformer';

@Injectable()
export class ValidationPipe implements PipeTransform<any> {
  async transform(value: any, { metatype }: ArgumentMetadata) {
    if (!metatype || !this.toValidate(metatype)) {
      return value;
    }

    const object = plainToClass(metatype, value);
    const errors = await validate(object);

    if (errors.length > 0) {
      const errorMessages = errors.map(error =>
        Object.values(error.constraints).join(', ')
      ).join('; ');

      throw new BadRequestException(`Validation failed: ${errorMessages}`);
    }

    return object;
  }

  private toValidate(metatype: Function): boolean {
    const types: Function[] = [String, Boolean, Number, Array, Object];
    return !types.includes(metatype);
  }
}
```

## Testing in NestJS: Pattern per la Qualità

NestJS è progettato fin dall'inizio per essere facilmente testabile, grazie alla dependency injection e alla modularità. Il framework fornisce utilities specifiche per diversi tipi di testing.

### Unit Testing: Testare i Componenti in Isolamento

```typescript
// users.service.spec.ts - Unit test per il service
import { Test, TestingModule } from '@nestjs/testing';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { Logger } from '@nestjs/common';

describe('UsersService', () => {
  let service: UsersService;
  let repository: UsersRepository;

  // Mock del repository per il testing
  const mockRepository = {
    create: jest.fn(),
    findByEmail: jest.fn(),
    findById: jest.fn(),
  };

  const mockLogger = {
    info: jest.fn(),
    error: jest.fn(),
    debug: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: UsersRepository,
          useValue: mockRepository, // Inietta il mock invece del repository reale
        },
        {
          provide: Logger,
          useValue: mockLogger,
        },
      ],
    }).compile();

    service = module.get<UsersService>(UsersService);
    repository = module.get<UsersRepository>(UsersRepository);
  });

  describe('create', () => {
    it('should create a user successfully', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
      };

      const expectedUser = { id: '1', ...createUserDto, createdAt: new Date() };

      mockRepository.findByEmail.mockResolvedValue(null); // Nessun utente esistente
      mockRepository.create.mockResolvedValue(expectedUser);

      // Act
      const result = await service.create(createUserDto);

      // Assert
      expect(result).toEqual(expectedUser);
      expect(mockRepository.findByEmail).toHaveBeenCalledWith(createUserDto.email);
      expect(mockRepository.create).toHaveBeenCalledWith(expect.objectContaining(createUserDto));
    });

    it('should throw error if user already exists', async () => {
      // Arrange
      const createUserDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
      };

      const existingUser = { id: '1', email: 'test@example.com' };
      mockRepository.findByEmail.mockResolvedValue(existingUser);

      // Act & Assert
      await expect(service.create(createUserDto)).rejects.toThrow('User with this email already exists');
    });
  });
});
```

### Integration Testing: Testare l'Integrazione tra Componenti

```typescript
// users.controller.integration.spec.ts - Test di integrazione
import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { UsersModule } from './users.module';
import { TypeOrmModule } from '@nestjs/typeorm';

describe('UsersController (integration)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [
        TypeOrmModule.forRoot({
          type: 'sqlite',
          database: ':memory:', // Database in memoria per i test
          entities: [User],
          synchronize: true,
        }),
        UsersModule,
      ],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /users', () => {
    it('should create a new user', () => {
      const createUserDto = {
        email: 'test@example.com',
        fullName: 'Test User',
        password: 'password123',
      };

      return request(app.getHttpServer())
        .post('/users')
        .send(createUserDto)
        .expect(201)
        .expect((res) => {
          expect(res.body.data).toHaveProperty('id');
          expect(res.body.data.email).toBe(createUserDto.email);
          expect(res.body.data).not.toHaveProperty('password'); // Password non dovrebbe essere ritornata
        });
    });
  });
});
```

## Preparazione al Colloquio: Domande Frequenti e Come Rispondere

Ora che abbiamo coperto i pattern fondamentali, vediamo come affrontare le domande più comuni sui colloqui tecnici per NestJS.

### Domanda 1: "Spiega cos'è la Dependency Injection e perché è importante in NestJS"

**Risposta strutturata:**

"La Dependency Injection è un design pattern che implementa il principio di Inversion of Control. In NestJS, invece che ogni classe crei da sé le proprie dipendenze, c'è un container IoC centrale che si occupa di fornire le dipendenze necessarie.

Il vantaggio principale è il disaccoppiamento: la classe non deve sapere come vengono create le sue dipendenze, rendendo il codice più testabile, modulare e flessibile. Per esempio, posso facilmente sostituire un database reale con un mock per i test, o cambiare implementazione senza modificare il codice che la usa.

NestJS implementa questo pattern attraverso i decorator come @Injectable() e @Inject(), e gestisce automaticamente il ciclo di vita delle istanze attraverso il suo IoC container."

### Domanda 2: "Qual è la differenza tra Guards, Interceptors, e Pipes?"

**Risposta strutturata:**

"Questi sono tutti pattern che permettono di gestire cross-cutting concerns, ma operano in momenti diversi del request lifecycle:

**Guards** vengono eseguiti prima dei controller e decidono se la richiesta deve essere processata. Implementano logica di autorizzazione e autenticazione. Ritornano boolean o lanciano eccezioni.

**Pipes** operano sui parametri in ingresso, trasformandoli e validandoli prima che raggiungano il controller. Per esempio, convertire stringhe in numeri o validare DTO.

**Interceptors** operano sia prima che dopo l'esecuzione del controller, permettendo di modificare la richiesta in ingresso o la risposta in uscita. Sono ideali per logging, caching, trasformazione delle risposte.

L'ordine di esecuzione è: Guards → Interceptors (pre) → Pipes → Controller → Interceptors (post)."

### Domanda 3: "Come gestiresti l'autenticazione e autorizzazione in un'applicazione NestJS?"

**Risposta strutturata:**

"Per l'autenticazione utilizzerei una strategia a più livelli:

1. **Passport Strategy**: Implementerei una JwtStrategy che estende PassportStrategy per validare i token JWT
2. **Auth Guard**: Creerei un AuthGuard che usa la strategia per proteggere le route
3. **Auth Service**: Un service dedicato per login, registrazione, e gestione token
4. **Role-based Authorization**: Guards specifici per controllare i ruoli utente

Esempio di implementazione con decorator personalizzati per i ruoli:

```typescript
@UseGuards(AuthGuard, RolesGuard)
@Roles('admin')
@Post('/sensitive-action')
async sensitiveAction() {
  // Solo admin possono accedere
}
```

Questo approccio separa chiaramente autenticazione (chi sei) da autorizzazione (cosa puoi fare)."

### Domanda 4: "Come implementeresti il caching in NestJS?"

**Risposta strutturata:**

"NestJS offre diverse strategie per il caching:

1. **Built-in Cache Manager**: Uso CacheModule con implementazioni in-memory o Redis
2. **Cache Interceptor**: Interceptor automatico che cachea le risposte basandosi su URL
3. **Custom Caching**: Service personalizzati per logiche di cache complesse

Esempio pratico:

```typescript
@UseInterceptors(CacheInterceptor)
@CacheTTL(60) // Cache per 60 secondi
@Get()
async getUsers() {
  return await this.usersService.findAll();
}
```

Per scenari più complessi, implementerei cache invalidation basata su eventi e cache warming per dati critici."

### Domanda 5: "Come gestisci gli errori in un'applicazione NestJS?"

**Risposta strutturata:**

"NestJS ha un sistema di error handling robusto basato su Exception Filters:

1. **Built-in Exceptions**: HttpException, NotFoundException, etc. per errori HTTP standard
2. **Custom Exception Filters**: Per gestire errori specifici del dominio
3. **Global Exception Filter**: Per catturare tutti gli errori non gestiti

Esempio di custom filter:

```typescript
@Catch(TypeOrmError)
export class DatabaseExceptionFilter implements ExceptionFilter {
  catch(exception: TypeOrmError, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    // Converte errori database in risposte HTTP appropriate
    response.status(400).json({
      statusCode: 400,
      message: 'Database operation failed',
      error: 'Bad Request'
    });
  }
}
```

L'approccio è quello di catturare errori il più specificamente possibile e fornire risposte meaningful ai client."

### Domanda 6: "Come ottimizzeresti le performance di un'applicazione NestJS?"

**Risposta strutturata:**

"Per ottimizzare le performance utilizzerei diverse strategie:

1. **Database Optimization**: Query efficienti, indici appropriati, eager/lazy loading strategico
2. **Caching**: Multi-livello (in-memory, Redis, CDN)
3. **Connection Pooling**: Pool di connessioni database configurati appropriatamente
4. **Compression**: Middleware per compressione gzip/brotli
5. **Rate Limiting**: Throttling per prevenire abuse
6. **Health Checks**: Monitoraggio proattivo delle performance

Per il monitoring userei strumenti come Prometheus + Grafana, implementando custom metrics:

```typescript
@Injectable()
export class MetricsService {
  private readonly histogram = new prometheus.Histogram({
    name: 'http_request_duration_seconds',
    help: 'Duration of HTTP requests in seconds',
    labelNames: ['method', 'route', 'status_code']
  });
}
```

L'importante è misurare prima di ottimizzare e identificare i veri bottleneck."

## Conclusione: Padroneggiare NestJS per Eccellere nei Colloqui

La padronanza di NestJS non è solo questione di conoscere la sintassi o memorizzare i decorator. È una comprensione profonda di come i pattern architetturali si integrano per creare applicazioni robuste, scalabili e maintibili.

Quando ti prepari per un colloquio su NestJS, ricorda che i recruiter cercano non solo competenza tecnica, ma anche capacità di ragionamento architetturale. Sanno che i framework cambiano, ma i principi di buona architettura rimangono costanti.

La chiave del successo è praticare attivamente questi pattern in progetti reali, sperimentare con le diverse opzioni che NestJS offre, e riflettere su come ogni pattern risolve specifici problemi architetturali. Solo attraverso l'applicazione pratica questi concetti diventeranno veramente tuoi, permettendoti di rispondere ai colloqui con sicurezza e di eccellere nel lavoro quotidiano.

Ricorda che NestJS è più di un framework: è una filosofia di sviluppo che promuove best practice consolidate e ti permette di scrivere codice di qualità enterprise. Padroneggiare NestJS significa padroneggiare principi che ti serviranno per tutta la carriera, indipendentemente dalle tecnologie specifiche che utilizzerai in futuro.
