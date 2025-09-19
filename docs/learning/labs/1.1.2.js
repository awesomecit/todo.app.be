/**
 * **Esercizio 2 (Livello Intermedio): Gestore Eventi di Sistema**
 *
 * Implementa una classe `ContatoreEventi` che monitora eventi provenienti
 * da diversi sensori simulati. Ogni sensore emette eventi a intervalli casuali.
 * La classe deve contare gli eventi per ogni sensore individualmente e
 * fornire statistiche totali.
 *
 * Usa arrow functions per i gestori eventi e dimostra la differenza
 * tra l'approccio con arrow functions e quello tradizionale.
 */

class ContatoreEventi {
  constructor() {
    this.eventiPerSensore = {};
    this.sensori = ['sensoreA', 'sensoreB', 'sensoreC'];
    this.inizializzaSensori();
  }

  inizializzaSensori() {
    this.sensori.forEach(sensore => {
      this.eventiPerSensore[sensore] = 0;
      // Simula eventi a intervalli casuali tra 500ms e 2000ms
      setInterval(() => this.emettiEvento(sensore), Math.random() * 1500 + 500);
    });
  }

  emettiEvento(sensore) {
    this.eventiPerSensore[sensore]++;
    console.log(
      `Evento emesso da ${sensore}: ${this.eventiPerSensore[sensore]} volte`,
    );
  }

  statisticheTotali() {
    const totale = Object.values(this.eventiPerSensore).reduce(
      (acc, curr) => acc + curr,
      0,
    );
    console.log(`Statistiche totali: ${totale} eventi emessi`);
  }
}

const contatore = new ContatoreEventi();

// Mostra statistiche totali ogni 1 secondo
setInterval(() => contatore.statisticheTotali(), 1000);

// si fermano dopo 5 secondi
setTimeout(() => {
  console.log('Fermando il contatore eventi dopo 5 secondi.');
  process.exit(0);
}, 5000);

/**
 * **Differenza tra Arrow Functions e Funzioni Tradizionali:**
 *
 * - Le arrow functions non hanno un proprio `this`. Invece, ereditano il valore di `this` dal contesto in cui sono state definite.
 * - Nel caso di `setInterval(() => this.emettiEvento(sensore), ...)`, l'arrow function eredita il valore di `this` dal metodo `inizializzaSensori()`, che è legato all'istanza di `ContatoreEventi`.
 * - Se avessi usato una funzione tradizionale, come in `setInterval(function() { this.emettiEvento(sensore); }, ...)`, il valore di `this` all'interno della funzione non sarebbe stato più legato all'istanza di `ContatoreEventi`, ma al contesto globale, causando un errore.
 *
 * Questo esempio dimostra come le arrow functions siano utili per mantenere il contesto corretto in situazioni asincrone come i timer e i gestori di eventi.
 */
