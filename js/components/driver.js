function driver(id) {
  const d = S.drivers.find((x) => x.driverId === id);
  if (!d) throw new Error("Pilota non trovato");
  const st = S.ds.find((x) => x.Driver.driverId === id);
  const rows = S.races
    .map((r) => {
      const x = S.res[r.round]?.Results?.find((y) => y.Driver.driverId === id);
      return (
        x && [
          `<a href="#/race/${r.round}">${r.raceName}</a>`,
          tn(x.Constructor),
          x.grid,
          pb(x.positionText),
          x.points,
          x.Time?.time || x.status,
          x.FastestLap?.Time?.time || "",
        ]
      );
    })
    .filter(Boolean);
  const all = S.races.map((r) => S.res[r.round]?.Results?.find((y) => y.Driver.driverId === id)).filter(Boolean);
  const nPod = all.filter((y) => +y.position <= 3).length;
  const best = Math.min(...all.map((y) => +y.position || 99));
  const T = tally("d", id), stats = [...(d.dateOfBirth ? [["🎂 Età", age(d.dateOfBirth) + " anni"]] : []), ["Gare", all.length], ["🥇 Vittorie", T.w], ["🥈 2° posti", T.s], ["🥉 3° posti", T.t], ["⏱ Pole", T.p], ["Podi", nPod], ["Migliore", all.length ? best + "°" : "-"], ["Punti", st?.points ?? "-"]];
  const tm = st?.Constructors?.at(-1) || all.at(-1)?.Constructor;
  const mx = Math.max(1, ...S.races.map((r) => +(S.res[r.round]?.Results?.find((y) => y.Driver.driverId === id)?.points || 0)));
  const spark = `<div class="spark" style="--tc:${col(tm?.constructorId || "x")}">${S.races.map((r) => { const y = S.res[r.round]?.Results?.find((z) => z.Driver.driverId === id), p = +(y?.points || 0); return `<a href="#/race/${r.round}" title="${r.raceName}: ${y ? "P" + y.positionText + " · " + p + " pt" : "—"}"><i style="height:${y ? Math.max(6, (p / mx) * 100) : 3}%" class="${y ? "" : "off"}"></i><small>${r.round}</small></a>`; }).join("")}</div>`;
  A.innerHTML =
    `<div class="hero dh" style="--tc:${col(tm?.constructorId || "x")}"><span class="wm">${d.permanentNumber || ""}</span>${ph(d)}<div><h2 style="margin:0">${d.givenName} ${d.familyName}</h2><span class="mut">${flag(d.nationality)} ${d.nationality}${d.dateOfBirth ? " · " + bio(d) : ""}</span><br>${tm ? `<a class="tn" href="#/team/${tm.constructorId}">${ticon(tm.constructorId, tm.name, 26)}${tm.name}</a>` : ""}${st ? ` <b class="pill">${st.position}° · ${st.points} pt · ${st.wins} vitt.</b>` : ""}</div></div>` +
    `<div class="stats">${stats.map(([a, b]) => `<div><b>${b}</b><small>${a}</small></div>`).join("")}</div>` +
    `<h3 class="sec">Punti gara per gara</h3>${spark}` +
    tbl(
      [
        "Gara",
        "Squadra",
        "Griglia",
        "Arrivo",
        "Punti",
        "Tempo / stato",
        "Giro veloce",
      ],
      rows,
    );
}
