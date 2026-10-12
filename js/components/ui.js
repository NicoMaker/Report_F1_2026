const ph=d=>S.photos[d.driverId]?`<img class="ph" src="${S.photos[d.driverId]}" alt="" loading="lazy">`:`<i class="ph">${d.code||d.familyName.slice(0,3).toUpperCase()}</i>`;
const dn=d=>`<a class="dn" href="#/driver/${d.driverId}">${ph(d)}<span>${d.givenName[0]}. <b>${d.familyName}</b></span></a>`;
const tn=c=>c?`<span class="tn"><i class="bd" style="background:${col(c.constructorId)}">${c.name.slice(0,2).toUpperCase()}</i>${c.name}</span>`:'';
const tbl=(h,rows,cls=[])=>`<div class="tw"><table><thead><tr>${h.map(x=>`<th>${x}</th>`).join('')}</tr></thead><tbody>${rows.map((r,i)=>`<tr class="${cls[i]||''}">${r.map(c=>`<td>${c??''}</td>`).join('')}</tr>`).join('')}</tbody></table></div>`;
const sel=(id,opts,v)=>`<select id="${id}">${opts.map(([a,b])=>`<option value="${a}"${a==v?' selected':''}>${b}</option>`).join('')}</select>`;

const podium=l=>`<div class="podium">${l.slice(0,3).map(s=>{const c=s.Constructors?.at(-1);return`<a class="pc p${s.position}" href="#/driver/${s.Driver.driverId}" style="--tc:${col(c?.constructorId||'x')}">${ph(s.Driver)}<small>${s.position}°</small><b>${s.Driver.familyName}</b><span>${c?.name||''}</span><em>${s.points} pt</em></a>`}).join('')}</div>`;
const nextRace=()=>{const r=S.races.find(x=>!S.res[x.round]);return r?`<a class="next" href="#/race/${r.round}"><small>Prossima gara · ${fd(r)}</small><h3>${r.raceName}</h3><p>${r.Circuit.circuitName}</p></a>`:''};
