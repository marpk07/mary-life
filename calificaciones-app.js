(function(){
  const PEOPLE = ['Mary','Laura','Valery'];
  const LS = 'mary_calificaciones_v1';
  const COL = 'mary_calificaciones';
  const DOC = 'team_data';
  let store = { days: {}, updatedAt: null };
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
  async function load(){
    loadLocal();
    await loadCloud();
  }
  function save(){
    saveLocal();
    saveCloud();
  }
  function num(v){ const n=parseFloat(String(v).replace(',','.')); return isNaN(n)?0:n; }
  function totalOf(ev){
    if(!ev) return 0;
    const disc = (ev.discounts||[]).reduce((s,d)=>s+Math.abs(num(d.amount)),0);
    return num(ev.prod)+num(ev.proact)-disc;
  }
  function emptyEv(){ return { prod:'', proact:'', prodNote:'', proactNote:'', status:'ok', statusNote:'', discounts:[{amount:'',reason:''}] }; }
  const STATUS_OPTS = [
    {v:'ok', t:'Con nota'},
    {v:'descanso', t:'Descanso'},
    {v:'permiso', t:'Permiso'},
    {v:'enfermedad', t:'Enfermedad'},
    {v:'otro', t:'Otro motivo'}
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
        <input data-k="${evalKey}" data-di="${i}" data-f="reason" placeholder="Motivo del descuento" value="${(d.reason||'').replace(/"/g,'&quot;')}">
        <button type="button" class="btn btn-ghost" style="padding:0.35rem;" onclick="removeDisc('${evalKey}',${i})">✕</button>
      </div>`).join('');
    return rows + `<button type="button" class="btn btn-ghost" style="margin-top:0.25rem;font-size:0.7rem;" onclick="addDisc('${evalKey}')">+ Descuento</button>`;
  }

  window.addDisc = function(evalKey){
    collectForm();
    const day = document.getElementById('day-date').value || todayISO();
    if(!store.days[day]) store.days[day]={evaluations:{}};
    const ev = store.days[day].evaluations[evalKey] || emptyEv();
    if(!ev.discounts) ev.discounts=[];
    ev.discounts.push({amount:'',reason:''});
    store.days[day].evaluations[evalKey]=ev;
    renderDayForm();
  };
  window.removeDisc = function(evalKey, i){
    collectForm();
    const day = document.getElementById('day-date').value || todayISO();
    const ev = store.days[day] && store.days[day].evaluations[evalKey];
    if(!ev||!ev.discounts) return;
    ev.discounts.splice(i,1);
    if(!ev.discounts.length) ev.discounts=[{amount:'',reason:''}];
    renderDayForm();
  };

  function dayScores(day, evaluated){
    const data = (store.days[day]&&store.days[day].evaluations)||{};
    const scores = {};
    const statuses = {};
    let sum=0, n=0;
    PEOPLE.forEach(function(ev){
      const key = ev+'→'+evaluated;
      const e = data[key];
      if(isAbsent(e)){
        scores[ev]=null;
        statuses[ev]=e.status;
        if(e.statusNote) statuses[ev+'_note']=e.statusNote;
      } else if(hasScore(e)){
        const t = totalOf(e);
        scores[ev]=t;
        statuses[ev]='ok';
        sum+=t; n++;
      } else {
        scores[ev]=null;
        statuses[ev]=null;
      }
    });
    scores.avg = n? sum/n : null;
    scores._status = statuses;
    return scores;
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

  function renderDaySummary(day, data){
    let html = '<div class="glass day-summary" style="padding:1rem;">';
    html += '<div class="sec" style="margin-top:0;">Resumen del día · '+day+'</div>';
    html += '<div style="overflow-x:auto;"><table><thead><tr><th>Evaluada</th><th>Mary</th><th>Laura</th><th>Valery</th><th>Prom.</th></tr></thead><tbody>';
    PEOPLE.forEach(function(person){
      const sc = dayScores(day, person);
      html += '<tr><td><b>'+person+'</b></td><td>'+cellHTML(sc,'Mary')+'</td><td>'+cellHTML(sc,'Laura')+'</td><td>'+cellHTML(sc,'Valery')+'</td><td>'+(sc.avg==null?'<span class="muted">—</span>':'<span class="score">'+sc.avg.toFixed(1)+'</span>')+'</td></tr>';
    });
    html += '</tbody></table></div>';
    const details = [];
    PEOPLE.forEach(function(evaluated){
      PEOPLE.forEach(function(evaluator){
        const key = evaluator+'→'+evaluated;
        const e = data[key];
        if(!e) return;
        if(isAbsent(e)){
          details.push('<div class="muted" style="margin:0.35rem 0;"><b>'+evaluator+' → '+evaluated+'</b>: <span class="status-badge '+e.status+'">'+statusLabel(e.status)+'</span> '+(e.statusNote||'')+'</div>');
          return;
        }
        if(!hasScore(e)) return;
        const tot = totalOf(e);
        let line = '<div style="margin:0.45rem 0;padding:0.55rem;border:1px solid var(--border);border-radius:12px;">';
        line += '<div style="font-weight:800;font-size:0.8rem;">'+evaluator+' → '+evaluated+' · <span class="score">'+tot.toFixed(1)+'</span></div>';
        line += '<div class="muted">Prod: '+(e.prod||'0')+(e.prodNote?(' · '+e.prodNote):'')+'</div>';
        line += '<div class="muted">Proact: '+(e.proact||'0')+(e.proactNote?(' · '+e.proactNote):'')+'</div>';
        const discs = (e.discounts||[]).filter(d=>d.amount!==''&&d.amount!=null);
        if(discs.length){
          line += '<div class="neg" style="margin-top:0.25rem;">Descuentos: '+discs.map(d=>'−'+Math.abs(num(d.amount))+(d.reason?(' ('+d.reason+')'):'')).join(', ')+'</div>';
        }
        line += '</div>';
        details.push(line);
      });
    });
    if(details.length){
      html += '<div class="sec">Detalle · notas y descuentos</div>'+details.join('');
    } else {
      html += '<p class="muted" style="margin:0.5rem 0 0;">Aún no hay notas ni motivos registrados este día.</p>';
    }
    html += '</div>';
    return html;
  }

  function renderDayForm(){
    const day = document.getElementById('day-date').value || todayISO();
    document.getElementById('day-date').value = day;
    const data = (store.days[day]&&store.days[day].evaluations) || {};
    let html = renderDaySummary(day, data);
    html += '<div class="sec">Registrar / editar evaluaciones</div>';
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
            <span class="score" style="float:right;">${hideScores?statusLabel(st):('Total: '+tot.toFixed(1))}</span>
          </h4>
          <div style="margin-bottom:0.55rem;">
            <label>Estado de esta evaluación</label>
            <select data-k="${key}" data-f="status" onchange="onStatusChange('${key}')">${statusOpts}</select>
            <div style="margin-top:0.35rem;${st==='ok'?'display:none;':''}" id="status-note-wrap-${key.replace('→','-')}">
              <label>Motivo / detalle</label>
              <input data-k="${key}" data-f="statusNote" placeholder="Ej. día libre, cita médica…" value="${(ev.statusNote||'').replace(/"/g,'&quot;')}">
            </div>
          </div>
          <div id="scores-wrap-${key.replace('→','-')}" style="${hideScores?'display:none;':''}">
          <div class="grid2">
            <div>
              <label>Productividad (pts)</label>
              <input data-k="${key}" data-f="prod" type="number" step="0.5" value="${ev.prod!=null?ev.prod:''}">
            </div>
            <div>
              <label>Proactividad (pts)</label>
              <input data-k="${key}" data-f="proact" type="number" step="0.5" value="${ev.proact!=null?ev.proact:''}">
            </div>
          </div>
          <div style="margin-top:0.45rem;">
            <label>Qué hizo (productividad)</label>
            <textarea data-k="${key}" data-f="prodNote" placeholder="Actividades del día…">${ev.prodNote||''}</textarea>
          </div>
          <div style="margin-top:0.45rem;">
            <label>Qué hizo (proactividad)</label>
            <textarea data-k="${key}" data-f="proactNote" placeholder="Si aplica…">${ev.proactNote||''}</textarea>
          </div>
          <div style="margin-top:0.55rem;">
            <label>Descuentos (se restan del total)</label>
            <div>${discHTML(key, ev.discounts)}</div>
          </div>
          </div>
        </div>`;
      });
      html += `</div>`;
    });
    document.getElementById('day-form').innerHTML = html;
  }

  window.onStatusChange = function(key){
    collectForm();
    renderDayForm();
  };

  function collectForm(){
    const day = document.getElementById('day-date').value || todayISO();
    if(!store.days[day]) store.days[day]={evaluations:{}};
    const evals = store.days[day].evaluations;
    document.querySelectorAll('#day-form [data-k][data-f]').forEach(function(el){
      const k = el.getAttribute('data-k');
      const f = el.getAttribute('data-f');
      const di = el.getAttribute('data-di');
      if(!evals[k]) evals[k]=emptyEv();
      if(di!=null){
        if(!evals[k].discounts) evals[k].discounts=[];
        const i = parseInt(di,10);
        while(evals[k].discounts.length<=i) evals[k].discounts.push({amount:'',reason:''});
        evals[k].discounts[i][f] = el.value;
      } else {
        evals[k][f] = el.value;
      }
    });
    Object.keys(evals).forEach(function(k){
      evals[k].total = totalOf(evals[k]);
    });
  }

  window.loadDayForm = function(){ renderDayForm(); };
  window.saveDay = async function(){
    collectForm();
    saveLocal();
    renderDayForm();
    setStatus('Guardando en Firebase…');
    await saveCloud();
    alert('Día guardado ✓ (local + Firebase)');
  };

  function mondayOf(d){
    const x = new Date(d.getFullYear(), d.getMonth(), d.getDate());
    const day = (x.getDay()+6)%7;
    x.setDate(x.getDate()-day);
    return x;
  }
  function iso(d){ return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0'); }

  window.setThisWeek = function(){
    const m = mondayOf(new Date());
    const sun = new Date(m); sun.setDate(m.getDate()+6);
    document.getElementById('range-from').value = iso(m);
    document.getElementById('range-to').value = iso(sun);
    renderWeek();
  };

  function daysInRange(from, to){
    const out=[];
    if(!from||!to) return out;
    let d = new Date(from+'T12:00:00');
    const end = new Date(to+'T12:00:00');
    while(d<=end){ out.push(iso(d)); d.setDate(d.getDate()+1); }
    return out;
  }

  window.renderWeek = function(){
    const from = document.getElementById('range-from').value;
    const to = document.getElementById('range-to').value;
    const days = daysInRange(from, to);
    const weekAvgs = {};
    PEOPLE.forEach(p=>weekAvgs[p]={sum:0,n:0});
    let kpis = '';
    let tables = '';
    const allErrors = [];

    PEOPLE.forEach(function(person){
      tables += `<div class="glass" style="padding:1rem;margin-bottom:1rem;">
        <div class="sec" style="margin-top:0;">Evaluación de ${person}</div>
        <div style="overflow-x:auto;"><table>
          <thead><tr><th>Día</th><th>Mary</th><th>Laura</th><th>Valery</th><th>Prom. día</th></tr></thead><tbody>`;
      days.forEach(function(day){
        const sc = dayScores(day, person);
        if(sc.avg!=null){ weekAvgs[person].sum+=sc.avg; weekAvgs[person].n++; }
        tables += `<tr><td>${day.slice(5)}</td><td>${cellHTML(sc,'Mary')}</td><td>${cellHTML(sc,'Laura')}</td><td>${cellHTML(sc,'Valery')}</td><td>${sc.avg==null?'<span class="muted">—</span>':'<span class="score">'+sc.avg.toFixed(1)+'</span>'}</td></tr>`;
        const data = (store.days[day]&&store.days[day].evaluations)||{};
        PEOPLE.forEach(function(ev){
          const e = data[ev+'→'+person];
          if(!e||!e.discounts) return;
          if(isAbsent(e)) return;
          e.discounts.forEach(function(d){
            if(d.amount===''||d.amount==null) return;
            const amt = Math.abs(num(d.amount));
            if(!amt && !d.reason) return;
            allErrors.push({day, person, by:ev, amount:amt, reason:d.reason||''});
          });
        });
      });
      const wavg = weekAvgs[person].n ? weekAvgs[person].sum/weekAvgs[person].n : null;
      tables += `</tbody></table></div>
        <p style="margin:0.65rem 0 0;font-weight:800;">Promedio del período: <span class="score">${wavg==null?'—':wavg.toFixed(2)}</span></p>
      </div>`;
    });

    PEOPLE.forEach(function(p){
      const w = weekAvgs[p].n? (weekAvgs[p].sum/weekAvgs[p].n).toFixed(2) : '—';
      kpis += `<div class="kpi"><div class="v">${w}</div><div class="l">${p}</div></div>`;
    });
    document.getElementById('week-kpis').innerHTML = kpis;
    document.getElementById('week-tables').innerHTML = tables;

    if(!allErrors.length){
      document.getElementById('week-errors').innerHTML = '<p class="muted">Sin descuentos registrados en el período.</p>';
    } else {
      let eh = '<table><thead><tr><th>Día</th><th>Responsable</th><th>Registró</th><th>Pts</th><th>Motivo</th></tr></thead><tbody>';
      allErrors.forEach(function(e){
        eh += `<tr><td>${e.day.slice(5)}</td><td><b>${e.person}</b></td><td>${e.by}</td><td class="neg">−${e.amount}</td><td>${e.reason||'—'}</td></tr>`;
      });
      eh += '</tbody></table>';
      const byP = {};
      allErrors.forEach(e=>{ byP[e.person]=(byP[e.person]||0)+e.amount; });
      eh += '<p style="margin-top:0.75rem;font-weight:700;">Total descuentos por responsable: '+
        PEOPLE.map(p=>`${p} <span class="neg">−${(byP[p]||0).toFixed(1)}</span>`).join(' · ')+'</p>';
      document.getElementById('week-errors').innerHTML = eh;
    }
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
      ctx.clearRect(0,0,W,H);
      const pad=30;
      const series = {};
      PEOPLE.forEach(p=>series[p]=days.map(d=>{ const sc=dayScores(d,p); return sc.avg; }));
      let max=10;
      PEOPLE.forEach(p=>series[p].forEach(v=>{ if(v!=null&&v>max) max=v; }));
      ctx.strokeStyle='rgba(244,114,182,0.25)';
      ctx.beginPath(); ctx.moveTo(pad,10); ctx.lineTo(pad,H-pad); ctx.lineTo(W-10,H-pad); ctx.stroke();
      PEOPLE.forEach(function(p, pi){
        ctx.strokeStyle=colors[p]; ctx.fillStyle=colors[p]; ctx.lineWidth=2;
        ctx.beginPath();
        let first=true;
        series[p].forEach(function(v,i){
          if(v==null){ first=true; return; }
          const x = pad + (i/(Math.max(days.length-1,1)))*(W-pad-20);
          const y = (H-pad) - (v/max)*(H-pad-20);
          if(first){ ctx.moveTo(x,y); first=false; } else ctx.lineTo(x,y);
        });
        ctx.stroke();
        series[p].forEach(function(v,i){
          if(v==null) return;
          const x = pad + (i/(Math.max(days.length-1,1)))*(W-pad-20);
          const y = (H-pad) - (v/max)*(H-pad-20);
          ctx.beginPath(); ctx.arc(x,y,3,0,Math.PI*2); ctx.fill();
        });
        ctx.fillText(p, pad + pi*70, 14);
      });
    }
    const c2 = document.getElementById('chart-disc');
    if(c2){
      const ctx = c2.getContext('2d');
      const W = c2.width = c2.clientWidth * (window.devicePixelRatio||1);
      const H = c2.height = 180 * (window.devicePixelRatio||1);
      ctx.clearRect(0,0,W,H);
      const totals = {Mary:0,Laura:0,Valery:0};
      days.forEach(function(day){
        const data = (store.days[day]&&store.days[day].evaluations)||{};
        PEOPLE.forEach(function(person){
          PEOPLE.forEach(function(ev){
            const e = data[ev+'→'+person];
            if(!e||!e.discounts||isAbsent(e)) return;
            e.discounts.forEach(d=>{ totals[person]+=Math.abs(num(d.amount)); });
          });
        });
      });
      const max = Math.max(1, ...PEOPLE.map(p=>totals[p]));
      const bw = W/5;
      PEOPLE.forEach(function(p,i){
        const h = (totals[p]/max)*(H-50);
        const x = bw + i*(bw*1.2);
        const y = H-30-h;
        ctx.fillStyle = colors[p];
        ctx.fillRect(x, y, bw*0.7, h);
        ctx.fillStyle = '#f5eef8';
        ctx.font = '12px sans-serif';
        ctx.fillText(p, x, H-12);
        ctx.fillText(totals[p].toFixed(1), x, y-6);
      });
    }
  }

  function buildReportText(){
    const from = document.getElementById('range-from').value;
    const to = document.getElementById('range-to').value;
    const days = daysInRange(from, to);
    let lines = ['CALIFICACIONES — Mary · Laura · Valery', 'Período: '+from+' → '+to, ''];
    PEOPLE.forEach(function(person){
      lines.push('══ Evaluación de '+person+' ══');
      lines.push('Día | Mary | Laura | Valery | Promedio');
      let sum=0,n=0;
      days.forEach(function(day){
        const sc = dayScores(day, person);
        function fWho(who){ if(sc[who]!=null) return sc[who].toFixed(1); const st=sc._status&&sc._status[who]; if(st&&st!=='ok') return statusLabel(st); return '—'; }
        lines.push(day+' | '+fWho('Mary')+' | '+fWho('Laura')+' | '+fWho('Valery')+' | '+(sc.avg==null?'—':sc.avg.toFixed(1)));
        if(sc.avg!=null){ sum+=sc.avg; n++; }
      });
      lines.push('Promedio período: '+(n?(sum/n).toFixed(2):'—'));
      lines.push('');
    });
    lines.push('══ Descuentos / errores ══');
    days.forEach(function(day){
      const data = (store.days[day]&&store.days[day].evaluations)||{};
      PEOPLE.forEach(function(person){
        PEOPLE.forEach(function(ev){
          const e = data[ev+'→'+person];
          if(!e) return;
          if(isAbsent(e)){
            lines.push(day+' · '+person+' (reg. '+ev+') · '+statusLabel(e.status)+(e.statusNote?(' · '+e.statusNote):''));
            return;
          }
          if(!e.discounts) return;
          e.discounts.forEach(function(d){
            if(d.amount===''||d.amount==null) return;
            lines.push(day+' · '+person+' (reg. '+ev+') −'+Math.abs(num(d.amount))+' · '+(d.reason||''));
          });
        });
      });
    });
    lines.push('');
    lines.push('Fórmula: Total = Productividad + Proactividad − Descuentos');
    lines.push('Promedio diario solo con las notas existentes (excluye descanso/permiso/enfermedad).');
    return lines.join('\n');
  }

  window.copyReport = function(){
    const t = buildReportText();
    if(navigator.clipboard&&navigator.clipboard.writeText){
      navigator.clipboard.writeText(t).then(()=>alert('Reporte copiado ✓')).catch(()=>prompt('Copia:',t));
    } else prompt('Copia:', t);
  };

  window.exportPDF = function(){
    const from = document.getElementById('range-from').value;
    const to = document.getElementById('range-to').value;
    const days = daysInRange(from, to);
    try {
      const { jsPDF } = window.jspdf;
      const doc = new jsPDF({ unit:'pt', format:'a4' });
      let y = 40;
      doc.setFontSize(14);
      doc.text('Calificaciones — Mary · Laura · Valery', 40, y); y+=18;
      doc.setFontSize(10);
      doc.setTextColor(100);
      doc.text('Periodo: '+from+' a '+to, 40, y); y+=16;
      doc.setTextColor(0);
      doc.text('Formula: Total = Productividad + Proactividad - Descuentos', 40, y); y+=20;
      PEOPLE.forEach(function(person){
        if(y>720){ doc.addPage(); y=40; }
        doc.setFontSize(12);
        doc.text('Evaluacion de '+person, 40, y); y+=8;
        const body = days.map(function(day){
          const sc = dayScores(day, person);
          function fWho(who){ if(sc[who]!=null) return sc[who].toFixed(1); const st=sc._status&&sc._status[who]; if(st&&st!=='ok') return statusLabel(st); return '-'; }
          return [day, fWho('Mary'), fWho('Laura'), fWho('Valery'), sc.avg==null?'-':sc.avg.toFixed(1)];
        });
        let sum=0,n=0;
        days.forEach(d=>{ const sc=dayScores(d,person); if(sc.avg!=null){sum+=sc.avg;n++;}});
        doc.autoTable({ startY: y, head: [['Dia','Mary','Laura','Valery','Prom. dia']], body: body, theme: 'striped', styles: { fontSize: 9 }, margin: { left:40, right:40 } });
        y = doc.lastAutoTable.finalY + 10;
        doc.setFontSize(10);
        doc.text('Promedio del periodo: '+(n?(sum/n).toFixed(2):'-'), 40, y); y+=22;
      });
      doc.save('calificaciones_'+from+'_'+to+'.pdf');
    } catch(err){
      console.error(err);
      alert('No se pudo generar el PDF. Usa Copiar.');
      copyReport();
    }
  };

  document.getElementById('day-date').value = todayISO();
  document.getElementById('day-date').addEventListener('change', function(){ renderDayForm(); });
  setThisWeek();
  showT('dia');
  load().then(function(){
    renderDayForm();
    renderWeek();
    setStatus(db ? '☁ Firebase listo' : 'Solo local');
  });
})();
