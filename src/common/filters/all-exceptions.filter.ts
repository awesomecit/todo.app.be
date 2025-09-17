import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import { Request, Response } from 'express';
import * as fs from 'fs';
import * as path from 'path';
import { CustomLogger } from '../logger/logger.service';

// Definiamo tipi specifici per rendere il codice type-safe
interface ErrorLogData {
  method: string;
  url: string;
  status: number;
  message: string;
  timestamp: string;
  userAgent: string;
  ip: string;
}

interface HttpExceptionResponse {
  message?: string | string[];
  error?: string;
  statusCode?: number;
  errors?: Record<string, any>;
}

interface ErrorResponse {
  statusCode: number;
  message: string | string[];
  timestamp: string;
  path: string;
  method: string;
  errors?: Record<string, any>;
  stack?: string;
}

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: CustomLogger) {}

  private generateCurlCommand(request: Request): string {
    // Uso di tipizzazione esplicita per evitare unsafe destructuring
    const method = request.method;
    const url = request.url;
    const headers = request.headers;
    const body: unknown = request.body;

    // Base URL from request
    const host = headers.host || 'localhost';
    const protocol = request.secure ? 'https' : 'http';
    const fullUrl = `${protocol}://${host}${url}`;

    // Initialize the curl command
    let curlCommand = `curl -X ${method} '${fullUrl}'`;

    // Risoluzione più sicura usando type assertion e type guards
    if (headers && typeof headers === 'object') {
      // Itera sulle chiavi in modo type-safe
      for (const key in headers) {
        if (Object.prototype.hasOwnProperty.call(headers, key)) {
          if (key !== 'host' && key !== 'connection') {
            const value = headers[key];
            curlCommand += ` -H '${key}: ${String(value)}'`;
          }
        }
      }
    }

    // Add body if present - gestione sicura della serializzazione
    if (body && typeof body === 'object' && Object.keys(body).length > 0) {
      curlCommand += ` -H 'Content-Type: application/json'`;

      try {
        // Serializzazione sicura con tipizzazione esplicita
        const safeBody: Record<string, unknown> = {};
        for (const key of Object.keys(body)) {
          safeBody[key] = (body as Record<string, unknown>)[key];
        }

        // Usiamo il safeBody tipizzato invece del body diretto
        const bodyStr = JSON.stringify(safeBody, (_key, value): unknown => {
          // Funzione replacer con tipo di ritorno esplicito
          return value === undefined ? null : value;
        });

        curlCommand += ` -d '${bodyStr}'`;
      } catch {
        // Fallback in caso di errore con un oggetto vuoto literal
        // Usiamo _err per indicare che è intenzionalmente non utilizzato
        curlCommand += ` -d '{}'`;
      }
    }

    return curlCommand;
  }

  private logToSentryFile(
    exception: unknown,
    request: Request,
    status: number,
    message: string | string[],
  ): void {
    try {
      const logDir = path.resolve(process.cwd(), 'logs');

      // Ensure log directory exists
      if (!fs.existsSync(logDir)) {
        fs.mkdirSync(logDir, { recursive: true });
      }

      // Ottieni la data formattata per il nome del file (YYYY-MM-DD)
      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`;

      // Crea il nome del file con la data
      const logFilePath = path.join(logDir, `sentry-${dateString}.log`);

      // Prepare log data
      const timestamp = new Date().toISOString();
      const curlCommand = this.generateCurlCommand(request);

      // Funzione per rimuovere i codici di colore ANSI
      const stripAnsiCodes = (str: string): string => {
        return str.replace(new RegExp('\u001b' + '\\[\\d+m', 'g'), '');
      };

      // Prepare log content with explicit typing
      const logEntry: Record<string, unknown> = {
        timestamp,
        status,
        message: Array.isArray(message) ? message.join(', ') : message,
        path: request.url,
        method: request.method,
        userAgent: request.get('User-Agent') || 'Unknown',
        ip: request.ip || 'Unknown',
        requestBody: request.body,
        requestQuery: request.query,
        requestParams: request.params,
        curlCommand,
        stack:
          exception instanceof Error
            ? stripAnsiCodes(exception.stack || '')
            : 'No stack trace available',
      };

      // Convert to string format and add a new line
      const logString = JSON.stringify(logEntry, null, 2) + '\n\n';

      // Append to file
      fs.appendFileSync(logFilePath, logString, 'utf8');
    } catch (error) {
      this.logger.error(
        `Failed to write to sentry.log: ${error instanceof Error ? error.message : String(error)}`,
        'ExceptionFilter',
      );
    }
  }

  /**
   * Estrae lo status e il messaggio dall'eccezione
   */
  private extractExceptionDetails(exception: unknown): {
    status: number;
    message: string | string[];
    errors?: Record<string, unknown>;
  } {
    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message: string | string[] = 'Internal server error';
    let errors: Record<string, unknown> | undefined = undefined;

    // Gestione specifica per HttpException con type guards
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const exceptionResponse = exception.getResponse();

      if (typeof exceptionResponse === 'object' && exceptionResponse !== null) {
        const typedResponse = exceptionResponse as HttpExceptionResponse;

        // Gestione specifica per errori di validazione (status 400)
        if (status === HttpStatus.BAD_REQUEST && typedResponse.message) {
          if (Array.isArray(typedResponse.message)) {
            // Gli errori di class-validator vengono spesso come array di stringhe
            message = 'Errori di validazione';
            errors = {
              validationErrors: typedResponse.message,
              details: 'Controlla i campi indicati e riprova',
            };
          } else {
            message = typedResponse.message;
          }
        } else {
          message = typedResponse.message || exception.message;
        }

        // Cast esplicito per evitare assegnamento non sicuro
        if (typedResponse.errors) {
          errors = {
            ...errors,
            ...(typedResponse.errors as Record<string, unknown>),
          };
        }
      } else if (typeof exceptionResponse === 'string') {
        message = exceptionResponse;
      } else {
        message = exception.message;
      }
    } else if (exception instanceof Error) {
      // Gestione per Error generici
      message = exception.message;
    }

    return { status, message, errors };
  }

  /**
   * Gestisce il logging dell'eccezione in base alla sua gravità
   */
  private handleErrorLogging(
    exception: unknown,
    request: Request,
    status: number,
    message: string | string[],
  ): void {
    // Prepariamo i dati di log in modo type-safe
    const errorLogData: ErrorLogData = {
      method: request.method,
      url: request.url,
      status,
      message: Array.isArray(message) ? message.join(', ') : message,
      timestamp: new Date().toISOString(),
      userAgent: request.get('User-Agent') || 'Unknown',
      ip: request.ip || 'Unknown',
    };

    // Log dell'errore con informazioni complete
    const logMessage = `${errorLogData.method} ${errorLogData.url} - ${status} - ${errorLogData.message}`;

    // Facciamo il confronto in modo type-safe convertendo entrambi i valori allo stesso tipo
    const serverErrorThreshold = HttpStatus.INTERNAL_SERVER_ERROR; // 500
    if (status >= serverErrorThreshold) {
      this.logger.error(
        logMessage,
        exception instanceof Error
          ? exception.stack
          : 'No stack trace available',
        'ExceptionFilter',
      );

      // Salva i dettagli dell'errore nel file sentry.log per errori server
      this.logToSentryFile(exception, request, status, message);
    } else {
      this.logger.warn(logMessage, 'ExceptionFilter');
    }
  }

  /**
   * Prepara la risposta di errore da inviare al client
   */
  private prepareErrorResponse(
    exception: unknown,
    request: Request,
    status: number,
    message: string | string[],
    errors?: Record<string, unknown>,
  ): ErrorResponse {
    // Response standardizzata con tipizzazione forte
    const errorResponse: ErrorResponse = {
      statusCode: status,
      message,
      timestamp: new Date().toISOString(),
      path: request.url,
      method: request.method,
    };

    // Aggiungiamo errori se presenti
    if (errors) {
      errorResponse.errors = errors;
    }

    // Stack trace solo in development
    if (process.env.NODE_ENV === 'development' && exception instanceof Error) {
      errorResponse.stack = exception.stack;
    }

    return errorResponse;
  }

  catch(exception: unknown, host: ArgumentsHost): void {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    // Estrai i dettagli dell'eccezione
    const { status, message, errors } = this.extractExceptionDetails(exception);

    // Gestisci il logging
    this.handleErrorLogging(exception, request, status, message);

    // Prepara e invia la risposta
    const errorResponse = this.prepareErrorResponse(
      exception,
      request,
      status,
      message,
      errors,
    );

    response.status(status).json(errorResponse);
  }
}
