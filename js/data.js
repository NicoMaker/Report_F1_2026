async function init(){
 const L=k=>F1.load(k).catch(()=>null);
 const [ra,dr,pho,re,qu,sp,dsd,csd]=await Promise.all(F1.CORE.map(L));
 S.races=ra?.Races||[];S.drivers=dr?.Drivers||[];S.photos=pho||{};S.res=byRound(re);S.q=byRound(qu);S.sp=byRound(sp);S.ds=ds(dsd);S.cs=cs(csd);
 if(!S.races.length){delete S.races;throw new Error('Nessun dato: controlla la connessione o avvia node server.js')}
}
const lastDone=()=>Math.max(0,...Object.keys(S.res).map(Number));

