# RabbitMQ e Message Queues

## Introduzione: Perché i Message Queues Sono Essenziali

Nelle architetture moderne a microservizi, i message queues rappresentano la spina dorsale della comunicazione asincrona. Pensa ai message queues come al sistema postale di una grande città: invece di costringere ogni cittadino ad andare personalmente a consegnare ogni messaggio (comunicazione sincrona), il sistema postale raccoglie, smista e consegna i messaggi in modo efficiente e affidabile (comunicazione asincrona).

RabbitMQ, basato sul protocollo AMQP (Advanced Message Queuing Protocol), è uno dei message broker più robusti e versatili disponibili. Come senior developer, padroneggiare RabbitMQ significa saper progettare sistemi che possano scalare orizzontalmente, gestire picchi di traffico, e mantenere la resilienza anche quando singoli componenti falliscono.

## 1. Fondamenti AMQP e Architettura RabbitMQ

### Il Modello AMQP

AMQP non è semplicemente una queue - è un intero ecosystem per l'elaborazione dei messaggi che definisce come producer, consumer, broker e messaggi interagiscono tra loro.

```
Producer → Exchange → Queue → Consumer

Il flusso non è diretto Producer→Queue come molti pensano!
```

### Componenti Fondamentali

```javascript
// Setup connessione RabbitMQ con configurazioni production-ready
import amqp from 'amqplib';

class RabbitMQManager {
  constructor(config = {}) {
    this.config = {
      hostname: config.hostname || 'localhost',
      port: config.port || 5672,
      username: config.username || 'guest',
      password: config.password || 'guest',
      vhost: config.vhost || '/',
      // Configurazioni avanzate per produzione
      heartbeat: config.heartbeat || 60, // Secondi
      connectionTimeout: config.connectionTimeout || 10000, // 10s
      channelMax: config.channelMax || 1000,
      frameMax: config.frameMax || 0, // No limit
    };

    this.connection = null;
    this.channels = new Map(); // Pool di canali
    this.reconnectAttempts = 0;
    this.maxReconnectAttempts = 10;
    this.reconnectDelay = 5000; // 5 secondi base delay
  }

  // Connessione robusta con retry automatico
  async connect() {
    try {
      console.log('🔗 Tentando connessione a RabbitMQ...');

      this.connection = await amqp.connect({
        protocol: 'amqp',
        ...this.config,
      });

      console.log('✅ Connessione RabbitMQ stabilita');
      this.reconnectAttempts = 0;

      // Setup listeners per gestire disconnessioni
      this.connection.on('error', this.handleConnectionError.bind(this));
      this.connection.on('close', this.handleConnectionClose.bind(this));

      return this.connection;
    } catch (error) {
      console.error('❌ Errore connessione RabbitMQ:', error.message);
      await this.handleReconnection();
    }
  }

  async handleConnectionError(error) {
    console.error('🚨 RabbitMQ connection error:', error);

    // Chiudi tutti i canali aperti
    for (const [channelId, channel] of this.channels) {
      try {
        await channel.close();
      } catch (closeError) {
        console.error(`Errore chiusura canale ${channelId}:`, closeError);
      }
    }
    this.channels.clear();
  }

  async handleConnectionClose() {
    console.warn('⚠️  Connessione RabbitMQ chiusa, tentando riconnessione...');
    await this.handleReconnection();
  }

  async handleReconnection() {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      console.error('💥 Max tentativi di riconnessione raggiunti');
      process.emit('rabbitmq-connection-failed');
      return;
    }

    this.reconnectAttempts++;
    const delay = this.reconnectDelay * Math.pow(2, this.reconnectAttempts - 1); // Exponential backoff

    console.log(
      `🔄 Tentativo riconnessione ${this.reconnectAttempts}/${this.maxReconnectAttempts} in ${delay}ms`,
    );

    setTimeout(() => {
      this.connect();
    }, delay);
  }

  // Creazione canale con pooling
  async createChannel(channelId = null) {
    if (!this.connection) {
      throw new Error('Connessione RabbitMQ non stabilita');
    }

    const id =
      channelId ||
      `channel_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;

    try {
      const channel = await this.connection.createChannel();

      // Configurazioni canale per performance
      await channel.prefetch(10); // Prefetch limit per consumer

      // Error handling per il canale
      channel.on('error', error => {
        console.error(`Errore canale ${id}:`, error);
        this.channels.delete(id);
      });

      channel.on('close', () => {
        console.log(`Canale ${id} chiuso`);
        this.channels.delete(id);
      });

      this.channels.set(id, channel);
      return { channel, channelId: id };
    } catch (error) {
      console.error('Errore creazione canale:', error);
      throw error;
    }
  }

  // Graceful shutdown
  async disconnect() {
    console.log('🔌 Chiudendo connessioni RabbitMQ...');

    // Chiudi tutti i canali
    const closePromises = Array.from(this.channels.entries()).map(
      async ([id, channel]) => {
        try {
          await channel.close();
          console.log(`✅ Canale ${id} chiuso`);
        } catch (error) {
          console.error(`❌ Errore chiusura canale ${id}:`, error);
        }
      },
    );

    await Promise.all(closePromises);

    // Chiudi connessione principale
    if (this.connection) {
      try {
        await this.connection.close();
        console.log('✅ Connessione RabbitMQ chiusa correttamente');
      } catch (error) {
        console.error('❌ Errore chiusura connessione:', error);
      }
    }
  }
}
```

### Exchange Types e Routing Strategies

RabbitMQ utilizza diversi tipi di exchange per determinare come i messaggi vengono instradati alle queue. Comprendere questi pattern è cruciale per architettare sistemi di messaging efficaci.

```javascript
// Gestione avanzata di Exchange e Routing
class MessageRouter {
  constructor(rabbitManager) {
    this.rabbitManager = rabbitManager;
    this.exchanges = new Map();
    this.bindings = new Map();
  }

  // Setup Exchange Direct - routing basato su exact match
  async setupDirectExchange(exchangeName, options = {}) {
    const { channel } = await this.rabbitManager.createChannel(
      `direct_${exchangeName}`,
    );

    await channel.assertExchange(exchangeName, 'direct', {
      durable: true, // Sopravvive al restart del broker
      autoDelete: false, // Non cancellare automaticamente
      internal: false, // Può ricevere messaggi da producer esterni
      ...options,
    });

    this.exchanges.set(exchangeName, { type: 'direct', channel });

    console.log(`📮 Direct Exchange '${exchangeName}' configurato`);
    return channel;
  }

  // Setup Exchange Topic - routing basato su pattern matching
  async setupTopicExchange(exchangeName, options = {}) {
    const { channel } = await this.rabbitManager.createChannel(
      `topic_${exchangeName}`,
    );

    await channel.assertExchange(exchangeName, 'topic', {
      durable: true,
      autoDelete: false,
      ...options,
    });

    this.exchanges.set(exchangeName, { type: 'topic', channel });

    console.log(`🏷️  Topic Exchange '${exchangeName}' configurato`);
    return channel;
  }

  // Setup Exchange Fanout - broadcast a tutte le queue
  async setupFanoutExchange(exchangeName, options = {}) {
    const { channel } = await this.rabbitManager.createChannel(
      `fanout_${exchangeName}`,
    );

    await channel.assertExchange(exchangeName, 'fanout', {
      durable: true,
      autoDelete: false,
      ...options,
    });

    this.exchanges.set(exchangeName, { type: 'fanout', channel });

    console.log(`📢 Fanout Exchange '${exchangeName}' configurato`);
    return channel;
  }

  // Setup Exchange Headers - routing basato su header match
  async setupHeadersExchange(exchangeName, options = {}) {
    const { channel } = await this.rabbitManager.createChannel(
      `headers_${exchangeName}`,
    );

    await channel.assertExchange(exchangeName, 'headers', {
      durable: true,
      autoDelete: false,
      ...options,
    });

    this.exchanges.set(exchangeName, { type: 'headers', channel });

    console.log(`📋 Headers Exchange '${exchangeName}' configurato`);
    return channel;
  }

  // Bind Queue con routing personalizzato
  async bindQueue(queueName, exchangeName, routingKey, options = {}) {
    const exchange = this.exchanges.get(exchangeName);
    if (!exchange) {
      throw new Error(`Exchange '${exchangeName}' non trovato`);
    }

    // Assicura che la queue esista
    await exchange.channel.assertQueue(queueName, {
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-message-ttl': options.messageTTL || 3600000, // 1 ora default
        'x-dead-letter-exchange': options.deadLetterExchange || '',
        'x-max-length': options.maxLength || 10000,
        ...options.queueArguments,
      },
    });

    // Crea binding
    await exchange.channel.bindQueue(
      queueName,
      exchangeName,
      routingKey,
      options.bindingArguments,
    );

    const bindingId = `${queueName}:${exchangeName}:${routingKey}`;
    this.bindings.set(bindingId, {
      queue: queueName,
      exchange: exchangeName,
      routingKey,
      options,
    });

    console.log(`🔗 Binding creato: ${bindingId}`);
  }

  // Esempi pratici di routing patterns
  async setupEcommerceRouting() {
    // Direct Exchange per comandi specifici
    await this.setupDirectExchange('ecommerce.commands');

    // Topic Exchange per eventi di dominio
    await this.setupTopicExchange('ecommerce.events');

    // Fanout Exchange per notifiche broadcast
    await this.setupFanoutExchange('ecommerce.notifications');

    // Setup routing per ordini
    await this.bindQueue(
      'order.processing',
      'ecommerce.commands',
      'order.create',
    );
    await this.bindQueue(
      'order.processing',
      'ecommerce.commands',
      'order.update',
    );

    // Setup routing per eventi con pattern matching
    await this.bindQueue('analytics.orders', 'ecommerce.events', 'order.*'); // Tutti gli eventi ordini
    await this.bindQueue(
      'inventory.updates',
      'ecommerce.events',
      '*.inventory.*',
    ); // Eventi inventory

    // Setup notifiche broadcast
    await this.bindQueue('email.notifications', 'ecommerce.notifications', '');
    await this.bindQueue('sms.notifications', 'ecommerce.notifications', '');
    await this.bindQueue('push.notifications', 'ecommerce.notifications', '');

    console.log('🏪 Setup routing e-commerce completato');
  }
}
```

### Diagramma Architettura RabbitMQ

```
┌─────────────┐    ┌──────────────────────────────────┐    ┌─────────────┐
│  Producer   │    │            BROKER                │    │  Consumer   │
│             │    │                                  │    │             │
│ publish()   │───▶│  ┌─────────┐    ┌──────────────┐ │───▶│ consume()   │
│             │    │  │Exchange │───▶│    Queue     │ │    │             │
└─────────────┘    │  │         │    │              │ │    └─────────────┘
                   │  │ • Direct│    │ • Durable    │ │
┌─────────────┐    │  │ • Topic │    │ • Exclusive  │ │    ┌─────────────┐
│  Producer   │    │  │ • Fanout│    │ • AutoDelete │ │    │  Consumer   │
│             │───▶│  │ • Headers    │ • Arguments  │ │───▶│             │
│ publish()   │    │  └─────────┘    └──────────────┘ │    │ consume()   │
│             │    │       │                ▲        │    │             │
└─────────────┘    │       ▼                │        │    └─────────────┘
                   │  ┌─────────────────────┐        │
                   │  │   Routing Rules     │        │
                   │  │ • Binding Keys      │        │
                   │  │ • Header Matching   │        │
                   │  │ • Pattern Matching  │        │
                   │  └─────────────────────┘        │
                   └──────────────────────────────────┘
```

## 2. Pattern di Messaging Avanzati

### Work Queues Pattern con Load Balancing

```javascript
// Producer per Work Queues con priorità e persistence
class WorkQueueProducer {
  constructor(rabbitManager, queueName) {
    this.rabbitManager = rabbitManager;
    this.queueName = queueName;
    this.channel = null;
    this.messageId = 0;
  }

  async initialize() {
    const { channel } = await this.rabbitManager.createChannel(
      `producer_${this.queueName}`,
    );
    this.channel = channel;

    // Configura queue con opzioni avanzate
    await this.channel.assertQueue(this.queueName, {
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-message-ttl': 3600000, // 1 ora TTL
        'x-max-length': 10000, // Max 10k messaggi in coda
        'x-overflow': 'reject-publish', // Comportamento quando pieno
        'x-dead-letter-exchange': 'failed-jobs', // DLX per job falliti
        'x-dead-letter-routing-key': this.queueName,
      },
    });

    console.log(`✅ Work Queue Producer inizializzato: ${this.queueName}`);
  }

  // Pubblica job con metadati avanzati
  async publishJob(jobData, options = {}) {
    if (!this.channel) {
      throw new Error('Producer non inizializzato');
    }

    const messageId = `job_${++this.messageId}_${Date.now()}`;
    const message = {
      id: messageId,
      data: jobData,
      createdAt: new Date().toISOString(),
      attempts: 0,
      priority: options.priority || 0,
      retryable: options.retryable !== false,
      maxRetries: options.maxRetries || 3,
      timeout: options.timeout || 30000,
      tags: options.tags || [],
      correlationId: options.correlationId || messageId,
    };

    const publishOptions = {
      persistent: true, // Messaggi persistenti
      messageId: messageId,
      timestamp: Date.now(),
      priority: options.priority || 0,
      expiration: options.expiration || 3600000, // 1 ora
      headers: {
        'x-retry-count': 0,
        'x-original-queue': this.queueName,
        'x-job-type': options.jobType || 'generic',
        ...options.headers,
      },
    };

    try {
      const published = this.channel.sendToQueue(
        this.queueName,
        Buffer.from(JSON.stringify(message)),
        publishOptions,
      );

      if (!published) {
        console.warn(
          `⚠️  Messaggio ${messageId} in buffer - possibile backpressure`,
        );
      }

      console.log(
        `📤 Job pubblicato: ${messageId} (priorità: ${options.priority || 0})`,
      );
      return messageId;
    } catch (error) {
      console.error(`❌ Errore pubblicazione job ${messageId}:`, error);
      throw error;
    }
  }

  // Batch publishing per performance
  async publishJobsBatch(jobs, options = {}) {
    const batchSize = options.batchSize || 100;
    const results = [];

    for (let i = 0; i < jobs.length; i += batchSize) {
      const batch = jobs.slice(i, i + batchSize);

      const batchPromises = batch.map(job =>
        this.publishJob(job.data, { ...options, ...job.options }),
      );

      try {
        const batchResults = await Promise.all(batchPromises);
        results.push(...batchResults);

        console.log(
          `📦 Batch ${Math.floor(i / batchSize) + 1} pubblicato: ${batch.length} job`,
        );

        // Pausa tra batch per evitare sovraccarico
        if (i + batchSize < jobs.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }
      } catch (error) {
        console.error(
          `❌ Errore batch ${Math.floor(i / batchSize) + 1}:`,
          error,
        );
        throw error;
      }
    }

    return results;
  }
}

// Consumer per Work Queues con processing robusto
class WorkQueueConsumer {
  constructor(rabbitManager, queueName, jobProcessor) {
    this.rabbitManager = rabbitManager;
    this.queueName = queueName;
    this.jobProcessor = jobProcessor;
    this.channel = null;
    this.isConsuming = false;
    this.processedCount = 0;
    this.failedCount = 0;
    this.startTime = Date.now();
  }

  async initialize(concurrency = 5) {
    const { channel } = await this.rabbitManager.createChannel(
      `consumer_${this.queueName}`,
    );
    this.channel = channel;

    // Configurazione canale per performance
    await this.channel.prefetch(concurrency); // Limita messaggi non-ack

    // Assicura che la queue esista
    await this.channel.assertQueue(this.queueName, {
      durable: true,
      exclusive: false,
      autoDelete: false,
    });

    console.log(
      `✅ Work Queue Consumer inizializzato: ${this.queueName} (concurrency: ${concurrency})`,
    );
  }

  // Inizia consuming con gestione errori avanzata
  async startConsuming() {
    if (!this.channel) {
      throw new Error('Consumer non inizializzato');
    }

    if (this.isConsuming) {
      console.warn('⚠️  Consumer già attivo');
      return;
    }

    this.isConsuming = true;
    console.log(`🔄 Iniziando consuming dalla queue: ${this.queueName}`);

    await this.channel.consume(
      this.queueName,
      async message => {
        if (message) {
          await this.processMessage(message);
        }
      },
      {
        noAck: false, // Richiede acknowledgment esplicito
      },
    );
  }

  async processMessage(message) {
    let job = null;
    const startTime = Date.now();

    try {
      // Parse messaggio
      job = JSON.parse(message.content.toString());
      const retryCount = parseInt(
        message.properties.headers['x-retry-count'] || 0,
      );

      console.log(`🔧 Processing job ${job.id} (tentativo ${retryCount + 1})`);

      // Timeout handling
      const processingPromise = this.jobProcessor(job.data, {
        jobId: job.id,
        attempt: retryCount + 1,
        correlationId: job.correlationId,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('Job timeout')),
          job.timeout || 30000,
        );
      });

      // Esegui job con timeout
      const result = await Promise.race([processingPromise, timeoutPromise]);

      // Job completato con successo
      const processingTime = Date.now() - startTime;
      console.log(`✅ Job ${job.id} completato in ${processingTime}ms`);

      this.channel.ack(message);
      this.processedCount++;

      // Emetti evento successo per monitoring
      process.emit('job-completed', {
        jobId: job.id,
        processingTime,
        result,
      });
    } catch (error) {
      await this.handleJobError(message, job, error);
    }
  }

  async handleJobError(message, job, error) {
    const retryCount = parseInt(
      message.properties.headers['x-retry-count'] || 0,
    );
    const maxRetries = job?.maxRetries || 3;

    console.error(`❌ Errore processing job ${job?.id}:`, error.message);

    if (job?.retryable && retryCount < maxRetries) {
      // Retry con backoff exponential
      await this.retryJob(message, job, retryCount + 1);
    } else {
      // Job definitivamente fallito
      await this.handleJobFailure(message, job, error);
    }
  }

  async retryJob(message, job, retryCount) {
    try {
      const delay = Math.min(1000 * Math.pow(2, retryCount - 1), 60000); // Max 1 minuto

      console.log(
        `🔄 Retry job ${job.id} tra ${delay}ms (tentativo ${retryCount})`,
      );

      // Republish con delay e retry count aggiornato
      setTimeout(async () => {
        try {
          await this.channel.sendToQueue(this.queueName, message.content, {
            ...message.properties,
            headers: {
              ...message.properties.headers,
              'x-retry-count': retryCount,
              'x-retry-timestamp': new Date().toISOString(),
            },
          });

          this.channel.ack(message);
        } catch (retryError) {
          console.error(`❌ Errore retry job ${job.id}:`, retryError);
          this.channel.nack(message, false, false); // Invia a DLX
        }
      }, delay);
    } catch (error) {
      console.error(`❌ Errore setup retry:`, error);
      this.channel.nack(message, false, false);
    }
  }

  async handleJobFailure(message, job, error) {
    console.error(
      `💥 Job ${job?.id} definitivamente fallito dopo ${message.properties.headers['x-retry-count'] || 0} tentativi`,
    );

    // Log per audit e debugging
    const failureRecord = {
      jobId: job?.id,
      originalQueue: this.queueName,
      error: error.message,
      retryCount: message.properties.headers['x-retry-count'] || 0,
      failedAt: new Date().toISOString(),
      jobData: job?.data,
    };

    // Emetti evento per sistemi di monitoring
    process.emit('job-failed', failureRecord);

    // NACK senza requeue - andrà al Dead Letter Exchange se configurato
    this.channel.nack(message, false, false);
    this.failedCount++;
  }

  // Stop consuming gracefully
  async stopConsuming() {
    if (!this.isConsuming) return;

    console.log(`🛑 Fermando consumer per queue: ${this.queueName}`);
    this.isConsuming = false;

    if (this.channel) {
      await this.channel.cancel(); // Ferma consuming
    }
  }

  // Ottieni statistiche consumer
  getStats() {
    const uptime = Date.now() - this.startTime;
    const processingRate =
      this.processedCount > 0 ? uptime / this.processedCount : 0;

    return {
      queue: this.queueName,
      processed: this.processedCount,
      failed: this.failedCount,
      successRate:
        this.processedCount / (this.processedCount + this.failedCount) || 0,
      uptime,
      averageProcessingTime: processingRate,
      isActive: this.isConsuming,
    };
  }
}
```

### Publish/Subscribe Pattern per Event Broadcasting

```javascript
// Event Broadcasting System con Topic Exchange
class EventBroadcaster {
  constructor(rabbitManager) {
    this.rabbitManager = rabbitManager;
    this.exchangeName = 'events';
    this.channel = null;
    this.eventTypes = new Set();
  }

  async initialize() {
    const { channel } = await this.rabbitManager.createChannel(
      `broadcaster_${this.exchangeName}`,
    );
    this.channel = channel;

    // Setup Topic Exchange per pattern matching flessibile
    await this.channel.assertExchange(this.exchangeName, 'topic', {
      durable: true,
      autoDelete: false,
    });

    console.log(
      `📡 Event Broadcaster inizializzato su exchange: ${this.exchangeName}`,
    );
  }

  // Pubblica evento con routing intelligente
  async publishEvent(eventType, payload, metadata = {}) {
    if (!this.channel) {
      throw new Error('Broadcaster non inizializzato');
    }

    const eventId = `evt_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const routingKey = this.generateRoutingKey(eventType);

    const event = {
      id: eventId,
      type: eventType,
      payload,
      metadata: {
        publishedAt: new Date().toISOString(),
        version: metadata.version || '1.0',
        source: metadata.source || 'unknown',
        correlationId: metadata.correlationId || eventId,
        ...metadata,
      },
    };

    try {
      const published = this.channel.publish(
        this.exchangeName,
        routingKey,
        Buffer.from(JSON.stringify(event)),
        {
          persistent: true,
          messageId: eventId,
          timestamp: Date.now(),
          type: eventType,
          headers: {
            'event-version': event.metadata.version,
            'event-source': event.metadata.source,
            'correlation-id': event.metadata.correlationId,
          },
        },
      );

      if (!published) {
        console.warn(
          `⚠️  Evento ${eventId} in buffer - possibile backpressure`,
        );
      }

      this.eventTypes.add(eventType);
      console.log(`📤 Evento pubblicato: ${eventType} (${eventId})`);

      return eventId;
    } catch (error) {
      console.error(`❌ Errore pubblicazione evento ${eventType}:`, error);
      throw error;
    }
  }

  // Genera routing key gerarchica per topic matching
  generateRoutingKey(eventType) {
    // Converte "UserRegistered" in "user.registered"
    return eventType.replace(/([a-z])([A-Z])/g, '$1.$2').toLowerCase();
  }

  // Batch publishing per eventi correlati
  async publishEventBatch(events, options = {}) {
    const results = [];
    const batchId = `batch_${Date.now()}`;

    console.log(`📦 Pubblicando batch ${batchId}: ${events.length} eventi`);

    for (const event of events) {
      try {
        const eventId = await this.publishEvent(event.type, event.payload, {
          ...event.metadata,
          batchId,
          correlationId: event.metadata?.correlationId || batchId,
        });

        results.push({ success: true, eventId, type: event.type });
      } catch (error) {
        console.error(`❌ Errore pubblicazione evento batch:`, error);
        results.push({
          success: false,
          error: error.message,
          type: event.type,
        });
      }
    }

    const successful = results.filter(r => r.success).length;
    console.log(
      `✅ Batch ${batchId} completato: ${successful}/${events.length} eventi pubblicati`,
    );

    return results;
  }

  // Event replay per recovery o debugging
  async replayEvents(eventTypes, fromTimestamp, metadata = {}) {
    console.log(
      `🔄 Replay eventi ${eventTypes.join(', ')} da ${fromTimestamp}`,
    );

    // In un sistema reale, questi eventi verrebbero letti da event store
    // Qui simuliamo il processo
    const replayBatch = eventTypes.map(type => ({
      type: `${type}Replayed`,
      payload: { originalType: type, replayedAt: new Date().toISOString() },
      metadata: {
        ...metadata,
        isReplay: true,
        originalTimestamp: fromTimestamp,
      },
    }));

    return await this.publishEventBatch(replayBatch);
  }
}

// Event Subscriber con pattern matching avanzato
class EventSubscriber {
  constructor(rabbitManager, subscriberName) {
    this.rabbitManager = rabbitManager;
    this.subscriberName = subscriberName;
    this.exchangeName = 'events';
    this.channel = null;
    this.subscriptions = new Map();
    this.handlers = new Map();
    this.eventStats = new Map();
  }

  async initialize() {
    const { channel } = await this.rabbitManager.createChannel(
      `subscriber_${this.subscriberName}`,
    );
    this.channel = channel;

    // Configurazione per performance
    await this.channel.prefetch(10);

    console.log(`🎯 Event Subscriber '${this.subscriberName}' inizializzato`);
  }

  // Sottoscrizione con pattern matching
  async subscribe(eventPattern, handler, options = {}) {
    if (!this.channel) {
      throw new Error('Subscriber non inizializzato');
    }

    const queueName = `${this.subscriberName}.${eventPattern.replace(/[.*]/g, '_')}`;
    const subscriptionId = `${eventPattern}:${queueName}`;

    // Crea queue dedicata per questa subscription
    await this.channel.assertQueue(queueName, {
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-message-ttl': options.messageTTL || 3600000,
        'x-max-length': options.maxLength || 1000,
      },
    });

    // Bind queue all'exchange con pattern
    await this.channel.bindQueue(queueName, this.exchangeName, eventPattern);

    // Registra handler
    this.handlers.set(subscriptionId, {
      pattern: eventPattern,
      handler,
      options,
      stats: { processed: 0, errors: 0 },
    });

    // Setup consumer
    await this.channel.consume(
      queueName,
      async message => {
        if (message) {
          await this.processEvent(message, subscriptionId);
        }
      },
      {
        noAck: false,
      },
    );

    this.subscriptions.set(subscriptionId, queueName);
    console.log(`✅ Sottoscrizione attiva: ${eventPattern} → ${queueName}`);

    return subscriptionId;
  }

  async processEvent(message, subscriptionId) {
    const handlerInfo = this.handlers.get(subscriptionId);
    if (!handlerInfo) {
      console.error(
        `❌ Handler non trovato per subscription: ${subscriptionId}`,
      );
      this.channel.nack(message, false, false);
      return;
    }

    let event = null;
    const startTime = Date.now();

    try {
      // Parse evento
      event = JSON.parse(message.content.toString());

      console.log(`📥 Processando evento: ${event.type} (${event.id})`);

      // Esegui handler con timeout
      const processingPromise = handlerInfo.handler(event.payload, {
        eventId: event.id,
        eventType: event.type,
        metadata: event.metadata,
        routingKey: message.fields.routingKey,
      });

      const timeout = handlerInfo.options.timeout || 30000;
      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(() => reject(new Error('Handler timeout')), timeout);
      });

      await Promise.race([processingPromise, timeoutPromise]);

      // Successo
      const processingTime = Date.now() - startTime;
      console.log(`✅ Evento ${event.type} processato in ${processingTime}ms`);

      handlerInfo.stats.processed++;
      this.updateEventStats(event.type, 'processed', processingTime);

      this.channel.ack(message);
    } catch (error) {
      console.error(`❌ Errore processing evento ${event?.type}:`, error);

      handlerInfo.stats.errors++;
      this.updateEventStats(event?.type, 'error');

      // Gestione retry basata su configurazione
      if (handlerInfo.options.retry !== false) {
        await this.handleEventRetry(message, event, subscriptionId);
      } else {
        this.channel.nack(message, false, false);
      }
    }
  }

  async handleEventRetry(message, event, subscriptionId) {
    const retryCount = parseInt(
      message.properties.headers?.['x-retry-count'] || 0,
    );
    const maxRetries =
      this.handlers.get(subscriptionId)?.options?.maxRetries || 3;

    if (retryCount < maxRetries) {
      // Retry con delay
      const delay = Math.min(1000 * Math.pow(2, retryCount), 30000);

      setTimeout(async () => {
        try {
          await this.channel.publish(
            this.exchangeName,
            message.fields.routingKey,
            message.content,
            {
              ...message.properties,
              headers: {
                ...message.properties.headers,
                'x-retry-count': retryCount + 1,
              },
            },
          );

          this.channel.ack(message);
        } catch (retryError) {
          console.error('❌ Errore retry evento:', retryError);
          this.channel.nack(message, false, false);
        }
      }, delay);
    } else {
      // Troppi retry, invia a DLQ
      console.error(
        `💥 Evento ${event?.type} fallito definitivamente dopo ${retryCount} tentativi`,
      );
      this.channel.nack(message, false, false);
    }
  }

  updateEventStats(eventType, status, processingTime = null) {
    if (!this.eventStats.has(eventType)) {
      this.eventStats.set(eventType, {
        processed: 0,
        errors: 0,
        totalProcessingTime: 0,
        avgProcessingTime: 0,
      });
    }

    const stats = this.eventStats.get(eventType);

    if (status === 'processed') {
      stats.processed++;
      stats.totalProcessingTime += processingTime;
      stats.avgProcessingTime = stats.totalProcessingTime / stats.processed;
    } else if (status === 'error') {
      stats.errors++;
    }
  }

  // Rimuovi sottoscrizione
  async unsubscribe(subscriptionId) {
    const queueName = this.subscriptions.get(subscriptionId);
    if (!queueName) {
      console.warn(`⚠️  Sottoscrizione non trovata: ${subscriptionId}`);
      return false;
    }

    try {
      // Cancella consumer
      await this.channel.cancel(); // Cancella tutti i consumer del canale

      // Rimuovi binding
      const handlerInfo = this.handlers.get(subscriptionId);
      if (handlerInfo) {
        await this.channel.unbindQueue(
          queueName,
          this.exchangeName,
          handlerInfo.pattern,
        );
      }

      this.subscriptions.delete(subscriptionId);
      this.handlers.delete(subscriptionId);

      console.log(`✅ Sottoscrizione rimossa: ${subscriptionId}`);
      return true;
    } catch (error) {
      console.error(`❌ Errore rimozione sottoscrizione:`, error);
      return false;
    }
  }

  // Statistiche sottoscrizioni
  getSubscriptionStats() {
    const stats = {
      subscriber: this.subscriberName,
      totalSubscriptions: this.subscriptions.size,
      subscriptions: {},
      eventStats: Object.fromEntries(this.eventStats),
    };

    for (const [subscriptionId, handlerInfo] of this.handlers) {
      stats.subscriptions[subscriptionId] = {
        pattern: handlerInfo.pattern,
        processed: handlerInfo.stats.processed,
        errors: handlerInfo.stats.errors,
        successRate:
          handlerInfo.stats.processed /
            (handlerInfo.stats.processed + handlerInfo.stats.errors) || 0,
      };
    }

    return stats;
  }
}
```

## 3. RPC Pattern e Request-Response

Il pattern RPC (Remote Procedure Call) trasforma chiamate asincrone in un'interfaccia simile alle chiamate di funzione sincrone, utilizzando correlation ID e reply-to queue.

```javascript
// RPC Server per servizi distribuiti
class RPCServer {
  constructor(rabbitManager, serviceName) {
    this.rabbitManager = rabbitManager;
    this.serviceName = serviceName;
    this.queueName = `rpc.${serviceName}`;
    this.channel = null;
    this.methods = new Map();
    this.requestStats = new Map();
  }

  async initialize(concurrency = 10) {
    const { channel } = await this.rabbitManager.createChannel(
      `rpc_server_${this.serviceName}`,
    );
    this.channel = channel;

    // Configurazione per performance RPC
    await this.channel.prefetch(concurrency);

    // Setup queue per richieste RPC
    await this.channel.assertQueue(this.queueName, {
      durable: true,
      exclusive: false,
      autoDelete: false,
      arguments: {
        'x-message-ttl': 60000, // Timeout 1 minuto per RPC
        'x-max-length': 1000,
      },
    });

    console.log(`🔌 RPC Server '${this.serviceName}' inizializzato`);

    // Avvia consumer
    await this.startConsuming();
  }

  // Registra metodo RPC
  registerMethod(methodName, handler, options = {}) {
    this.methods.set(methodName, {
      handler,
      timeout: options.timeout || 30000,
      validate: options.validate || null,
      cache: options.cache || false,
      cacheTTL: options.cacheTTL || 300000, // 5 minuti
    });

    console.log(`📋 Metodo RPC registrato: ${this.serviceName}.${methodName}`);
  }

  async startConsuming() {
    await this.channel.consume(
      this.queueName,
      async message => {
        if (message) {
          await this.processRPCRequest(message);
        }
      },
      {
        noAck: false,
      },
    );

    console.log(`🔄 RPC Server in ascolto su queue: ${this.queueName}`);
  }

  async processRPCRequest(message) {
    const startTime = Date.now();
    let request = null;

    try {
      // Parse richiesta RPC
      request = JSON.parse(message.content.toString());
      const { method, params, id } = request;

      console.log(`📞 RPC Request: ${method} (${id})`);

      // Verifica metodo registrato
      const methodInfo = this.methods.get(method);
      if (!methodInfo) {
        throw new Error(`Metodo '${method}' non registrato`);
      }

      // Validazione parametri se configurata
      if (methodInfo.validate && !methodInfo.validate(params)) {
        throw new Error(`Parametri non validi per metodo '${method}'`);
      }

      // Esegui metodo con timeout
      const resultPromise = methodInfo.handler(params, {
        requestId: id,
        correlationId: message.properties.correlationId,
        replyTo: message.properties.replyTo,
      });

      const timeoutPromise = new Promise((_, reject) => {
        setTimeout(
          () => reject(new Error('RPC method timeout')),
          methodInfo.timeout,
        );
      });

      const result = await Promise.race([resultPromise, timeoutPromise]);

      // Invia risposta
      await this.sendRPCResponse(message, {
        id,
        result,
        error: null,
        executionTime: Date.now() - startTime,
      });

      // Aggiorna statistiche
      this.updateMethodStats(method, 'success', Date.now() - startTime);

      this.channel.ack(message);
    } catch (error) {
      console.error(`❌ Errore RPC ${request?.method}:`, error);

      // Invia errore al client
      await this.sendRPCResponse(message, {
        id: request?.id,
        result: null,
        error: {
          message: error.message,
          code: error.code || 'INTERNAL_ERROR',
          stack:
            process.env.NODE_ENV === 'development' ? error.stack : undefined,
        },
        executionTime: Date.now() - startTime,
      });

      this.updateMethodStats(request?.method, 'error');
      this.channel.ack(message);
    }
  }

  async sendRPCResponse(originalMessage, response) {
    const replyTo = originalMessage.properties.replyTo;
    const correlationId = originalMessage.properties.correlationId;

    if (!replyTo) {
      console.error('❌ Nessuna reply-to queue specificata per RPC response');
      return;
    }

    try {
      await this.channel.sendToQueue(
        replyTo,
        Buffer.from(JSON.stringify(response)),
        {
          correlationId,
          timestamp: Date.now(),
          messageId: `response_${response.id}_${Date.now()}`,
        },
      );

      console.log(`📤 RPC Response inviata: ${response.id}`);
    } catch (error) {
      console.error('❌ Errore invio RPC response:', error);
    }
  }

  updateMethodStats(methodName, status, executionTime = null) {
    if (!this.requestStats.has(methodName)) {
      this.requestStats.set(methodName, {
        calls: 0,
        errors: 0,
        totalExecutionTime: 0,
        avgExecutionTime: 0,
        minExecutionTime: Infinity,
        maxExecutionTime: 0,
      });
    }

    const stats = this.requestStats.get(methodName);
    stats.calls++;

    if (status === 'error') {
      stats.errors++;
    } else if (status === 'success' && executionTime) {
      stats.totalExecutionTime += executionTime;
      stats.avgExecutionTime =
        stats.totalExecutionTime / (stats.calls - stats.errors);
      stats.minExecutionTime = Math.min(stats.minExecutionTime, executionTime);
      stats.maxExecutionTime = Math.max(stats.maxExecutionTime, executionTime);
    }
  }

  getStats() {
    return {
      service: this.serviceName,
      methods: Object.fromEntries(this.requestStats),
      uptime: Date.now() - this.startTime,
    };
  }
}

// RPC Client con connection pooling e caching
class RPCClient {
  constructor(rabbitManager, clientId = null) {
    this.rabbitManager = rabbitManager;
    this.clientId =
      clientId ||
      `client_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`;
    this.channel = null;
    this.replyQueue = null;
    this.pendingRequests = new Map(); // correlation_id -> { resolve, reject, timeout }
    this.requestCounter = 0;
    this.cache = new Map(); // Simple in-memory cache
  }

  async initialize() {
    const { channel } = await this.rabbitManager.createChannel(
      `rpc_client_${this.clientId}`,
    );
    this.channel = channel;

    // Crea reply queue esclusiva per questo client
    const replyQueueInfo = await this.channel.assertQueue('', {
      exclusive: true,
      autoDelete: true,
    });

    this.replyQueue = replyQueueInfo.queue;

    // Setup consumer per risposte RPC
    await this.channel.consume(
      this.replyQueue,
      message => {
        this.handleRPCResponse(message);
      },
      {
        noAck: true, // Auto-ack per reply queue
      },
    );

    console.log(`🔌 RPC Client inizializzato: ${this.clientId}`);
  }

  // Chiamata RPC con promise-based interface
  async call(serviceName, method, params = {}, options = {}) {
    if (!this.channel) {
      throw new Error('RPC Client non inizializzato');
    }

    const requestId = `req_${++this.requestCounter}_${Date.now()}`;
    const correlationId = `${this.clientId}_${requestId}`;
    const cacheKey = options.cache
      ? `${serviceName}.${method}:${JSON.stringify(params)}`
      : null;

    // Controlla cache se abilitata
    if (cacheKey && this.cache.has(cacheKey)) {
      const cached = this.cache.get(cacheKey);
      if (Date.now() < cached.expiry) {
        console.log(`💾 Cache hit per ${serviceName}.${method}`);
        return cached.result;
      } else {
        this.cache.delete(cacheKey);
      }
    }

    const request = {
      id: requestId,
      method,
      params,
      timestamp: new Date().toISOString(),
    };

    const timeout = options.timeout || 30000;

    return new Promise((resolve, reject) => {
      // Timeout timer
      const timeoutId = setTimeout(() => {
        this.pendingRequests.delete(correlationId);
        reject(
          new Error(
            `RPC timeout per ${serviceName}.${method} dopo ${timeout}ms`,
          ),
        );
      }, timeout);

      // Registra richiesta pendente
      this.pendingRequests.set(correlationId, {
        resolve,
        reject,
        timeoutId,
        startTime: Date.now(),
        cacheKey,
        cacheTTL: options.cacheTTL || 300000,
      });

      // Invia richiesta RPC
      this.channel
        .sendToQueue(
          `rpc.${serviceName}`,
          Buffer.from(JSON.stringify(request)),
          {
            correlationId,
            replyTo: this.replyQueue,
            timestamp: Date.now(),
            messageId: requestId,
          },
        )
        .then(sent => {
          if (!sent) {
            clearTimeout(timeoutId);
            this.pendingRequests.delete(correlationId);
            reject(
              new Error(`Impossibile inviare RPC request a ${serviceName}`),
            );
          }
        })
        .catch(error => {
          clearTimeout(timeoutId);
          this.pendingRequests.delete(correlationId);
          reject(error);
        });
    });
  }

  handleRPCResponse(message) {
    const correlationId = message.properties.correlationId;
    const pendingRequest = this.pendingRequests.get(correlationId);

    if (!pendingRequest) {
      console.warn(
        `⚠️  Ricevuta risposta RPC per richiesta non trovata: ${correlationId}`,
      );
      return;
    }

    try {
      const response = JSON.parse(message.content.toString());
      const { result, error, executionTime } = response;

      // Cleanup
      clearTimeout(pendingRequest.timeoutId);
      this.pendingRequests.delete(correlationId);

      if (error) {
        const rpcError = new Error(error.message);
        rpcError.code = error.code;
        rpcError.remoteMack = error.stack;

        console.error(`❌ RPC Error per ${correlationId}:`, error);
        pendingRequest.reject(rpcError);
      } else {
        const totalTime = Date.now() - pendingRequest.startTime;
        console.log(
          `✅ RPC Success per ${correlationId} in ${totalTime}ms (exec: ${executionTime}ms)`,
        );

        // Cache risultato se richiesto
        if (pendingRequest.cacheKey) {
          this.cache.set(pendingRequest.cacheKey, {
            result,
            expiry: Date.now() + pendingRequest.cacheTTL,
          });
        }

        pendingRequest.resolve(result);
      }
    } catch (parseError) {
      console.error('❌ Errore parsing RPC response:', parseError);
      pendingRequest.reject(new Error('Invalid RPC response format'));
    }
  }

  // Chiamate RPC parallele
  async callParallel(requests, options = {}) {
    const promises = requests.map(req =>
      this.call(req.service, req.method, req.params, {
        ...options,
        ...req.options,
      }),
    );

    if (options.failFast !== false) {
      // Fallisce al primo errore
      return await Promise.all(promises);
    } else {
      // Raccoglie tutti i risultati, anche errori
      return await Promise.allSettled(promises);
    }
  }

  // Cleanup risorse
  async destroy() {
    // Cancella tutte le richieste pendenti
    for (const [correlationId, pendingRequest] of this.pendingRequests) {
      clearTimeout(pendingRequest.timeoutId);
      pendingRequest.reject(new Error('RPC Client distrutto'));
    }

    this.pendingRequests.clear();
    this.cache.clear();

    console.log(`🔌 RPC Client ${this.clientId} distrutto`);
  }
}
```

## 4. Monitoring e Observability

### Sistema di Monitoring Completo

```javascript
// Monitoring avanzato per RabbitMQ e message processing
class RabbitMQMonitor {
  constructor(rabbitManager, options = {}) {
    this.rabbitManager = rabbitManager;
    this.monitoringInterval = options.interval || 30000; // 30 secondi
    this.metricsChannel = null;
    this.metrics = {
      queues: new Map(),
      exchanges: new Map(),
      connections: new Map(),
      consumers: new Map(),
      publishers: new Map(),
    };

    this.alerts = new Map();
    this.alertThresholds = {
      queueDepth: options.queueDepthThreshold || 1000,
      processingTime: options.processingTimeThreshold || 5000, // 5s
      errorRate: options.errorRateThreshold || 0.1, // 10%
      memoryUsage: options.memoryThreshold || 0.8, // 80%
      connectionCount: options.connectionThreshold || 100,
    };

    this.isMonitoring = false;
    this.monitoringTimer = null;
  }

  async initialize() {
    const { channel } = await this.rabbitManager.createChannel('monitor');
    this.metricsChannel = channel;

    // Setup monitoring exchange per metrics
    await this.metricsChannel.assertExchange('monitoring', 'topic', {
      durable: true,
      autoDelete: false,
    });

    console.log('📊 RabbitMQ Monitor inizializzato');
  }

  async startMonitoring() {
    if (this.isMonitoring) return;

    this.isMonitoring = true;
    console.log(
      `🔍 Avvio monitoring con intervallo ${this.monitoringInterval}ms`,
    );

    this.monitoringTimer = setInterval(async () => {
      try {
        await this.collectMetrics();
        await this.checkAlerts();
        await this.publishMetrics();
      } catch (error) {
        console.error('❌ Errore durante monitoring:', error);
      }
    }, this.monitoringInterval);

    // Monitoring immediato
    await this.collectMetrics();
  }

  async collectMetrics() {
    const timestamp = new Date().toISOString();

    // Metriche di sistema
    const systemMetrics = {
      timestamp,
      memory: process.memoryUsage(),
      cpu: process.cpuUsage(),
      uptime: process.uptime(),
    };

    // Metriche connessione RabbitMQ
    const connectionMetrics = await this.collectConnectionMetrics();

    // Metriche queue (richiederebbe RabbitMQ Management API in produzione)
    const queueMetrics = await this.collectQueueMetrics();

    // Aggiorna metrics store
    this.updateMetricsStore('system', systemMetrics);
    this.updateMetricsStore('connections', connectionMetrics);
    this.updateMetricsStore('queues', queueMetrics);

    console.log(`📈 Metriche raccolte: ${timestamp}`);
  }

  async collectConnectionMetrics() {
    // In un ambiente reale, useresti l'API di management di RabbitMQ
    // Qui simuliamo le metriche di connessione
    return {
      totalConnections: this.rabbitManager.channels.size,
      activeChannels: this.rabbitManager.channels.size,
      connectionState: this.rabbitManager.connection
        ? 'connected'
        : 'disconnected',
      reconnectAttempts: this.rabbitManager.reconnectAttempts,
    };
  }

  async collectQueueMetrics() {
    // Simula raccolta metriche queue
    // In produzione, integreresti con RabbitMQ Management API
    const queueMetrics = new Map();

    // Esempio di metriche che raccoglieresti
    const mockQueues = ['orders', 'notifications', 'analytics', 'user.events'];

    for (const queueName of mockQueues) {
      queueMetrics.set(queueName, {
        messages: Math.floor(Math.random() * 100),
        messagesReady: Math.floor(Math.random() * 50),
        messagesUnacknowledged: Math.floor(Math.random() * 10),
        consumers: Math.floor(Math.random() * 5),
        publishRate: Math.random() * 100,
        deliverRate: Math.random() * 95,
        ackRate: Math.random() * 90,
        redeliverRate: Math.random() * 5,
      });
    }

    return queueMetrics;
  }

  updateMetricsStore(category, metrics) {
    const maxHistory = 288; // 24 ore con intervalli di 5 minuti

    if (!this.metrics[category]) {
      this.metrics[category] = [];
    }

    this.metrics[category].push({
      timestamp: new Date().toISOString(),
      data: metrics,
    });

    // Mantieni solo le ultime N metriche
    if (this.metrics[category].length > maxHistory) {
      this.metrics[category] = this.metrics[category].slice(-maxHistory);
    }
  }

  async checkAlerts() {
    const currentTime = Date.now();

    // Alert per profondità queue
    if (this.metrics.queues.length > 0) {
      const latestQueueMetrics =
        this.metrics.queues[this.metrics.queues.length - 1];

      for (const [queueName, queueStats] of latestQueueMetrics.data) {
        if (queueStats.messages > this.alertThresholds.queueDepth) {
          await this.triggerAlert('QUEUE_DEPTH_HIGH', {
            queue: queueName,
            current: queueStats.messages,
            threshold: this.alertThresholds.queueDepth,
            severity: 'HIGH',
          });
        }

        // Alert per basso tasso di ack
        const ackRate = queueStats.ackRate / 100;
        if (ackRate < 1 - this.alertThresholds.errorRate) {
          await this.triggerAlert('LOW_ACK_RATE', {
            queue: queueName,
            current: ackRate,
            threshold: 1 - this.alertThresholds.errorRate,
            severity: 'MEDIUM',
          });
        }
      }
    }

    // Alert per memoria sistema
    if (this.metrics.system.length > 0) {
      const latestSystemMetrics =
        this.metrics.system[this.metrics.system.length - 1];
      const heapUsedRatio =
        latestSystemMetrics.data.memory.heapUsed /
        latestSystemMetrics.data.memory.heapTotal;

      if (heapUsedRatio > this.alertThresholds.memoryUsage) {
        await this.triggerAlert('MEMORY_USAGE_HIGH', {
          current: Math.round(heapUsedRatio * 100),
          threshold: Math.round(this.alertThresholds.memoryUsage * 100),
          severity: 'HIGH',
        });
      }
    }
  }

  async triggerAlert(alertType, alertData) {
    const alertId = `${alertType}_${Date.now()}`;
    const alert = {
      id: alertId,
      type: alertType,
      timestamp: new Date().toISOString(),
      ...alertData,
    };

    // Evita spam di alert duplicati
    const lastAlert = this.alerts.get(alertType);
    if (lastAlert && Date.now() - lastAlert.timestamp < 300000) {
      // 5 minuti
      return;
    }

    this.alerts.set(alertType, alert);

    console.warn(`🚨 ALERT [${alertType}]:`, alertData);

    // Pubblica alert su exchange monitoring
    await this.publishAlert(alert);

    // In produzione, integrare con sistemi come PagerDuty, Slack, etc.
    process.emit('rabbitmq-alert', alert);
  }

  async publishAlert(alert) {
    try {
      await this.metricsChannel.publish(
        'monitoring',
        `alerts.${alert.severity.toLowerCase()}.${alert.type.toLowerCase()}`,
        Buffer.from(JSON.stringify(alert)),
        {
          persistent: true,
          timestamp: Date.now(),
          headers: {
            alertType: alert.type,
            severity: alert.severity,
          },
        },
      );
    } catch (error) {
      console.error('❌ Errore pubblicazione alert:', error);
    }
  }

  async publishMetrics() {
    const metricsSnapshot = {
      timestamp: new Date().toISOString(),
      system: this.metrics.system[this.metrics.system.length - 1],
      connections:
        this.metrics.connections[this.metrics.connections.length - 1],
      queues: this.metrics.queues[this.metrics.queues.length - 1],
      alerts: Array.from(this.alerts.values()).slice(-10), // Ultimi 10 alert
    };

    try {
      await this.metricsChannel.publish(
        'monitoring',
        'metrics.snapshot',
        Buffer.from(JSON.stringify(metricsSnapshot)),
        {
          persistent: false, // Metrics non persistenti
          timestamp: Date.now(),
        },
      );
    } catch (error) {
      console.error('❌ Errore pubblicazione metriche:', error);
    }
  }

  stopMonitoring() {
    if (this.monitoringTimer) {
      clearInterval(this.monitoringTimer);
      this.monitoringTimer = null;
    }
    this.isMonitoring = false;
    console.log('⏹️  Monitoring fermato');
  }

  // API per ottenere dashboard metrics
  getDashboardData() {
    return {
      summary: this.getSummaryMetrics(),
      queues: this.getQueueSummary(),
      alerts: this.getActiveAlerts(),
      trends: this.getTrendAnalysis(),
    };
  }

  getSummaryMetrics() {
    const latest = {
      system: this.metrics.system[this.metrics.system.length - 1],
      connections:
        this.metrics.connections[this.metrics.connections.length - 1],
    };

    return {
      uptime: latest.system?.data.uptime || 0,
      memoryUsage: latest.system
        ? Math.round(
            (latest.system.data.memory.heapUsed /
              latest.system.data.memory.heapTotal) *
              100,
          )
        : 0,
      connections: latest.connections?.data.totalConnections || 0,
      status: latest.connections?.data.connectionState || 'unknown',
    };
  }

  getQueueSummary() {
    const latestQueues = this.metrics.queues[this.metrics.queues.length - 1];
    if (!latestQueues) return [];

    return Array.from(latestQueues.data.entries()).map(([name, stats]) => ({
      name,
      messages: stats.messages,
      consumers: stats.consumers,
      publishRate: Math.round(stats.publishRate),
      deliverRate: Math.round(stats.deliverRate),
    }));
  }

  getActiveAlerts() {
    const fiveMinutesAgo = Date.now() - 300000;
    return Array.from(this.alerts.values())
      .filter(alert => new Date(alert.timestamp).getTime() > fiveMinutesAgo)
      .sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
      );
  }

  getTrendAnalysis() {
    // Analizza trend degli ultimi 30 punti dati
    const systemTrend = this.analyzeTrend(
      this.metrics.system.slice(-30),
      'data.memory.heapUsed',
    );
    const queueTrend = this.analyzeQueueTrends();

    return {
      memoryTrend: systemTrend,
      queueTrends: queueTrend,
    };
  }

  analyzeTrend(dataPoints, path) {
    if (dataPoints.length < 2) return 'insufficient_data';

    const values = dataPoints
      .map(point => this.getNestedValue(point, path))
      .filter(v => v != null);
    if (values.length < 2) return 'insufficient_data';

    const first = values[0];
    const last = values[values.length - 1];
    const change = ((last - first) / first) * 100;

    if (change > 5) return 'increasing';
    if (change < -5) return 'decreasing';
    return 'stable';
  }

  getNestedValue(obj, path) {
    return path
      .split('.')
      .reduce((current, key) => current && current[key], obj);
  }

  analyzeQueueTrends() {
    // Analisi trend per ogni queue
    const queueTrends = {};

    if (this.metrics.queues.length < 2) return queueTrends;

    const recent = this.metrics.queues.slice(-10);
    const firstSnapshot = recent[0];
    const lastSnapshot = recent[recent.length - 1];

    if (firstSnapshot && lastSnapshot) {
      for (const [queueName] of firstSnapshot.data) {
        const firstStats = firstSnapshot.data.get(queueName);
        const lastStats = lastSnapshot.data.get(queueName);

        if (firstStats && lastStats) {
          queueTrends[queueName] = {
            messagesTrend: this.calculateTrend(
              firstStats.messages,
              lastStats.messages,
            ),
            rateTrend: this.calculateTrend(
              firstStats.publishRate,
              lastStats.publishRate,
            ),
          };
        }
      }
    }

    return queueTrends;
  }

  calculateTrend(oldValue, newValue) {
    if (oldValue === 0) return newValue > 0 ? 'increasing' : 'stable';
    const change = ((newValue - oldValue) / oldValue) * 100;
    if (change > 10) return 'increasing';
    if (change < -10) return 'decreasing';
    return 'stable';
  }
}
```

## Cheat Sheet - Quick Reference per Colloqui

### Domande Frequenti su RabbitMQ

| Domanda                                   | Risposta Concisa                                                                | Dettaglio Importante                          |
| ----------------------------------------- | ------------------------------------------------------------------------------- | --------------------------------------------- |
| "Differenza tra queue e exchange?"        | Exchange è il router, queue è il buffer. Producer → Exchange → Queue → Consumer | Exchange non memorizza messaggi, li instrada  |
| "Quando usare Direct vs Topic vs Fanout?" | Direct per routing esatto, Topic per pattern, Fanout per broadcast              | Topic permette wildcards (\* e #)             |
| "Come gestire message durability?"        | Queue durable + messaggi persistent + consumer ack                              | Tutti e 3 necessari per garantire persistenza |
| "Cos'è il prefetch e perché importante?"  | Limita messaggi non-ack per consumer, evita memory issues                       | Crucial per backpressure management           |
| "Come implementare retry logic?"          | DLX + TTL + routing key incrementale                                            | Exponential backoff preferibile               |

### Pattern di Routing

```javascript
// ✅ Direct Exchange - Exact Match
await channel.publish('direct-exchange', 'orders.create', message);
// Queue bind con 'orders.create' riceve questo messaggio

// ✅ Topic Exchange - Pattern Match
await channel.publish('topic-exchange', 'user.profile.updated', message);
// Queues bind con 'user.*' o 'user.profile.*' ricevono il messaggio

// ✅ Fanout Exchange - Broadcast
await channel.publish('fanout-exchange', '', message);
// Tutte le queue bind ricevono il messaggio

// ✅ Headers Exchange - Attribute Match
await channel.publish('headers-exchange', '', message, {
  headers: { 'x-match': 'all', format: 'json', type: 'order' },
});
```

### Configuration Best Practices

```javascript
// ✅ Production-Ready Queue
await channel.assertQueue('orders', {
  durable: true, // Sopravvive al restart
  exclusive: false, // Condivisibile tra connessioni
  autoDelete: false, // Non cancellare automaticamente
  arguments: {
    'x-message-ttl': 3600000, // TTL messaggi (1 ora)
    'x-dead-letter-exchange': 'dlx', // Dead letter exchange
    'x-max-length': 10000, // Max messaggi in queue
    'x-overflow': 'reject-publish', // Comportamento overflow
  },
});

// ✅ Performance Tuning
await channel.prefetch(10); // Limita messaggi non-ack
await channel.confirm(); // Publisher confirms per reliability

// ✅ Message Publishing
channel.publish('exchange', 'routing.key', Buffer.from(JSON.stringify(data)), {
  persistent: true, // Messaggio persistente
  mandatory: true, // Fallisce se nessuna queue match
  messageId: 'unique_id', // ID unico messaggio
  timestamp: Date.now(), // Timestamp pubblicazione
  expiration: '60000', // TTL messaggio (60s)
});
```

### Error Handling Patterns

```javascript
// ✅ Consumer con Retry Logic
channel.consume('queue', async message => {
  try {
    await processMessage(JSON.parse(message.content.toString()));
    channel.ack(message);
  } catch (error) {
    const retryCount = parseInt(message.properties.headers?.['x-retry'] || '0');

    if (retryCount < 3) {
      // Retry con delay
      setTimeout(
        () => {
          channel.publish('', 'queue', message.content, {
            ...message.properties,
            headers: {
              ...message.properties.headers,
              'x-retry': retryCount + 1,
            },
          });
          channel.ack(message);
        },
        Math.pow(2, retryCount) * 1000,
      );
    } else {
      // Troppi retry - invia a DLQ
      channel.nack(message, false, false);
    }
  }
});

// ✅ Graceful Shutdown
process.on('SIGTERM', async () => {
  console.log('Shutting down...');
  await channel.cancel(); // Stop consuming
  await channel.close();
  await connection.close();
  process.exit(0);
});
```

### Monitoring Metrics

| Metrica              | Normale | Warning  | Critical        |
| -------------------- | ------- | -------- | --------------- |
| Queue Depth          | < 100   | 100-1000 | > 1000          |
| Message Rate         | Steady  | Spikes   | Consistent high |
| Consumer Utilization | > 80%   | 50-80%   | < 50%           |
| Memory Usage         | < 70%   | 70-85%   | > 85%           |
| Connection Count     | Stable  | Growing  | Excessive       |

## Esercizi Pratici per Colloqui

### Esercizio 1: E-commerce Order Processing Pipeline

**Scenario**: Progetta un sistema che gestisce il flusso completo di processamento ordini e-commerce.

**Requisiti**:

- Order creation → Inventory check → Payment processing → Shipping → Notifications
- Gestione fallimenti con compensation logic
- Real-time order status updates
- Analytics e reporting asincroni

**Punti chiave da dimostrare**:

- Saga pattern implementation
- Event sourcing per order status
- Dead letter queues per failed orders
- Performance tuning per high volume

### Esercizio 2: Real-time Chat System con RabbitMQ

**Scenario**: Sistema di chat che supporta rooms, private messages, e presence indication.

**Requisiti**:

- User joins/leaves room events
- Message broadcasting per room
- Private message routing
- Online/offline status updates
- Message history e persistence

**Punti chiave da dimostrare**:

- Topic exchange per room routing
- Direct exchange per private messages
- Fanout per presence updates
- TTL e message expiration

### Esercizio 3: Microservices Communication Hub

**Scenario**: Gateway di comunicazione per 20+ microservizi con different SLAs.

**Requisiti**:

- RPC calls con timeout differenziati
- Event broadcasting per state changes
- Priority queues per criticità
- Circuit breaker pattern
- Comprehensive monitoring e alerting

**Punti chiave da dimostrare**:

- Multiple exchange strategies
- Connection pooling e resource management
- Backpressure handling
- Observability e debugging

---

_Padroneggiare RabbitMQ significa comprendere non solo la sintassi, ma i pattern architetturali che rendono possibili sistemi distribuiti robusti e scalabili. La pratica costante con scenari reali ti preparerà ad affrontare qualsiasi sfida tecnica._
