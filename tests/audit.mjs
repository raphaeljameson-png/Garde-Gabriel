/* ═══════════════════════════════════════════════════════════════
   AUDIT AUTOMATIQUE DU MOTEUR GARDE-GABRIEL
   Vérifie la conformité de garde-engine.js aux dispositifs
   (Nanterre 27.03.25 + Paris 06.02.26, lectures RJ actées).
   Usage : node tests/audit.mjs  (code retour 1 si échec)
   Pensé pour GitHub Actions : à chaque commit + cron hebdomadaire
   (détecte les dérives des API externes Hebcal / Éducation nationale).
   ═══════════════════════════════════════════════════════════════ */

globalThis.localStorage={_d:{},getItem(k){return this._d[k]||null},setItem(k,v){this._d[k]=v},removeItem(k){delete this._d[k]}};

const eng=await import('../garde-engine.js');
const {getCustody,d2s,s2d,isPontVaque,syncHebcal,syncSchoolCal,getMothersDay,getFathersDay,state}=eng;

let pass=0,fail=0,warn=0;
const who=ds=>getCustody(s2d(ds)).who;
const chk=(l,c)=>{c?pass++:(fail++,console.log("ÉCHEC:",l));};

/* ── Synchronisations réelles (réseau), avec relances ── */
async function retry(fn,n=3){let r=false;for(let i=0;i<n&&!(r==='updated'||r==='cached');i++){if(i)await new Promise(x=>setTimeout(x,4000));localStorage.removeItem('gabriel_last_sync');localStorage.removeItem('gabriel_school_last_sync');r=await fn();}return r}
const rHeb=await retry(syncHebcal);
const rSco=await retry(syncSchoolCal);
const online = rHeb==='updated' && rSco==='updated';
if(!online){warn++;console.log("AVERTISSEMENT : sync indisponible (Hebcal:",rHeb,"/ École:",rSco,") — contrôles réseau ignorés, données de secours testées.");}

/* ── A. Contrôles dépendant des données synchronisées ── */
if(online){
    chk("Sync — RH 2026 = nuitées 11+12 sept (pas le 13)", state.relHols["2026-09-11"]&&state.relHols["2026-09-12"]&&!state.relHols["2026-09-13"]);
    chk("Sync — Hanouka 2026 = nuitées 4 et 11 déc", state.relHols["2026-12-04"]&&state.relHols["2026-12-11"]&&!state.relHols["2026-12-05"]&&!state.relHols["2026-12-12"]);
    chk("Sync — Kippour 2026 = nuit de Kol Nidré seule (20 sept)", state.relHols["2026-09-20"]&&!state.relHols["2026-09-21"]);
    chk("Sync — Pourim 2026 = nuit du 2 mars", !!state.relHols["2026-03-02"]&&!state.relHols["2026-03-03"]);
    chk("Sync — Shmini 2026 = nuit du 2 oct", !!state.relHols["2026-10-02"]&&!state.relHols["2026-10-03"]);
    chk("Sync — Pessah 2026 = nuits 1er+2 avril", state.relHols["2026-04-01"]&&state.relHols["2026-04-02"]&&!state.relHols["2026-04-03"]);
    chk("Sync — Hiver 2027 officiel 6-21/02, mid 13/02", state.schoolHols.some(h=>h.n==="Hiver"&&h.s==="2027-02-06"&&h.e==="2027-02-21"&&h.mid==="2027-02-13"));
    chk("Sync — Printemps 2027 officiel 3-18/04", state.schoolHols.some(h=>h.n==="Printemps"&&h.s==="2027-04-03"&&h.e==="2027-04-18"));
    chk("Sync — Été 2027 dès le samedi 3/07", state.schoolHols.some(h=>h.summer&&h.s==="2027-07-03"));
    chk("Sync — Ponts : 15/05/2026 vaqué, 07/05/2027 non", isPontVaque("2026-05-15")===true&&isPontVaque("2027-05-07")===false);
    chk("Sync — RH 2027 (impaire) = nuitées 1-2 oct chez Maman", who("2027-10-01")==="Maman"&&who("2027-10-02")==="Maman"&&!!state.relHols["2027-10-01"]);

    /* Dates-clés (convention nuitée + dispositifs), valables avec données synchronisées */
    [["2026-09-11","Papa"],["2026-09-12","Papa"],["2026-09-13","Maman"],
     ["2026-09-18","Papa"],["2026-09-20","Papa"],["2026-09-21","Maman"],
     ["2026-10-02","Papa"],["2026-12-04","Papa"],["2026-12-05","Maman"],
     ["2026-12-11","Papa"],["2026-12-12","Papa"],
     ["2026-03-02","Papa"],["2026-04-01","Papa"],["2026-04-02","Papa"],
     ["2027-02-05","Papa"],["2027-02-12","Papa"],["2027-02-13","Maman"],["2027-02-21","Maman"],
     ["2027-04-09","Papa"],["2027-04-10","Maman"],
     ["2027-05-06","Papa"],["2027-05-07","Papa"],
     ["2027-07-02","Papa"],["2027-07-16","Papa"],["2027-07-17","Maman"],
     ["2027-07-30","Maman"],["2027-07-31","Papa"],["2027-08-13","Papa"],["2027-08-14","Maman"]
    ].forEach(([ds,w])=>chk(`Sync — ${ds} = ${w}`, who(ds)===w));
}

/* ── B. Contrôles toujours valides (règles du moteur, données de secours incluses) ── */
[["2026-07-17","Maman"],["2026-07-18","Papa"],["2026-07-31","Papa"],["2026-08-01","Maman"],
 ["2026-08-14","Maman"],["2026-08-15","Papa"],["2026-08-31","Papa"],["2026-09-01","Maman"],
 ["2026-05-14","Papa"],["2026-05-31","Maman"],["2026-06-21","Papa"],
 ["2027-11-10","Papa"],["2027-11-11","Papa"],["2027-11-12","Maman"],
 ["2028-07-22","Papa"],["2028-08-05","Maman"],["2028-08-19","Papa"]
].forEach(([ds,w])=>chk(`${ds} = ${w}`, who(ds)===w));

/* Indépendance à l'heure de consultation (régression v3.1) : le résultat de
   getCustody doit être identique à 0h, 9h, 12h, 15h et 23h, y compris sur les
   jours de bascule (samedis d'été, milieux et bornes de vacances). */
for(const ds of ["2026-07-18","2026-08-01","2026-08-15","2026-08-31","2026-07-03","2026-07-04","2026-04-25","2027-02-13","2026-09-11"]){
    const [y,m,j]=ds.split('-').map(Number);
    const at=h=>getCustody(new Date(y,m-1,j,h,30,0)).who;
    chk(`Indépendance à l'heure — ${ds}`, at(0)===at(9)&&at(9)===at(12)&&at(12)===at(15)&&at(15)===at(23));
}

/* Invariant « jours ordinaires » : hors vacances/fêtes/fériés/FdM-FdP,
   Papa = week-ends des semaines paires (ven-sam-dim) + mercredi des semaines impaires. */
let scanned=0;
for(let d=new Date(2025,6,1,12);d<=new Date(2028,7,31,12);d.setDate(d.getDate()+1)){
    const ds=d2s(d);const c=getCustody(new Date(d));
    if(c.vac||c.rel||c.ferie||ds===getMothersDay(d.getFullYear())||ds===getFathersDay(d.getFullYear()))continue;
    const tmp=new Date(Date.UTC(d.getFullYear(),d.getMonth(),d.getDate()));const dn=tmp.getUTCDay()||7;
    tmp.setUTCDate(tmp.getUTCDate()+4-dn);const ys=new Date(Date.UTC(tmp.getUTCFullYear(),0,1));
    const wk=Math.ceil((((tmp-ys)/86400000)+1)/7);const even=wk%2===0;const dow=d.getDay();
    const exp=(even&&(dow===5||dow===6||dow===0))||(!even&&dow===3);
    if((c.who==="Papa")!==exp){fail++;console.log("ÉCHEC invariant ordinaire:",ds,c.who,c.why);}
    scanned++;
}
chk(`Invariant jours ordinaires (${scanned} jours scannés)`, scanned>500);

/* Transitions de vacances : une seule au samedi-milieu (petites),
   exactement 3 et toutes des samedis (été, blocs ancrés samedi). */
for(const h of state.schoolHols.filter(h=>h.s>="2025-06"&&h.s<="2030-09")){
    const start=s2d(h.s);start.setDate(start.getDate()-1);const end=s2d(h.e);
    let prev=null;const tr=[];
    for(let d=new Date(start);d<=end;d.setDate(d.getDate()+1)){const w=getCustody(new Date(d)).who;if(prev&&w!==prev)tr.push(d2s(d));prev=w;}
    if(h.summer) chk(`Été ${h.s} : 3 passages, tous des samedis`, tr.length===3&&tr.every(x=>s2d(x).getDay()===6));
    else chk(`${h.n} ${h.s} : transition unique au mid ${h.mid}`, tr.length===1&&tr[0]===h.mid);
}

console.log(`\nRÉSULTAT : ${pass} OK / ${fail} ÉCHEC(S)${warn?` / ${warn} avertissement(s)`:''}`);
process.exit(fail?1:0);
