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

    index.html · css/style.css · css/intro.css · server.js · package.json
    js/            api.js (API+cache) · utils.js (bandiere) · data.js · router.js · intro.js
    js/components/ ui · calendar · standings · driver · race · search
    img/flags/     bandiere SVG locali (nazioni e nazionalità)
    img/f1-logo.svg (opzionale) logo F1 per header, intro e favicon
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

## Novità (v2.3)

- **Intro animata** a ogni ingresso (stile Finanza_e_Statistica): logo F1 con anello che si disegna, titolo "Formula 1 2026", linee di velocità e bandiera a scacchi. Click o tasto per saltarla; segue il tema chiaro/scuro.
- **Logo F1 nell'header** al posto della scritta "Formula 1": usa `img/f1-logo.svg` se lo aggiungi, altrimenti il logo ufficiale da formula1.com (stesso logo anche per intro e favicon), con emblema stilizzato di riserva. Accanto resta il badge rosso **2026**.
- **Riga rossa di posizione a tutta larghezza**: l'header ha la riga rossa su tutta la larghezza e un segmento acceso, che scorre, sotto la voce di menu in cui ti trovi.
- Aggiunto `package.json` (`npm start`).

## Novità (v2.2)

- **Data di nascita all'italiana** ("25 agosto 2006") con **età sempre aggiornata** (calcolata ogni volta sulla data di oggi): pagina pilota, statistiche e schede "Tutti i piloti".
- **Bandiera della nazionalità** del pilota su ogni avatar (basso a sinistra, il logo squadra è a destra), nel podio, nelle tabelle, nel calendario (2°/3°), nella ricerca e accanto a vincitore/pole nella pagina gara.
- **Emblemi squadra** ora in SVG inline: si vedono sempre, anche senza i file in `img/teams/` (se aggiungi `img/teams/<constructorId>.svg` viene usato quello).
- **2° e 3° posto molto più evidenti**: podio con medaglie argento/bronzo, numero gigante, bordi e glow colorati; righe di tabella, card piloti/squadre e pillole del calendario evidenziate.
- **Select con ricerca** (scelta gara, pilota nei giri): digita per filtrare (anche per circuito, paese, sigla), Invio per scegliere, Esc per chiudere.
- Se la foto di un pilota non si carica compaiono le iniziali.

## Novità

- **Podio** 2°-1°-3° con il 1° al centro (più alto, con corona); versione compatta su mobile. Presente in classifica piloti, costruttori e in Risultati/Qualifica/Sprint di ogni gara.
- **Ricerca globale** nell'header (tasto `/`): piloti, squadre, gare, circuiti, paesi. Invio = pagina risultati.
- **Filtri live** in ogni tabella e griglia, **ordinamento colonne** con un click, tema chiaro/scuro.
- Nuove pagine **Squadra** (`#/team/<id>`) e statistiche nella pagina pilota.

## Novità

- **Calendario**: in ogni gara si vede subito il vincitore (foto, nome, squadra con logo) e i 2°/3° con la loro squadra. Bandiere SVG locali: niente più "US", "IT" su Windows.
