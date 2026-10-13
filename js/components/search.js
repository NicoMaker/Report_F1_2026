// Ricerca globale (header + pagina risultati), filtri nelle tabelle/griglie, ordinamento colonne, tema
const norm = (s) => String(s || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function sIndex() {
  if (S._ix) return S._ix;
  const ix = [];
  S.drivers.forEach((d) => ix.push({ k: "🏎️", t: `${d.givenName} ${d.familyName}`, s: `#${d.permanentNumber || "-"} · ${d.nationality}`, h: `#/driver/${d.driverId}`, x: norm([d.givenName, d.familyName, d.code, d.permanentNumber, d.nationality].join(" ")) }));
  S.cs.forEach((c) => ix.push({ k: "🛠️", t: c.Constructor.name, s: `Squadra · ${c.points} pt`, h: `#/team/${c.Constructor.constructorId}`, x: norm(c.Constructor.name + " " + (c.Constructor.nationality || "") + " squadra team") }));
  S.races.forEach((r) => {
    const l = r.Circuit.Location, w = S.res[r.round]?.Results?.[0]?.Driver;
    ix.push({ k: "🏁", t: r.raceName, s: `Gara ${r.round} · ${l.locality}, ${l.country}`, h: `#/race/${r.round}`, x: norm([r.raceName, r.Circuit.circuitName, l.locality, l.country, "gara", r.round, w?.familyName].join(" ")) });
  });
  return (S._ix = ix);
}
const sFind = (q) => {
  if (!S.races) return [];
  const t = norm(q).split(/\s+/).filter(Boolean);
  return t.length ? sIndex().filter((i) => t.every((w) => i.x.includes(w))) : [];
};
function searchPage(q) {
  q = decodeURIComponent(q || "");
  const r = sFind(q);
  A.innerHTML = `<h2>Risultati per “${esc(q)}”</h2>${r.length ? `<div class="grid">${r.map((i) => `<a class="card" href="${i.h}"><small>${i.k}</small><h3>${esc(i.t)}</h3><p>${esc(i.s)}</p></a>`).join("")}</div>` : '<p class="mut">Nessun risultato.</p>'}`;
}
const qi = $("#q"), sr = $("#sr");
const show = () => {
  const v = qi.value.trim(), r = sFind(v);
  if (!v) return (sr.hidden = true);
  sr.innerHTML = r.length
    ? r.slice(0, 8).map((i) => `<a href="${i.h}"><span>${i.k}</span><b>${esc(i.t)}</b><small>${esc(i.s)}</small></a>`).join("") + (r.length > 8 ? `<a class="all" href="#/search/${encodeURIComponent(v)}">Vedi tutti (${r.length}) →</a>` : "")
    : '<p class="mut">Nessun risultato</p>';
  sr.hidden = false;
};
qi.oninput = qi.onfocus = show;
qi.onkeydown = (e) => {
  if (e.key === "Enter" && qi.value.trim()) {
    location.hash = "#/search/" + encodeURIComponent(qi.value.trim());
    sr.hidden = true;
    qi.blur();
  }
  if (e.key === "Escape") (sr.hidden = true), qi.blur();
};
addEventListener("hashchange", () => (sr.hidden = true));
document.addEventListener("keydown", (e) => {
  if (e.key === "/" && !/INPUT|SELECT|TEXTAREA/.test(document.activeElement.tagName)) {
    e.preventDefault();
    qi.focus();
  }
});
document.addEventListener("click", (e) => {
  if (!e.target.closest(".sb")) sr.hidden = true;
  const th = e.target.closest("th");
  if (!th) return;
  const tb = th.closest("table").tBodies[0], i = th.cellIndex, d = th.dataset.d === "1" ? -1 : 1;
  th.parentNode.querySelectorAll("th").forEach((x) => delete x.dataset.d);
  th.dataset.d = d;
  const key = (r) => {
    const t = r.cells[i].textContent.trim().replace(",", "."), m = t.match(/^\+?(\d+):(\d+(?:\.\d+)?)/), n = m ? +m[1] * 60 + +m[2] : parseFloat(t);
    return isNaN(n) ? t.toLowerCase() : n;
  };
  [...tb.rows].sort((a, b) => {
    const x = key(a), y = key(b);
    return (typeof x === "number" && typeof y === "number" ? x - y : String(x).localeCompare(String(y), "it", { numeric: true })) * d;
  }).forEach((r) => tb.appendChild(r));
});
// Filtro live su qualsiasi input.tf: filtra righe della tabella o card della griglia che segue
document.addEventListener("input", (e) => {
  if (!e.target.classList.contains("tf")) return;
  const t = e.target.nextElementSibling, w = norm(e.target.value).split(/\s+/).filter(Boolean);
  if (!t) return;
  (t.classList.contains("grid") ? [...t.children] : [...t.querySelectorAll("tbody tr")]).forEach((el) => {
    const x = norm(el.textContent + " " + (el.querySelector("img,i.ph") ? "" : ""));
    el.hidden = !w.every((k) => x.includes(k));
  });
});
const th = $("#th"), root = document.documentElement;
try { const T = localStorage.getItem("f1_theme"); if (T) root.dataset.theme = T; } catch {}
th.onclick = () => {
  const n = root.dataset.theme === "light" ? "dark" : "light";
  root.dataset.theme = n;
  try { localStorage.setItem("f1_theme", n); } catch {}
};
