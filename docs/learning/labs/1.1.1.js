// **Esercizio 1 (Livello Base): Timer con Contesto**

// Crea un oggetto `Timer` che ha un metodo `inizia()`. Quando viene chiamato, dovrebbe stampare un messaggio ogni secondo che include il nome del timer e quanti secondi sono passati. Il timer deve fermarsi dopo 5 secondi. Usa le arrow functions per gestire correttamente il contesto.

const Timer = {
  nome: 'Il Mio Timer',
  secondiTrascorsi: 0,

  /**
   * Soluzione con le arrow functions:
   * Le arrow functions non hanno un proprio this. Invece, ereditano il valore di this dal contesto in cui sono state definite.
   * Nel tuo esempio, l'arrow function () => { ... } all'interno di setInterval eredita il valore di this dal metodo inizia(), che è legato all'oggetto Timer.
   * Di conseguenza, this.secondiTrascorsi e this.nome fanno correttamente riferimento all'oggetto Timer.
   */

  inizia() {
    const intervallo = setInterval(() => {
      // eredita il this lessicale di inizia() che è Timer
      this.secondiTrascorsi++;
      console.log(
        `${this.nome}: ${this.secondiTrascorsi} secondi sono passati`,
      );
      if (this.secondiTrascorsi >= 5) {
        clearInterval(intervallo);
        console.log(`${this.nome} si è fermato dopo 5 secondi.`);
      }
    }, 1000);
  },

  // Problema con setInterval:

  // Quando passi una funzione normale a setInterval, il valore di this all'interno della funzione non è più legato all'oggetto Timer.
  // Invece, this fa riferimento al contesto globale(window nel browser o global in Node.js).
  // Questo significa che, se avessi usato una funzione normale, this.secondiTrascorsi e this.nome non avrebbero funzionato correttamente.

  // iniziaErrata() {
  //   const intervallo = setInterval(function () {
  //     this.secondiTrascorsi++;
  //     console.log(`${this.nome}: ${this.secondiTrascorsi} secondi sono passati`);
  //     if (this.secondiTrascorsi >= 5) {
  //       clearInterval(intervallo);
  //       console.log(`${this.nome} si è fermato dopo 5 secondi.`);
  //     }
  //   }, 1000);
  // }
};

Timer.inizia();
