// Pagina Database: stato del DB SQLite e console SQL di sola lettura (richiede node server.js, solo da localhost)
const PRE = [
  [
    "🏆 1°/2°/3° e pole",
    "SELECT name AS pilota, wins AS vittorie, seconds AS secondi, thirds AS terzi, poles AS pole FROM v_driver_tally ORDER BY wins DESC, seconds DESC, thirds DESC, poles DESC",
  ],
  [
    "🛠️ Punti per squadra",
    "SELECT c.name AS squadra, SUM(r.points) AS punti, SUM(r.pos=1) AS vittorie, SUM(r.pos<=3) AS podi FROM results r JOIN constructors c ON c.id=r.constructor_id GROUP BY c.id ORDER BY punti DESC",
  ],
  [
    "📈 Posizioni guadagnate",
    "SELECT d.family AS pilota, ra.name AS gara, r.grid AS partenza, r.pos AS arrivo, r.grid-r.pos AS guadagnate FROM results r JOIN drivers d ON d.id=r.driver_id JOIN races ra USING(round) WHERE r.grid>0 ORDER BY guadagnate DESC LIMIT 20",
  ],
  [
    "⏱ Pit stop più veloci",
    "SELECT d.family AS pilota, p.round AS gara, p.lap AS giro, p.duration AS durata FROM pitstops p JOIN drivers d ON d.id=p.driver_id ORDER BY CAST(p.duration AS REAL) LIMIT 20",
  ],
  [
    "🗂 Tabelle",
    "SELECT name, type FROM sqlite_master WHERE name NOT LIKE 'sqlite_%' ORDER BY type, name",
  ],
];
async function runSql(sql) {
  const o = $("#sqlo");
  o.innerHTML = '<div class="ld"><i></i>Esecuzione…</div>';
  try {
    const j = await (
      await fetch("api/query?sql=" + encodeURIComponent(sql))
    ).json();
    if (j.error) throw new Error(j.error);
    o.innerHTML = j.rows.length
      ? `<p class="mut">${j.total} righe${j.total > 500 ? " (mostrate 500)" : ""}</p>` +
        tbl(
          j.cols,
          j.rows.map((r) => j.cols.map((c) => esc(r[c]))),
          [],
          true,
        )
      : '<p class="mut">Nessuna riga.</p>';
  } catch (e) {
    o.innerHTML = `<p class="err">${esc(e.message)}</p>`;
  }
}
async function dbPage() {
  A.innerHTML =
    '<h2>Database</h2><div class="ld"><i></i>Connessione al DB…</div>';
  let m = null;
  try {
    const r = await fetch("api/meta");
    if (r.ok) m = await r.json();
  } catch {}
  if (!m) {
    A.innerHTML =
      '<h2>Database</h2><p class="mut">DB non disponibile: avvia <code>node server.js</code> e apri http://localhost:3000 (richiede Node ≥ 22.13).</p>';
    return;
  }
  A.innerHTML =
    `<h2>Database</h2><div class="stats"><div><b>${m.races}</b><small>gare</small></div><div><b>${m.results}</b><small>risultati</small></div><div><b>${m.laps}</b><small>giri</small></div><div><b>SQLite</b><small>agg. ${new Date(m.updated).toLocaleString("it-IT")}</small></div></div>` +
    `<h3 class="sec">Query pronte</h3><div class="chips">${PRE.map((p, i) => `<button class="pre" data-i="${i}">${p[0]}</button>`).join("")}</div>` +
    `<h3 class="sec">Console SQL (sola lettura)</h3><textarea id="sqli" rows="4" spellcheck="false">${esc(PRE[0][1])}</textarea><p><button id="sqlr" class="run">▶ Esegui</button></p><div id="sqlo"></div>`;
  runSql(PRE[0][1]);
}
document.addEventListener("click", (e) => {
  const p = e.target.closest(".pre"),
    r = e.target.closest("#sqlr");
  if (p) {
    $("#sqli").value = PRE[+p.dataset.i][1];
    runSql($("#sqli").value);
  }
  if (r) runSql($("#sqli").value);
});
document.addEventListener("keydown", (e) => {
  if (e.target.id === "sqli" && e.key === "Enter" && (e.ctrlKey || e.metaKey))
    runSql(e.target.value);
});
fetch("api/meta")
  .then((r) => (r.ok ? r.json() : null))
  .then((m) => {
    if (m)
      $("#dbf").textContent =
        `DB SQLite · ${m.results} risultati · agg. ${new Date(m.updated).toLocaleString("it-IT")}`;
  })
  .catch(() => {});
