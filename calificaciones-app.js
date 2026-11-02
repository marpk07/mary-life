(function(){
  const PEOPLE = ['Mary','Laura','Valery'];
  const LS = 'mary_calificaciones_v1';
  const COL = 'mary_calificaciones';
  const DOC = 'team_data';
  let store = { days: {}, openPendientesMaster: [], updatedAt: null };
  let db = null;
  const firebaseConfig = {
    apiKey: "AIzaSyCnhvfyXpwJdYOQFCvsyHDhgW9F3X7ARR4",
    authDomain: "marpk-816dd.firebaseapp.com",
    projectId: "marpk-816dd",
    storageBucket: "marpk-816dd.firebasestorage.app",
    messagingSenderId: "189644122232",
    appId: "1:189644122232:web:ed7894f1510a373d44658d"
  };
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  } catch (e) { console.warn('Firebase init', e); }

  const DEFAULT_OPENS = [
    {id:'odon', title:'Procedimiento odontología', status:'en_espera', note:''},
    {id:'maite', title:'Documentación Maite', status:'en_proceso', note:''},
    {id:'suplemento', title:'Suplemento', status:'pendiente', note:''},
    {id:'apple', title:'Venta de equipos Apple', status:'en_proceso', note:''},
    {id:'monitor', title:'Transporte de monitor', status:'en_espera', note:''},
    {id:'mudanza', title:'Mudanza', status:'en_proceso', note:''},
    {id:'nalito', title:'Profilaxis Nalito', status:'en_espera', note:''},
    {id:'eco', title:'Ecocardiograma Doppler', status:'en_espera', note:''},
    {id:'bicimoto', title:'Bicimoto', status:'pendiente', note:''},
    {id:'joyas', title:'Joyas / otorrino', status:'en_proceso', note:''}
  ];
  const OPEN_STATUS = [
    {v:'en_espera', t:'En espera'},
    {v:'en_proceso', t:'En proceso'},
    {v:'pendiente', t:'Pendiente'},
    {v:'cerrado', t:'Cerrado'}
  ];
  function openStatusLabel(s){
    const m={en_espera:'En espera',en_proceso:'En proceso',pendiente:'Pendiente',cerrado:'Cerrado'};
    return m[s]||s||'—';
  }
  function bonoMary(avg){
    if(avg==null) return {bonus:0, total:25, label:'Sin nota'};
    if(avg>=9) return {bonus:25, total:50, label:'9.0–10'};
    if(avg>=8) return {bonus:10, total:35, label:'8.0–8.9'};
    if(avg>=7) return {bonus:5, total:30, label:'7.0–7.9'};
    return {bonus:0, total:25, label:'<7'};
  }
  function bonoLV(avg){
    if(avg==null) return {bonus:0, total:150, label:'Sin nota'};
    if(avg>=8.9) return {bonus:150, total:300, label:'≥8.9'};
    if(avg>=8.4) return {bonus:100, total:250, label:'8.4–8.9'};
    if(avg>=8.0) return {bonus:70, total:220, label:'8.0–8.4'};
    return {bonus:0, total:150, label:'<8.0'};
  }
  function setStatus(msg){
    var el = document.getElementById('sync-status');
    if (el) el.textContent = msg || '';
  }
  function todayISO(){
    const d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function loadLocal(){
    try { const r = localStorage.getItem(LS); if(r){ const p=JSON.parse(r); if(p&&typeof p==='object'){ store=p; if(!store.days) store.days={}; } } } catch(e){}
    if(!store.days) store.days={};
    if(!store.openPendientesMaster || !store.openPendientesMaster.length){
      store.openPendientesMaster = DEFAULT_OPENS.map(x=>({...x}));
    }
  }
  function saveLocal(){
    store.updatedAt = Date.now();
    try { localStorage.setItem(LS, JSON.stringify(store)); } catch(e){}
  }
  async function loadCloud(){
    if(!db){ setStatus('Sin nube · solo local'); return; }
    try {
      setStatus('Sincronizando…');
      const snap = await db.collection(COL).doc(DOC).get();
      if (snap.exists) {
        const d = snap.data();
        if (d && (!store.updatedAt || (d.updatedAt||0) >= store.updatedAt)) {
          store = d;
          if (!store.days) store.days = {};
          if(!store.openPendientesMaster || !store.openPendientesMaster.length){
            store.openPendientesMaster = DEFAULT_OPENS.map(x=>({...x}));
          }
          saveLocal();
        }
      }
      setStatus('☁ Firebase listo');
    } catch(e){
      console.warn('cloud load', e);
      setStatus('Local (nube no disponible)');
    }
  }
  async function saveCloud(){
    if(!db) return;
    try {
      store.updatedAt = Date.now();
      await db.collection(COL).doc(DOC).set({...store, updatedAt: store.updatedAt}, {merge:true});
      setStatus('☁ Guardado en Firebase · ' + new Date().toLocaleTimeString());
    } catch(e){
      console.warn('cloud save', e);
      setStatus('Guardado local (error nube)');
    }
  }
  async function load(){ loadLocal(); await loadCloud(); }
  function num(v){ const n=parseFloat(String(v).replace(',','.')); return isNaN(n)?0:n; }
  function totalOf(ev){
    if(!ev) return 0;
    const disc = (ev.discounts||[]).reduce((s,d)=>s+Math.abs(num(d.amount)),0);
    return num(ev.prod)+num(ev.proact)-disc;
  }
  function emptyEv(){ return { prod:'', proact:'', prodNote:'', proactNote:'', status:'ok', statusNote:'', discounts:[{amount:'',reason:''}] }; }
  const STATUS_OPTS = [
    {v:'ok', t:'Con nota'}, {v:'descanso', t:'Descanso'}, {v:'permiso', t:'Permiso'},
    {v:'enfermedad', t:'Enfermedad'}, {v:'otro', t:'Otro motivo'}
  ];
  function statusLabel(s){
    const m={ok:'Con nota',descanso:'Descanso',permiso:'Permiso',enfermedad:'Enfermedad',otro:'Otro'};
    return m[s]||s||'—';
  }
  function hasScore(e){
    if(!e) return false;
    if(e.status && e.status!=='ok') return false;
    return (e.prod!==''&&e.prod!=null)||(e.proact!==''&&e.proact!=null)||(e.discounts||[]).some(d=>d.amount!==''&&d.amount!=null);
  }
  function isAbsent(e){ return e && e.status && e.status!=='ok'; }
  function ensureDay(day){
    if(!store.days[day]) store.days[day]={evaluations:{}, activities:{}, pendientesManana:{}, hoursMary:'', hoursPending:''};
    const d = store.days[day];
    if(!d.evaluations) d.evaluations={};
    if(!d.activities) d.activities={};
    if(!d.pendientesManana) d.pendientesManana={};
    if(d.hoursMary==null) d.hoursMary='';
    if(d.hoursPending==null) d.hoursPending='';
    return d;
  }
  function linesToBullets(text){
    if(!text||!String(text).trim()) return [];
    return String(text).split(/\n+/).map(s=>s.replace(/^[\s•\-\*]+/,'').trim()).filter(Boolean);
  }
  window.showT = function(t){
    document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active', b.dataset.t===t));
    document.getElementById('panel-dia').style.display = t==='dia'?'':'none';
    document.getElementById('panel-semana').style.display = t==='semana'?'':'none';
    document.getElementById('panel-graf').style.display = t==='graf'?'':'none';
    if(t==='semana') renderWeek();
    if(t==='graf'){ renderWeek(); drawCharts(); }
  };
  function discHTML(evalKey, list){
    const rows = (list&&list.length?list:[{amount:'',reason:''}]).map((d,i)=>`
      <div class="disc-row">
        <input data-k="${evalKey}" data-di="${i}" data-f="amount" type="number" step="0.5" placeholder="-0.5" value="${d.amount!=null?d.amount:''}">
        <input data-k="${evalKey}" data-di="${i}" data-f="reason" placeholder="Motivo" value="${(d.reason||'').replace(/"/g,'&quot;')}">
        <button type="button" class="btn btn-ghost" style="padding:0.35rem;" onclick="removeDisc('${evalKey}',${i})">✕</button>
      </div>`).join('');
    return rows + `<button type="button" class="btn btn-ghost" style="margin-top:0.25rem;font-size:0.7rem;" onclick="addDisc('${evalKey}')">+ Descuento</button>`;
  }
  window.addDisc = function(evalKey){
    collectForm();
    const day = document.getElementById('day-date').value || todayISO();
    const d = ensureDay(day);
    const ev = d.evaluations[evalKey] || emptyEv();
    if(!ev.discounts) ev.discounts=[];
    ev.discounts.push({amount:'',reason:''});
    d.evaluations[evalKey]=ev;
    renderDayForm();
  };
  window.removeDisc = function(evalKey, i){
    collectForm();
    const day = document.getElementById('day-date').value || todayISO();
    const d = store.days[day];
    const ev = d && d.evaluations[evalKey];
    if(!ev||!ev.discounts) return;
    ev.discounts.splice(i,1);
    if(!ev.discounts.length) ev.discounts=[{amount:'',reason:''}];
    renderDayForm();
  };
  function dayScores(day, evaluated){
    const data = (store.days[day]&&store.days[day].evaluations)||{};
    const scores = {}; const statuses = {}; let sum=0, n=0;
    PEOPLE.forEach(function(ev){
      const key = ev+'→'+evaluated;
      const e = data[key];
      if(isAbsent(e)){ scores[ev]=null; statuses[ev]=e.status; if(e.statusNote) statuses[ev+'_note']=e.statusNote; }
      else if(hasScore(e)){ const t = totalOf(e); scores[ev]=t; statuses[ev]='ok'; sum+=t; n++; }
      else { scores[ev]=null; statuses[ev]=null; }
    });
    scores.avg = n? sum/n : null; scores._status = statuses; return scores;
  }
  function cellHTML(sc, who){
    if(sc[who]!=null) return '<span class="score">'+sc[who].toFixed(1)+'</span>';
    const st = sc._status && sc._status[who];
    if(st && st!=='ok'){
      const note = sc._status[who+'_note'];
      return '<span class="status-badge '+st+'">'+statusLabel(st)+'</span>'+(note?'<div class="muted" style="font-size:0.6rem;margin-top:2px;">'+note+'</div>':'');
    }
    return '<span class="muted">—</span>';
  }
  function consolidatedNote(day, person){
    const data = (store.days[day]&&store.days[day].evaluations)||{};
    const preferKey = person==='Mary' ? 'Mary→Mary' : 'Mary→'+person;
    const e = data[preferKey];
    if(isAbsent(e)) return {absent:true, status:e.status, statusNote:e.statusNote||'', prod:null, proact:null, disc:null, total:null, discounts:[]};
    if(hasScore(e)){
      const discSum = (e.discounts||[]).reduce((s,d)=>s+Math.abs(num(d.amount)),0);
      return {absent:false, prod:num(e.prod), proact:num(e.proact), disc:discSum, total:totalOf(e), discounts:(e.discounts||[]).filter(d=>d.amount!==''&&d.amount!=null), proactNote:e.proactNote||''};
    }
    const sc = dayScores(day, person);
    if(sc.avg!=null) return {absent:false, prod:null, proact:null, disc:null, total:sc.avg, discounts:[], fromAvg:true};
    return {absent:false, prod:null, proact:null, disc:null, total:null, discounts:[]};
  }
  function renderDaySummary(day, d){
    let html = '<div class="glass day-summary" style="padding:1rem;">';
    html += '<div class="sec" style="margin-top:0;">Resumen del día · '+day+'</div>';
    if(d.hoursMary) html += '<p class="muted">Horas Mary: <b class="score">'+d.hoursMary+' h</b></p>';
    html += '<div style="overflow-x:auto;"><table><thead><tr><th>Evaluada</th><th>Mary</th><th>Laura</th><th>Valery</th><th>Prom.</th></tr></thead><tbody>';
    PEOPLE.forEach(function(person){
      const sc = dayScores(day, person);
      html += '<tr><td><b>'+person+'</b></td><td>'+cellHTML(sc,'Mary')+'</td><td>'+cellHTML(sc,'Laura')+'</td><td>'+cellHTML(sc,'Valery')+'</td><td>'+(sc.avg==null?'<span class="muted">—</span>':'<span class="score">'+sc.avg.toFixed(1)+'</span>')+'</td></tr>';
    });
    html += '</tbody></table></div></div>';
    return html;
  }
  function renderOpenPendientes(){
    const list = store.openPendientesMaster || [];
    let html = '<div class="glass" style="padding:1rem;margin-bottom:1rem;">';
    html += '<div class="sec" style="margin-top:0;">Pendientes abiertos (updates)</div>';
    html += '<p class="muted" style="margin:0 0 0.5rem;">Lista compartida. Cambia estado o agrega nuevos.</p>';
    list.forEach(function(p,i){
      if(p.status==='cerrado') return;
      const opts = OPEN_STATUS.map(o=>'<option value="'+o.v+'" '+(p.status===o.v?'selected':'')+'>'+o.t+'</option>').join('');
      html += `<div class="pend-row"><div>
          <input data-open="${i}" data-of="title" value="${(p.title||'').replace(/"/g,'&quot;')}" placeholder="Título">
          <input data-open="${i}" data-of="note" style="margin-top:0.25rem;" value="${(p.note||'').replace(/"/g,'&quot;')}" placeholder="Nota">
        </div><select data-open="${i}" data-of="status">${opts}</select>
        <button type="button" class="btn btn-ghost" style="padding:0.35rem;" onclick="removeOpen(${i})">✕</button></div>`;
    });
    html += `<button type="button" class="btn btn-ghost" style="margin-top:0.35rem;" onclick="addOpen()">+ Pendiente abierto</button>`;
    html += '<details style="margin-top:0.65rem;"><summary class="muted" style="cursor:pointer;">Ver cerrados</summary>';
    list.forEach(function(p,i){
      if(p.status!=='cerrado') return;
      html += '<div class="muted" style="margin:0.25rem 0;">✓ '+p.title+' <button type="button" class="btn btn-ghost" style="padding:0.2rem 0.4rem;font-size:0.65rem;" onclick="reopenOpen('+i+')">Reabrir</button></div>';
    });
    html += '</details></div>';
    return html;
  }
  function renderDayForm(){
    const day = document.getElementById('day-date').value || todayISO();
    document.getElementById('day-date').value = day;
    const d = ensureDay(day);
    const data = d.evaluations;
    let html = renderDaySummary(day, d);
    html += `<div class="glass" style="padding:1rem;margin-bottom:1rem;">
      <div class="sec" style="margin-top:0;">Cierre del día · meta</div>
      <div class="grid2">
        <div><label>Horas trabajadas de Mary</label>
          <input id="hours-mary" type="number" step="0.5" min="0" value="${d.hoursMary!=null?d.hoursMary:''}" placeholder="ej. 4.5"></div>
        <div><label>Horas pendientes por recuperar</label>
          <input id="hours-pending" type="number" step="0.5" min="0" value="${d.hoursPending!=null?d.hoursPending:''}" placeholder="acumulado"></div>
      </div></div>`;
    html += '<div class="glass" style="padding:1rem;margin-bottom:1rem;"><div class="sec" style="margin-top:0;">Actividades y pendientes de mañana</div>';
    PEOPLE.forEach(function(p){
      const act = d.activities[p]||''; const pend = d.pendientesManana[p]||'';
      html += `<div style="margin-bottom:0.85rem;">
        <div style="font-weight:800;margin-bottom:0.35rem;color:#f9a8d4;">${p}</div>
        <label>Actividades del día (una por línea)</label>
        <textarea id="act-${p}">${act}</textarea>
        <label style="margin-top:0.4rem;">Pendientes de mañana (una por línea)</label>
        <textarea id="pend-${p}">${pend}</textarea></div>`;
    });
    html += '</div>';
    html += renderOpenPendientes();
    html += '<div class="sec">Evaluaciones (notas)</div>';
    PEOPLE.forEach(function(evaluated){
      html += `<div class="glass" style="padding:1rem;margin-bottom:1rem;">
        <div class="sec" style="margin-top:0;">Evaluada: ${evaluated}</div>`;
      PEOPLE.forEach(function(evaluator){
        const key = evaluator+'→'+evaluated;
        const ev = data[key] || emptyEv();
        const tot = totalOf(ev);
        const self = evaluator===evaluated;
        const st = ev.status || 'ok';
        const statusOpts = STATUS_OPTS.map(o=>'<option value="'+o.v+'" '+(st===o.v?'selected':'')+'>'+o.t+'</option>').join('');
        const hideScores = st!=='ok';
        html += `<div class="eval-card">
          <h4>${self?'🪞 Autoevaluación de '+evaluator : '✍️ '+evaluator+' → '+evaluated}
            <span class="score" style="float:right;">${hideScores?statusLabel(st):('Total: '+tot.toFixed(1))}</span></h4>
          <div style="margin-bottom:0.55rem;"><label>Estado</label>
            <select data-k="${key}" data-f="status" onchange="onStatusChange()">${statusOpts}</select>
            <div style="margin-top:0.35rem;${st==='ok'?'display:none;':''}">
              <label>Motivo</label>
              <input data-k="${key}" data-f="statusNote" value="${(ev.statusNote||'').replace(/"/g,'&quot;')}"></div></div>
          <div style="${hideScores?'display:none;':''}">
          <div class="grid2">
            <div><label>Productividad</label><input data-k="${key}" data-f="prod" type="number" step="0.5" value="${ev.prod!=null?ev.prod:''}"></div>
            <div><label>Proactividad</label><input data-k="${key}" data-f="proact" type="number" step="0.5" value="${ev.proact!=null?ev.proact:''}"></div>
          </div>
          <div style="margin-top:0.45rem;"><label>Nota proactividad</label>
            <textarea data-k="${key}" data-f="proactNote">${ev.proactNote||''}</textarea></div>
          <div style="margin-top:0.55rem;"><label>Descuentos</label><div>${discHTML(key, ev.discounts)}</div></div>
          </div></div>`;
      });
      html += `</div>`;
    });
    document.getElementById('day-form').innerHTML = html;
  }
  window.onStatusChange = function(){ collectForm(); renderDayForm(); };
  window.addOpen = function(){
    collectForm();
    if(!store.openPendientesMaster) store.openPendientesMaster=[];
    store.openPendientesMaster.push({id:'n'+Date.now(), title:'', status:'pendiente', note:''});
    renderDayForm();
  };
  window.removeOpen = function(i){ collectForm(); store.openPendientesMaster.splice(i,1); renderDayForm(); };
  window.reopenOpen = function(i){ collectForm(); if(store.openPendientesMaster[i]) store.openPendientesMaster[i].status='en_proceso'; renderDayForm(); };
  function collectForm(){
    const day = document.getElementById('day-date').value || todayISO();
    const d = ensureDay(day);
    const evals = d.evaluations;
    document.querySelectorAll('#day-form [data-k][data-f]').forEach(function(el){
      const k = el.getAttribute('data-k'); const f = el.getAttribute('data-f'); const di = el.getAttribute('data-di');
      if(!evals[k]) evals[k]=emptyEv();
      if(di!=null){
        if(!evals[k].discounts) evals[k].discounts=[];
        const i = parseInt(di,10);
        while(evals[k].discounts.length<=i) evals[k].discounts.push({amount:'',reason:''});
        evals[k].discounts[i][f] = el.value;
      } else { evals[k][f] = el.value; }
    });
    Object.keys(evals).forEach(function(k){ evals[k].total = totalOf(evals[k]); });
    const hm = document.getElementById('hours-mary'); const hp = document.getElementById('hours-pending');
    if(hm) d.hoursMary = hm.value; if(hp) d.hoursPending = hp.value;
    PEOPLE.forEach(function(p){
      const a = document.getElementById('act-'+p); const pe = document.getElementById('pend-'+p);
      if(a) d.activities[p] = a.value; if(pe) d.pendientesManana[p] = pe.value;
    });
    document.querySelectorAll('#day-form [data-open][data-of]').forEach(function(el){
      const i = parseInt(el.getAttribute('data-open'),10); const f = el.getAttribute('data-of');
      if(!store.openPendientesMaster[i]) return;
      store.openPendientesMaster[i][f] = el.value;
    });
  }
  window.loadDayForm = function(){ renderDayForm(); };
  window.saveDay = async function(){
    collectForm(); saveLocal(); renderDayForm();
    setStatus('Guardando en Firebase…'); await saveCloud(); alert('Día guardado ✓');
  };
  function mondayOf(d){
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = (x.getDay()+6)%7; x.setDate(x.getDate()-day); return x;
  }
  function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }
  window.setThisWeek = function(){
    const m = mondayOf(new Date()); const sun = new Date(m); sun.setDate(m.getDate()+6);
    document.getElementById('range-from').value = iso(m);
    document.getElementById('range-to').value = iso(sun); renderWeek();
  };
  function daysInRange(from, to){
    const out=[]; if(!from||!to) return out;
    let d = new Date(from+'T12:00:00'); const end = new Date(to+'T12:00:00');
    while(d<=end){ out.push(iso(d)); d.setDate(d.getDate()+1); } return out;
  }
  window.renderWeek = function(){
    const from = document.getElementById('range-from').value;
    const to = document.getElementById('range-to').value;
    const days = daysInRange(from, to);
    const weekAvgs = {}; PEOPLE.forEach(p=>weekAvgs[p]={sum:0,n:0});
    let kpis = ''; let tables = ''; const allErrors = [];
    PEOPLE.forEach(function(person){
      tables += `<div class="glass" style="padding:1rem;margin-bottom:1rem;">
        <div class="sec" style="margin-top:0;">Evaluación de ${person}</div>
        <div style="overflow-x:auto;"><table><thead><tr><th>Día</th><th>Mary</th><th>Laura</th><th>Valery</th><th>Prom. día</th></tr></thead><tbody>`;
      days.forEach(function(day){
        const sc = dayScores(day, person);
        if(sc.avg!=null){ weekAvgs[person].sum+=sc.avg; weekAvgs[person].n++; }
        tables += `<tr><td>${day.slice(5)}</td><td>${cellHTML(sc,'Mary')}</td><td>${cellHTML(sc,'Laura')}</td><td>${cellHTML(sc,'Valery')}</td><td>${sc.avg==null?'<span class="muted">—</span>':'<span class="score">'+sc.avg.toFixed(1)+'</span>'}</td></tr>`;
        const data = (store.days[day]&&store.days[day].evaluations)||{};
        PEOPLE.forEach(function(ev){
          const e = data[ev+'→'+person];
          if(!e||!e.discounts||isAbsent(e)) return;
          e.discounts.forEach(function(d){
            if(d.amount===''||d.amount==null) return;
            const amt = Math.abs(num(d.amount)); if(!amt && !d.reason) return;
            allErrors.push({day, person, by:ev, amount:amt, reason:d.reason||''});
          });
        });
      });
      const wavg = weekAvgs[person].n ? weekAvgs[person].sum/weekAvgs[person].n : null;
      tables += `</tbody></table></div><p style="margin:0.65rem 0 0;font-weight:800;">Promedio: <span class="score">${wavg==null?'—':wavg.toFixed(2)}</span></p></div>`;
    });
    PEOPLE.forEach(function(p){
      const w = weekAvgs[p].n? (weekAvgs[p].sum/weekAvgs[p].n).toFixed(2) : '—';
      kpis += `<div class="kpi"><div class="v">${w}</div><div class="l">${p}</div></div>`;
    });
    document.getElementById('week-kpis').innerHTML = kpis;
    document.getElementById('week-tables').innerHTML = tables;
    if(!allErrors.length) document.getElementById('week-errors').innerHTML = '<p class="muted">Sin descuentos.</p>';
    else {
      let eh = '<table><thead><tr><th>Día</th><th>Resp.</th><th>Reg.</th><th>Pts</th><th>Motivo</th></tr></thead><tbody>';
      allErrors.forEach(function(e){ eh += `<tr><td>${e.day.slice(5)}</td><td><b>${e.person}</b></td><td>${e.by}</td><td class="neg">−${e.amount}</td><td>${e.reason||'—'}</td></tr>`; });
      document.getElementById('week-errors').innerHTML = eh+'</tbody></table>';
    }
    let bh = '<table><thead><tr><th>Persona</th><th>Prom.</th><th>Rango</th><th>Bono</th><th>Total</th></tr></thead><tbody>';
    PEOPLE.forEach(function(p){
      const avg = weekAvgs[p].n ? weekAvgs[p].sum/weekAvgs[p].n : null;
      if(p==='Mary'){ const b=bonoMary(avg); bh += `<tr><td><b>Mary</b></td><td>${avg==null?'—':avg.toFixed(2)}</td><td>${b.label}</td><td>+$${b.bonus}</td><td class="score">$${b.total}</td></tr>`; }
      else { const b=bonoLV(avg); bh += `<tr><td><b>${p}</b></td><td>${avg==null?'—':avg.toFixed(2)}</td><td>${b.label}</td><td>+R$${b.bonus}</td><td class="score">R$${b.total}</td></tr>`; }
    });
    document.getElementById('week-bonos').innerHTML = bh+'</tbody></table><p class="muted">Mary base $25. Laura/Valery base R$150.</p>';
    drawCharts();
  };
  function drawCharts(){
    const from = document.getElementById('range-from').value;
    const to = document.getElementById('range-to').value;
    const days = daysInRange(from, to);
    const colors = {Mary:'#f472b6', Laura:'#a78bfa', Valery:'#34d399'};
    const c1 = document.getElementById('chart-avg');
    if(c1){
      const ctx = c1.getContext('2d');
      const W = c1.width = c1.clientWidth * (window.devicePixelRatio||1);
      const H = c1.height = 200 * (window.devicePixelRatio||1);
      ctx.clearRect(0,0,W,H); const pad=30;
      const series = {}; PEOPLE.forEach(p=>series[p]=days.map(d=>dayScores(d,p).avg));
      let max=10; PEOPLE.forEach(p=>series[p].forEach(v=>{ if(v!=null&&v>max) max=v; }));
      ctx.strokeStyle='rgba(244,114,182,0.25)'; ctx.beginPath(); ctx.moveTo(pad,10); ctx.lineTo(pad,H-pad); ctx.lineTo(W-10,H-pad); ctx.stroke();
      PEOPLE.forEach(function(p, pi){
        ctx.strokeStyle=colors[p]; ctx.fillStyle=colors[p]; ctx.lineWidth=2; ctx.beginPath(); let first=true;
        series[p].forEach(function(v,i){
          if(v==null){ first=true; return; }
          const x = pad + (i/(Math.max(days.length-1,1)))*(W-pad-20);
          const y = (H-pad) - (v/max)*(H-pad-20);
          if(first){ ctx.moveTo(x,y); first=false; } else ctx.lineTo(x,y);
        }); ctx.stroke();
        ctx.fillText(p, pad + pi*70, 14);
      });
    }
  }
  function fmtDateLong(isoStr){
    try {
      const d = new Date(isoStr+'T12:00:00');
      const days = ['Domingo','Lunes','Martes','Miércoles','Jueves','Viernes','Sábado'];
      const months = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
      return days[d.getDay()]+' '+d.getDate()+' de '+months[d.getMonth()]+' de '+d.getFullYear();
    } catch(e){ return isoStr; }
  }
  window.copyParaEquipo = function(){
    collectForm();
    const day = document.getElementById('day-date').value || todayISO();
    const d = ensureDay(day);
    const cn = consolidatedNote(day, 'Mary');
    const acts = linesToBullets(d.activities.Mary);
    let t = '📋 *Cierre de Mary · '+day+'*\n\n*Actividades del día*\n';
    if(acts.length) acts.forEach(a=>{ t += '• '+a+'\n'; }); else t += '• (sin registrar)\n';
    t += '\n';
    if(cn.absent) t += '*Estado:* '+statusLabel(cn.status)+'\n';
    else {
      t += '*Productividad:* '+(cn.prod!=null?cn.prod.toFixed(1):'—')+'/10\n';
      t += '*Proactividad:* '+(cn.proact!=null?cn.proact.toFixed(1):'0')+'\n';
      if(cn.proactNote) t += '_'+cn.proactNote+'_\n';
      if(cn.discounts && cn.discounts.length){ t += '\n*Descuentos / errores*\n'; cn.discounts.forEach(x=>{ t += '• −'+Math.abs(num(x.amount))+(x.reason?(' · '+x.reason):'')+'\n'; }); }
      else t += '\n*Descuentos:* ninguno\n';
      t += '\n*Puntaje final:* '+(cn.total!=null?cn.total.toFixed(1):'—')+'/10\n';
    }
    t += '\n*Horas trabajadas:* '+(d.hoursMary!==''&&d.hoursMary!=null?('≈ '+d.hoursMary+' h'):'—')+'\n';
    const pend = linesToBullets(d.pendientesManana.Mary);
    if(pend.length){ t += '\n*Pendientes de mañana*\n'; pend.forEach(p=>{ t += '• '+p+'\n'; }); }
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(()=>alert('Copiado para Laura/Valery ✓')).catch(()=>prompt('Copia:',t));
    else prompt('Copia:', t);
  };
  function buildReportText(){
    const from = document.getElementById('range-from').value;
    const to = document.getElementById('range-to').value;
    const days = daysInRange(from, to);
    let lines = ['CALIFICACIONES', 'Período: '+from+' → '+to, ''];
    PEOPLE.forEach(function(person){
      lines.push('══ '+person+' ══');
      let sum=0,n=0;
      days.forEach(function(day){
        const sc = dayScores(day, person);
        function fWho(who){ if(sc[who]!=null) return sc[who].toFixed(1); const st=sc._status&&sc._status[who]; if(st&&st!=='ok') return statusLabel(st); return '—'; }
        lines.push(day+' | '+fWho('Mary')+' | '+fWho('Laura')+' | '+fWho('Valery')+' | '+(sc.avg==null?'—':sc.avg.toFixed(1)));
        if(sc.avg!=null){ sum+=sc.avg; n++; }
      });
      const avg = n?sum/n:null;
      lines.push('Promedio: '+(avg==null?'—':avg.toFixed(2)));
      if(person==='Mary'){ const b=bonoMary(avg); lines.push('Bono +$'+b.bonus+' · Total $'+b.total); }
      else { const b=bonoLV(avg); lines.push('Bono +R$'+b.bonus+' · Total R$'+b.total); }
      lines.push('');
    });
    return lines.join('\n');
  }
  window.copyReport = function(){
    const t = buildReportText();
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(()=>alert('Copiado ✓')).catch(()=>prompt('Copia:',t));
    else prompt('Copia:', t);
  };
  window._calAPI = {
    collectForm, ensureDay, consolidatedNote, dayScores, linesToBullets,
    statusLabel, openStatusLabel, bonoMary, bonoLV, num, PEOPLE, fmtDateLong,
    daysInRange, todayISO, getStore: function(){ return store; }
  };
  document.getElementById('day-date').value = todayISO();
  document.getElementById('day-date').addEventListener('change', function(){ renderDayForm(); });
  setThisWeek(); showT('dia');
  load().then(function(){ renderDayForm(); renderWeek(); setStatus(db ? '☁ Firebase listo' : 'Solo local'); });
})();
