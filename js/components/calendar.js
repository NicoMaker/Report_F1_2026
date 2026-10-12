function cal() {
  A.innerHTML = `<h2>Calendario e risultati</h2>${nextRace()}<div class="grid">${S.races
    .map((r) => {
      const w = S.res[r.round]?.Results?.[0],
        c = r.Circuit.Location;
      return `<a class="card" href="#/race/${r.round}"><small>Gara ${r.round} · ${fd(r)}</small><h3>${r.raceName}</h3><p>${c.locality}, ${c.country}</p>${w ? `<div class="w">🏆 ${w.Driver.givenName[0]}. ${w.Driver.familyName} <span>${w.Constructor.name}</span></div>` : '<div class="w soon">In programma</div>'}</a>`;
    })
    .join("")}</div>`;
}
