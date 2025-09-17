import { INestApplication } from '@nestjs/common';
import { SwaggerModule, DocumentBuilder, OpenAPIObject } from '@nestjs/swagger';
import { CustomLogger } from '../common/logger/logger.service';

export function setupSwagger(
  app: INestApplication,
  logger: CustomLogger,
  port: number = 3000,
): OpenAPIObject {
  // Configurazione di base
  const options = new DocumentBuilder()
    .setTitle('API Documentation')
    .setDescription('Documentazione completa delle API del backend')
    .setVersion('1.0')
    .addBearerAuth(
      { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      'JWT',
    )
    .addTag('api', 'Endpoints API principali')
    .addTag('health', 'Controlli di salute del sistema')
    .addServer(`http://localhost:${port}`)
    .build();

  // Crea la documentazione
  const document = SwaggerModule.createDocument(app, options, {
    deepScanRoutes: true,
    ignoreGlobalPrefix: false,
  });

  // Controlla se l'health endpoint è stato documentato
  if (!document.paths['/health']) {
    logger.warn(
      'Health endpoint non trovato in Swagger, aggiungiamo manualmente',
      'Swagger',
    );

    // Se necessario, puoi aggiungere manualmente il percorso
    document.paths['/health'] = {
      get: {
        tags: ['health'],
        summary: "Controlla lo stato di salute dell'applicazione",
        description:
          "Verifica database, memoria e spazio su disco dell'applicazione",
        responses: {
          '200': {
            description: "L'applicazione è in salute",
          },
          '503': {
            description: 'Uno o più servizi non sono disponibili',
          },
        },
        parameters: [],
      },
    };
  }

  // Configura l'interfaccia Swagger
  SwaggerModule.setup('api-docs', app, document, {
    customCss: '.swagger-ui .topbar { display: none }',
    swaggerOptions: {
      persistAuthorization: true,
      docExpansion: 'list',
      filter: true,
      displayRequestDuration: true,
      tryItOutEnabled: true,
    },
  });

  logger.log(
    '📚 Swagger documentation initialized and accessible at /api-docs',
    'Swagger',
  );

  return document;
}
