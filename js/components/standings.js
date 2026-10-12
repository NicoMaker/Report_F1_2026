function drivers(){
 const m=+S.ds[0]?.points||1;
 A.innerHTML=`<h2>Classifica piloti</h2>`+podium(S.ds)+tbl(['#','Pilota','Squadra','Vitt.','Punti'],S.ds.map(s=>[s.positionText,dn(s.Driver),tn(s.Constructors?.at(-1)),s.wins,`<b>${s.points}</b><div class="bar" style="width:${s.points/m*100}%;background:${col(s.Constructors?.at(-1)?.constructorId||'x')}"></div>`]),pod(S.ds.map(s=>[+s.position])))
 +`<h2 style="margin-top:20px">Tutti i piloti</h2><div class="grid">${S.drivers.map(d=>`<a class="card" href="#/driver/${d.driverId}"><div class="dn">${ph(d)}<span><b>${d.givenName} ${d.familyName}</b><br><small>#${d.permanentNumber||'-'} · ${d.nationality}</small></span></div></a>`).join('')}</div>`;
}
function teams(){
 const m=+S.cs[0]?.points||1;
 A.innerHTML=`<h2>Classifica costruttori</h2>`+tbl(['#','Squadra','Vitt.','Punti'],S.cs.map(s=>[s.positionText,tn(s.Constructor),s.wins,`<b>${s.points}</b><div class="bar" style="width:${s.points/m*100}%;background:${col(s.Constructor.constructorId)}"></div>`]),pod(S.cs.map(s=>[+s.position])))
 +`<h2 style="margin-top:20px">Piloti per squadra</h2><div class="grid">${S.cs.map(c=>`<div class="card" style="border-left-color:${col(c.Constructor.constructorId)}"><h3>${tn(c.Constructor)}</h3>${S.ds.filter(d=>d.Constructors?.some(x=>x.constructorId===c.Constructor.constructorId)).map(d=>`<p style="margin-top:6px">${dn(d.Driver)}</p>`).join('')}</div>`).join('')}</div>`;
}
