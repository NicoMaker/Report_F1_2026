# F1 2026 – Dashboard dati

Dati: Jolpica/Ergast API (calendario, risultati, qualifica, sprint, giri, pit stop, classifiche dopo ogni gara) + foto piloti da Wikipedia.

## Avvio (consigliato: salvataggio automatico)

    npm start               # (= node server.js) sito su http://localhost:3000, JSON salvati in data/ e aggiornati ogni 15 min
    REFRESH_MIN=5 node server.js   # cambia la frequenza

Richiede Node 18+, nessuna dipendenza da installare. Il primo avvio scarica anche i giri di tutte le gare concluse (ci vuole qualche minuto: l'API ha un limite di richieste).
Aggiornamento manuale: http://localhost:3000/api/refresh

## Senza Node

Apri index.html: i dati arrivano direttamente dall'API e restano in cache nel browser.

## Struttura
    index.html · css/style.css · server.js
    js/            api.js (API+cache) · utils.js (bandiere) · data.js · router.js
    js/components/ ui · calendar · standings · driver · race · search
    img/flags/     bandiere SVG locali (nazioni e nazionalità)
    img/teams/     (opzionale) loghi ufficiali <constructorId>.svg
    data/          i JSON, ordinati per tipo (il server li aggiorna da solo):
      races/       races.json                      calendario
      drivers/     drivers.json · photos.json      piloti e foto
      results/     results.json · qualifying.json · sprint.json
      standings/   driverStandings.json · constructorStandings.json (ultime)
        drivers/       dstand_<giro>.json          classifica piloti dopo ogni gara
        constructors/  cstand_<giro>.json          classifica squadre dopo ogni gara
      laps/        laps_<giro>.json                tempi giro per giro
      pitstops/    pitstops_<giro>.json            soste ai box

## Novità
- **Podio** 2°-1°-3° con il 1° al centro (più alto, con corona); versione compatta su mobile. Presente in classifica piloti, costruttori e in Risultati/Qualifica/Sprint di ogni gara.
- **Ricerca globale** nell'header (tasto `/`): piloti, squadre, gare, circuiti, paesi. Invio = pagina risultati.
- **Filtri live** in ogni tabella e griglia, **ordinamento colonne** con un click, tema chiaro/scuro.
- Nuove pagine **Squadra** (`#/team/<id>`) e statistiche nella pagina pilota.

## Novità
- **Calendario**: in ogni gara si vede subito il vincitore (foto, nome, squadra con logo) e i 2°/3° con la loro squadra. Bandiere SVG locali: niente più "US", "IT" su Windows.
