function cal() {
  const done = lastDone(), tot = S.races.length, L = S.ds[0], T = S.cs[0], lc = L?.Constructors?.at(-1);
  const nx = S.races.find((x) => !S.res[x.round]);
  const dash =
    `<div class="dash"><div class="dc2"><small>Stagione 2026</small><b class="big">${done}<span>/${tot}</span></b><div class="bar2"><i style="width:${(done / tot) * 100}%"></i></div><small>gare disputate</small></div>` +
    (L ? `<a class="dc2" href="#/driver/${L.Driver.driverId}" style="--tc:${col(lc?.constructorId || "x")}"><small>Leader piloti</small><div class="dn">${ph(L.Driver)}<span><b>${L.Driver.familyName}</b><br><small>${L.points} pt</small></span></div>${tlh(tally("d", L.Driver.driverId))}</a>` : "") +
    (T ? `<a class="dc2" href="#/team/${T.Constructor.constructorId}" style="--tc:${col(T.Constructor.constructorId)}"><small>Leader costruttori</small><div class="dn">${ticon(T.Constructor.constructorId, T.Constructor.name, 42)}<span><b>${T.Constructor.name}</b><br><small>${T.points} pt</small></span></div>${tlh(tally("c", T.Constructor.constructorId))}</a>` : "") +
    `</div>`;
  const card = (r) => {
    const res = S.res[r.round]?.Results, c = r.Circuit.Location, n = nx && nx.round === r.round;
    return `<a class="rc${n ? " nx" : ""}" href="#/race/${r.round}"><span class="rn">${r.round}</span><div class="rt"><span class="fg">${flag(c.country)}</span><small>${fd(r)}${S.sp[r.round] ? " · <u>SPRINT</u>" : ""}</small></div><h3>${r.raceName}</h3><p>${c.locality}, ${c.country}</p>${
      res ? `<div class="mp">${res.slice(0, 3).map((y, i) => `<span style="--tc:${col(y.Constructor.constructorId)}"><i>${i + 1}</i>${y.Driver.code || y.Driver.familyName.slice(0, 3).toUpperCase()}</span>`).join("")}</div>` : `<div class="w soon">${n ? "⏱ Prossima gara" : "In programma"}</div>`
    }</a>`;
  };
  A.innerHTML = `<h2>Calendario e risultati</h2>${dash}${nextRace()}${fbox("Cerca gara, circuito, paese, vincitore…")}<div class="grid rg">${S.races.map(card).join("")}</div>`;
}
