const TABS = [
  ["res", "Risultati"],
  ["q", "Qualifica"],
  ["sp", "Sprint"],
  ["laps", "Giri"],
  ["pit", "Pit stop"],
  ["st", "Classifica dopo gara"],
];
async function race(n, tab = "res") {
  n = n || lastDone() || 1;
  const r = S.races.find((x) => x.round == n);
  if (!r) throw new Error("Gara non trovata");
  const L = r.Circuit.Location, w = S.res[n]?.Results?.[0], pq = S.q[n]?.QualifyingResults?.[0], tot = S.races.length;
  let h =
    `<div class="hero rh"><span class="fg big">${flag(L.country)}</span><div><small class="mut">Gara ${r.round} di ${tot}</small><h2 style="margin:2px 0">${r.raceName}</h2><span class="mut">${r.Circuit.circuitName} · ${L.locality}, ${L.country} · ${fd(r)}</span>${w ? `<br><b>🏆 ${w.Driver.givenName} ${w.Driver.familyName}</b>` : ""}${pq ? `<br><span class="mut">⏱ Pole: ${pq.Driver.givenName} ${pq.Driver.familyName}</span>` : ""}</div><div class="nv">${+n > 1 ? `<a href="#/race/${+n - 1}/${tab}">‹</a>` : ""}${+n < tot ? `<a href="#/race/${+n + 1}/${tab}">›</a>` : ""}</div></div>` +
    sel(
      "rs",
      S.races.map((x) => [x.round, `${x.round}. ${x.raceName}`]),
      n,
    ) +
    `<div class="tabs">${TABS.map(([k, l]) => `<a href="#/race/${n}/${k}" class="${k === tab ? "on" : ""}">${l}</a>`).join("")}</div>`;
  const none =
    '<p class="mut">Dati non ancora disponibili per questa sessione.</p>';
  if (tab === "res") {
    const x = S.res[n]?.Results;
    h += x
      ? podR(x, (y) => y.Time?.time || y.status) +
        tbl(
          [
            "#",
            "Pilota",
            "Squadra",
            "Griglia",
            "Giri",
            "Tempo / stato",
            "Giro veloce",
            "Pt",
          ],
          x.map((y) => [
            y.positionText,
            dn(y.Driver),
            tn(y.Constructor),
            y.grid,
            y.laps,
            y.Time?.time || y.status,
            y.FastestLap
              ? `<span class="${y.FastestLap.rank == 1 ? "fl" : ""}">${y.FastestLap.Time.time} (g.${y.FastestLap.lap})</span>`
              : "",
            y.points,
          ]),
          pod(x.map((y) => [+y.position])),
        )
      : none;
  }
  if (tab === "q") {
    const x = S.q[n]?.QualifyingResults;
    h += x
      ? podR(x, (y) => y.Q3 || y.Q2 || y.Q1) +
        tbl(
          ["#", "Pilota", "Squadra", "Q1", "Q2", "Q3"],
          x.map((y) => [
            y.position,
            dn(y.Driver),
            tn(y.Constructor),
            y.Q1,
            y.Q2,
            y.Q3,
          ]),
          pod(x.map((y) => [+y.position])),
        )
      : none;
  }
  if (tab === "sp") {
    const x = S.sp[n]?.SprintResults;
    h += x
      ? podR(x, (y) => y.Time?.time || y.status) +
        tbl(
          ["#", "Pilota", "Squadra", "Griglia", "Tempo / stato", "Pt"],
          x.map((y) => [
            y.positionText,
            dn(y.Driver),
            tn(y.Constructor),
            y.grid,
            y.Time?.time || y.status,
            y.points,
          ]),
          pod(x.map((y) => [+y.position])),
        )
      : '<p class="mut">Nessuna sprint in questo weekend.</p>';
  }
  if (tab === "laps") {
    const l = (await F1.load("laps_" + n).catch(() => null))?.Races?.[0]?.Laps;
    if (!l?.length) h += none;
    else {
      const ids = [...new Set(l[0].Timings.map((t) => t.driverId))],
        cur = S.lapDrv && ids.includes(S.lapDrv) ? S.lapDrv : ids[0];
      S.lapDrv = cur;
      const all = l.flatMap((x) => x.Timings.map((t) => sec(t.time))),
        best = Math.min(...all),
        mine = l
          .map((x) => x.Timings.find((t) => t.driverId === cur))
          .filter(Boolean),
        my = Math.min(...mine.map((t) => sec(t.time)));
      h +=
        sel(
          "ld",
          ids.map((i) => [
            i,
            S.drivers.find((d) => d.driverId === i)?.familyName || i,
          ]),
          cur,
        ) +
        `<p class="mut">Giro più veloce gara: <span class="fl">${best.toFixed(3)}s</span> · Migliore del pilota: ${my.toFixed(3)}s</p>` +
        tbl(
          ["Giro", "Posizione", "Tempo"],
          l
            .map((x) => {
              const t = x.Timings.find((t) => t.driverId === cur);
              return (
                t && [
                  x.number,
                  t.position,
                  `<span class="${sec(t.time) === best ? "fl" : sec(t.time) === my ? "mut" : ""}">${t.time}</span>`,
                ]
              );
            })
            .filter(Boolean),
        );
    }
  }
  if (tab === "pit") {
    const p = (await F1.load("pitstops_" + n).catch(() => null))?.Races?.[0]
      ?.PitStops;
    h += p?.length
      ? tbl(
          ["Pilota", "Sosta", "Giro", "Ora", "Durata"],
          p.map((x) => [
            dn(
              S.drivers.find((d) => d.driverId === x.driverId) || {
                driverId: x.driverId,
                givenName: "?",
                familyName: x.driverId,
              },
            ),
            x.stop,
            x.lap,
            x.time,
            x.duration,
          ]),
        )
      : none;
  }
  if (tab === "st") {
    const [a, b] = await Promise.all(
      ["dstand_", "cstand_"].map((k) => F1.load(k + n).catch(() => null)),
    );
    h += a
      ? `<div class="two"><div><h3>Piloti</h3>${tbl(
          ["#", "Pilota", "Pt"],
          ds(a).map((s) => [
            s.positionText,
            dn(s.Driver),
            `<b>${s.points}</b>`,
          ]),
        )}</div><div><h3>Squadre</h3>${tbl(
          ["#", "Squadra", "Pt"],
          cs(b).map((s) => [
            s.positionText,
            tn(s.Constructor),
            `<b>${s.points}</b>`,
          ]),
        )}</div></div>`
      : none;
  }
  A.innerHTML = h;
  $("#rs").onchange = (e) =>
    (location.hash = `#/race/${e.target.value}/${tab}`);
  const ld = $("#ld");
  if (ld)
    ld.onchange = (e) => {
      S.lapDrv = e.target.value;
      race(n, "laps");
    };
}
