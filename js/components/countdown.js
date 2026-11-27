// Prossima gara: conto alla rovescia live (giorni · ore · minuti · secondi), orari nel fuso del circuito
// e nel tuo fuso, una riga con conto alla rovescia per ogni sessione del weekend.
// Fine stagione: card "Campionato finito".

// Fuso orario IANA del circuito: prima per circuito (paesi con più fusi), poi per nazione
const TZ_CIRCUIT = [
  [/miami/, "America/New_York"],
  [/americas|austin/, "America/Chicago"],
  [/vegas/, "America/Los_Angeles"],
  [/villeneuve|montreal/, "America/Toronto"],
  [/mandalika|lombok/, "Asia/Makassar"],
];
const TZ_COUNTRY = [
  ["australia", "Australia/Melbourne"],
  ["austria", "Europe/Vienna"],
  ["azerbaijan", "Asia/Baku"],
  ["belgium", "Europe/Brussels"],
  ["brazil", "America/Sao_Paulo"],
  ["canada", "America/Toronto"],
  ["china", "Asia/Shanghai"],
  ["czech", "Europe/Prague"],
  ["france", "Europe/Paris"],
  ["germany", "Europe/Berlin"],
  ["hungary", "Europe/Budapest"],
  ["indonesia", "Asia/Jakarta"],
  ["italy", "Europe/Rome"],
  ["japan", "Asia/Tokyo"],
  ["malaysia", "Asia/Kuala_Lumpur"],
  ["mexico", "America/Mexico_City"],
  ["monaco", "Europe/Monaco"],
  ["netherlands", "Europe/Amsterdam"],
  ["portugal", "Europe/Lisbon"],
  ["qatar", "Asia/Qatar"],
  ["san marino", "Europe/San_Marino"],
  ["singapore", "Asia/Singapore"],
  ["spain", "Europe/Madrid"],
  ["thailand", "Asia/Bangkok"],
  ["uae", "Asia/Dubai"],
  ["united arab", "Asia/Dubai"],
  ["uk", "Europe/London"],
  ["united kingdom", "Europe/London"],
  ["usa", "America/New_York"],
  ["united states", "America/New_York"],
];
const circuitTz = (r) => {
  const id = (r.Circuit.circuitId + " " + r.Circuit.Location.locality).toLowerCase();
  const byC = TZ_CIRCUIT.find(([re]) => re.test(id));
  if (byC) return byC[1];
  const c = String(r.Circuit.Location.country || "").toLowerCase();
  return TZ_COUNTRY.find(([k]) => c.startsWith(k))?.[1] || "UTC";
};

// Sessioni del weekend presenti nei dati (con data E ora), in ordine cronologico; la gara è l'ultima
const SESSIONS = [
  ["FirstPractice", "Prove libere 1"],
  ["SecondPractice", "Prove libere 2"],
  ["ThirdPractice", "Prove libere 3"],
  ["SprintQualifying", "Qualifica Sprint"],
  ["Sprint", "Sprint"],
  ["Qualifying", "Qualifica"],
];
const weekend = (r) =>
  [
    ...SESSIONS.filter(([k]) => r[k]?.date && r[k]?.time).map(([k, l]) => ({
      label: l,
      ts: Date.parse(r[k].date + "T" + r[k].time),
    })),
    { label: "Gara", ts: Date.parse(r.date + "T" + (r.time || "12:00:00Z")), race: true },
  ]
    .filter((s) => !isNaN(s.ts))
    .sort((a, b) => a.ts - b.ts);

const fmtWhen = (ts, tz) =>
  new Intl.DateTimeFormat("it-IT", {
    timeZone: tz,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  }).format(ts);
const tzShort = (ts, tz) =>
  new Intl.DateTimeFormat("it-IT", { timeZone: tz, timeZoneName: "short" })
    .formatToParts(ts)
    .find((p) => p.type === "timeZoneName")?.value || tz;
const myTz = () => Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

const split = (ms) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return { d: Math.floor(s / 86400), h: Math.floor(s / 3600) % 24, m: Math.floor(s / 60) % 60, s: s % 60 };
};
const p2 = (n) => String(n).padStart(2, "0");
// Dopo l'inizio, la gara dura circa 2 ore e mezza: poi si aspettano i risultati
const RACE_MS = 2.5 * 36e5;

const bigCd = (ts, race) => {
  const ms = ts - Date.now();
  if (ms <= 0)
    return `<div class="cdst">${Date.now() - ts < RACE_MS ? "🔴 Gara in corso" : Date.now() - ts < 864e5 ? "⏳ Risultati in arrivo" : "Gara già disputata · risultati non ancora disponibili"}</div>`;
  const t = split(ms),
    u = (v, l) => `<div class="cdu"><b>${race ? p2(v) : v}</b><small>${l}</small></div>`;
  return u(t.d, "giorni") + u(t.h, "ore") + u(t.m, "min") + u(t.s, "sec");
};
const miniCd = (ts) => {
  const ms = ts - Date.now();
  if (ms <= 0) return "Terminata";
  const t = split(ms);
  return (t.d ? t.d + "g " : "") + `${p2(t.h)}:${p2(t.m)}:${p2(t.s)}`;
};

const nextRace = () => {
  if (!S.races?.length) return "";
  const r = S.races.find((x) => !S.res[x.round]);
  if (!r)
    return `<div class="next end"><span class="fg">🏁</span><div><small>Stagione 2026</small><h3>Campionato finito</h3><p>Tutte le ${S.races.length} gare sono state disputate. Appuntamento alla prossima stagione!</p></div></div>`;
  const tz = circuitTz(r),
    me = myTz(),
    ses = weekend(r),
    race = ses.find((s) => s.race),
    nx = ses.find((s) => s.ts > Date.now()) || race;
  const rows = ses
    .map((s) => {
      const a = `${fmtWhen(s.ts, tz)} (${tzShort(s.ts, tz)})`,
        b = fmtWhen(s.ts, me);
      return `<div class="nxr${s.ts <= Date.now() ? " done" : ""}${s === nx ? " nx" : ""}${s.race ? " rc" : ""}"><div class="nxl"><b>${s.label}</b><span>📍 Circuito: ${a}</span>${tz === me ? "" : `<span>🏠 Tu: ${b}</span>`}</div><span class="nxt" data-ts="${s.ts}">${miniCd(s.ts)}</span></div>`;
    })
    .join("");
  return (
    `<a class="next" href="#/race/${r.round}"><span class="fg">${flag(r.Circuit.Location.country)}</span><div><small>Prossima gara · ${fd(r)}</small><h3>${r.raceName}</h3><p>${r.Circuit.circuitName} · ${r.Circuit.Location.locality}</p></div><div class="cdw" data-ts="${race.ts}" data-race="1">${bigCd(race.ts, true)}</div></a>` +
    `<section class="nxs"><h3 class="sec">Weekend di gara · orari e conto alla rovescia</h3><div class="nxg">${rows}</div><p class="mut nxn">Orari "Circuito" nel fuso del posto (${tz.replace(/_/g, " ")}); "Tu" nel tuo fuso (${me.replace(/_/g, " ")}).</p></section>`
  );
};

// Aggiorna tutti i conti alla rovescia presenti nella pagina ogni secondo
setInterval(() => {
  document.querySelectorAll(".cdw[data-ts]").forEach((e) => (e.innerHTML = bigCd(+e.dataset.ts, true)));
  document.querySelectorAll(".nxt[data-ts]").forEach((e) => {
    const ts = +e.dataset.ts,
      t = miniCd(ts);
    if (e.textContent !== t) e.textContent = t;
    if (ts <= Date.now()) e.closest(".nxr")?.classList.add("done");
  });
}, 1000);
