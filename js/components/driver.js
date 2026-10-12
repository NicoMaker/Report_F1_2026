function driver(id){
 const d=S.drivers.find(x=>x.driverId===id);if(!d)throw new Error('Pilota non trovato');
 const st=S.ds.find(x=>x.Driver.driverId===id);
 const rows=S.races.map(r=>{const x=S.res[r.round]?.Results?.find(y=>y.Driver.driverId===id);return x&&[`<a href="#/race/${r.round}">${r.raceName}</a>`,tn(x.Constructor),x.grid,x.positionText,x.points,x.Time?.time||x.status,x.FastestLap?.Time?.time||'']}).filter(Boolean);
 A.innerHTML=`<div class="hero">${ph(d)}<div><h2 style="margin:0">${d.givenName} ${d.familyName}</h2><span class="mut">#${d.permanentNumber||'-'} · ${d.nationality} · nato il ${d.dateOfBirth}</span><br>${st?`<b>${st.position}° in classifica · ${st.points} punti · ${st.wins} vittorie</b>`:''}</div></div>`+tbl(['Gara','Squadra','Griglia','Arrivo','Punti','Tempo / stato','Giro veloce'],rows);
}
