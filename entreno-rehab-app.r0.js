  function todayISO(){
    const d = new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function setStatus(m){ const el=document.getElementById('sync-status'); if(el) el.textContent=m||''; }
  function loadLocal(){
    try {
      const r = localStorage.getItem(LS);
      if(r){ const p=JSON.parse(r); if(p&&p.sessions) store=p; }
    } catch(e){}
    if(!store.sessions) store.sessions=[];
  }
  function saveLocal(){
    store.updatedAt = Date.now();
    try { localStorage.setItem(LS, JSON.stringify(store)); } catch(e){}
  }
  async function loadCloud(){
    if(!db){ setStatus('Solo local'); return; }
    try {
      setStatus('Sincronizando…');
      const snap = await db.collection(COL).doc(DOC).get();
      if(snap.exists){
        const d = snap.data()||{};
        const remote = d.sessions||[];
        const map = {};
        store.sessions.forEach(s=>{ if(s&&s.id) map[s.id]=s; });
        remote.forEach(s=>{
          if(!s||!s.id) return;
          if(!map[s.id] || (s.updatedAt||0)>=(map[s.id].updatedAt||0)) map[s.id]=s;
        });
        store.sessions = Object.keys(map).map(k=>map[k]).sort((a,b)=>(b.date||'').localeCompare(a.date||''));
        saveLocal();
      }
      setStatus('☁ Firebase listo');
    } catch(e){
      console.warn(e);
      setStatus('Local (nube no disponible)');
    }
  }
  async function saveCloud(){
    if(!db) return;
    try {
      store.updatedAt = Date.now();
      await db.collection(COL).doc(DOC).set({ sessions: store.sessions, updatedAt: store.updatedAt, phase: PHASE }, { merge:true });
      setStatus('☁ Guardado · '+new Date().toLocaleTimeString());
    } catch(e){
      console.warn(e);
      setStatus('Guardado local (error nube)');
    }
  }

  function lastLogsForExercise(exId, limit){
    const out=[];
    for(const s of store.sessions){
      if(!s.exercises) continue;
      const ex = s.exercises.find(e=>e.id===exId);
      if(!ex||!ex.sets||!ex.sets.length) continue;
      const done = ex.sets.filter(x=>x.reps||x.weight||x.sec);
      if(!done.length) continue;
      out.push({ date:s.date, templateId:s.templateId, sets:done, note:ex.note||'' });
      if(out.length>=(limit||3)) break;
    }
    return out;
  }
  function bestLoadPhase(exId){
    let best=null;
    for(const s of store.sessions){
      if(s.phase && s.phase!==PHASE) continue;
      const ex=(s.exercises||[]).find(e=>e.id===exId);
      if(!ex) continue;
      (ex.sets||[]).forEach(set=>{
        const w=parseFloat(set.weight)||0;
        const r=parseInt(set.reps,10)||0;
        if(w<=0) return;
        const score=w*1000+r;
        if(!best||score>best.score) best={ weight:w, reps:r, date:s.date, score};
      });
    }
    return best;
  }
  function isPR(exId, weight, reps){
    const w=parseFloat(weight)||0, r=parseInt(reps,10)||0;
    if(w<=0) return false;
    let maxW=0, maxRepsAtW=0;
    store.sessions.forEach(s=>{
      const ex=(s.exercises||[]).find(e=>e.id===exId);
      if(!ex) return;
      (ex.sets||[]).forEach(set=>{
        const sw=parseFloat(set.weight)||0;
        const sr=parseInt(set.reps,10)||0;
        if(sw>maxW){ maxW=sw; maxRepsAtW=sr; }
        else if(sw===maxW && sr>maxRepsAtW) maxRepsAtW=sr;
      });
    });
    if(w>maxW) return 'PR peso';
    if(w===maxW && r>maxRepsAtW) return 'PR reps';
    return false;
  }

  function emptySession(templateId, date){
    const t = TEMPLATES[templateId];
    return {
      id: 's_'+Date.now()+'_'+Math.random().toString(36).slice(2,7),
      date: date||todayISO(),
      templateId,
      kind: t.kind,
      title: t.title,
      phase: PHASE,
      exercises: t.exercises.map(ex=>({
        id: ex.id,
        name: ex.name,
        mode: ex.mode,
        optional: !!ex.optional,
        planNote: ex.note||'',
        holdSec: ex.holdSec||null,
        targetReps: ex.targetReps||null,
        targetSec: ex.targetSec||null,
        planSets: ex.sets||1,
        skipped: false,
        note: '',
        sets: Array.from({length: ex.sets||1}, ()=>({ reps:'', weight:'', sec:'', rpe:'' }))
      })),
      pain: '', painWhere: '', painWhen: '',
      effort: '', durationMin: '', kcal: '', hrAvg: '', hrMax: '',
      sessionNote: '',
      updatedAt: Date.now(),
      completed: false
    };
  }

  window.showTab = function(tab){
    ['home','session','history','fisio'].forEach(function(t){
      const p=document.getElementById('panel-'+t);
      if(p) p.style.display = t===tab?'':'none';
      const b=document.querySelector('.tab[data-t="'+t+'"]');
      if(b) b.classList.toggle('active', t===tab);
    });
    if(tab==='history') renderHistory();
    if(tab==='fisio') renderFisio();
  };

  function renderHome(){
    const box=document.getElementById('tpl-list');
    if(!box) return;
    const groups=[
      {label:'Calentamiento', ids:['cal_piernas','cal_torso']},
      {label:'Rehabilitación', ids:['rehab_b1','rehab_b2','movilidad']},
      {label:'Gimnasio', ids:['push','pull','piernas_a','piernas_b']}
    ];
    let h='';
    groups.forEach(g=>{
      h+='<div class="sec">'+g.label+'</div>';
      g.ids.forEach(id=>{
        const t=TEMPLATES[id];
        h+='<button type="button" class="tpl-card" onclick="startSession(\''+id+'\')">';
        h+='<b>'+t.title+'</b><span class="muted">'+t.hint+'</span></button>';
      });
    });
    box.innerHTML=h;
    document.getElementById('session-date').value = todayISO();
  }

  window.startSession = function(templateId){
    const date = document.getElementById('session-date').value || todayISO();
    active = emptySession(templateId, date);
    active.exercises.forEach(ex=>{
      const last = lastLogsForExercise(ex.id, 1)[0];
      if(last && last.sets && last.sets[0] && ex.mode==='load'){
        ex.sets.forEach((s,i)=>{
          const src = last.sets[i] || last.sets[last.sets.length-1];
          if(src && src.weight) s.weight = src.weight;
        });
      }
    });
    showTab('session');
    renderSession();
  };

  window.cancelSession = function(){
    if(active && !confirm('¿Salir sin guardar esta sesión?')) return;
    stopTimer();
    active=null;
    showTab('home');
  };

  function stopTimer(){
    if(timer.iv) clearInterval(timer.iv);
    timer={ exId:null, left:0, total:0, iv:null };
    const bar=document.getElementById('timer-bar');
    if(bar) bar.style.display='none';
  }

  window.startTimer = function(exId, sec){
    stopTimer();
    sec = parseInt(sec,10)||30;
    timer.exId=exId; timer.left=sec; timer.total=sec;
    const bar=document.getElementById('timer-bar');
    if(bar) bar.style.display='flex';
    tickTimer();
    timer.iv=setInterval(tickTimer, 1000);
  };
  function tickTimer(){
    const el=document.getElementById('timer-display');
    const m=Math.floor(timer.left/60), s=timer.left%60;
    if(el) el.textContent = String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');
    if(timer.left<=0){
      stopTimer();
      if(navigator.vibrate) try{ navigator.vibrate([200,100,200]); }catch(e){}
      const td=document.getElementById('timer-display');
      if(td) td.textContent='¡Listo!';
      return;
    }
    timer.left--;
  }
  window.stopTimerBtn = function(){ stopTimer(); };

