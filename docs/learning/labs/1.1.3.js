// **Esercizio 3 (Livello Avanzato): Sistema di Callback con Context Preservation**

// Implementa un sistema di gestione asincrona che simula chiamate API. Il sistema dovrebbe permettere di concatenare operazioni, mantenendo sempre il contesto corretto. Dimostra la comprensione profonda del lexical scoping gestendo sia successi che errori.

class GestoreAPI {
  constructor(nomeUtente) {
    this.nomeUtente = nomeUtente;
    this.operazioniInCorso = 0;
    this.risultati = [];
  }

  chiamataAPI(endpoint, dati) {
    this.operazioniInCorso++;
    console.log(`Calling ${endpoint} with data:`, dati);

    setTimeout(() => {
      if (Math.random() > 0.5) {
        this.onSuccesso(`Success from ${endpoint}`);
      } else {
        this.onErrore(`Error from ${endpoint}`);
      }
    }, 1000);
  }

  onSuccesso(risultato) {
    this.risultati.push(risultato);
    this.operazioniInCorso--;
    console.log(`Success: ${risultato}`);
  }

  onErrore(errore) {
    this.operazioniInCorso--;
    console.error(`Error: ${errore}`);
  }

  ottieniStatistiche() {
    return {
      utente: this.nomeUtente,
      operazioniCompletate: this.risultati.length,
      operazioniInCorso: this.operazioniInCorso,
    };
  }
}

const gestore = new GestoreAPI('Mario');

gestore.chiamataAPI('/endpoint1', { key: 'value1' });
gestore.chiamataAPI('/endpoint2', { key: 'value2' });

setTimeout(() => {
  console.log(gestore.ottieniStatistiche());
}, 3000);

/*Spiegazione:
1. La classe `GestoreAPI` simula un sistema di chiamate API asincrone.
2. Il metodo `chiamataAPI` inizia una chiamata API, incrementando il contatore delle operazioni in corso e simulando una risposta asincrona con `setTimeout`.
3. Le arrow functions sono utilizzate nei callback di `setTimeout` per mantenere il contesto di `this`, che si riferisce sempre all'istanza di `GestoreAPI`.
4. I metodi `onSuccesso` e `onErrore` gestiscono rispettivamente i casi di successo e errore, aggiornando lo stato interno della classe.
5. Il metodo `ottieniStatistiche` fornisce un riepilogo delle operazioni completate e in corso.
6. Infine, vengono effettuate due chiamate API e dopo 3 secondi vengono stampate le statistiche correnti.

Questo esercizio dimostra la gestione del contesto corretto in un ambiente asincrono, utilizzando il lexical scoping delle arrow functions per preservare il riferimento a `this`.*/
