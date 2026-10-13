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
  const all = S.races
    .map((r) => S.res[r.round]?.Results?.find((y) => y.Driver.driverId === id))
    .filter(Boolean);
  const nPod = all.filter((y) => +y.position <= 3).length;
  const best = Math.min(...all.map((y) => +y.position || 99));
  const T = tally("d", id),
    stats = [
      ...(d.dateOfBirth ? [["🎂 Età", age(d.dateOfBirth) + " anni"]] : []),
      ["Gare", all.length],
      [medal(1) + " Vittorie", T.w],
      [medal(2) + " 2° posti", T.s],
      [medal(3) + " 3° posti", T.t],
      ["⏱ Pole", T.p],
      ["Podi", nPod],
      ["Migliore", all.length ? best + "°" : "-"],
      ["Punti", st?.points ?? "-"],
    ];
  const tm = st?.Constructors?.at(-1) || all.at(-1)?.Constructor;
  const mx = Math.max(
    1,
    ...S.races.map(
      (r) =>
        +(
          S.res[r.round]?.Results?.find((y) => y.Driver.driverId === id)
            ?.points || 0
        ),
    ),
  );
  // Per ogni gara: punti, barra, numero gara, posizione d'arrivo, griglia e qualifica (POLE sì/no)
  const spark = `<div class="spark" style="--tc:${col(tm?.constructorId || "x")}">${S.races
    .map((r) => {
      const y = S.res[r.round]?.Results?.find((z) => z.Driver.driverId === id),
        q = S.q[r.round]?.QualifyingResults?.find(
          (z) => z.Driver.driverId === id,
        ),
        p = +(y?.points || 0),
        pole = !!q && +q.position === 1,
        n = +y?.position,
        cls = pole ? " pole" + (n >= 1 && n <= 3 ? " pd" + n : "") : "",
        tip =
          `${r.raceName}\n` +
          (y
            ? `Arrivo: ${isNaN(+y.positionText) ? y.status || y.positionText : y.positionText + "°"}${y.grid ? " · Griglia: " + (y.grid === "0" ? "corsia box" : y.grid + "°") : ""} · ${p} pt`
            : "Gara non ancora disputata") +
          (q ? `\nQualifica: ${pole ? "POLE POSITION" : q.position + "°"}` : "");
      return `<a href="#/race/${r.round}" class="sc${y ? "" : " off"}${cls}" title="${esc(tip)}"><span class="spm">${medal(n)}</span><b class="spv">${y ? p : ""}</b><span class="spb"><i style="height:${y ? Math.max(6, (p / mx) * 100) : 3}%" class="${y ? ["", "g", "s", "b"][n] || "" : "off"}"></i></span><small>${r.round}</small>${y ? pb(y.positionText) : '<span class="pb n">·</span>'}<em class="spg">${y ? (y.grid && y.grid !== "0" ? "G" + y.grid : "BOX") : ""}</em><u class="spp${pole ? " on" : ""}">${pole ? "⏱ POLE" : q ? "Q" + q.position : y ? "-" : ""}</u></a>`;
    })
    .join("")}</div><p class="mut sl">Barra = punti · <b>numero</b> = gara · badge = posizione d'arrivo (${medal(1)}${medal(2)}${medal(3)} podio, R = ritirato) · G = griglia di partenza · ⏱ POLE = pole position, Q = posizione in qualifica</p>`;
  A.innerHTML =
    `<div class="hero dh" style="--tc:${col(tm?.constructorId || "x")}"><span class="wm">${d.permanentNumber || ""}</span>${ph(d)}<div><h2 style="margin:0">${d.givenName} ${d.familyName}</h2><span class="mut">${flag(d.nationality)} ${d.nationality}${d.dateOfBirth ? " · " + bio(d) : ""}</span><br>${tm ? `<a class="tn" href="#/team/${tm.constructorId}">${ticon(tm.constructorId, tm.name, 26)}${tm.name}</a>` : ""}${st ? ` <b class="pill">${st.position}° · ${st.points} pt · ${st.wins} vitt.</b>` : ""}</div>${pn("d", id)}</div>` +
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
