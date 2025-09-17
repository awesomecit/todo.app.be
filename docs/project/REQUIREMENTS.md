# Sezione 1 – Coding

## Obiettivo

Realizza una semplice API REST che permetta di gestire utenti e i loro “task” (to-do list).

L’implementazione dovrà prevedere:
• Uso di Node.js e TypeScript
• Strutturazione del progetto orientata a best practice (organizzazione cartelle, modularità,
ecc.)
• Utilizzo di un ORM a scelta (ad esempio TypeORM, Prisma, Sequelize ecc. - specificare
quale e perché la scelta)
• Possibilità di scegliere liberamente:
◦ Il database
◦ Il framework HTTP tra Express, Fastify, Nestjs
◦ Architettura e pattern (monolite, repository ecc.)
• README dettagliato con istruzioni di avvio, scelte tecniche, come far partire i test.

## Funzionalità richieste

1. Gestione Utenti
    ◦ Registrazione e login con autenticazione
    ◦ Recupero del profilo utente autenticato
2. Gestione Task
    ◦ Creazione, lettura, aggiornamento, e cancellazione (CRUD) dei task collegati
    all’utente autenticato
    ◦ Ogni task deve contenere almeno: titolo, descrizione, stato (completato/non
    completato)
    ◦ I task devono essere visibili solo per l’utente autenticato
3. Testing
    ◦ Almeno un set minimale di test (unitari o di integrazione) che dimostri la corretta
    funzionalità delle API più importanti

## Valore aggiunto se presente (non richiesto, ma valutato positivamente)

    • Esempio di validazione dati in input
    • Qualche documentazione API (Swagger/OpenAPI)
    • Esecuzione in Docker

## Consegna

• Codice su repository pubblico (GitHub, GitLab, ecc.)
• README con istruzioni chiare

## Criteri di valutazione

• Pulizia del codice e struttura del progetto
• Copertura e chiarezza dei test
• Uso corretto di TypeScript e di un ORM
• Motivazione delle scelte tecniche effettuate nel README

## Sezione 2 – Domande Teoriche

1. Spiega cosa sono i Decorators in typescript e fornisci un esempio d’uso pratico.

2. Come si può implementare un middleware globale? Quando è consigliato usarlo?

3. Racconta un errore o difficoltà che hai incontrato usando Nodejs e come lo hai risolto.

4. Ti viene chiesto di ottimizzare le performance di una API Nodejs molto trafficata.
Quali metriche monitoreresti e quali strumenti useresti? Spiega la tua strategia con
riferimenti a esperienze reali (o idee personali concrete).
