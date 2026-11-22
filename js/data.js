// Classifiche ricalcolate dai risultati reali (gare + sprint): non dipendono dal ritardo
// dell'API sulle classifiche e usano lo spareggio ufficiale (più vittorie, poi più 2°, 3°…).
function rebuildStandings(apiD, apiC) {
  const rounds = Object.keys(S.res)
    .map(Number)
    .sort((a, b) => a - b);
  if (!rounds.length) return { d: apiD, c: apiC };
  const D = {},
    C = {};
  const slot = (M, id, base) =>
    (M[id] ||= { ...base, points: 0, pos: Array(30).fill(0) });
  const add = (list, isRace) => {
    for (const x of list || []) {
      const dr = slot(D, x.Driver.driverId, {
        Driver: x.Driver,
        Constructors: [],
      });
      const cs_ = slot(C, x.Constructor.constructorId, {
        Constructor: x.Constructor,
      });
      const p = +x.points || 0;
      dr.points += p;
      cs_.points += p;
      if (
        !dr.Constructors.some(
          (t) => t.constructorId === x.Constructor.constructorId,
        )
      )
        dr.Constructors.push(x.Constructor);
      if (isRace && +x.position > 0) {
        dr.pos[+x.position]++;
        cs_.pos[+x.position]++;
      }
    }
  };
  for (const n of rounds) {
    add(S.res[n]?.Results, true);
    add(S.sp[n]?.SprintResults, false);
  }
  const rank = (M, prev, key, name) => {
    const list = Object.values(M);
    // piloti/squadre presenti solo nell'API (0 punti) restano in coda
    for (const s of prev || []) {
      const id = key(s);
      if (!list.some((x) => key(x) === id))
        list.push({ ...s, points: +s.points || 0, pos: Array(30).fill(0) });
    }
    list.sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points;
      for (let i = 1; i < 30; i++)
        if (b.pos[i] !== a.pos[i]) return b.pos[i] - a.pos[i];
      return name(a).localeCompare(name(b));
    });
    return list.map((x, i) => {
      const { pos, ...o } = x;
      return {
        ...o,
        position: String(i + 1),
        positionText: String(i + 1),
        points: String(Math.round(x.points * 100) / 100),
        wins: String(pos[1] || 0),
      };
    });
  };
  const nd = rank(
    D,
    apiD,
    (s) => s.Driver.driverId,
    (s) => s.Driver.familyName,
  );
  const nc = rank(
    C,
    apiC,
    (s) => s.Constructor.constructorId,
    (s) => s.Constructor.name,
  );
  const diff =
    nd.length !== apiD.length ||
    nd.some(
      (s, i) =>
        apiD[i]?.Driver.driverId !== s.Driver.driverId ||
        +apiD[i]?.points !== +s.points,
    );
  if (diff)
    console.info(
      "Classifica ricalcolata dai risultati: l'API non era aggiornata.",
    );
  return { d: nd, c: nc };
}
async function init() {
  const L = (k) => F1.load(k).catch(() => null);
  const [ra, dr, pho, re, qu, sp, dsd, csd] = await Promise.all(F1.CORE.map(L));
  S.races = ra?.Races || [];
  S.drivers = dr?.Drivers || [];
  S.photos = pho || {};
  S.res = byRound(re);
  S.q = byRound(qu);
  S.sp = byRound(sp);
  const st = rebuildStandings(ds(dsd), cs(csd));
  S.ds = st.d;
  S.cs = st.c;
  S.dc = Object.fromEntries(
    S.ds.map((s) => [s.Driver.driverId, s.Constructors?.at(-1)?.constructorId]),
  );
  if (!S.races.length) {
    delete S.races;
    throw new Error(
      "Nessun dato: controlla la connessione o avvia node server.js",
    );
  }
}
const lastDone = () => Math.max(0, ...Object.keys(S.res).map(Number));
