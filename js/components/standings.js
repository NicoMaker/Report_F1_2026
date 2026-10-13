function drivers() {
  const m = +S.ds[0]?.points || 1;
  A.innerHTML =
    `<h2>Classifica piloti</h2>` +
    podD(S.ds) +
    tbl(
      ["#", "Pilota", "Squadra", "🥇 Vitt.", "🥈 2°", "🥉 3°", "⏱ Pole", "Punti"],
      S.ds.map((s) => [
        s.positionText,
        dn(s.Driver),
        tn(s.Constructors?.at(-1)),
        ...T3(tally("d", s.Driver.driverId)),
        `<b>${s.points}</b><div class="bar" style="width:${(s.points / m) * 100}%;background:${col(s.Constructors?.at(-1)?.constructorId || "x")}"></div>`,
      ]),
      pod(S.ds.map((s) => [+s.position])),
    ) +
    `<h2 style="margin-top:20px">Tutti i piloti</h2>${fbox("Cerca pilota, numero, nazionalità…")}<div class="grid">${S.drivers.map((d) => { const t = S.ds.find((x) => x.Driver.driverId === d.driverId)?.Constructors?.at(-1); return `<a class="card dcd" style="--tc:${col(t?.constructorId || "x")}" href="#/driver/${d.driverId}"><span class="wm">${d.permanentNumber || ""}</span><div class="dn">${ph(d)}<span><b>${d.givenName} ${d.familyName}</b><br><small>${flag(d.nationality)} ${d.nationality}${t ? " · " + t.name : ""}</small></span></div>${tlh(tally("d", d.driverId))}</a>`; }).join("")}</div>`;
}
function teams() {
  const m = +S.cs[0]?.points || 1;
  const drv = (id) => S.ds.filter((d) => d.Constructors?.some((x) => x.constructorId === id));
  A.innerHTML =
    `<h2>Squadre 2026</h2><div class="wall">${S.cs.map((c) => `<a href="#/team/${c.Constructor.constructorId}">${ticon(c.Constructor.constructorId, c.Constructor.name, 56)}<small>${c.Constructor.name}</small></a>`).join("")}</div>` +
    podT(S.cs) +
    `${fbox("Cerca squadra o pilota…")}<div class="grid tg">${S.cs
      .map((c) => {
        const id = c.Constructor.constructorId, k = col(id);
        return `<div class="tc" style="--tc:${k}"><a class="tch" href="#/team/${id}">${ticon(id, c.Constructor.name, 52)}<span><b>${c.Constructor.name}</b><small>${c.Constructor.nationality || ""}</small></span><i>${c.positionText}°</i></a><div class="tcs"><span><b>${c.points}</b> pt</span></div>${tlh(tally("c", id))}<div class="bar" style="width:${(c.points / m) * 100}%;background:${k}"></div>${drv(id).map((d) => `<div class="tcd">${dn(d.Driver)}<em>${d.points} pt</em></div>`).join("")}</div>`;
      })
      .join("")}</div>` +
    `<h2 style="margin-top:22px">Classifica costruttori</h2>` +
    tbl(
      ["#", "Squadra", "🥇 Vitt.", "🥈 2°", "🥉 3°", "⏱ Pole", "Punti"],
      S.cs.map((s) => [s.positionText, tn(s.Constructor), ...T3(tally("c", s.Constructor.constructorId)), `<b>${s.points}</b><div class="bar" style="width:${(s.points / m) * 100}%;background:${col(s.Constructor.constructorId)}"></div>`]),
      pod(S.cs.map((s) => [+s.position])),
    );
}
function team(id) {
  const c = S.cs.find((x) => x.Constructor.constructorId === id);
  if (!c) throw new Error("Squadra non trovata");
  const C = c.Constructor, k = col(id);
  const ds = S.ds.filter((d) => d.Constructors?.some((x) => x.constructorId === id));
  const rows = S.races
    .map((r) => {
      const rs = (S.res[r.round]?.Results || []).filter((y) => y.Constructor.constructorId === id);
      return rs.length && [`<a href="#/race/${r.round}">${r.raceName}</a>`, rs.map((y) => dn(y.Driver)).join(""), rs.map((y) => y.positionText).join(" · "), `<b>${rs.reduce((a, y) => a + +y.points, 0)}</b>`];
    })
    .filter(Boolean);
  const pods = S.races.reduce((n, r) => n + (S.res[r.round]?.Results || []).filter((y) => y.Constructor.constructorId === id && +y.position <= 3).length, 0);
  const T = tally("c", id), stats = [["Classifica", c.position + "°"], ["Punti", c.points], ["🥇 Vittorie", T.w], ["🥈 2° posti", T.s], ["🥉 3° posti", T.t], ["⏱ Pole", T.p], ["Podi", T.w + T.s + T.t]];
  A.innerHTML =
    `<div class="hero th" style="--tc:${k}">${ticon(id, C.name, 104)}<div><h2 style="margin:0">${C.name}</h2><span class="mut">${C.nationality || ""} · ${ds.length} piloti</span></div></div>` +
    `<div class="stats">${stats.map(([a, b]) => `<div><b>${b}</b><small>${a}</small></div>`).join("")}</div>` +
    `<div class="chips">${ds.map((d) => `<span class="chip">${dn(d.Driver)}<em>${d.points} pt</em></span>`).join("")}</div>` +
    tbl(["Gara", "Piloti", "Arrivo", "Punti"], rows);
}
