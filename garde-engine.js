/* ═══════════════════════════════════════════════════════
   GARDE ENGINE — moteur commun Garde-Gabriel (source de vérité unique)
   Importé par index.html ET jours_libres.html.

   Convention : un jour marqué = la NUIT que Gabriel passe chez ce parent.
   Fêtes hébraïques : entrée la veille au soir — on marque chaque nuit contenue
   dans la fête (de la veille à l'avant-dernier jour civil inclus).
   Vacances scolaires : synchronisées depuis data.education.gouv.fr (Zone C) ;
   les dates de secours locales ne servent que pour les années non publiées.
   Été : blocs de 14 jours ancrés sur le premier samedi des vacances,
   passages de bras toujours le samedi (1er bloc flexible).
   v3.1 : getCustody normalise toute date à midi — résultat indépendant de
   l'heure de consultation.
   ═══════════════════════════════════════════════════════ */

export const d2s=d=>`${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`;
export const s2d=s=>{const[y,m,j]=s.split('-').map(Number);return new Date(y,m-1,j,12,0,0)};

/* ── VACANCES SCOLAIRES Zone C — dates de secours locales.
   2024-2025 à 2026-2027 : conformes à l'arrêté officiel (vérifié le 6.07.2026).
   2027-2028 à 2029-2030 : PRÉVISIONNEL — non publié, à confirmer par l'import. ── */
export const DEFAULT_SCHOOL_HOLS=[
    {n:"Toussaint",s:"2024-10-19",e:"2024-11-03",mid:"2024-10-26"},
    {n:"Noël",s:"2024-12-21",e:"2025-01-05",mid:"2024-12-28"},
    {n:"Hiver",s:"2025-02-15",e:"2025-03-02",mid:"2025-02-22"},
    {n:"Printemps",s:"2025-04-12",e:"2025-04-27",mid:"2025-04-19"},
    {n:"Été",s:"2025-07-05",e:"2025-08-31",summer:true},
    {n:"Toussaint",s:"2025-10-18",e:"2025-11-02",mid:"2025-10-25"},
    {n:"Noël",s:"2025-12-20",e:"2026-01-04",mid:"2025-12-27"},
    {n:"Hiver",s:"2026-02-21",e:"2026-03-08",mid:"2026-02-28"},
    {n:"Printemps",s:"2026-04-18",e:"2026-05-03",mid:"2026-04-25"},
    {n:"Été",s:"2026-07-04",e:"2026-08-31",summer:true},
    {n:"Toussaint",s:"2026-10-17",e:"2026-11-01",mid:"2026-10-24"},
    {n:"Noël",s:"2026-12-19",e:"2027-01-03",mid:"2026-12-26"},
    {n:"Hiver",s:"2027-02-06",e:"2027-02-21",mid:"2027-02-13"},
    {n:"Printemps",s:"2027-04-03",e:"2027-04-18",mid:"2027-04-10"},
    {n:"Été",s:"2027-07-03",e:"2027-08-31",summer:true},
    {n:"Toussaint",s:"2027-10-23",e:"2027-11-07",mid:"2027-10-30"},
    {n:"Noël",s:"2027-12-18",e:"2028-01-02",mid:"2027-12-25"},
    {n:"Hiver",s:"2028-02-19",e:"2028-03-05",mid:"2028-02-26"},
    {n:"Printemps",s:"2028-04-15",e:"2028-04-30",mid:"2028-04-22"},
    {n:"Été",s:"2028-07-06",e:"2028-08-31",summer:true},
    {n:"Toussaint",s:"2028-10-21",e:"2028-11-05",mid:"2028-10-28"},
    {n:"Noël",s:"2028-12-23",e:"2029-01-07",mid:"2028-12-30"},
    {n:"Hiver",s:"2029-02-17",e:"2029-03-04",mid:"2029-02-24"},
    {n:"Printemps",s:"2029-04-14",e:"2029-04-29",mid:"2029-04-21"},
    {n:"Été",s:"2029-07-06",e:"2029-08-31",summer:true},
    {n:"Toussaint",s:"2029-10-20",e:"2029-11-04",mid:"2029-10-27"},
    {n:"Noël",s:"2029-12-22",e:"2030-01-06",mid:"2029-12-29"},
    {n:"Hiver",s:"2030-02-23",e:"2030-03-10",mid:"2030-03-02"},
    {n:"Printemps",s:"2030-04-20",e:"2030-05-05",mid:"2030-04-27"},
    {n:"Été",s:"2030-07-06",e:"2030-08-31",summer:true}
];

/* ── FÊTES JUIVES — secours local (convention nuitée) ── */
const DEFAULT_REL_HOLS={
    "2025-04-12":"Pessah (1er soir, Seder)","2025-04-13":"Pessah (2e soir)",
    "2025-09-22":"Roch Hachana (1re nuitée)","2025-09-23":"Roch Hachana (2e nuitée)",
    "2025-10-01":"Kippour (nuit de Kol Nidré)",
    "2025-12-14":"Hanouka 1er jour (nuitée)","2025-12-21":"Hanouka dernier jour (nuitée)",
    "2026-03-02":"Pourim (nuitée)",
    "2026-04-01":"Pessah (1er soir, Seder)","2026-04-02":"Pessah (2e soir)",
    "2026-09-11":"Roch Hachana (1re nuitée)","2026-09-12":"Roch Hachana (2e nuitée)",
    "2026-09-20":"Kippour (nuit de Kol Nidré)",
    "2026-10-02":"Shmini 'Atsérêt (nuitée)",
    "2026-12-04":"Hanouka 1er jour (nuitée)","2026-12-11":"Hanouka dernier jour (nuitée)"
};

/* ── ÉTAT PARTAGÉ (alimenté par localStorage, commun aux deux pages du même domaine) ── */
export const state={
    schoolHols: JSON.parse(localStorage.getItem('gabriel_school_holidays')||'null')||DEFAULT_SCHOOL_HOLS,
    pontRanges: JSON.parse(localStorage.getItem('gabriel_pont_ranges')||'null')||[],
    relHols:    JSON.parse(localStorage.getItem('gabriel_religious_holidays')||'null')||DEFAULT_REL_HOLS,
    exceptions: {}
};
export function setExceptions(ex){ state.exceptions = ex || {}; }

export function computeEaster(year){
    const a=year%19,b=Math.floor(year/100),c=year%100,d=Math.floor(b/4),e=b%4,f=Math.floor((b+8)/25),g=Math.floor((b-f+1)/3),h=(19*a+b-d-g+15)%30,i=Math.floor(c/4),k=c%4,l=(32+2*e+2*i-h-k)%7,m=Math.floor((a+11*h+22*l)/451),mo=Math.floor((h+l-7*m+114)/31),da=((h+l-7*m+114)%31)+1;
    return new Date(year,mo-1,da,12,0,0);
}

export function getMothersDay(yr){
    let fdm=new Date(yr,4,31,12,0,0);
    while(fdm.getDay()!==0) fdm.setDate(fdm.getDate()-1);
    const easter=computeEaster(yr);
    const pentecost=new Date(easter);pentecost.setDate(easter.getDate()+49);
    if(d2s(fdm)===d2s(pentecost)) fdm.setDate(fdm.getDate()+7);
    return d2s(fdm);
}

export function getFathersDay(yr){
    const fdp=new Date(yr,5,1,12,0,0);let sc=0;
    while(sc<3){if(fdp.getDay()===0)sc++;if(sc<3)fdp.setDate(fdp.getDate()+1)}
    return d2s(fdp);
}

export function getPH(year){
    const easter=computeEaster(year);
    const add=n=>{const x=new Date(easter);x.setDate(x.getDate()+n);return d2s(x)};
    return new Set([`${year}-01-01`,`${year}-05-01`,`${year}-05-08`,`${year}-07-14`,`${year}-08-15`,`${year}-11-01`,`${year}-11-11`,`${year}-12-25`,add(1),add(39),add(50)]);
}

export function getFerieName(ds){
    const y=parseInt(ds.split('-')[0]);
    const easter=computeEaster(y);
    const add=n=>{const x=new Date(easter);x.setDate(x.getDate()+n);return d2s(x)};
    const dict={
        [`${y}-01-01`]:"Jour de l'An", [`${y}-05-01`]:"Fête du Travail", [`${y}-05-08`]:"Victoire 1945",
        [`${y}-07-14`]:"Fête Nationale", [`${y}-08-15`]:"Assomption", [`${y}-11-01`]:"Toussaint",
        [`${y}-11-11`]:"Armistice 1918", [`${y}-12-25`]:"Noël",
        [add(1)]:"Lundi de Pâques", [add(39)]:"Ascension", [add(50)]:"Lundi de Pentecôte"
    };
    return dict[ds]||null;
}

export function isoWeek(date){
    const tmp=new Date(Date.UTC(date.getFullYear(),date.getMonth(),date.getDate()));
    const dayN=tmp.getUTCDay()||7;
    tmp.setUTCDate(tmp.getUTCDate()+4-dayN);
    const yearStart=new Date(Date.UTC(tmp.getUTCFullYear(),0,1));
    return Math.ceil((((tmp-yearStart)/86400000)+1)/7);
}

/* Pont après un jeudi férié : vrai si le vendredi est officiellement vaqué.
   Si l'année n'est pas couverte par les données, comportement historique (pont présumé). */
export function isPontVaque(ds){
    if(state.pontRanges.some(p=>ds>=p.s&&ds<=p.e)) return true;
    return !state.pontRanges.some(p=>p.s.slice(0,4)===ds.slice(0,4));
}

export function getCustody(dateInput){
    /* Normalisation à MIDI : le résultat ne doit jamais dépendre de l'heure de
       consultation. Toutes les bornes internes (samedis de bascule, milieux et
       limites de vacances) sont ancrées à 12h ; sans cette normalisation, une
       consultation le matin décalait les passages du samedi au dimanche dans
       « À venir », et une consultation l'après-midi sortait le dernier jour
       des vacances de l'été. */
    const date=new Date(dateInput.getFullYear(),dateInput.getMonth(),dateInput.getDate(),12,0,0);
    const ds=d2s(date);
    const yr=date.getFullYear();
    const dow=date.getDay();
    const t=date.getTime();

    let isRel = !!state.relHols[ds];
    let relText = isRel ? ` (+ ${state.relHols[ds]})` : "";

    let isVac = false;
    for(const h of state.schoolHols){
        const startH = s2d(h.s);
        const firstNight = new Date(startH);
        firstNight.setDate(firstNight.getDate() - 1);
        const endH = s2d(h.e);
        if(t >= firstNight.getTime() && t <= endH.getTime()){ isVac = true; break; }
    }

    if(state.exceptions[ds]) return{who:state.exceptions[ds],why:"Exception manuelle" + relText, forced:true, rel: isRel, vac: isVac};
    if(ds===getMothersDay(yr)) return{who:"Maman",why:"Fête des Mères 💐" + relText, rel: isRel, vac: isVac};
    if(ds===getFathersDay(yr)) return{who:"Papa",why:"Fête des Pères 👔" + relText, rel: isRel, vac: isVac};

    for(const h of state.schoolHols){
        const startH = s2d(h.s);
        const firstNight = new Date(startH);
        firstNight.setDate(firstNight.getDate() - 1);
        const endH = s2d(h.e);
        if(t < firstNight.getTime() || t > endH.getTime()) continue;

        const startYear=parseInt(h.s.split('-')[0]);
        const isEvenYear=(startYear%2===0);

        if(h.summer){
            /* Passages de bras d'été TOUJOURS le samedi : blocs de 14 jours ancrés sur
               le premier samedi des vacances. Si la fin des cours ne tombe pas un
               vendredi, le 1er bloc absorbe les jours d'écart (règle « flexible »). */
            const anchor = new Date(startH);
            while(anchor.getDay() !== 6) anchor.setDate(anchor.getDate() + 1);
            const sat2 = new Date(anchor); sat2.setDate(anchor.getDate() + 14);
            const sat3 = new Date(anchor); sat3.setDate(anchor.getDate() + 28);
            const sat4 = new Date(anchor); sat4.setDate(anchor.getDate() + 42);

            let block = 0;
            if (t >= sat4.getTime()) block = 3;
            else if (t >= sat3.getTime()) block = 2;
            else if (t >= sat2.getTime()) block = 1;

            const isPapaBlockEvenYear = (block === 1 || block === 3);
            const isPapaBlockOddYear = (block === 0 || block === 2);
            const papaHas = isEvenYear ? isPapaBlockEvenYear : isPapaBlockOddYear;

            const blockNames = ["1ère quinzaine de Juillet", "2ème quinzaine de Juillet", "1ère quinzaine d'Août", "2ème quinzaine d'Août"];
            return {who: papaHas ? "Papa" : "Maman", why: `Été (${blockNames[block]})${relText}`, rel: isRel, vac: isVac};

        } else {
            const midH = s2d(h.mid);
            const isFirst = (t < midH.getTime());
            const papaHas = isEvenYear ? !isFirst : isFirst;
            return {who: papaHas ? "Papa" : "Maman", why: `Vacances ${h.n} (${isFirst ? '1ère' : '2ème'} moitié)${relText}`, rel: isRel, vac: isVac};
        }
    }

    if(isRel) {
        const relParent = (yr % 2 === 0) ? "Papa" : "Maman";
        return{who: relParent, why:`${state.relHols[ds]} (${relParent})`, rel: true, vac: isVac};
    }

    const ph = getPH(yr);
    const weekNo = isoWeek(date);
    const isEvenWk = (weekNo % 2 === 0);
    const yesterday = new Date(date); yesterday.setDate(date.getDate() - 1);
    const yesterdayDS = d2s(yesterday);

    if(dow===1 && ph.has(ds)) {
        const who = isEvenWk ? "Maman" : "Papa";
        return {who: who, why: `Lundi férié (prolonge le week-end)${relText}`, ferie:true, rel: isRel, vac: isVac};
    }
    if(dow===5 && ph.has(ds)) {
        const who = isEvenWk ? "Papa" : "Maman";
        return {who: who, why: `Vendredi férié (anticipe le week-end)${relText}`, ferie:true, rel: isRel, vac: isVac};
    }
    if(dow===4 && ph.has(ds)) {
        // Clause des jugements : tout férié contigu à une période de DVH s'y ajoute.
        const why = isEvenWk ? `Jeudi férié (pont avec le week-end)${relText}` : `Jeudi férié (prolonge la nuit du mercredi)${relText}`;
        return {who: "Papa", why: why, ferie:true, rel: isRel, vac: isVac};
    }
    if(dow===5 && ph.has(yesterdayDS) && isPontVaque(ds)) {
        const who = isEvenWk ? "Papa" : "Maman";
        return {who: who, why: `Pont du vendredi${relText}`, ferie:true, rel: isRel, vac: isVac};
    }

    if(isEvenWk && (dow===5||dow===6||dow===0)){
        return{who:"Papa",why:`S${weekNo} (paire) — Week-end Papa${relText}`, rel: isRel, vac: isVac};
    }
    if(!isEvenWk && (dow===3)){
        return{who:"Papa",why:`S${weekNo} (impaire) — Nuit du Mercredi${relText}`, rel: isRel, vac: isVac};
    }

    return{who:"Maman",why:`Résidence habituelle${relText}`, rel: isRel, vac: isVac};
}

/* ── SYNC HEBCAL (fêtes juives, convention nuitée) ──
   Retourne 'cached' (données récentes), 'updated' (mises à jour) ou false (échec). */
export async function syncHebcal(){
    const lastSync=localStorage.getItem('gabriel_last_sync');const now=Date.now();
    if(lastSync&&now-lastSync<7*24*3600*1000) return 'cached';
    try{
        const curYr=new Date().getFullYear();const newRel={};
        for(const yr of[curYr,curYr+1,curYr+2,curYr+3,curYr+4,curYr+5]){
            const res=await fetch(`https://www.hebcal.com/hebcal?v=1&cfg=json&maj=on&min=on&year=${yr}`);
            const data=await res.json();
            if(!data.items)continue;
            data.items.forEach(item=>{
                const orig=item.title_orig||item.title||'';const ds=item.date;if(!ds)return;
                /* NB : Hebcal nomme le J1 de Roch Hachana « Rosh Hashana 5787 » (avec l'année) ;
                   la regex l'accepte mais exclut « Rosh Hashana II » et « LaBehemot ». */
                if(orig === 'Erev Rosh Hashana') newRel[ds]='Roch Hachana (1re nuitée)';
                if(/^Rosh Hashana( \d+)?$/.test(orig)) newRel[ds]='Roch Hachana (2e nuitée)';
                // (Rosh Hashana II = jour de sortie de fête : nuit suivante chez l'autre parent, non marquée)
                if(orig==='Yom Kippur'){const d1=s2d(ds);d1.setDate(d1.getDate()-1);newRel[d2s(d1)]='Kippour (nuit de Kol Nidré)'}
                if(orig==='Purim'){const d1=s2d(ds);d1.setDate(d1.getDate()-1);newRel[d2s(d1)]='Pourim (nuitée)'}
                if(orig==='Erev Pesach') newRel[ds]='Pessah (1er soir, Seder)';
                if(orig==='Pesach I') newRel[ds]='Pessah (2e soir)';
                // (Pesach II et suivants : hors dispositif — seuls les deux premiers soirs sont accordés)
                if(orig==='Shmini Atzeret'){const d1=s2d(ds);d1.setDate(d1.getDate()-1);newRel[d2s(d1)]="Shmini 'Atsérêt (nuitée)"}
                if(orig==='Chanukah: 1 Candle') newRel[ds]='Hanouka 1er jour (nuitée)';
                if(orig==='Chanukah: 8 Candles') newRel[ds]='Hanouka dernier jour (nuitée)';
            });
        }
        if(Object.keys(newRel).length>5){
            state.relHols=newRel;
            localStorage.setItem('gabriel_religious_holidays',JSON.stringify(newRel));
            localStorage.setItem('gabriel_last_sync',String(now));
            return 'updated';
        }
        return false;
    }catch(e){return false}
}

/* ── SYNC CALENDRIER SCOLAIRE ZONE C (data.education.gouv.fr) ──
   Convention API : start_date = vendredi (fin des cours), end_date = veille de la reprise.
   Convention moteur : s = 1er samedi, e = veille de la reprise, mid = s + 7.
   Retourne 'cached', 'updated' ou false. */
export async function syncSchoolCal(){
    const last=localStorage.getItem('gabriel_school_last_sync');const now=Date.now();
    if(last&&now-last<7*24*3600*1000) return 'cached';
    try{
        const url="https://data.education.gouv.fr/api/explore/v2.1/catalog/datasets/fr-en-calendrier-scolaire/records?"
            +"where="+encodeURIComponent('zones="Zone C" and location="Paris" and start_date>="2024-08-01"')
            +"&select=description,start_date,end_date,population&order_by=start_date&limit=60";
        const res=await fetch(url);
        const data=await res.json();
        if(!data.results||!data.results.length) return false;
        const plusJ=(x,n)=>{const d=s2d(x);d.setDate(d.getDate()+n);return d2s(d)};
        const api=[],ponts=[];
        data.results.forEach(r=>{
            if(r.population==='Enseignants') return; // dates élèves uniquement
            const desc=r.description||'',sd=(r.start_date||'').slice(0,10),ed=(r.end_date||'').slice(0,10);
            if(!sd) return;
            if(desc.indexOf('Pont')===0){ ponts.push({s:sd,e:ed||sd}); return; }
            if(desc==="Début des Vacances d'Été"){ api.push({n:"Été",s:plusJ(sd,1),e:sd.slice(0,4)+"-08-31",summer:true,prov:true}); return; }
            if(desc==="Vacances d'Été"){ api.push({n:"Été",s:plusJ(sd,1),e:ed,summer:true}); return; }
            const m=desc.match(/Toussaint|Noël|Hiver|Printemps/);
            if(m&&ed){ const s=plusJ(sd,1); api.push({n:m[0],s:s,e:ed,mid:plusJ(s,7)}); }
        });
        const clean=api.filter(a=>!a.prov||!api.some(b=>b.n==="Été"&&!b.prov&&Math.abs(s2d(b.s)-s2d(a.s))<45*86400000));
        if(clean.length<4) return false; // réponse anormale : on ne touche à rien
        const covered=h=>clean.some(a=>a.n===h.n&&Math.abs(s2d(a.s)-s2d(h.s))<45*86400000);
        const merged=clean.concat(DEFAULT_SCHOOL_HOLS.filter(h=>!covered(h))).sort((a,b)=>a.s.localeCompare(b.s));
        state.schoolHols=merged; state.pontRanges=ponts;
        localStorage.setItem('gabriel_school_holidays',JSON.stringify(merged));
        localStorage.setItem('gabriel_pont_ranges',JSON.stringify(ponts));
        localStorage.setItem('gabriel_school_last_sync',String(now));
        return 'updated';
    }catch(e){return false}
}
