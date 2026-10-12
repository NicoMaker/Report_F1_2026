async function route() {
  const [, v = "", a, b] = location.hash.split("/");
  document
    .querySelectorAll("nav a")
    .forEach((x) =>
      x.classList.toggle(
        "on",
        x.getAttribute("href") === "#/" + (v === "driver" ? "drivers" : v),
      ),
    );
  try {
    if (!S.races) {
      A.innerHTML = '<p class="mut">Caricamento dati…</p>';
      await init();
    }
    ({
      "": cal,
      drivers,
      teams,
      driver: () => driver(a),
      race: () => race(a, b),
    })[v]?.();
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
