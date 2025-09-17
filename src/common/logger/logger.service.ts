import { Injectable, LoggerService } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as winston from 'winston';
import 'winston-daily-rotate-file';

// Helper functions per il safe stringify
function handlePrimitives(value: unknown): string | null {
  // Caso base: se è già una stringa, restituiscila così com'è
  if (typeof value === 'string') {
    return value;
  }

  // Gestione esplicita di null e undefined per evitare confusione
  if (value === null) {
    return 'null';
  }
  if (value === undefined) {
    return 'undefined';
  }

  // Per numeri, boolean e altri primitivi, la conversione standard è perfetta
  if (
    typeof value === 'number' ||
    typeof value === 'boolean' ||
    typeof value === 'bigint'
  ) {
    return `${value}`;
  }

  return null;
}

function handleSpecialObjects(value: unknown): string | null {
  if (typeof value !== 'object' || value === null) {
    return null;
  }

  // Gestione speciale per array: li rendiamo leggibili
  if (Array.isArray(value)) {
    try {
      return `[${value.map((item) => safeStringify(item)).join(', ')}]`;
    } catch {
      return '[Array]';
    }
  }

  // Per Error objects, vogliamo il message e possibilmente lo stack
  if (value instanceof Error) {
    return value.stack || value.message || 'Error';
  }

  // Per Date objects, vogliamo una rappresentazione ISO
  if (value instanceof Date) {
    return value.toISOString();
  }

  return null;
}

function handleGenericObject(value: unknown): string {
  try {
    const jsonString = JSON.stringify(value, null, 2);
    // Se l'oggetto è troppo grande, lo tronchiamo per evitare log giganteschi
    return jsonString.length > 500
      ? `${jsonString.substring(0, 500)}...`
      : jsonString;
  } catch {
    // Se JSON.stringify fallisce (riferimenti circolari, etc),
    // proviamo a estrarre almeno le chiavi principali
    try {
      const keys = Object.keys(value as Record<string, unknown>);
      return `{Object with keys: ${keys.join(', ')}}`;
    } catch {
      // Ultimo fallback: almeno indiciamo che tipo di oggetto è
      // Gestiamo il constructor in modo type-safe
      if (value && typeof value === 'object' && 'constructor' in value) {
        const constructor = value.constructor;
        if (
          constructor &&
          typeof constructor === 'function' &&
          constructor.name
        ) {
          return `[${constructor.name}]`;
        }
      }
      return '[Object]';
    }
  }
}

// Helper function avanzata per convertire valori unknown in stringhe meaningful
function safeStringify(value: unknown): string {
  // Prima controlla i primitivi
  const primitiveResult = handlePrimitives(value);
  if (primitiveResult !== null) {
    return primitiveResult;
  }

  // Poi controlla oggetti speciali
  const specialObjectResult = handleSpecialObjects(value);
  if (specialObjectResult !== null) {
    return specialObjectResult;
  }

  // Per oggetti, facciamo uno sforzo extra per renderli utili
  if (typeof value === 'object') {
    return handleGenericObject(value);
  }

  // Per function e symbol, forniamo una rappresentazione sensata
  if (typeof value === 'function') {
    return `[Function: ${value.name || 'anonymous'}]`;
  }

  if (typeof value === 'symbol') {
    return value.toString();
  }

  // Fallback finale per qualsiasi caso edge che non abbiamo coperto
  return `[Unrecognized value of type: ${typeof value}]`;
}

// Formatter per il timestamp con timezone configurabile
const timestampWithTimezone = (timezone: string) => {
  return winston.format((info) => {
    // Ottieni l'ora corrente
    const date = new Date();

    // Formato base UTC
    const utcTime = date.toISOString();

    try {
      // Ottieni l'orario nella timezone specificata
      const options: Intl.DateTimeFormatOptions = {
        timeZone: timezone,
        hour12: false,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        timeZoneName: 'short',
      };

      // Formatta la data nella timezone specificata
      const timeInZone = new Intl.DateTimeFormat('it-IT', options).format(date);

      // Aggiungi entrambi i formati al timestamp
      info.timestamp = `${utcTime} (${timeInZone})`;
    } catch {
      // Fallback se la timezone non è valida
      info.timestamp = `${utcTime} (timezone error: ${timezone})`;
    }

    return info;
  })();
};

@Injectable()
export class CustomLogger implements LoggerService {
  private logger: winston.Logger;

  constructor(private configService: ConfigService) {
    // Otteniamo l'ambiente di esecuzione
    const nodeEnv =
      this.configService.get<string>('NODE_ENV') ||
      process.env.NODE_ENV ||
      'development';

    // Otteniamo le configurazioni con type safety e valori di default intelligenti
    // Diamo priorità alle configurazioni specifiche per l'ambiente
    const logLevel =
      this.configService.get<string>(`logging.${nodeEnv}.level`) ||
      this.configService.get<string>('logging.level') ||
      (nodeEnv === 'production' ? 'info' : 'debug');
    const maxFiles =
      this.configService.get<string>(`logging.${nodeEnv}.maxFiles`) ||
      this.configService.get<string>('logging.maxFiles') ||
      '14d';
    const maxSize =
      this.configService.get<string>(`logging.${nodeEnv}.maxSize`) ||
      this.configService.get<string>('logging.maxSize') ||
      '20m';
    const timezone =
      this.configService.get<string>(`logging.${nodeEnv}.timezone`) ||
      this.configService.get<string>('logging.timezone') ||
      'Europe/Rome';

    // Formato comune per timestamp con timezone
    const timestampFormat = timestampWithTimezone(timezone);

    // Formato specifico per i file di log (senza colori)
    const fileFormat = winston.format.combine(
      timestampFormat,
      winston.format.uncolorize(), // Rimuove i codici colore ANSI
      winston.format.errors({ stack: true }),
      winston.format.printf((info) => {
        const timestamp =
          typeof info.timestamp === 'string'
            ? info.timestamp
            : new Date().toISOString();
        const level = typeof info.level === 'string' ? info.level : 'info';
        const message = safeStringify(info.message);
        const context = info.context
          ? ` {"context":"${safeStringify(info.context)}",`
          : ' {';
        const stack = info.stack
          ? `, "stack":"${safeStringify(info.stack)}"`
          : '';

        // Nuovo formato che mette il timestamp all'inizio della riga come nella console
        return `[${timestamp}][${level}]: ${message}${context}"timestamp":"${timestamp}"${stack}}`;
      }),
    );

    // Formato per la console (con colori)
    const consoleFormat = winston.format.combine(
      timestampFormat,
      winston.format.errors({ stack: true }),
      winston.format.colorize(),
      winston.format.printf((info) => {
        const timestamp =
          typeof info.timestamp === 'string'
            ? info.timestamp
            : new Date().toISOString();
        const level = typeof info.level === 'string' ? info.level : 'info';
        const message = safeStringify(info.message);
        const context = info.context ? `[${safeStringify(info.context)}] ` : '';
        const stack = info.stack ? `\n${safeStringify(info.stack)}` : '';

        return `[${timestamp}][${level}]: ${context}${message}${stack}`;
      }),
    );

    // Configurazione delle transports in base all'ambiente
    const transports: winston.transport[] = [
      // Console output con formato colorato
      new winston.transports.Console({
        format: consoleFormat,
        // In development mostriamo tutto, in production solo da warning in su (se non specificato altrimenti)
        level: nodeEnv === 'production' ? logLevel || 'warn' : logLevel,
      }),
    ];

    // In production e staging aggiungiamo sempre i file di log
    if (nodeEnv !== 'test') {
      transports.push(
        // File per errori - senza colori ANSI e con timestamp completo
        new winston.transports.DailyRotateFile({
          filename: 'logs/error-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          level: 'error',
          maxFiles,
          maxSize,
          format: fileFormat,
        }),

        // File per tutti i log - senza colori ANSI e con timestamp completo
        new winston.transports.DailyRotateFile({
          filename: 'logs/combined-%DATE%.log',
          datePattern: 'YYYY-MM-DD',
          maxFiles,
          maxSize,
          format: fileFormat,
        }),
      );
    }

    this.logger = winston.createLogger({
      level: logLevel,
      transports,
    });

    // Log iniziale con informazioni sulla timezone e ambiente configurati
    this.logger.info(
      `Logger initialized with environment: ${nodeEnv}, timezone: ${timezone}, level: ${logLevel}`,
    );
  }

  log(message: string, context?: string): void {
    this.logger.info(message, { context });
  }

  error(message: string, stack?: string, context?: string): void {
    this.logger.error(message, { stack, context });
  }

  warn(message: string, context?: string): void {
    this.logger.warn(message, { context });
  }

  debug(message: string, context?: string): void {
    this.logger.debug(message, { context });
  }

  verbose(message: string, context?: string): void {
    this.logger.verbose(message, { context });
  }

  // Properly implement info method, which is the same as log in this implementation
  info(message: string, context?: string): void {
    this.logger.info(message, { context });
  }
}
