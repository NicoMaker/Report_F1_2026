const esc = (s) =>
  String(s ?? "").replace(
    /[&<>"]/g,
    (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c],
  );
// Emblemi squadra: generati (forma + colori + sigla). Se esiste img/teams/<id>.svg lo usa al suo posto.
const TI = {
  mercedes: ["#00d2be", "#0b4f4a", "MER", "circle"],
  ferrari: ["#e8002d", "#7a0016", "SF", "shield"],
  mclaren: ["#ff8000", "#8a3d00", "MCL", "diamond"],
  red_bull: ["#3671c6", "#12285a", "RB", "badge"],
  rb: ["#6692ff", "#1c2f6e", "VR", "hex"],
  alpine: ["#ff87bc", "#2a56c6", "ALP", "octagon"],
  haas: ["#d6001c", "#2a2c30", "HAAS", "rounded"],
  audi: ["#c4001d", "#1b1b1b", "AUDI", "circle"],
  williams: ["#2f9be0", "#0a2a66", "W", "badge"],
  aston_martin: ["#229971", "#06352a", "AMR", "shield"],
  cadillac: ["#c8a24a", "#16161a", "CAD", "diamond"],
};
const ticon = (id, name = "", s) => {
  const t = TI[id] || [
    col(id),
    "#111",
    (name || id).slice(0, 3).toUpperCase(),
    "hex",
  ];
  return `<span class="ti sh-${t[3]} l${t[2].length}" style="--c1:${t[0]};--c2:${t[1]}${s ? ";--s:" + s + "px" : ""}" title="${esc(name)}"><b>${t[2]}</b><img src="img/teams/${id}.svg" alt="" onload="this.parentNode.classList.add('im')" onerror="this.remove()"></span>`;
};
// Conteggio 1°/2°/3° posti in gara e pole (qualifica) per pilota ("d") o squadra ("c")
const tally = (by, id) => {
  const o = { w: 0, s: 0, t: 0, p: 0 },
    k = (y) => (by === "d" ? y.Driver.driverId : y.Constructor.constructorId);
  for (const r of S.races) {
    for (const y of S.res[r.round]?.Results || [])
      if (k(y) === id) {
        const p = +y.position;
        if (p === 1) o.w++;
        else if (p === 2) o.s++;
        else if (p === 3) o.t++;
      }
    const q = S.q[r.round]?.QualifyingResults?.find((y) => +y.position === 1);
    if (q && k(q) === id) o.p++;
  }
  o.pod = o.w + o.s + o.t;
  return o;
};
const T3 = (o) => [o.w, o.s, o.t, o.p];
const tlh = (o) =>
  `<span class="tl"><b title="Vittorie">🥇 ${o.w}</b><b title="Secondi posti">🥈 ${o.s}</b><b title="Terzi posti">🥉 ${o.t}</b><b title="Pole position">⏱ Pole ${o.p}</b></span>`;
// Foto pilota con piccolo logo della sua squadra
const ph = (d) => {
  const c = S.dc?.[d.driverId];
  return `<span class="av">${S.photos[d.driverId] ? `<img class="ph" src="${S.photos[d.driverId]}" alt="" loading="lazy">` : `<i class="ph">${d.code || d.familyName.slice(0, 3).toUpperCase()}</i>`}${c ? ticon(c, c.replace(/_/g, " ")) : ""}</span>`;
};
// Badge posizione: oro/argento/bronzo, punti, fuori dai punti, ritiro (R, D, W…)
const pb = (t) => {
  const n = +t,
    x = isNaN(n);
  return `<span class="pb ${x ? "x" : n === 1 ? "g" : n === 2 ? "s" : n === 3 ? "b" : n <= 10 ? "p" : "n"}">${x ? t : n}</span>`;
};
const dn = (d) =>
  `<a class="dn" href="#/driver/${d.driverId}">${ph(d)}<span>${d.givenName[0]}. <b>${d.familyName}</b></span></a>`;
const tn = (c) =>
  c
    ? `<a class="tn" href="#/team/${c.constructorId}">${ticon(c.constructorId, c.name, 26)}${c.name}</a>`
    : "";
const fbox = (p = "Filtra…") =>
  `<input class="tf" type="search" placeholder="🔎 ${p}" aria-label="${p}">`;
// Tabella con filtro testuale automatico (>6 righe) e colonne ordinabili (click sull'intestazione)
const tbl = (h, rows, cls = [], f = rows.length > 6) =>
  `${f ? fbox() : ""}<div class="tw"><table><thead><tr>${h.map((x) => `<th title="Ordina">${x}</th>`).join("")}</tr></thead><tbody>${rows.map((r, i) => `<tr class="${cls[i] || ""}">${r.map((c) => `<td>${c ?? ""}</td>`).join("")}</tr>`).join("")}</tbody></table></div>`;
const sel = (id, opts, v) =>
  `<select id="${id}">${opts.map(([a, b]) => `<option value="${a}"${a == v ? " selected" : ""}>${b}</option>`).join("")}</select>`;

// Podio: 2° a sinistra, 1° AL CENTRO (più alto), 3° a destra. l = [{pos,href,c,img,name,sub,val}] in ordine 1,2,3
const podium = (l) =>
  `<div class="podium">${[1, 0, 2]
    .map((i) => l[i])
    .filter(Boolean)
    .map(
      (x) =>
        `<a class="pc s${x.pos}" href="${x.href}" style="--tc:${x.c}">${x.pos === 1 ? '<u class="cr">👑</u>' : ""}${x.img}<small>${x.pos}°</small><b>${x.name}</b><span class="ps">${x.sub}</span><em>${x.val}</em>${x.tl || ""}</a>`,
    )
    .join("")}</div>`;
const podD = (ds) =>
  podium(
    ds.slice(0, 3).map((s, i) => {
      const c = s.Constructors?.at(-1);
      return {
        pos: i + 1,
        href: `#/driver/${s.Driver.driverId}`,
        c: col(c?.constructorId || "x"),
        img: ph(s.Driver),
        name: s.Driver.familyName,
        sub: c?.name || "",
        val: s.points + " pt",
        tl: tlh(tally("d", s.Driver.driverId)),
      };
    }),
  );
const podT = (cs) =>
  podium(
    cs.slice(0, 3).map((s, i) => {
      const k = col(s.Constructor.constructorId);
      return {
        pos: i + 1,
        href: `#/team/${s.Constructor.constructorId}`,
        c: k,
        img: ticon(s.Constructor.constructorId, s.Constructor.name),
        name: s.Constructor.name,
        sub: s.Constructor.nationality || "",
        val: s.points + " pt",
        tl: tlh(tally("c", s.Constructor.constructorId)),
      };
    }),
  );
const podR = (x, f) =>
  podium(
    x
      .slice(0, 3)
      .map((y, i) => ({
        pos: i + 1,
        href: `#/driver/${y.Driver.driverId}`,
        c: col(y.Constructor.constructorId),
        img: ph(y.Driver),
        name: y.Driver.familyName,
        sub: y.Constructor.name,
        val: f(y) || "",
      })),
  );
const nextRace = () => {
  const r = S.races.find((x) => !S.res[x.round]);
  if (!r) return "";
  const d = Math.ceil(
    (new Date(r.date + "T" + (r.time || "12:00:00Z")) - Date.now()) / 864e5,
  );
  return `<a class="next" href="#/race/${r.round}"><span class="fg">${flag(r.Circuit.Location.country)}</span><div><small>Prossima gara · ${fd(r)}</small><h3>${r.raceName}</h3><p>${r.Circuit.circuitName}</p></div>${d > 0 ? `<div class="cd"><b>${d}</b><small>giorni</small></div>` : ""}</a>`;
};
