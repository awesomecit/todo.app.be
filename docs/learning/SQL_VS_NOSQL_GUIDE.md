# 📚 Database SQL vs NoSQL - Guida Studio per Interview

_Dominio applicativo: Sistema di Gestione Task Utente_

## Sommario

1. [Database Relazionali vs NoSQL](#database-relazionali-vs-nosql)
2. [Il Linguaggio SQL](#il-linguaggio-sql)
3. [Proprietà ACID](#proprietà-acid)
4. [Modello Entità-Relazioni](#modello-entità-relazioni)
5. [Operazioni CRUD](#operazioni-crud)
6. [JOIN e Query Complesse](#join-e-query-complesse)
7. [Scalabilità](#scalabilità)
8. [Strategia di Scelta Database](#strategia-di-scelta-database)
9. [Esempi Pratici nel Task Management](#esempi-pratici-nel-task-management)

---

## Database Relazionali vs NoSQL

### Database SQL (Relazionali)

I database relazionali organizzano i dati in **tabelle** con righe e colonne, seguendo uno **schema rigido** predefinito. Immagina una libreria ben organizzata dove ogni libro ha una posizione specifica e segue un sistema di catalogazione uniforme.

**Caratteristiche principali:**

- **Schema rigido**: ogni tabella ha campi e tipi ben definiti
- **Relazioni forti**: supporto nativo per collegamenti tra entità (JOIN)
- **Linguaggio standardizzato**: SQL è universalmente accettato
- **Garanzie ACID**: transazioni sicure e consistenti
- **Scalabilità verticale**: si potenzia aumentando risorse del server

**Quando usarli nel Task Management:**

- Core dell'applicazione (utenti, progetti, task principali)
- Gestione permessi e ruoli
- Report finanziari e audit trail
- Qualsiasi operazione che richiede consistenza forte

### Database NoSQL (Non-relazionali)

I database NoSQL sono come contenitori flessibili che possono adattarsi a diverse forme di dati. Esistono quattro tipi principali, ognuno ottimizzato per scenari specifici.

#### Tipologie NoSQL

1. **Key-Value** (es. Redis)
   - Struttura: chiave → valore
   - Velocità estrema per accessi diretti
   - Perfetto per cache e sessioni utente

2. **Document Store** (es. MongoDB, Elasticsearch)
   - Struttura: documenti JSON/BSON
   - Schema flessibile
   - Ottimo per dati semi-strutturati

3. **Wide-Column** (es. Cassandra)
   - Struttura: famiglie di colonne
   - Scalabilità massima
   - Ideale per time-series e IoT

4. **Graph** (es. Neo4j)
   - Struttura: nodi e relazioni
   - Navigazione veloce di connessioni
   - Perfetto per social network e raccomandazioni

**Quando usarli nel Task Management:**

- Cache per performance (Redis)
- Ricerca full-text sui task (Elasticsearch)
- Analytics in tempo reale
- Dati non strutturati (allegati, commenti)

---

## Il Linguaggio SQL

SQL (Structured Query Language) è il linguaggio standard per comunicare con database relazionali. È come imparare a parlare la lingua dei dati strutturati.

### Categorie principali

**DDL - Data Definition Language** (Definire struttura)

```sql
CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  created_at TIMESTAMP DEFAULT NOW()
);
```

**DML - Data Manipulation Language** (Manipolare dati)

```sql
INSERT INTO users (username, email) VALUES ('mario_rossi', 'mario@email.com');
UPDATE users SET email = 'nuovo@email.com' WHERE id = 1;
DELETE FROM users WHERE id = 1;
```

**DQL - Data Query Language** (Interrogare dati)

```sql
SELECT username, email FROM users WHERE created_at > '2024-01-01';
```

**DCL/TCL** (Controllo e transazioni)

```sql
GRANT SELECT ON users TO mario_rossi;
BEGIN; UPDATE users SET email = 'test@test.com'; COMMIT;
```

---

## Proprietà ACID

Le proprietà ACID sono le fondamenta che garantiscono l'affidabilità dei database relazionali. Pensa a ACID come alle regole di sicurezza in una banca.

### Atomicità (A)

**Concetto**: "Tutto o niente" - una transazione è un'unità indivisibile.

**Esempio pratico**: Quando un utente completa un task e guadagna punti esperienza:

```sql
BEGIN;
UPDATE tasks SET status = 'completed', completed_at = NOW() WHERE id = 123;
UPDATE users SET experience_points = experience_points + 50 WHERE id = 456;
COMMIT;
-- Se una delle due operazioni fallisce, entrambe vengono annullate
```

### Consistenza (C)

**Concetto**: Il database rispetta sempre le regole di business definite.

**Esempio pratico**: Un task non può essere assegnato a un utente inesistente:

```sql
-- Questo vincolo garantisce consistenza
ALTER TABLE tasks ADD CONSTRAINT fk_assignee
FOREIGN KEY (assigned_to) REFERENCES users(id);
```

### Isolamento (I)

**Concetto**: Le transazioni concorrenti non interferiscono tra loro.

**Esempio pratico**: Due manager non possono assegnare lo stesso task contemporaneamente:

```sql
-- Transaction 1
BEGIN;
SELECT status FROM tasks WHERE id = 123 FOR UPDATE; -- Lock il record
-- verifica che status = 'unassigned'
UPDATE tasks SET assigned_to = 456, status = 'assigned' WHERE id = 123;
COMMIT;
```

### Durabilità (D)

**Concetto**: Una volta confermata, una transazione è permanente.

**Esempio pratico**: Se confermi la consegna di un progetto, resta salvata anche se il server si spegne subito dopo.

---

## Modello Entità-Relazioni

Il modello E-R è la mappa concettuale che trasforma il mondo reale in strutture database. È come disegnare l'architettura prima di costruire una casa.

### Schema E-R per Task Management

```
UTENTE (id, username, email, ruolo, created_at)
    |
    | 1:N (un utente può avere molti task)
    |
TASK (id, titolo, descrizione, status, priorità, created_at, assigned_to, project_id)
    |
    | N:1 (molti task appartengono a un progetto)
    |
PROGETTO (id, nome, descrizione, deadline, manager_id)
    |
    | 1:N (un progetto ha molti task)
    |
COMMENTO (id, task_id, user_id, testo, created_at)
```

### Cardinalità spiegata

**1:1** (Uno a Uno)

- Un utente ha un profilo dettagliato
- Usato raramente, spesso si unisce tutto in una tabella

**1:N** (Uno a Molti)

- Un utente può avere molti task
- Un progetto può avere molti task
- La relazione più comune nei database

**N:M** (Molti a Molti)

- Un task può avere molte etichette (tag)
- Un'etichetta può essere su molti task
- Richiede una tabella intermedia (task_tags)

---

## Operazioni CRUD

CRUD rappresenta le quattro operazioni fondamentali sui dati. Nel context del task management, vediamo esempi concreti.

### CREATE - Inserimento

```sql
-- Creare un nuovo utente
INSERT INTO users (username, email, role)
VALUES ('alice_dev', 'alice@company.com', 'developer');

-- Creare un task con riferimenti
INSERT INTO tasks (title, description, priority, assigned_to, project_id)
VALUES (
  'Implementare login OAuth',
  'Aggiungere autenticazione Google e GitHub',
  'high',
  (SELECT id FROM users WHERE username = 'alice_dev'),
  1
);
```

### READ - Lettura

```sql
-- Tutti i task di un utente
SELECT t.title, t.status, p.name as project_name
FROM tasks t
JOIN projects p ON t.project_id = p.id
WHERE t.assigned_to = (SELECT id FROM users WHERE username = 'alice_dev');

-- Task con priorità alta e scadenza vicina
SELECT * FROM tasks
WHERE priority = 'high'
  AND due_date BETWEEN NOW() AND NOW() + INTERVAL '7 days'
ORDER BY due_date ASC;
```

### UPDATE - Aggiornamento

```sql
-- Completare un task
UPDATE tasks
SET status = 'completed', completed_at = NOW()
WHERE id = 123 AND assigned_to = (SELECT id FROM users WHERE username = 'alice_dev');

-- Riassegnare task in blocco
UPDATE tasks
SET assigned_to = (SELECT id FROM users WHERE username = 'bob_senior')
WHERE assigned_to = (SELECT id FROM users WHERE username = 'john_junior')
  AND status IN ('open', 'in_progress');
```

### DELETE - Cancellazione

```sql
-- Eliminare commenti vecchi (soft delete preferibile)
UPDATE comments
SET deleted_at = NOW()
WHERE created_at < NOW() - INTERVAL '2 years';

-- Hard delete solo per dati di test
DELETE FROM tasks WHERE project_id = 999; -- progetto di test
```

---

## JOIN e Query Complesse

I JOIN sono il cuore della potenza relazionale. Ti permettono di combinare dati da più tabelle come se fossero puzzle che si incastrano.

### Tipi di JOIN

#### INNER JOIN - Solo corrispondenze

```sql
-- Mostra solo task assegnati (esclude task senza assegnatario)
SELECT
  u.username,
  t.title,
  t.status
FROM users u
INNER JOIN tasks t ON u.id = t.assigned_to;
```

**Quando usarlo**: Quando vuoi solo dati che hanno match in entrambe le tabelle.

#### LEFT JOIN - Tutti da sinistra

```sql
-- Mostra tutti gli utenti, anche quelli senza task
SELECT
  u.username,
  COUNT(t.id) as task_count
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
GROUP BY u.id, u.username;
```

**Quando usarlo**: Vuoi mantenere tutti i record della tabella principale.

#### RIGHT JOIN - Tutti da destra

```sql
-- Mostra tutti i task, anche quelli senza assegnatario
SELECT
  u.username,
  t.title,
  t.status
FROM users u
RIGHT JOIN tasks t ON u.id = t.assigned_to;
```

**Quando usarlo**: Raramente usato, LEFT JOIN è più intuitivo.

#### FULL OUTER JOIN - Tutti da entrambe

```sql
-- Mostra tutti utenti E tutti task, con o senza match
SELECT
  COALESCE(u.username, 'Nessun utente') as user,
  COALESCE(t.title, 'Nessun task') as task
FROM users u
FULL OUTER JOIN tasks t ON u.id = t.assigned_to;
```

**Quando usarlo**: Analisi complete dove non vuoi perdere nessun dato.

### Query avanzate nel Task Management

#### Dashboard utente con statistiche

```sql
SELECT
  u.username,
  COUNT(t.id) as total_tasks,
  COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
  COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as active_tasks,
  AVG(EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/86400) as avg_completion_days
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
GROUP BY u.id, u.username
HAVING COUNT(t.id) > 0;
```

#### Report progetti con performance team

```sql
WITH project_stats AS (
  SELECT
    p.id,
    p.name,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    AVG(CASE WHEN t.completed_at IS NOT NULL
        THEN EXTRACT(EPOCH FROM (t.completed_at - t.created_at))/86400
        END) as avg_completion_days
  FROM projects p
  LEFT JOIN tasks t ON p.id = t.project_id
  GROUP BY p.id, p.name
)
SELECT
  name,
  total_tasks,
  completed_tasks,
  ROUND((completed_tasks * 100.0 / NULLIF(total_tasks, 0)), 2) as completion_rate,
  ROUND(avg_completion_days, 1) as avg_days_to_complete
FROM project_stats
WHERE total_tasks > 0
ORDER BY completion_rate DESC;
```

---

## Scalabilità

La scalabilità determina come il tuo sistema cresce con l'aumento di utenti e dati. È come scegliere tra potenziare una macchina esistente o aggiungerne di nuove.

### Scalabilità Verticale (Scale-Up)

**Concetto**: Potenziare il server esistente aggiungendo RAM, CPU, SSD più veloci.

**Analogia**: Assumere un cuoco più bravo e dargli attrezzature migliori invece di aprire altre cucine.

**Pro:**

- Semplice da implementare
- Nessuna complessità di distribuzione
- Transazioni ACID complete

**Contro:**

- Limite fisico (non puoi aggiungere RAM all'infinito)
- Single point of failure
- Costoso per hardware di fascia alta

### Scalabilità Orizzontale (Scale-Out)

**Concetto**: Aggiungere più server che lavorano insieme distribuendo il carico.

**Analogia**: Aprire filiali del ristorante invece di espandere quella principale.

**Pro:**

- Crescita quasi illimitata
- Resilienza (se un nodo fallisce, altri continuano)
- Costo lineare (server commodity)

**Contro:**

- Complessità di gestione distribuita
- Consistenza eventuale (non immediata)
- Problemi di rete e latenza

### Esempio pratico: Scaling del Task Management

```sql
-- Sistema piccolo: tutto su un PostgreSQL
-- ✅ Semplice, transazioni perfette, query complesse

-- Sistema medio: PostgreSQL + Redis
-- PostgreSQL: core data (users, tasks, projects)
-- Redis: cache sessioni, contatori real-time

-- Sistema grande: Sharding + Read Replicas
-- Sharding per utente: users 1-1000 → shard1, users 1001-2000 → shard2
-- Read replicas per query analitiche
-- Redis cluster per cache distribuita
-- Elasticsearch per ricerca full-text
```

---

## Strategia di Scelta Database

Questa sezione ti guida nella decisione più importante: SQL o NoSQL? La risposta non è mai assoluta, ma dipende dai requisiti specifici.

### Framework di Decisione

#### 1. Analisi della Struttura Dati

**Domande chiave:**

- I dati hanno relazioni complesse?
- Lo schema cambia spesso?
- Hai bisogno di join tra entità?

**Task Management Example:**

```
✅ SQL: Utenti ↔ Task ↔ Progetti hanno relazioni forti
❌ NoSQL: Per metadati task variabili (custom fields)
```

#### 2. Valutazione Volume e Crescita

**Domande chiave:**

- Quanti dati gestisci oggi e tra 5 anni?
- La crescita è prevedibile o esplosiva?
- Hai bisogno di distribuzione geografica?

**Soglie indicative:**

- < 1TB, < 1M utenti → SQL spesso sufficiente
- > 10TB, > 10M utenti → Considerare NoSQL
- Crescita > 10x anno → NoSQL quasi obbligatorio

#### 3. Requisiti di Consistenza

**Domande chiave:**

- Tollerai inconsistenze temporanee?
- Le transazioni multi-record sono critiche?
- Hai requisiti di audit rigorosi?

**Task Management Example:**

```sql
-- Critico: Assegnazione task (SQL)
BEGIN;
UPDATE tasks SET assigned_to = 123 WHERE id = 456;
INSERT INTO task_history (task_id, action, user_id) VALUES (456, 'assigned', 123);
COMMIT;

-- Non critico: Contatore visualizzazioni task (NoSQL)
INCR task:456:views  -- Redis, eventual consistency OK
```

### Architetture Ibride (Spesso la soluzione migliore)

#### Pattern: Core SQL + NoSQL specializzati

```
PostgreSQL (Core business logic)
├── Users, Tasks, Projects, Permissions
├── Financial data, Audit logs
└── Complex reporting queries

Redis (Performance layer)
├── User sessions
├── Real-time counters
├── Temporary data
└── Cache query results

Elasticsearch (Search & Analytics)
├── Full-text search on tasks/comments
├── Activity logs analysis
├── Real-time dashboards
└── User behavior analytics
```

#### Migration Strategy Example

```sql
-- Phase 1: Start with PostgreSQL
-- ✅ Fast to develop, all features work

-- Phase 2: Add Redis for performance
-- ✅ Session storage, cache hot data
-- ✅ Real-time features (notifications)

-- Phase 3: Add Elasticsearch for search
-- ✅ Full-text search across tasks
-- ✅ Advanced analytics and reporting

-- Phase 4: Consider sharding/NoSQL only if needed
-- ✅ When single PostgreSQL can't handle load
```

---

## Esempi Pratici nel Task Management

Questa sezione mette insieme tutti i concetti in esempi realistici che potresti incontrare in un'intervista.

### Scenario 1: Database Design Completo

**Requisito**: Progettare database per task management che supporti:

- Utenti con ruoli diversi
- Progetti con task gerarchici
- Commenti e allegati
- Timeline e milestone
- Notifiche real-time

#### Schema SQL (PostgreSQL)

```sql
-- Tabelle core
CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role user_role_enum DEFAULT 'member',
    avatar_url TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE projects (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    description TEXT,
    manager_id INTEGER REFERENCES users(id),
    status project_status_enum DEFAULT 'active',
    due_date TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE tasks (
    id SERIAL PRIMARY KEY,
    title VARCHAR(200) NOT NULL,
    description TEXT,
    assigned_to INTEGER REFERENCES users(id),
    project_id INTEGER REFERENCES projects(id) NOT NULL,
    parent_task_id INTEGER REFERENCES tasks(id), -- Per subtask
    status task_status_enum DEFAULT 'open',
    priority priority_enum DEFAULT 'medium',
    estimated_hours INTEGER,
    actual_hours INTEGER,
    due_date TIMESTAMP,
    completed_at TIMESTAMP,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Tabelle di supporto
CREATE TABLE comments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    user_id INTEGER REFERENCES users(id),
    content TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE attachments (
    id SERIAL PRIMARY KEY,
    task_id INTEGER REFERENCES tasks(id) ON DELETE CASCADE,
    filename VARCHAR(255) NOT NULL,
    file_path TEXT NOT NULL,
    file_size INTEGER,
    uploaded_by INTEGER REFERENCES users(id),
    created_at TIMESTAMP DEFAULT NOW()
);

-- Enums
CREATE TYPE user_role_enum AS ENUM ('admin', 'manager', 'developer', 'member');
CREATE TYPE project_status_enum AS ENUM ('planning', 'active', 'completed', 'cancelled');
CREATE TYPE task_status_enum AS ENUM ('open', 'in_progress', 'review', 'completed', 'cancelled');
CREATE TYPE priority_enum AS ENUM ('low', 'medium', 'high', 'urgent');
```

### Scenario 2: Query Performance Optimization

**Problema**: La query dashboard è lenta con 100k+ task.

#### Query problematica

```sql
-- Lenta: scan completo senza indici
SELECT
    u.username,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
GROUP BY u.username;
```

#### Ottimizzazione step-by-step

```sql
-- Step 1: Aggiungere indici strategici
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(status);
CREATE INDEX idx_tasks_assigned_status ON tasks(assigned_to, status); -- Composite index

-- Step 2: Ottimizzare query con filtri
SELECT
    u.username,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
WHERE u.role IN ('developer', 'manager') -- Filtro utenti attivi
  AND (t.created_at IS NULL OR t.created_at > NOW() - INTERVAL '1 year') -- Task recenti
GROUP BY u.id, u.username
ORDER BY total_tasks DESC;

-- Step 3: Materialized view per dashboard
CREATE MATERIALIZED VIEW user_task_stats AS
SELECT
    u.id as user_id,
    u.username,
    COUNT(t.id) as total_tasks,
    COUNT(CASE WHEN t.status = 'completed' THEN 1 END) as completed_tasks,
    COUNT(CASE WHEN t.status = 'in_progress' THEN 1 END) as active_tasks,
    MAX(t.updated_at) as last_activity
FROM users u
LEFT JOIN tasks t ON u.id = t.assigned_to
GROUP BY u.id, u.username;

-- Refresh periodico (ogni ora)
CREATE INDEX idx_user_task_stats_username ON user_task_stats(username);
REFRESH MATERIALIZED VIEW user_task_stats;
```

### Scenario 3: Scaling Strategy

**Problema**: L'app task management deve supportare 1M+ utenti globalmente.

#### Strategia di scaling progressiva

**Phase 1: Single PostgreSQL Optimization**

```sql
-- Connection pooling
-- Configurazione PostgreSQL per alta performance
-- Read replicas per query analitiche
-- Partitioning su tabelle grandi

-- Esempio partitioning per task per data
CREATE TABLE tasks_2024 PARTITION OF tasks
    FOR VALUES FROM ('2024-01-01') TO ('2025-01-01');
```

**Phase 2: Caching Layer**

```python
# Redis per cache hot data
import redis
r = redis.Redis()

def get_user_dashboard(user_id):
    cache_key = f"dashboard:{user_id}"
    cached = r.get(cache_key)
    if cached:
        return json.loads(cached)

    # Query database
    data = fetch_dashboard_from_db(user_id)
    r.setex(cache_key, 3600, json.dumps(data))  # Cache 1 ora
    return data
```

**Phase 3: Geographic Distribution**

```
US Region: PostgreSQL Primary + Read Replicas
EU Region: PostgreSQL Primary + Read Replicas
ASIA Region: PostgreSQL Primary + Read Replicas

Global Redis Cluster per sessioni
Global Elasticsearch per search
CDN per assets statici
```

### Scenario 4: Interview Questions Tipiche

#### Q: "Come gestiresti i permessi in un task management?"

**Risposta strutturata:**

```sql
-- Approccio RBAC (Role-Based Access Control)
CREATE TABLE roles (
    id SERIAL PRIMARY KEY,
    name VARCHAR(50) UNIQUE NOT NULL,
    description TEXT
);

CREATE TABLE permissions (
    id SERIAL PRIMARY KEY,
    resource VARCHAR(50) NOT NULL, -- 'task', 'project', 'user'
    action VARCHAR(50) NOT NULL,   -- 'read', 'write', 'delete', 'assign'
    scope VARCHAR(50) DEFAULT 'own' -- 'own', 'team', 'all'
);

CREATE TABLE role_permissions (
    role_id INTEGER REFERENCES roles(id),
    permission_id INTEGER REFERENCES permissions(id),
    PRIMARY KEY (role_id, permission_id)
);

-- Esempio check permission
CREATE OR REPLACE FUNCTION can_user_access_task(
    p_user_id INTEGER,
    p_task_id INTEGER,
    p_action VARCHAR(50)
) RETURNS BOOLEAN AS $$
DECLARE
    user_role VARCHAR(50);
    task_assignee INTEGER;
    task_project_id INTEGER;
    project_manager INTEGER;
BEGIN
    -- Ottieni ruolo utente
    SELECT role INTO user_role FROM users WHERE id = p_user_id;

    -- Ottieni info task
    SELECT assigned_to, project_id INTO task_assignee, task_project_id
    FROM tasks WHERE id = p_task_id;

    -- Admin può fare tutto
    IF user_role = 'admin' THEN
        RETURN TRUE;
    END IF;

    -- Manager del progetto può fare tutto sui suoi task
    SELECT manager_id INTO project_manager
    FROM projects WHERE id = task_project_id;

    IF project_manager = p_user_id THEN
        RETURN TRUE;
    END IF;

    -- Assegnatario può leggere/modificare i propri task
    IF task_assignee = p_user_id AND p_action IN ('read', 'update') THEN
        RETURN TRUE;
    END IF;

    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;
```

#### Q: "Come implementeresti search full-text veloce?"

**Risposta con architettura ibrida:**

```sql
-- PostgreSQL: search base con tsvector
ALTER TABLE tasks ADD COLUMN search_vector tsvector;

CREATE INDEX idx_tasks_search ON tasks USING gin(search_vector);

-- Trigger per aggiornare search vector
CREATE OR REPLACE FUNCTION update_task_search_vector()
RETURNS TRIGGER AS $$
BEGIN
    NEW.search_vector :=
        setweight(to_tsvector('italian', COALESCE(NEW.title, '')), 'A') ||
        setweight(to_tsvector('italian', COALESCE(NEW.description, '')), 'B');
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER tg_update_task_search
    BEFORE INSERT OR UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_task_search_vector();

-- Query search
SELECT id, title, ts_rank(search_vector, query) as rank
FROM tasks, websearch_to_tsquery('italian', 'bug login oauth') query
WHERE search_vector @@ query
ORDER BY rank DESC;
```

```python
# Per search avanzata: integrazione Elasticsearch
from elasticsearch import Elasticsearch

class TaskSearchService:
    def __init__(self):
        self.es = Elasticsearch(['localhost:9200'])

    def index_task(self, task):
        doc = {
            'title': task.title,
            'description': task.description,
            'assignee': task.assigned_to_username,
            'project': task.project_name,
            'status': task.status,
            'tags': task.tags,
            'created_at': task.created_at
        }

        self.es.index(
            index='tasks',
            id=task.id,
            document=doc
        )

    def search(self, query, user_id, filters=None):
        # Query con permessi utente
        search_body = {
            "query": {
                "bool": {
                    "must": [
                        {
                            "multi_match": {
                                "query": query,
                                "fields": ["title^2", "description", "assignee", "project"]
                            }
                        }
                    ],
                    "filter": [
                        {"term": {"visible_to": user_id}}
                    ]
                }
            },
            "highlight": {
                "fields": {
                    "title": {},
                    "description": {}
                }
            }
        }

        if filters:
            search_body["query"]["bool"]["filter"].extend(filters)

        return self.es.search(
            index='tasks',
            body=search_body,
            size=20
        )
```

---

## Conclusioni e Punti Chiave per Interview

### Concepts da ricordare assolutamente

1. **ACID è il cuore dei database relazionali** - saper spiegare ogni proprietà con esempi
2. **JOIN sono la potenza di SQL** - saper scegliere il tipo giusto per ogni scenario
3. **NoSQL non significa "No Schema"** - significa schema flessibile, non assente
4. **Scalabilità orizzontale vs verticale** - capire trade-off e quando scegliere ognuna
5. **Architetture ibride sono la norma** - SQL per consistenza + NoSQL per performance

### Red flags da evitare

❌ "NoSQL è sempre più veloce di SQL"
❌ "PostgreSQL non scala"
❌ "MongoDB sostituisce sempre MySQL"
❌ "Redis è solo una cache"
❌ "Le migrazioni database sono facili"

### Risposte vincenti

✅ **Dipende dai requisiti** - sempre contestualizzare
✅ **Trade-off espliciti** - ogni scelta ha pro e contro
✅ **Esempi concreti** - sempre supportare la teoria con pratica
✅ **Architettura evolutiva** - iniziare semplice, crescere con bisogni
✅ **Misurazione e monitoring** - come verifichi che le tue scelte funzionano

### Tips per interview

1. **Fai domande di chiarimento**: "Quanti utenti? Che tipo di dati? Requisiti di consistenza?"
2. **Inizia semplice**: "Inizierei con PostgreSQL, poi..."
3. **Spiega il reasoning**: "Scelgo INNER JOIN perché..."
4. **Mostra trade-off**: "Questo approccio è veloce ma usa più memoria..."
5. **Pensa alla manutenzione**: "Come monitorerei le performance? Come farei backup?"

Ricorda: l'interviewer non cerca la soluzione perfetta, ma vuole vedere il tuo processo di ragionamento e la comprensione dei trade-off. Sii onesto sui limiti delle tue conoscenze e mostra curiosità per apprendere.
