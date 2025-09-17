import {
  MiddlewareConsumer,
  Module,
  NestModule,
  ValidationPipe,
} from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_FILTER, APP_GUARD, APP_PIPE } from '@nestjs/core';
import { TerminusModule } from '@nestjs/terminus';
import { ThrottlerGuard, ThrottlerModule } from '@nestjs/throttler';

import { AppController } from './app.controller';
import {
  RootWildcardController,
  WildcardController,
} from './common/controllers/wildcard.controller';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { CustomLogger } from './common/logger/logger.service';
import { SecurityMiddleware } from './common/middleware/security.middleware';
import configuration from './config/configuration';
import { validationSchema } from './config/validation.schema';
import { HealthController } from './health/health.controller';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [
    // Configurazione ambiente con validazione
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validationSchema,
      validationOptions: {
        allowUnknown: true,
        abortEarly: true,
      },
    }),

    // Rate limiting
    ThrottlerModule.forRoot([
      {
        ttl: 60000, // 1 minuto
        limit: 100, // 100 requests per minuto
      },
    ]),

    // Database TypeORM
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'postgres',
        host: configService.get('database.host'),
        port: configService.get('database.port'),
        username: configService.get('database.username'),
        password: configService.get('database.password'),
        database: configService.get('database.name'),
        autoLoadEntities: true,
        synchronize: configService.get('nodeEnv') === 'development', // Solo in dev!
        logging: configService.get('nodeEnv') === 'development',
        retryAttempts: 3,
        retryDelay: 3000,
      }),
      inject: [ConfigService],
    }),

    // Health checks
    TerminusModule,

    // Feature modules here ...
  ],
  controllers: [
    HealthController,
    AppController,
    WildcardController,
    RootWildcardController,
  ],
  providers: [
    CustomLogger,
    // Validation pipe globale
    {
      provide: APP_PIPE,
      useValue: new ValidationPipe({
        whitelist: true, // Rimuove proprietà non definite nei DTO
        forbidNonWhitelisted: true, // Lancia errore se ci sono proprietà non whitelisted
        transform: true, // Trasforma automaticamente i tipi
        validateCustomDecorators: true, // Valida decoratori custom
        transformOptions: {
          enableImplicitConversion: true, // Conversione automatica dei tipi
        },
      }),
    },
    // Rate limiting guard globale
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_FILTER,
      useClass: AllExceptionsFilter,
    },
  ],
})
export class AppModule implements NestModule {
  configure(consumer: MiddlewareConsumer) {
    // Applica middleware di sicurezza a tutte le routes
    consumer.apply(SecurityMiddleware).forRoutes('*');
  }
}
