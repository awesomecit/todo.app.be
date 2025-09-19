# Node.js Fondamentali

## Introduzione: Perché Node.js è Rivoluzionario

Node.js ha trasformato radicalmente lo sviluppo server-side introducendo JavaScript anche lato server, ma la vera innovazione risiede nella sua architettura event-driven e non-bloccante. Come senior developer, comprendere profondamente questi meccanismi ti permetterà di progettare applicazioni performanti e scalabili.

Immagina Node.js come un cameriere estremamente efficiente in un ristorante affollato: invece di aspettare che un piatto sia pronto prima di prendere il prossimo ordine (approccio tradizionale bloccante), prende più ordini contemporaneamente e serve i piatti appena sono pronti. Questa analogia cattura l'essenza dell'I/O non-bloccante di Node.js.

## 1. Event Loop: Il Cuore Pulsante di Node.js

### Architettura dell'Event Loop

L'Event Loop è l'anima di Node.js e rappresenta uno dei concetti più importanti da padroneggiare per un colloquio senior. È un loop infinito che gestisce l'esecuzione del codice, raccoglie eventi e esegue callback asincrone.

```javascript
// Esempio che dimostra l'ordine di esecuzione nell'Event Loop
console.log('1. Inizio'); // Esecuzione sincrona immediata

setTimeout(() => {
  console.log('4. Timer callback'); // Timer phase
}, 0);

setImmediate(() => {
  console.log('3. Immediate callback'); // Check phase
});

process.nextTick(() => {
  console.log('2. Next tick callback'); // Priorità massima
});

console.log('1. Fine'); // Esecuzione sincrona immediata

// Output garantito:
// 1. Inizio
// 1. Fine
// 2. Next tick callback
// 3. Immediate callback
// 4. Timer callback
```

### Le Sei Fasi dell'Event Loop

L'Event Loop opera attraverso sei fasi principali, ognuna con una specifica coda di callback:

```
   ┌───────────────────────────┐
┌─>│        Timer Phase        │  ← setTimeout, setInterval
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │   Pending I/O Callbacks   │  ← I/O callbacks differiti
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │     Idle, Prepare         │  ← Solo per uso interno
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │        Poll Phase         │  ← Fetching new I/O events
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
│  │       Check Phase         │  ← setImmediate callbacks
│  └─────────────┬─────────────┘
│  ┌─────────────┴─────────────┐
└──┤    Close Callbacks        │  ← socket.on('close', ...)
   └───────────────────────────┘
```

### Edge Cases dell'Event Loop

**Caso 1: Blocking dell'Event Loop**

```javascript
// ❌ SBAGLIATO: Questo bloccherà l'event loop
function blockingOperation() {
  const start = Date.now();
  while (Date.now() - start < 5000) {
    // Operazione sincrona che blocca per 5 secondi
    // Durante questo tempo, nessun altro callback può essere eseguito
  }
}

// ✅ GIUSTO: Utilizzare Worker Threads per operazioni CPU-intensive
const { Worker, isMainThread, parentPort } = require('worker_threads');

if (isMainThread) {
  console.log('Main thread: delegando operazione pesante al worker');
  const worker = new Worker(__filename);
  worker.postMessage('start_heavy_computation');

  worker.on('message', result => {
    console.log('Risultato ricevuto dal worker:', result);
  });

  // L'event loop rimane libero per gestire altre operazioni
  setInterval(() => {
    console.log('Event loop è ancora responsivo!');
  }, 1000);
} else {
  // Codice del worker thread
  parentPort.on('message', () => {
    // Operazione CPU-intensive eseguita in thread separato
    let result = 0;
    for (let i = 0; i < 10000000; i++) {
      result += Math.sqrt(i);
    }
    parentPort.postMessage(result);
  });
}
```

**Caso 2: Gestione delle Eccezioni Non Catturate**

```javascript
// Pattern essenziale per applicazioni production-ready
process.on('uncaughtException', error => {
  console.error('Uncaught Exception detected:', error);

  // Log dell'errore per debugging
  console.error('Stack trace:', error.stack);

  // Graceful shutdown - l'applicazione è in uno stato inconsistente
  process.exit(1);
});

process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Promise Rejection at:', promise);
  console.error('Reason:', reason);

  // In Node.js future versions, questo causerà la terminazione del processo
  // È meglio gestire esplicitamente tutti i promise rejections
  process.exit(1);
});

// Esempio di promise rejection non gestita
async function riskyOperation() {
  throw new Error('Something went wrong!');
}

// ❌ SBAGLIATO: Promise rejection non catturata
riskyOperation(); // Questo triggerà unhandledRejection

// ✅ GIUSTO: Sempre gestire promise rejections
riskyOperation().catch(error => {
  console.error('Errore gestito correttamente:', error.message);
});
```

## 2. Sistema di Moduli: Evolution da CommonJS a ES Modules

### CommonJS: Il Sistema Tradizionale

CommonJS è stato il sistema di moduli originale di Node.js, caratterizzato da importazioni sincrone e runtime.

```javascript
// math-utils.js - Modulo CommonJS
function add(a, b) {
  return a + b;
}

function multiply(a, b) {
  return a * b;
}

// Diversi modi di esportazione
module.exports = {
  add,
  multiply,
};

// Oppure esportazione diretta
// module.exports.subtract = (a, b) => a - b;

// app.js - Utilizzo del modulo
const { add, multiply } = require('./math-utils');
const fs = require('fs'); // Core module
const express = require('express'); // NPM module

console.log(add(5, 3)); // 8

// Le importazioni CommonJS sono sincrone e avvengono a runtime
if (someCondition) {
  const conditionalModule = require('./conditional-module');
}
```

### ES Modules: Il Futuro Moderno

ES Modules rappresentano il standard moderno per i moduli JavaScript, con importazioni statiche analizzabili a compile-time.

```javascript
// math-utils.mjs - Modulo ES
export function add(a, b) {
  return a + b;
}

export function multiply(a, b) {
  return a * b;
}

// Export default
export default function subtract(a, b) {
  return a - b;
}

// app.mjs - Utilizzo del modulo
import subtract, { add, multiply } from './math-utils.mjs';
import fs from 'fs/promises'; // Promise-based API
import express from 'express';

console.log(add(5, 3)); // 8

// ✅ Per importazioni condizionali, usa dynamic imports
if (someCondition) {
  const { default: conditionalModule } = await import(
    './conditional-module.mjs'
  );
}
```

### Configurazione per ES Modules

```json
// package.json - Abilita ES Modules per tutto il progetto
{
  "type": "module",
  "name": "my-modern-node-app",
  "version": "1.0.0",
  "exports": {
    ".": "./index.js",
    "./utils": "./lib/utils.js"
  }
}
```

### Pattern di Interoperabilità

```javascript
// Utilizzare CommonJS dentro ES Modules
import { createRequire } from 'module';
const require = createRequire(import.meta.url);

// Ora possiamo usare require() per moduli CommonJS legacy
const legacyModule = require('./legacy-commonjs-module');

// Utilizzare ES Modules dentro CommonJS (tramite dynamic import)
async function loadESModule() {
  try {
    const { default: modernModule, namedExport } = await import(
      './modern-esm-module.mjs'
    );
    return { modernModule, namedExport };
  } catch (error) {
    console.error('Errore caricamento ES Module:', error);
    throw error;
  }
}

// Esempio pratico: migrare gradualmente da CommonJS a ES Modules
// wrapper.js - Bridge per compatibilità
export async function loadConfig() {
  // Carica configurazione da modulo CommonJS esistente
  const legacyConfig = require('./config/legacy-config.js');

  // E integra con nuovi moduli ES
  const { validateConfig } = await import('./validators/config-validator.mjs');

  return validateConfig(legacyConfig);
}
```

## 3. Core Modules: Gli Strumenti Fondamentali

### File System (fs) - Gestione File Avanzata

```javascript
import fs from 'fs/promises';
import { createReadStream, createWriteStream } from 'fs';
import path from 'path';

// Pattern per operazioni file sicure e performanti
class FileManager {
  constructor(baseDir = process.cwd()) {
    this.baseDir = path.resolve(baseDir);
  }

  // Lettura sicura con gestione errori completa
  async readFileSecurely(relativePath, options = {}) {
    try {
      // Previene directory traversal attacks
      const safePath = this.resolveSafePath(relativePath);

      const stats = await fs.stat(safePath);

      if (stats.size > options.maxSize || 10 * 1024 * 1024) {
        // 10MB default
        throw new Error(`File troppo grande: ${stats.size} bytes`);
      }

      const encoding = options.encoding || 'utf8';
      const data = await fs.readFile(safePath, encoding);

      return {
        success: true,
        data,
        size: stats.size,
        lastModified: stats.mtime,
      };
    } catch (error) {
      return {
        success: false,
        error: error.message,
        code: error.code,
      };
    }
  }

  // Stream processing per file grandi
  async processLargeFile(inputPath, outputPath, transformFn) {
    return new Promise((resolve, reject) => {
      const readStream = createReadStream(this.resolveSafePath(inputPath));
      const writeStream = createWriteStream(this.resolveSafePath(outputPath));

      let processedLines = 0;
      let buffer = '';

      readStream.on('data', chunk => {
        buffer += chunk.toString();
        const lines = buffer.split('\n');

        // Mantieni l'ultima linea incomplete nel buffer
        buffer = lines.pop();

        for (const line of lines) {
          if (line.trim()) {
            const transformed = transformFn(line);
            writeStream.write(transformed + '\n');
            processedLines++;
          }
        }
      });

      readStream.on('end', () => {
        // Processa l'ultima linea se presente
        if (buffer.trim()) {
          const transformed = transformFn(buffer);
          writeStream.write(transformed + '\n');
          processedLines++;
        }

        writeStream.end();
      });

      writeStream.on('finish', () => {
        resolve({ processedLines, outputPath });
      });

      readStream.on('error', reject);
      writeStream.on('error', reject);
    });
  }

  // Previene path traversal attacks
  resolveSafePath(relativePath) {
    const resolved = path.resolve(this.baseDir, relativePath);

    // Assicurati che il path risolto sia dentro baseDir
    if (!resolved.startsWith(this.baseDir)) {
      throw new Error(`Path non sicuro rilevato: ${relativePath}`);
    }

    return resolved;
  }

  // Operazioni batch con controllo concorrenza
  async processBatchFiles(filePaths, processor, concurrency = 5) {
    const results = [];
    const executing = [];

    for (const filePath of filePaths) {
      const promise = this.processFile(filePath, processor);
      results.push(promise);

      if (results.length >= concurrency) {
        executing.push(promise);

        if (executing.length >= concurrency) {
          await Promise.race(executing);
          executing.splice(
            executing.findIndex(p => p === promise),
            1,
          );
        }
      }
    }

    return Promise.all(results);
  }
}
```

### Stream API - Gestione Efficiente dei Dati

```javascript
import { Readable, Writable, Transform, pipeline } from 'stream';
import { promisify } from 'util';

const pipelineAsync = promisify(pipeline);

// Custom Readable Stream per generare dati
class DataGenerator extends Readable {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    this.currentId = 0;
    this.maxRecords = options.maxRecords || 1000;
    this.delay = options.delay || 0;
  }

  _read() {
    if (this.currentId < this.maxRecords) {
      const record = {
        id: this.currentId++,
        timestamp: new Date().toISOString(),
        value: Math.random() * 1000,
        category: ['A', 'B', 'C'][Math.floor(Math.random() * 3)],
      };

      if (this.delay > 0) {
        setTimeout(() => this.push(record), this.delay);
      } else {
        this.push(record);
      }
    } else {
      this.push(null); // Segnala fine stream
    }
  }
}

// Custom Transform Stream per processing dati
class DataProcessor extends Transform {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    this.processingRules = options.rules || {};
    this.stats = {
      processed: 0,
      errors: 0,
      startTime: Date.now(),
    };
  }

  _transform(record, encoding, callback) {
    try {
      // Applica regole di trasformazione
      const processed = this.applyRules(record);

      // Aggiungi metadati di processing
      processed._metadata = {
        processedAt: new Date().toISOString(),
        processingTime: Date.now() - record.timestamp,
      };

      this.stats.processed++;
      callback(null, processed);
    } catch (error) {
      this.stats.errors++;
      console.error(`Errore processing record ${record.id}:`, error);

      // Continua il processing invece di fermare lo stream
      callback(); // Non passa l'errore per continuare
    }
  }

  applyRules(record) {
    let processed = { ...record };

    // Applica filtri
    if (this.processingRules.filters) {
      for (const filter of this.processingRules.filters) {
        processed = filter(processed);
      }
    }

    // Applica trasformazioni
    if (this.processingRules.transforms) {
      for (const transform of this.processingRules.transforms) {
        processed = transform(processed);
      }
    }

    return processed;
  }

  _flush(callback) {
    // Statistiche finali
    const duration = Date.now() - this.stats.startTime;
    console.log(`Processing completato:`, {
      ...this.stats,
      duration: `${duration}ms`,
      recordsPerSecond: Math.round((this.stats.processed / duration) * 1000),
    });

    callback();
  }
}

// Gestione Backpressure avanzata
class BackpressureAwareWritable extends Writable {
  constructor(options = {}) {
    super({ objectMode: true, ...options });
    this.buffer = [];
    this.processing = false;
    this.batchSize = options.batchSize || 100;
    this.maxBufferSize = options.maxBufferSize || 1000;
  }

  _write(record, encoding, callback) {
    // Aggiungi al buffer
    this.buffer.push(record);

    // Controlla se il buffer è troppo pieno
    if (this.buffer.length >= this.maxBufferSize) {
      console.warn('Buffer quasi pieno, rallentando...');
      // Aggiungi delay per permettere al sistema di recuperare
      setTimeout(callback, 10);
    } else {
      callback();
    }

    // Processa batch quando raggiunge la dimensione target
    if (this.buffer.length >= this.batchSize && !this.processing) {
      this.processBatch();
    }
  }

  async processBatch() {
    if (this.processing || this.buffer.length === 0) return;

    this.processing = true;
    const batch = this.buffer.splice(0, this.batchSize);

    try {
      await this.processRecordsBatch(batch);
    } catch (error) {
      console.error('Errore processing batch:', error);
      // Re-inserisci i record nel buffer per retry
      this.buffer.unshift(...batch);
    } finally {
      this.processing = false;

      // Continua processing se ci sono altri record
      if (this.buffer.length > 0) {
        setImmediate(() => this.processBatch());
      }
    }
  }

  async processRecordsBatch(records) {
    // Simula processing asincrono (es. scrittura database)
    console.log(`Processing batch di ${records.length} records`);

    // Simula variabilità nei tempi di processing
    const processingTime = 50 + Math.random() * 200;
    await new Promise(resolve => setTimeout(resolve, processingTime));

    return records;
  }

  _final(callback) {
    // Processa tutti i record rimanenti prima di chiudere
    if (this.buffer.length > 0) {
      this.processBatch().finally(callback);
    } else {
      callback();
    }
  }
}

// Utilizzo avanzato delle Stream
async function processDataStream() {
  try {
    const generator = new DataGenerator({
      maxRecords: 10000,
      delay: 1, // 1ms delay tra record
    });

    const processor = new DataProcessor({
      rules: {
        filters: [
          record => record.value > 100, // Filtra valori bassi
          record => record.category !== 'C', // Escludi categoria C
        ],
        transforms: [
          record => ({ ...record, value: Math.round(record.value) }),
          record => ({ ...record, processed: true }),
        ],
      },
    });

    const writer = new BackpressureAwareWritable({
      batchSize: 50,
      maxBufferSize: 500,
    });

    // Pipeline con gestione errori automatica
    await pipelineAsync(generator, processor, writer);

    console.log('Pipeline completata con successo');
  } catch (error) {
    console.error('Errore nella pipeline:', error);
  }
}
```

## 4. Buffer - Gestione Dati Binari Avanzata

```javascript
// Gestione efficiente e sicura dei Buffer
class BufferManager {
  constructor() {
    this.maxBufferSize = Buffer.constants.MAX_LENGTH;
    this.defaultEncoding = 'utf8';
  }

  // Creazione sicura di buffer
  createSafeBuffer(input, encoding = 'utf8') {
    try {
      if (Buffer.isBuffer(input)) {
        return input;
      }

      if (typeof input === 'string') {
        const buffer = Buffer.from(input, encoding);
        this.validateBufferSize(buffer);
        return buffer;
      }

      if (Array.isArray(input)) {
        const buffer = Buffer.from(input);
        this.validateBufferSize(buffer);
        return buffer;
      }

      throw new TypeError('Input deve essere Buffer, string o array');
    } catch (error) {
      console.error('Errore creazione buffer:', error);
      return null;
    }
  }

  validateBufferSize(buffer) {
    if (buffer.length > this.maxBufferSize) {
      throw new RangeError(`Buffer troppo grande: ${buffer.length} bytes`);
    }
  }

  // Concatenazione efficiente di buffer multipli
  concatBuffersEfficiently(buffers, totalLength = null) {
    if (!Array.isArray(buffers) || buffers.length === 0) {
      return Buffer.alloc(0);
    }

    // Calcola lunghezza totale se non fornita
    if (totalLength === null) {
      totalLength = buffers.reduce((sum, buf) => sum + buf.length, 0);
    }

    this.validateBufferSize({ length: totalLength });

    // Usa Buffer.concat con lunghezza pre-calcolata per performance
    return Buffer.concat(buffers, totalLength);
  }

  // Lettura sicura di diversi tipi di dati
  readDataTypes(buffer, offset = 0) {
    const result = {};
    let currentOffset = offset;

    try {
      // Leggi integer a 32-bit
      result.int32 = buffer.readInt32BE(currentOffset);
      currentOffset += 4;

      // Leggi float a 64-bit
      result.double = buffer.readDoubleLE(currentOffset);
      currentOffset += 8;

      // Leggi stringa con lunghezza prefissa
      const stringLength = buffer.readUInt16BE(currentOffset);
      currentOffset += 2;

      result.string = buffer
        .subarray(currentOffset, currentOffset + stringLength)
        .toString('utf8');
      currentOffset += stringLength;

      result.nextOffset = currentOffset;
      return result;
    } catch (error) {
      throw new Error(
        `Errore lettura buffer all'offset ${currentOffset}: ${error.message}`,
      );
    }
  }

  // Scrittura strutturata di dati
  writeDataStructure(data) {
    const stringBuffer = Buffer.from(data.string, 'utf8');
    const totalLength = 4 + 8 + 2 + stringBuffer.length; // int32 + double + string_length + string

    const buffer = Buffer.allocUnsafe(totalLength);
    let offset = 0;

    // Scrivi int32
    buffer.writeInt32BE(data.int32, offset);
    offset += 4;

    // Scrivi double
    buffer.writeDoubleLE(data.double, offset);
    offset += 8;

    // Scrivi lunghezza stringa
    buffer.writeUInt16BE(stringBuffer.length, offset);
    offset += 2;

    // Scrivi stringa
    stringBuffer.copy(buffer, offset);

    return buffer;
  }

  // Confronto sicuro di buffer (timing attack resistant)
  constantTimeCompare(buffer1, buffer2) {
    if (!Buffer.isBuffer(buffer1) || !Buffer.isBuffer(buffer2)) {
      return false;
    }

    if (buffer1.length !== buffer2.length) {
      return false;
    }

    // Usa crypto.timingSafeEqual per evitare timing attacks
    const crypto = require('crypto');
    return crypto.timingSafeEqual(buffer1, buffer2);
  }
}

// Esempio d'uso per processing di file binari
async function processBinaryFile(filePath) {
  const bufferManager = new BufferManager();
  const fs = require('fs/promises');

  try {
    const fileBuffer = await fs.readFile(filePath);
    console.log(`File caricato: ${fileBuffer.length} bytes`);

    // Analizza header del file (primi 64 bytes)
    const headerBuffer = fileBuffer.subarray(0, 64);
    const header = bufferManager.readDataTypes(headerBuffer);

    console.log('Header del file:', header);

    // Processa il resto del file in chunk
    const chunkSize = 8192; // 8KB chunks
    const chunks = [];

    for (let offset = 64; offset < fileBuffer.length; offset += chunkSize) {
      const chunk = fileBuffer.subarray(
        offset,
        Math.min(offset + chunkSize, fileBuffer.length),
      );

      // Processa chunk (esempio: invertire i bytes)
      const processedChunk = Buffer.from(chunk).reverse();
      chunks.push(processedChunk);
    }

    // Ricomponi il file processato
    const processedFile = bufferManager.concatBuffersEfficiently(chunks);

    return processedFile;
  } catch (error) {
    console.error('Errore processing file binario:', error);
    throw error;
  }
}
```

## 5. Event Emitters e Pattern Observer

```javascript
import EventEmitter from 'events';

// Event Emitter avanzato con funzionalità enterprise
class AdvancedEventEmitter extends EventEmitter {
  constructor(options = {}) {
    super();
    this.metrics = new Map(); // Tracking eventi per monitoring
    this.middleware = []; // Middleware chain per eventi
    this.eventHistory = options.keepHistory ? [] : null;
    this.maxHistorySize = options.maxHistorySize || 1000;

    this.setupDefaultHandlers();
  }

  setupDefaultHandlers() {
    // Gestisce warning per troppi listener
    this.on('newListener', eventName => {
      const listenerCount = this.listenerCount(eventName);
      if (listenerCount > 10) {
        console.warn(
          `⚠️  Possibile memory leak: ${listenerCount} listener per evento '${eventName}'`,
        );
      }
    });

    // Gestisce errori non catturati
    this.on('error', error => {
      console.error('Event Emitter Error:', error);
    });
  }

  // Override emit per aggiungere funzionalità avanzate
  emit(eventName, ...args) {
    // Aggiorna metriche
    const count = this.metrics.get(eventName) || 0;
    this.metrics.set(eventName, count + 1);

    // Salva nella history se abilitata
    if (this.eventHistory) {
      this.eventHistory.push({
        event: eventName,
        args: args,
        timestamp: new Date().toISOString(),
      });

      // Mantieni history size limitata
      if (this.eventHistory.length > this.maxHistorySize) {
        this.eventHistory.shift();
      }
    }

    // Esegui middleware chain
    const middlewareContext = {
      eventName,
      args,
      timestamp: Date.now(),
      stopPropagation: false,
    };

    for (const middleware of this.middleware) {
      try {
        middleware(middlewareContext);
        if (middlewareContext.stopPropagation) {
          return false;
        }
      } catch (error) {
        console.error('Middleware error:', error);
      }
    }

    return super.emit(eventName, ...middlewareContext.args);
  }

  // Aggiungi middleware per processing eventi
  use(middleware) {
    if (typeof middleware !== 'function') {
      throw new TypeError('Middleware deve essere una funzione');
    }
    this.middleware.push(middleware);
    return this; // Chainable
  }

  // Listener con timeout automatico
  onWithTimeout(eventName, listener, timeout) {
    const timeoutId = setTimeout(() => {
      this.removeListener(eventName, listener);
      console.warn(`Listener per evento '${eventName}' rimosso per timeout`);
    }, timeout);

    const wrappedListener = (...args) => {
      clearTimeout(timeoutId);
      return listener(...args);
    };

    this.on(eventName, wrappedListener);
    return this;
  }

  // Listener che si esegue solo una volta con condition
  onceWhen(eventName, condition, listener) {
    const wrappedListener = (...args) => {
      if (condition(...args)) {
        this.removeListener(eventName, wrappedListener);
        return listener(...args);
      }
    };

    this.on(eventName, wrappedListener);
    return this;
  }

  // Promise-based event waiting
  waitForEvent(eventName, timeout = 5000, condition = null) {
    return new Promise((resolve, reject) => {
      const timeoutId = setTimeout(() => {
        this.removeListener(eventName, listener);
        reject(new Error(`Timeout waiting for event '${eventName}'`));
      }, timeout);

      const listener = (...args) => {
        if (!condition || condition(...args)) {
          clearTimeout(timeoutId);
          this.removeListener(eventName, listener);
          resolve(args);
        }
      };

      this.on(eventName, listener);
    });
  }

  // Ottieni metriche e statistiche
  getMetrics() {
    return {
      events: Object.fromEntries(this.metrics),
      totalEvents: Array.from(this.metrics.values()).reduce(
        (sum, count) => sum + count,
        0,
      ),
      uniqueEvents: this.metrics.size,
      history: this.eventHistory ? this.eventHistory.slice(-10) : null, // Ultimi 10 eventi
    };
  }

  // Reset metriche
  resetMetrics() {
    this.metrics.clear();
    if (this.eventHistory) {
      this.eventHistory.length = 0;
    }
  }
}

// Implementazione pratica: Sistema di notifiche
class NotificationSystem extends AdvancedEventEmitter {
  constructor() {
    super({ keepHistory: true });
    this.channels = new Map();
    this.rateLimits = new Map();

    this.setupMiddleware();
    this.setupChannels();
  }

  setupMiddleware() {
    // Rate limiting middleware
    this.use(context => {
      const { eventName } = context;
      const now = Date.now();
      const windowMs = 60000; // 1 minuto
      const maxEvents = 100;

      if (!this.rateLimits.has(eventName)) {
        this.rateLimits.set(eventName, []);
      }

      const events = this.rateLimits.get(eventName);

      // Rimuovi eventi vecchi
      while (events.length > 0 && events[0] < now - windowMs) {
        events.shift();
      }

      if (events.length >= maxEvents) {
        console.warn(`Rate limit raggiunto per evento '${eventName}'`);
        context.stopPropagation = true;
        return;
      }

      events.push(now);
    });

    // Logging middleware
    this.use(context => {
      console.log(
        `[${new Date().toISOString()}] Event: ${context.eventName}`,
        context.args.length > 0 ? context.args : '',
      );
    });
  }

  setupChannels() {
    // Email channel
    this.channels.set('email', {
      send: async (recipient, message) => {
        // Simula invio email
        console.log(`📧 Sending email to ${recipient}:`, message);
        await new Promise(resolve => setTimeout(resolve, 100));
        return { success: true, channel: 'email', recipient };
      },
    });

    // SMS channel
    this.channels.set('sms', {
      send: async (recipient, message) => {
        console.log(`📱 Sending SMS to ${recipient}:`, message);
        await new Promise(resolve => setTimeout(resolve, 50));
        return { success: true, channel: 'sms', recipient };
      },
    });

    // Push notification channel
    this.channels.set('push', {
      send: async (recipient, message) => {
        console.log(`🔔 Sending push to ${recipient}:`, message);
        await new Promise(resolve => setTimeout(resolve, 25));
        return { success: true, channel: 'push', recipient };
      },
    });
  }

  async sendNotification(type, recipient, message, options = {}) {
    try {
      // Emetti evento pre-send
      this.emit('notification:sending', {
        type,
        recipient,
        message,
        options,
      });

      const channel = this.channels.get(type);
      if (!channel) {
        throw new Error(`Canale notifica '${type}' non supportato`);
      }

      const result = await channel.send(recipient, message);

      // Emetti evento success
      this.emit('notification:sent', {
        type,
        recipient,
        message,
        result,
      });

      return result;
    } catch (error) {
      // Emetti evento error
      this.emit('notification:failed', {
        type,
        recipient,
        message,
        error: error.message,
      });

      throw error;
    }
  }

  // Bulk notifications con controllo concorrenza
  async sendBulkNotifications(notifications, concurrency = 5) {
    const results = [];
    const executing = [];

    for (const notification of notifications) {
      const promise = this.sendNotification(
        notification.type,
        notification.recipient,
        notification.message,
        notification.options,
      );

      results.push(promise);

      if (results.length >= concurrency) {
        executing.push(promise);

        if (executing.length >= concurrency) {
          await Promise.race(executing);
          executing.splice(
            executing.findIndex(p => p === promise),
            1,
          );
        }
      }
    }

    // Aspetta che tutte le notifiche siano completate
    const finalResults = await Promise.allSettled(results);

    // Emetti statistiche finali
    this.emit('bulk:completed', {
      total: notifications.length,
      successful: finalResults.filter(r => r.status === 'fulfilled').length,
      failed: finalResults.filter(r => r.status === 'rejected').length,
    });

    return finalResults;
  }
}

// Utilizzo del sistema di notifiche
async function demonstrateNotificationSystem() {
  const notificationSystem = new NotificationSystem();

  // Setup listeners per monitoring
  notificationSystem.on('notification:sent', data => {
    console.log(`✅ Notifica inviata con successo:`, data.result);
  });

  notificationSystem.on('notification:failed', data => {
    console.error(`❌ Notifica fallita:`, data.error);
  });

  notificationSystem.on('bulk:completed', stats => {
    console.log(`📊 Bulk notification completato:`, stats);
  });

  try {
    // Notifica singola
    await notificationSystem.sendNotification(
      'email',
      'user@example.com',
      'Benvenuto nel nostro servizio!',
    );

    // Notifiche bulk
    const bulkNotifications = [
      { type: 'email', recipient: 'user1@example.com', message: 'Messaggio 1' },
      { type: 'sms', recipient: '+1234567890', message: 'Messaggio SMS' },
      { type: 'push', recipient: 'device123', message: 'Notifica push' },
    ];

    await notificationSystem.sendBulkNotifications(bulkNotifications);

    // Mostra metriche finali
    console.log('📈 Metriche sistema:', notificationSystem.getMetrics());
  } catch (error) {
    console.error('Errore nel sistema di notifiche:', error);
  }
}
```

## 6. Memory Management e Performance

### Monitoring e Ottimizzazione Memoria

```javascript
// Sistema completo per monitoring memoria e garbage collection
class MemoryManager {
  constructor(options = {}) {
    this.monitoringInterval = options.interval || 5000; // 5 secondi
    this.alertThresholds = {
      heapUsed: options.heapUsedThreshold || 0.8, // 80% dell'heap
      rss: options.rssThreshold || 1024 * 1024 * 1024, // 1GB RSS
      external: options.externalThreshold || 512 * 1024 * 1024, // 512MB external
    };

    this.metrics = [];
    this.maxMetrics = options.maxMetrics || 1000;
    this.alertCallbacks = [];
    this.isMonitoring = false;
    this.intervalId = null;

    this.setupGCListeners();
  }

  setupGCListeners() {
    // Listener per garbage collection events (richiede --expose-gc)
    if (global.gc) {
      const originalGC = global.gc;
      global.gc = (...args) => {
        const before = process.memoryUsage();
        const start = process.hrtime.bigint();

        const result = originalGC.apply(global, args);

        const after = process.memoryUsage();
        const duration = Number(process.hrtime.bigint() - start) / 1000000; // ms

        this.recordGCEvent({
          timestamp: new Date().toISOString(),
          duration,
          memoryBefore: before,
          memoryAfter: after,
          freedMemory: before.heapUsed - after.heapUsed,
        });

        return result;
      };
    }
  }

  recordGCEvent(gcEvent) {
    console.log(
      `🗑️  GC Event: ${gcEvent.freedMemory} bytes liberati in ${gcEvent.duration}ms`,
    );

    // Emetti evento per sistemi di monitoring esterni
    process.emit('gc-event', gcEvent);
  }

  // Ottiene snapshot dettagliato memoria
  getMemorySnapshot() {
    const memUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    return {
      timestamp: new Date().toISOString(),
      memory: {
        rss: {
          bytes: memUsage.rss,
          mb: Math.round((memUsage.rss / 1024 / 1024) * 100) / 100,
          description: 'Resident Set Size - memoria fisica totale',
        },
        heapTotal: {
          bytes: memUsage.heapTotal,
          mb: Math.round((memUsage.heapTotal / 1024 / 1024) * 100) / 100,
          description: 'Heap totale allocato da V8',
        },
        heapUsed: {
          bytes: memUsage.heapUsed,
          mb: Math.round((memUsage.heapUsed / 1024 / 1024) * 100) / 100,
          percentage: Math.round(
            (memUsage.heapUsed / memUsage.heapTotal) * 100,
          ),
          description: 'Heap attualmente in uso',
        },
        external: {
          bytes: memUsage.external,
          mb: Math.round((memUsage.external / 1024 / 1024) * 100) / 100,
          description: 'Memoria usata da oggetti C++ legati a JS',
        },
        arrayBuffers: {
          bytes: memUsage.arrayBuffers || 0,
          mb:
            Math.round(((memUsage.arrayBuffers || 0) / 1024 / 1024) * 100) /
            100,
          description: 'Memoria allocata per ArrayBuffers e SharedArrayBuffers',
        },
      },
      cpu: {
        user: cpuUsage.user,
        system: cpuUsage.system,
        userMs: Math.round(cpuUsage.user / 1000),
        systemMs: Math.round(cpuUsage.system / 1000),
      },
      uptime: process.uptime(),
      pid: process.pid,
    };
  }

  // Inizia monitoring continuo
  startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log(
      `🔍 Iniziando monitoring memoria ogni ${this.monitoringInterval}ms`,
    );

    this.intervalId = setInterval(() => {
      const snapshot = this.getMemorySnapshot();
      this.metrics.push(snapshot);

      // Mantieni solo le ultime N metriche
      if (this.metrics.length > this.maxMetrics) {
        this.metrics.shift();
      }

      // Controllo soglie di allarme
      this.checkAlerts(snapshot);
    }, this.monitoringInterval);
  }

  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    this.isMonitoring = false;
    console.log('⏹️  Monitoring memoria fermato');
  }

  checkAlerts(snapshot) {
    const { memory } = snapshot;

    // Alert per heap usage
    if (memory.heapUsed.percentage >= this.alertThresholds.heapUsed * 100) {
      this.triggerAlert('HIGH_HEAP_USAGE', {
        current: memory.heapUsed.percentage,
        threshold: this.alertThresholds.heapUsed * 100,
        recommendation:
          'Considerare garbage collection forzata o ottimizzazioni',
      });
    }

    // Alert per RSS
    if (memory.rss.bytes >= this.alertThresholds.rss) {
      this.triggerAlert('HIGH_RSS_USAGE', {
        current: memory.rss.mb,
        threshold: Math.round(this.alertThresholds.rss / 1024 / 1024),
        recommendation: 'Verificare memory leaks o ridurre utilizzo memoria',
      });
    }

    // Alert per memoria esterna
    if (memory.external.bytes >= this.alertThresholds.external) {
      this.triggerAlert('HIGH_EXTERNAL_MEMORY', {
        current: memory.external.mb,
        threshold: Math.round(this.alertThresholds.external / 1024 / 1024),
        recommendation: 'Verificare oggetti nativi e buffer',
      });
    }
  }

  triggerAlert(type, data) {
    const alert = {
      type,
      timestamp: new Date().toISOString(),
      ...data,
    };

    console.warn(`⚠️  MEMORY ALERT [${type}]:`, alert);

    // Notifica tutti i callback registrati
    for (const callback of this.alertCallbacks) {
      try {
        callback(alert);
      } catch (error) {
        console.error('Errore callback alert:', error);
      }
    }
  }

  // Registra callback per alert
  onAlert(callback) {
    this.alertCallbacks.push(callback);
  }

  // Forza garbage collection (richiede --expose-gc)
  forceGC() {
    if (global.gc) {
      const before = this.getMemorySnapshot();
      console.log('🗑️  Forzando garbage collection...');

      global.gc();

      const after = this.getMemorySnapshot();
      const freed = before.memory.heapUsed.bytes - after.memory.heapUsed.bytes;

      console.log(
        `✅ GC completato: ${Math.round(freed / 1024 / 1024)} MB liberati`,
      );
      return { before, after, freed };
    } else {
      console.warn('⚠️  GC non disponibile. Avvia Node.js con --expose-gc');
      return null;
    }
  }

  // Analizza trend memoria
  getMemoryTrend(minutes = 5) {
    const now = Date.now();
    const timeWindow = minutes * 60 * 1000;

    const recentMetrics = this.metrics.filter(metric => {
      const metricTime = new Date(metric.timestamp).getTime();
      return now - metricTime <= timeWindow;
    });

    if (recentMetrics.length < 2) {
      return {
        trend: 'insufficient_data',
        message: 'Dati insufficienti per analisi trend',
      };
    }

    const first = recentMetrics[0];
    const last = recentMetrics[recentMetrics.length - 1];

    const heapChange = last.memory.heapUsed.bytes - first.memory.heapUsed.bytes;
    const rssChange = last.memory.rss.bytes - first.memory.rss.bytes;

    return {
      trend:
        heapChange > 0
          ? 'increasing'
          : heapChange < 0
            ? 'decreasing'
            : 'stable',
      analysis: {
        timeWindow: `${minutes} minuti`,
        samplesCount: recentMetrics.length,
        heapChange: {
          bytes: heapChange,
          mb: Math.round((heapChange / 1024 / 1024) * 100) / 100,
        },
        rssChange: {
          bytes: rssChange,
          mb: Math.round((rssChange / 1024 / 1024) * 100) / 100,
        },
        avgHeapUsage: Math.round(
          recentMetrics.reduce(
            (sum, m) => sum + m.memory.heapUsed.percentage,
            0,
          ) / recentMetrics.length,
        ),
      },
    };
  }

  // Genera report completo
  generateReport() {
    const current = this.getMemorySnapshot();
    const trend = this.getMemoryTrend(10); // Ultimi 10 minuti

    return {
      generatedAt: new Date().toISOString(),
      current,
      trend,
      recommendations: this.generateRecommendations(current, trend),
      history: {
        totalSamples: this.metrics.length,
        oldestSample:
          this.metrics.length > 0 ? this.metrics[0].timestamp : null,
        newestSample:
          this.metrics.length > 0
            ? this.metrics[this.metrics.length - 1].timestamp
            : null,
      },
    };
  }

  generateRecommendations(current, trend) {
    const recommendations = [];

    // Raccomandazioni basate su utilizzo attuale
    if (current.memory.heapUsed.percentage > 80) {
      recommendations.push({
        priority: 'HIGH',
        category: 'MEMORY',
        message:
          'Heap usage >80%. Considerare ottimizzazioni o scaling verticale.',
        actions: [
          'Analizzare oggetti in memoria',
          'Implementare object pooling',
          'Forzare GC periodico',
        ],
      });
    }

    if (current.memory.external.mb > 500) {
      recommendations.push({
        priority: 'MEDIUM',
        category: 'EXTERNAL',
        message:
          'Alto utilizzo memoria esterna. Verificare buffer e oggetti nativi.',
        actions: [
          'Audit usage di Buffer',
          'Verificare addon nativi',
          'Controllare ArrayBuffer leaks',
        ],
      });
    }

    // Raccomandazioni basate su trend
    if (trend.trend === 'increasing' && trend.analysis.heapChange.mb > 50) {
      recommendations.push({
        priority: 'HIGH',
        category: 'LEAK',
        message: 'Possibile memory leak rilevato. Heap in crescita costante.',
        actions: [
          'Heap dump analysis',
          'Profiling con --inspect',
          'Review event listeners',
        ],
      });
    }

    return recommendations;
  }
}

// Utilizzo pratico del Memory Manager
async function demonstrateMemoryManagement() {
  const memoryManager = new MemoryManager({
    interval: 2000, // Check ogni 2 secondi
    heapUsedThreshold: 0.7, // Alert al 70%
    rssThreshold: 512 * 1024 * 1024, // Alert a 512MB RSS
  });

  // Setup alert handler
  memoryManager.onAlert(alert => {
    console.log('🚨 ALERT RICEVUTO:', alert);

    // In produzione, qui invieresti l'alert a sistemi di monitoring
    // come Prometheus, DataDog, CloudWatch, etc.
  });

  // Inizia monitoring
  memoryManager.startMonitoring();

  // Simula operazioni che consumano memoria
  console.log('🧪 Simulando carico memoria...');

  const largeObjects = [];
  for (let i = 0; i < 100; i++) {
    // Crea oggetti grandi per testare il sistema
    const largeArray = new Array(100000).fill(0).map((_, idx) => ({
      id: idx,
      data: Math.random().toString(36),
      timestamp: new Date().toISOString(),
    }));

    largeObjects.push(largeArray);

    // Breve pausa per permettere al monitoring di raccogliere dati
    await new Promise(resolve => setTimeout(resolve, 1000));

    if (i % 20 === 0) {
      console.log(`📊 Iterazione ${i}/100 completata`);
      const snapshot = memoryManager.getMemorySnapshot();
      console.log(
        `💾 Heap: ${snapshot.memory.heapUsed.mb}MB (${snapshot.memory.heapUsed.percentage}%)`,
      );
    }
  }

  // Attendi un po' per raccogliere metriche
  await new Promise(resolve => setTimeout(resolve, 10000));

  // Genera report finale
  console.log('\n📋 REPORT FINALE:');
  const report = memoryManager.generateReport();
  console.log(JSON.stringify(report, null, 2));

  // Cleanup
  memoryManager.stopMonitoring();

  // Forza GC per liberare memoria
  memoryManager.forceGC();
}
```

## Cheat Sheet - Quick Reference per Colloqui

### Domande Frequenti e Risposte

| Domanda                                              | Risposta Concisa                                                                  | Dettaglio Importante                                    |
| ---------------------------------------------------- | --------------------------------------------------------------------------------- | ------------------------------------------------------- |
| "Differenza tra process.nextTick() e setImmediate()" | nextTick ha priorità più alta e viene eseguito prima di ogni fase dell'event loop | nextTick può causare starvation se usato eccessivamente |
| "Come gestire memory leak in Node.js?"               | Monitoring con process.memoryUsage(), heap dumps, evitare listener non rimossi    | Usare WeakMap/WeakSet per riferimenti deboli            |
| "Quando usare Worker Threads vs Child Process?"      | Worker Threads per CPU-intensive JS, Child Process per binari esterni             | Worker Threads condividono memoria, Child Process no    |
| "Come ottimizzare performance I/O?"                  | Stream per file grandi, connection pooling, caching strategico                    | Sempre usare fs.promises o stream per I/O non-bloccante |
| "Differenza tra CommonJS e ES Modules?"              | CommonJS sync a runtime, ES Modules async a compile-time                          | ES Modules permettono tree-shaking e static analysis    |

### Pattern di Codice Essenziali

```javascript
// ✅ Gestione Errori Robusta
async function robustOperation() {
  try {
    const result = await riskyOperation();
    return { success: true, data: result };
  } catch (error) {
    console.error('Operation failed:', error);
    return { success: false, error: error.message };
  }
}

// ✅ Event Loop Non-Bloccante
async function processLargeDataset(data) {
  const results = [];
  for (let i = 0; i < data.length; i++) {
    results.push(await processItem(data[i]));

    // Yield al event loop ogni 1000 item
    if (i % 1000 === 0) {
      await new Promise(resolve => setImmediate(resolve));
    }
  }
  return results;
}

// ✅ Stream Processing Pattern
const { pipeline } = require('stream/promises');

async function processFileStream(inputPath, outputPath) {
  await pipeline(
    fs.createReadStream(inputPath),
    new TransformStream(),
    fs.createWriteStream(outputPath),
  );
}

// ✅ Memory-Safe Event Emitter
class SafeEventEmitter extends EventEmitter {
  constructor() {
    super();
    this.setMaxListeners(20); // Previene warning

    // Auto-cleanup
    this.cleanupTimer = setInterval(() => {
      this.removeAllListeners('temporary-event');
    }, 60000);
  }

  destroy() {
    this.removeAllListeners();
    if (this.cleanupTimer) {
      clearInterval(this.cleanupTimer);
    }
  }
}
```

### Performance Benchmarks di Riferimento

| Operazione        | Tempo Target  | Note Ottimizzazione                        |
| ----------------- | ------------- | ------------------------------------------ |
| File Read (< 1MB) | < 10ms        | Usa fs.promises, considera caching         |
| Database Query    | < 50ms        | Connection pooling, query optimization     |
| HTTP Response     | < 100ms       | Keep-alive, compression, CDN               |
| Memory Allocation | < 1ms per 1MB | Object pooling per allocazioni frequenti   |
| JSON Parse (1MB)  | < 20ms        | Considera streaming parser per file grandi |

### Debugging Commands

```bash
# Memory profiling
node --inspect --expose-gc app.js

# CPU profiling
node --prof app.js
node --prof-process isolate-*.log > profile.txt

# Heap snapshot
node --inspect --heap-prof app.js

# Event loop monitoring
node --trace-warnings app.js
```

## Esercizi Pratici per Colloqui

### Esercizio 1: Sistema di Monitoring Real-time

**Scenario**: Devi implementare un sistema che monitora la performance di un'API Node.js in produzione.

**Requisiti**:

- Traccia response time, memory usage, CPU usage ogni richiesta
- Emetti alert quando soglie vengono superate
- Mantieni metriche aggregate (media, percentili)
- Esponi endpoint /health e /metrics per monitoring esterno

**Punti chiave da dimostrare**:

- Event Loop non-bloccante durante monitoring
- Memory-efficient data structures per metriche
- Proper error handling e graceful degradation

### Esercizio 2: File Processing Pipeline

**Scenario**: Processa file CSV di milioni di righe senza consumare troppa memoria.

**Requisiti**:

- Leggi, trasforma e scrivi file usando Stream API
- Implementa backpressure handling
- Aggiungi error recovery per righe malformate
- Progress reporting via WebSocket o Server-Sent Events

**Punti chiave da dimostrare**:

- Stream API mastery
- Async iteration patterns
- Memory management per large datasets

### Esercizio 3: Event-Driven Architecture

**Scenario**: Sistema di notifiche che gestisce milioni di utenti.

**Requisiti**:

- Event Emitter personalizzato con rate limiting
- Multiple delivery channels (email, SMS, push)
- Retry logic con exponential backoff
- Metrics e monitoring per delivery success rate

**Punti chiave da dimostrare**:

- Observer pattern implementation
- Async concurrency control
- Production-ready error handling

---

_Questa guida ti fornisce le basi solide necessarie per affrontare con sicurezza qualsiasi colloquio tecnico per posizioni senior Node.js. Ricorda: la pratica costante e la comprensione profonda dei concetti sono più importanti della memorizzazione di sintassi._
