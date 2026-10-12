# F1 2026 – Dashboard dati

Dati: Jolpica/Ergast API (calendario, risultati, qualifica, sprint, giri, pit stop, classifiche dopo ogni gara) + foto piloti da Wikipedia.

## Avvio (consigliato: salvataggio automatico)

    node server.js          # serve il sito su http://localhost:3000 e salva i JSON in data/ ogni 15 min
    REFRESH_MIN=5 node server.js   # cambia la frequenza

Richiede Node 18+. Il primo avvio scarica anche i giri di tutte le gare concluse (ci vuole qualche minuto: l'API ha un limite di richieste).
Aggiornamento manuale: http://localhost:3000/api/refresh

## Senza Node

Apri index.html: i dati arrivano direttamente dall'API e restano in cache nel browser.

## Struttura

index.html · css/style.css · js/api.js (API+cache) · js/utils.js · js/data.js · js/components/{ui,calendar,standings,driver,race}.js · js/router.js · server.js · data/
