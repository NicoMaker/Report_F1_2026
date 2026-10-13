async function route() {
  const [, v = "", a, b] = location.hash.split("/");
  document.querySelectorAll("nav a").forEach((x) =>
    x.classList.toggle("on", x.getAttribute("href") === "#/" + ({ driver: "drivers", team: "teams" }[v] ?? v)),
  );
  try {
    if (!S.races) {
      A.innerHTML = '<div class="ld"><i></i>Caricamento dati…</div>';
      await init();
    }
    ({ "": cal, drivers, teams, team: () => team(a), driver: () => driver(a), race: () => race(a, b), search: () => searchPage(a) })[v]?.();
    scrollTo(0, 0);
  } catch (e) {
    A.innerHTML = `<p class="err">${e.message}</p>`;
  }
}
$("#rf").onclick = () => {
  F1.reset();
  for (const k in S) delete S[k];
  route();
};
addEventListener("hashchange", route);
route();
