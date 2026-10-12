// Condiviso da browser e Node (server.js). Fonte dati: Jolpica (Ergast) + Wikipedia per le foto.
(function () {
  const BASE = "https://api.jolpi.ca/ergast/f1/2026";
  const CORE = [
    "races",
    "drivers",
    "photos",
    "results",
    "qualifying",
    "sprint",
    "driverStandings",
    "constructorStandings",
  ];
  const P = {
    races: "/races",
    results: "/results",
    qualifying: "/qualifying",
    sprint: "/sprint",
    drivers: "/drivers",
    driverStandings: "/driverstandings",
    constructorStandings: "/constructorstandings",
  };
  const R = {
    dstand: "driverstandings",
    cstand: "constructorstandings",
    pitstops: "pitstops",
    laps: "laps",
  };
  const path = (k) => {
    const m = k.match(/^(\w+)_(\d+)$/);
    return m ? `/${m[2]}/${R[m[1]]}` : P[k];
  };
  const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
  async function req(u) {
    for (let i = 1; i <= 6; i++) {
      const r = await fetch(u);
      if (r.ok) return r.json();
      if (r.status !== 429) throw new Error("HTTP " + r.status + " " + u);
      await sleep(2500 * i);
    }
    throw new Error("Rate limit " + u);
  }
  function merge(a, b) {
    if (a.Drivers) {
      a.Drivers.push(...b.Drivers);
      return;
    }
    if (!a.Races) return;
    for (const r of b.Races) {
      const x = a.Races.find((y) => y.round === r.round);
      if (!x) {
        a.Races.push(r);
        continue;
      }
      for (const f of [
        "Results",
        "QualifyingResults",
        "SprintResults",
        "PitStops",
      ])
        if (r[f]) x[f] = (x[f] || []).concat(r[f]);
      if (r.Laps)
        for (const l of r.Laps) {
          const y = x.Laps.find((z) => z.number === l.number);
          y ? y.Timings.push(...l.Timings) : x.Laps.push(l);
        }
    }
  }
  async function fetchLive(k) {
    if (k === "photos") {
      const o = {};
      await Promise.all(
        (await fetchLive("drivers")).Drivers.map(async (d) => {
          try {
            const j = await (
              await fetch(
                "https://en.wikipedia.org/api/rest_v1/page/summary/" +
                  d.url.split("/").pop(),
              )
            ).json();
            if (j.thumbnail) o[d.driverId] = j.thumbnail.source;
          } catch {}
        }),
      );
      return o;
    }
    let off = 0,
      total = 1,
      out = null;
    while (off < total) {
      const m = (await req(`${BASE}${path(k)}.json?limit=100&offset=${off}`))
        .MRData;
      total = +m.total;
      off += 100;
      const t = m.RaceTable || m.StandingsTable || m.DriverTable;
      out ? merge(out, t) : (out = t);
      if (off < total) await sleep(300);
    }
    return out;
  }
  const MEM = {};
  async function load(k) {
    // 1) file salvato dal server 2) API live 3) cache locale
    if (MEM[k]) return MEM[k];
    try {
      const r = await fetch("data/" + k + ".json", { cache: "no-store" });
      if (r.ok) return (MEM[k] = await r.json());
    } catch {}
    try {
      const j = await fetchLive(k);
      MEM[k] = j;
      try {
        localStorage.setItem("f1_" + k, JSON.stringify(j));
      } catch {}
      return j;
    } catch (e) {
      const c = localStorage.getItem("f1_" + k);
      if (c) return (MEM[k] = JSON.parse(c));
      throw e;
    }
  }
  const F1 = {
    fetchLive,
    load,
    CORE,
    reset: () => {
      for (const k in MEM) delete MEM[k];
    },
  };
  typeof module !== "undefined" ? (module.exports = F1) : (window.F1 = F1);
})();
