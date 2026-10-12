// node server.js  ->  http://localhost:3000  (scarica e salva i dati in data/ da solo, ogni REFRESH_MIN minuti)
const http = require("http"),
  fs = require("fs"),
  path = require("path"),
  F1 = require("./js/api.js");
const D = path.join(__dirname, "data"),
  PORT = process.env.PORT || 3000,
  EVERY = (+process.env.REFRESH_MIN || 15) * 60000;
fs.mkdirSync(D, { recursive: true });
const file = (k) => path.join(D, k + ".json");
async function save(k) {
  try {
    fs.writeFileSync(file(k), JSON.stringify(await F1.fetchLive(k)));
    console.log("✓", k);
  } catch (e) {
    console.log("✗", k, e.message);
  }
}
let busy = false;
async function update() {
  if (busy) return;
  busy = true;
  console.log("Aggiornamento dati…");
  for (const k of F1.CORE) await save(k);
  try {
    const races = JSON.parse(fs.readFileSync(file("races"))).Races;
    const done = races.filter(
      (r) =>
        new Date(r.date + "T" + (r.time || "23:59:59Z")).getTime() <
        Date.now() - 3 * 36e5,
    );
    for (const r of done)
      for (const p of ["dstand", "cstand", "pitstops", "laps"]) {
        const k = p + "_" + r.round,
          last = r === done[done.length - 1];
        if (!fs.existsSync(file(k)) || (last && p !== "laps")) await save(k);
      }
  } catch (e) {
    console.log("Errore giri/classifiche:", e.message);
  }
  console.log("Aggiornamento finito");
  busy = false;
}
const T = {
  ".html": "text/html",
  ".css": "text/css",
  ".js": "text/javascript",
  ".json": "application/json",
};
http
  .createServer((q, s) => {
    const u = decodeURIComponent(q.url.split("?")[0]);
    if (u === "/api/refresh") {
      update();
      s.end("ok");
      return;
    }
    const f = path.join(__dirname, u === "/" ? "index.html" : u);
    if (
      !f.startsWith(__dirname) ||
      !fs.existsSync(f) ||
      fs.statSync(f).isDirectory()
    ) {
      s.statusCode = 404;
      return s.end("404");
    }
    s.setHeader(
      "Content-Type",
      (T[path.extname(f)] || "application/octet-stream") + ";charset=utf-8",
    );
    s.setHeader("Cache-Control", "no-store");
    fs.createReadStream(f).pipe(s);
  })
  .listen(PORT, () => {
    console.log("Apri http://localhost:" + PORT);
    update();
    setInterval(update, EVERY);
  });
