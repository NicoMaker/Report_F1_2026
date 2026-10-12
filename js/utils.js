const $ = (s) => document.querySelector(s),
  A = $("#app"),
  S = {};
const COL = {
  mercedes: "#00bfa5",
  ferrari: "#e8002d",
  red_bull: "#3671c6",
  mclaren: "#ff8000",
  aston_martin: "#229971",
  alpine: "#ff87bc",
  williams: "#2f9be0",
  rb: "#6692ff",
  audi: "#c4001d",
  haas: "#8a8f94",
  cadillac: "#555",
};
const col = (id) =>
  COL[id] ||
  "#" +
    (
      (Math.abs([...id].reduce((a, c) => (a * 31 + c.charCodeAt(0)) | 0, 7)) %
        0xaaaaaa) +
      0x333333
    )
      .toString(16)
      .slice(0, 6)
      .padStart(6, "0");
const pod = (rows) => rows.map((r) => "p" + r[0]);
const byRound = (l) =>
  Object.fromEntries((l?.Races || []).map((r) => [r.round, r]));
const fd = (r) =>
  new Date(r.date + "T" + (r.time || "12:00:00Z")).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
const sec = (t) => {
  if (!t) return 1e9;
  const p = t.split(":");
  return p.length > 1 ? +p[0] * 60 + +p[1] : +p[0];
};
const ds = (l) => l?.StandingsLists?.[0]?.DriverStandings || [],
  cs = (l) => l?.StandingsLists?.[0]?.ConstructorStandings || [];
