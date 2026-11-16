(function(){
  const LS = 'mary_entreno_rehab_v1';
  const COL = 'mary_entreno_rehab';
  const DOC = 'sessions_data';
  const PHASE = 'v3_nov2026';

  const TEMPLATES = {
    cal_piernas: {
      id:'cal_piernas', kind:'calentamiento', title:'Calentamiento piernas',
      hint:'~8–10 min · dinámico, sin estirar estático antes de cargar',
      exercises:[
        {id:'cp1', name:'Bicicleta suave', mode:'time', targetSec:300, sets:1, note:'5 min, resistencia baja'},
        {id:'cp2', name:'Círculos de pierna de pie (adelante/atrás)', mode:'reps', targetReps:10, sets:2, note:'Por pierna, controlado'},
        {id:'cp3', name:'Círculos / balanceo lateral de pierna', mode:'reps', targetReps:10, sets:2, note:'De pie, hacia los lados'},
        {id:'cp4', name:'Rotación de cadera de pie', mode:'reps', targetReps:10, sets:2, note:'Giro suave de la pierna'},
        {id:'cp5', name:'Zancada dinámica + inclinación de torso', mode:'reps', targetReps:8, sets:2, note:'Por lado; te inclinas adelante/atrás con control'},
        {id:'cp6', name:'Rotación de piernas sentada', mode:'reps', targetReps:10, sets:2, note:'Sentada, abre/cierra o rota con control'},
        {id:'cp7', name:'Puente de glúteo', mode:'reps', targetReps:10, sets:1, note:'Sin peso'},
        {id:'cp8', name:'Sentadilla sin peso', mode:'reps', targetReps:10, sets:1, note:'Rango cómodo, sin dolor de tendón'}
      ]
    },
    cal_torso: {
      id:'cal_torso', kind:'calentamiento', title:'Calentamiento torso (Push/Pull)',
      hint:'~8–10 min · movilidad dinámica',
      exercises:[
        {id:'ct1', name:'Caminata suave', mode:'time', targetSec:180, sets:1, note:'3 min'},
        {id:'ct2', name:'Círculos de hombros', mode:'reps', targetReps:12, sets:2, note:'Adelante y atrás'},
        {id:'ct3', name:'Círculos de brazos', mode:'reps', targetReps:12, sets:2, note:'Amplios, sin dolor'},
        {id:'ct4', name:'Apertura de pecho', mode:'time', targetSec:30, sets:2, note:'Manos atrás o en marco, suave'},
        {id:'ct5', name:'Rotación de tronco de pie', mode:'reps', targetReps:10, sets:2, note:'Por lado'},
        {id:'ct6', name:'Gato-camello', mode:'reps', targetReps:10, sets:1, note:'Lento'},
        {id:'ct7', name:'Serie ligera del 1.er ejercicio del día', mode:'reps', targetReps:12, sets:1, note:'Peso muy liviano · activa el patrón'}
      ]
    },
    rehab_b1: {
      id:'rehab_b1', kind:'rehab', title:'Rehab Bloque 1 · Cuádriceps y flexores',
      hint:'3×15 base · isométricos sin irritar el tendón · ~15 min',
      exercises:[
        {id:'r1a', name:'Extensión de cuádriceps isométrica', mode:'iso', targetReps:15, sets:3, holdSec:25, note:'Sentada, extiende y sostén. Aprieta fuerte, sin dolor. 20–30 s.'},
        {id:'r1b', name:'Extensión isométrica + abd/aducción con obstáculo', mode:'reps', targetReps:15, sets:3, note:'Pasa la pierna por encima del objeto: dentro y fuera.'},
        {id:'r1c', name:'Elevación de pierna recta (SLR)', mode:'reps', targetReps:15, sets:3, note:'Boca arriba, eleva hasta la altura de la otra rodilla.'},
        {id:'r1d', name:'Dead bug', mode:'reps', targetReps:15, sets:3, note:'Brazo y pierna contrarios; sin arquear la espalda.'},
        {id:'r1e', name:'Marcha con pausa', mode:'iso', targetReps:15, sets:3, holdSec:5, note:'Rodilla a 90° · mantén 5 s · alterna.'},
        {id:'r1f', name:'Sitting leg raise (rodilla al pecho)', mode:'reps', targetReps:15, sets:3, note:'Boca arriba, flexiona cadera y baja con control.'}
      ]
    },
    rehab_b2: {
      id:'rehab_b2', kind:'rehab', title:'Rehab Bloque 2 · Lumbar y glúteos',
      hint:'3×15 · tronco estable · ~15 min',
      exercises:[
        {id:'r2a', name:'Bird-dog', mode:'reps', targetReps:15, sets:3, note:'Cuatro apoyos; brazo y pierna contrarios, cadera nivelada.'},
        {id:'r2b', name:'Gato-camello', mode:'reps', targetReps:15, sets:3, note:'Movimiento lento.'},
        {id:'r2c', name:'Puente de glúteo a una pierna', mode:'reps', targetReps:15, sets:3, note:'Sin girar la pelvis.'},
        {id:'r2d', name:'Patada trasera en cuadrupedia', mode:'reps', targetReps:15, sets:3, note:'Sin arquear la lumbar.'},
        {id:'r2e', name:'Hip thrust', mode:'reps', targetReps:15, sets:3, note:'Pausa 1 s arriba.'},
        {id:'r2f', name:'Clamshell (almeja)', mode:'reps', targetReps:15, sets:3, note:'Abre rodilla sin girar pelvis.'}
      ]
    },
    movilidad: {
      id:'movilidad', kind:'movilidad', title:'Movilidad y estiramiento (cuerpo completo)',
      hint:'20–25 min · mié/dom o cuando toque · sin dolor',
      exercises:[
        {id:'m1', name:'Gato-camello', mode:'reps', targetReps:10, sets:1, note:'Lento'},
        {id:'m2', name:'Postura del niño', mode:'time', targetSec:40, sets:1, note:'30–45 s'},
        {id:'m3', name:'Rotación torácica en cuadrupedia', mode:'reps', targetReps:8, sets:1, note:'Por lado'},
        {id:'m4', name:'Estiramiento flexor de cadera', mode:'time', targetSec:40, sets:1, note:'30–45 s por lado'},
        {id:'m5', name:'Isquios acostada con banda/toalla', mode:'time', targetSec:40, sets:1, note:'30–45 s por lado'},
        {id:'m6', name:'Figura 4 (glúteo)', mode:'time', targetSec:40, sets:1, note:'30–45 s por lado'},
        {id:'m7', name:'Pantorrilla en pared', mode:'time', targetSec:40, sets:1, note:'30–45 s por lado'},
        {id:'m8', name:'Pecho en marco de puerta', mode:'time', targetSec:30, sets:1, note:'Sin forzar hombro'},
        {id:'m9', name:'Rodillas al pecho + rotación lumbar', mode:'time', targetSec:30, sets:1, note:'Por lado'},
        {id:'m10', name:'Cuádriceps (opcional)', mode:'time', targetSec:25, sets:1, note:'Si molesta el tendón, sáltalo', optional:true}
      ]
    },
    piernas_a: {
      id:'piernas_a', kind:'gym', title:'Piernas A (suave)',
      hint:'Peso moderado · molestia ≤3–4/10 · sin subir peso estas 4 sem',
      exercises:[
        {id:'pa1', name:'Prensa 45° (pies ancho hombros)', mode:'load', targetReps:12, sets:3, note:'Rodilla ~90°. 3×12–15'},
        {id:'pa2', name:'Curl femoral sentada', mode:'load', targetReps:12, sets:3, note:'Baja en 3 s'},
        {id:'pa3', name:'Aductores en máquina', mode:'load', targetReps:12, sets:3, note:'Pausa 1 s al cerrar'},
        {id:'pa4', name:'Elevación de talones', mode:'load', targetReps:12, sets:3, note:'Lenta, pausa abajo y arriba'}
      ]
    },
    piernas_b: {
      id:'piernas_b', kind:'gym', title:'Piernas B · Glúteos y multífidos',
      hint:'Moderado · sin sentadilla ni step-up ni extensión de cuádriceps con peso',
      exercises:[
        {id:'pb1', name:'Hiperextensión (silla romana)', mode:'load', targetReps:12, sets:3, note:'Hasta línea recta, pausa 2 s'},
        {id:'pb2', name:'Hip thrust (máquina o barra)', mode:'load', targetReps:10, sets:4, note:'4×8–12 · rodilla 90°'},
        {id:'pb3', name:'Peso muerto rumano ligero', mode:'load', targetReps:10, sets:3, note:'Espalda neutra'},
        {id:'pb4', name:'Pull-through polea baja', mode:'load', targetReps:12, sets:3, note:'Bisagra de cadera'},
        {id:'pb5', name:'Patada de glúteo (recorrido corto)', mode:'load', targetReps:12, sets:2, note:'Antes del ángulo que duele'},
        {id:'pb6', name:'Abductores en máquina', mode:'load', targetReps:15, sets:3, note:'Series largas, sin impulso'}
      ]
    },
    push: {
      id:'push', kind:'gym', title:'Push (tren superior)',
      hint:'Carga normal de torso · última sesión y PR a la vista',
      exercises:[
        {id:'pu1', name:'Press banca o mancuernas', mode:'load', targetReps:8, sets:4, note:''},
        {id:'pu2', name:'Press hombro', mode:'load', targetReps:10, sets:3, note:''},
        {id:'pu3', name:'Fondos o press cerrado', mode:'load', targetReps:10, sets:3, note:''},
        {id:'pu4', name:'Elevaciones laterales', mode:'load', targetReps:12, sets:3, note:''},
        {id:'pu5', name:'Extensión de tríceps', mode:'load', targetReps:12, sets:3, note:''},
        {id:'pu6', name:'Aperturas o cruz de poleas', mode:'load', targetReps:12, sets:3, note:''}
      ]
    },
    pull: {
      id:'pull', kind:'gym', title:'Pull (tren superior)',
      hint:'Carga normal de torso · última sesión y PR a la vista',
      exercises:[
        {id:'pl1', name:'Jalón al pecho o dominadas asistidas', mode:'load', targetReps:8, sets:4, note:''},
        {id:'pl2', name:'Remo (barra, mancuerna o máquina)', mode:'load', targetReps:10, sets:4, note:''},
        {id:'pl3', name:'Face pull', mode:'load', targetReps:12, sets:3, note:''},
        {id:'pl4', name:'Curl bíceps', mode:'load', targetReps:10, sets:3, note:''},
        {id:'pl5', name:'Pull-over o extensión de espalda', mode:'load', targetReps:12, sets:3, note:''},
        {id:'pl6', name:'Deltoides posterior / pájaros', mode:'load', targetReps:12, sets:3, note:''}
      ]
    }
  };

  let store = { sessions: [], updatedAt: null };
  let db = null;
  let active = null;
  let timer = { exId:null, left:0, total:0, iv:null };

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
  } catch(e){ console.warn(e); }

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

  function histLine(exId){
    const logs=lastLogsForExercise(exId, 2);
    if(!logs.length) return '<div class="hist muted">Sin historial aún</div>';
    return '<div class="hist">'+logs.map(l=>{
      const top=l.sets.map(s=>{
        if(s.weight) return s.weight+'×'+(s.reps||'?');
        if(s.sec) return s.sec+'s';
        return (s.reps||'?')+' reps';
      }).join(', ');
      return '<span>'+l.date.slice(5)+': '+top+'</span>';
    }).join(' · ')+'</div>';
  }

  function renderSession(){
    const box=document.getElementById('session-body');
    if(!active||!box) return;
    const t=TEMPLATES[active.templateId];
    let h='<div class="glass pad">';
    h+='<div class="row-between"><div><b>'+active.title+'</b><div class="muted">'+active.date+' · '+(t&&t.hint||'')+'</div></div>';
    h+='<button type="button" class="btn btn-ghost" onclick="cancelSession()">✕</button></div></div>';

    active.exercises.forEach((ex,ei)=>{
      h+='<div class="glass pad ex-card'+(ex.skipped?' skipped':'')+'">';
      h+='<div class="row-between"><b>'+ex.name+(ex.optional?' <span class="muted">(opcional)</span>':'')+'</b>';
      h+='<label class="chk"><input type="checkbox" '+(ex.skipped?'checked':'')+' onchange="toggleSkip('+ei+')"> Saltar</label></div>';
      if(ex.planNote) h+='<div class="muted plan-note">'+ex.planNote+'</div>';
      h+=histLine(ex.id);
      const best=bestLoadPhase(ex.id);
      if(best) h+='<div class="hist muted">Mejor fase: '+best.weight+' × '+best.reps+' ('+best.date.slice(5)+')</div>';

      if(!ex.skipped){
        const defSec = ex.holdSec || ex.targetSec || 30;
        h+='<div class="timer-row"><button type="button" class="btn btn-pink" onclick="startTimer(\''+ex.id+'\','+defSec+')">⏱ Timer '+defSec+'s</button>';
        h+='<input type="number" class="sec-in" id="tim-'+ei+'" value="'+defSec+'" min="5" max="600">';
        h+='<button type="button" class="btn btn-ghost" onclick="startTimer(\''+ex.id+'\', document.getElementById(\'tim-'+ei+'\').value)">▶</button></div>';

        ex.sets.forEach((set,si)=>{
          h+='<div class="set-row">';
          h+='<span class="set-n">S'+(si+1)+'</span>';
          if(ex.mode==='load'){
            h+='<input type="number" step="0.5" placeholder="lb/kg" value="'+(set.weight||'')+'" onchange="updSet('+ei+','+si+',\'weight\',this.value)">';
            h+='<input type="number" placeholder="reps" value="'+(set.reps||'')+'" onchange="updSet('+ei+','+si+',\'reps\',this.value)">';
          } else if(ex.mode==='time'||ex.mode==='iso'){
            h+='<input type="number" placeholder="seg" value="'+(set.sec||'')+'" onchange="updSet('+ei+','+si+',\'sec\',this.value)">';
            if(ex.mode==='iso') h+='<input type="number" placeholder="reps" value="'+(set.reps||'')+'" onchange="updSet('+ei+','+si+',\'reps\',this.value)">';
          } else {
            h+='<input type="number" placeholder="reps" value="'+(set.reps||'')+'" onchange="updSet('+ei+','+si+',\'reps\',this.value)">';
          }
          h+='<input type="number" step="0.5" min="0" max="10" placeholder="RPE" value="'+(set.rpe||'')+'" onchange="updSet('+ei+','+si+',\'rpe\',this.value)" class="rpe">';
          h+='</div>';
        });
        h+='<button type="button" class="btn btn-ghost btn-sm" onclick="addSet('+ei+')">+ Serie</button>';
        h+='<input class="note-in" placeholder="Nota del ejercicio" value="'+(ex.note||'').replace(/"/g,'"')+'" onchange="updExNote('+ei+',this.value)">';
      }
      h+='</div>';
    });

    h+='<div class="glass pad"><div class="sec" style="margin-top:0">Cierre de sesión · reloj</div>';
    h+='<div class="grid2">';
    h+='<div><label>Duración (min)</label><input type="number" id="c-dur" value="'+(active.durationMin||'')+'"></div>';
    h+='<div><label>Calorías</label><input type="number" id="c-kcal" value="'+(active.kcal||'')+'"></div>';
    h+='<div><label>FC promedio</label><input type="number" id="c-hr" value="'+(active.hrAvg||'')+'"></div>';
    h+='<div><label>FC máx</label><input type="number" id="c-hrmax" value="'+(active.hrMax||'')+'"></div>';
    h+='<div><label>Esfuerzo sesión (1–10)</label><input type="number" min="1" max="10" id="c-eff" value="'+(active.effort||'')+'"></div>';
    h+='</div>';
    if(active.kind==='rehab'||active.kind==='movilidad'||active.kind==='calentamiento'){
      h+='<div class="grid2" style="margin-top:.5rem">';
      h+='<div><label>Dolor (1–10)</label><input type="number" min="0" max="10" id="c-pain" value="'+(active.pain||'')+'"></div>';
      h+='<div><label>Dónde</label><select id="c-where"><option value="">—</option>';
      ['nada','rodilla','lumbar','ambos','otro'].forEach(w=>{
        h+='<option value="'+w+'"'+(active.painWhere===w?' selected':'')+'>'+w+'</option>';
      });
      h+='</select></div>';
      h+='<div style="grid-column:1/-1"><label>Cuándo duele</label><select id="c-when"><option value="">—</option>';
      [['no','No dolió'],['inicio','Al inicio'],['mitad','A mitad'],['final','Al final'],['despues','Después / al día siguiente']].forEach(function(p){
        h+='<option value="'+p[0]+'"'+(active.painWhen===p[0]?' selected':'')+'>'+p[1]+'</option>';
      });
      h+='</select></div></div>';
    }
    h+='<label style="margin-top:.5rem">Nota de la sesión</label><textarea id="c-note" rows="2">'+(active.sessionNote||'')+'</textarea>';
    h+='<button type="button" class="btn btn-pink" style="width:100%;margin-top:.75rem" onclick="saveActiveSession()">💾 Guardar sesión</button>';
    h+='</div>';
    box.innerHTML=h;
  }

  window.toggleSkip = function(ei){ active.exercises[ei].skipped=!active.exercises[ei].skipped; renderSession(); };
  window.updSet = function(ei,si,f,v){ active.exercises[ei].sets[si][f]=v; };
  window.updExNote = function(ei,v){ active.exercises[ei].note=v; };
  window.addSet = function(ei){
    active.exercises[ei].sets.push({ reps:'', weight:'', sec:'', rpe:'' });
    renderSession();
  };

  window.saveActiveSession = function(){
    if(!active) return;
    active.durationMin = document.getElementById('c-dur').value;
    active.kcal = document.getElementById('c-kcal').value;
    active.hrAvg = document.getElementById('c-hr').value;
    active.hrMax = document.getElementById('c-hrmax').value;
    active.effort = document.getElementById('c-eff').value;
    active.sessionNote = document.getElementById('c-note').value;
    const painEl=document.getElementById('c-pain');
    if(painEl){
      active.pain=painEl.value;
      active.painWhere=document.getElementById('c-where').value;
      active.painWhen=document.getElementById('c-when').value;
    }
    active.completed=true;
    active.updatedAt=Date.now();
    active.exercises.forEach(ex=>{
      (ex.sets||[]).forEach(set=>{
        const pr=isPR(ex.id, set.weight, set.reps);
        if(pr) set.pr=pr;
      });
    });
    const idx=store.sessions.findIndex(s=>s.id===active.id);
    if(idx>=0) store.sessions[idx]=active; else store.sessions.unshift(active);
    store.sessions.sort((a,b)=>(b.date||'').localeCompare(a.date||''));
    saveLocal();
    saveCloud();
    stopTimer();
    active=null;
    alert('Sesión guardada ✓');
    showTab('history');
    renderHistory();
  };

  function renderHistory(){
    const box=document.getElementById('history-body');
    if(!box) return;
    if(!store.sessions.length){ box.innerHTML='<p class="muted">Aún no hay sesiones.</p>'; return; }
    let h='';
    store.sessions.slice(0,40).forEach(s=>{
      h+='<div class="glass pad hist-card">';
      h+='<div class="row-between"><b>'+s.title+'</b><span class="muted">'+s.date+'</span></div>';
      const bits=[];
      if(s.durationMin) bits.push(s.durationMin+' min');
      if(s.kcal) bits.push(s.kcal+' kcal');
      if(s.effort) bits.push('Esf. '+s.effort);
      if(s.pain!==''&&s.pain!=null) bits.push('Dolor '+s.pain+'/10');
      if(bits.length) h+='<div class="muted">'+bits.join(' · ')+'</div>';
      if(s.sessionNote) h+='<div class="muted">'+s.sessionNote+'</div>';
      h+='<button type="button" class="btn btn-ghost btn-sm" onclick="viewSession(\''+s.id+'\')">Ver detalle</button>';
      h+='</div>';
    });
    box.innerHTML=h;
  }

  window.viewSession = function(id){
    const s=store.sessions.find(x=>x.id===id);
    if(!s) return;
    let t=s.title+' · '+s.date+'\n\n';
    (s.exercises||[]).forEach(ex=>{
      if(ex.skipped){ t+='— '+ex.name+' (saltado)\n'; return; }
      t+=ex.name+'\n';
      (ex.sets||[]).forEach((set,i)=>{
        let line='  S'+(i+1)+': ';
        if(set.weight) line+=set.weight+' × '+(set.reps||'?');
        else if(set.sec) line+=set.sec+'s'+(set.reps?(' × '+set.reps):'');
        else line+=(set.reps||'?')+' reps';
        if(set.rpe) line+=' · RPE '+set.rpe;
        if(set.pr) line+=' · '+set.pr;
        t+=line+'\n';
      });
      if(ex.note) t+='  Nota: '+ex.note+'\n';
    });
    if(s.pain) t+='\nDolor: '+s.pain+'/10 · '+(s.painWhere||'')+' · '+(s.painWhen||'');
    if(s.sessionNote) t+='\nSesión: '+s.sessionNote;
    alert(t);
  };

  function renderFisio(){
    const box=document.getElementById('fisio-body');
    if(!box) return;
    const from=document.getElementById('fisio-from').value;
    const to=document.getElementById('fisio-to').value;
    const rehab=store.sessions.filter(s=>{
      if(s.kind!=='rehab'&&s.kind!=='movilidad') return false;
      if(from && s.date<from) return false;
      if(to && s.date>to) return false;
      return true;
    });
    let text='Reporte rehab · Mary\nPeríodo: '+(from||'…')+' → '+(to||'…')+'\n\n';
    if(!rehab.length) text+='Sin sesiones de rehab en el rango.\n';
    rehab.forEach(s=>{
      text+=s.date+' · '+s.title+'\n';
      if(s.pain!==''&&s.pain!=null) text+='  Dolor: '+s.pain+'/10 · '+(s.painWhere||'—')+' · cuándo: '+(s.painWhen||'—')+'\n';
      (s.exercises||[]).forEach(ex=>{
        if(ex.skipped){ text+='  · '+ex.name+': saltado\n'; return; }
        const sets=(ex.sets||[]).filter(x=>x.reps||x.sec).map(x=>{
          if(x.sec&&x.reps) return x.reps+'×'+x.sec+'s';
          if(x.sec) return x.sec+'s';
          return (x.reps||'?')+' reps';
        }).join(', ');
        text+='  · '+ex.name+': '+(sets||'—');
        if(ex.note) text+=' ('+ex.note+')';
        text+='\n';
      });
      if(s.sessionNote) text+='  Nota: '+s.sessionNote+'\n';
      text+='\n';
    });
    box.innerHTML='<pre class="report">'+text.replace(/</g,'<')+'</pre><button type="button" class="btn btn-pink" onclick="copyFisio()">📋 Copiar para la fisio</button>';
    window._fisioText=text;
  }
  window.copyFisio = function(){
    const t=window._fisioText||'';
    if(navigator.clipboard&&navigator.clipboard.writeText) navigator.clipboard.writeText(t).then(()=>alert('Copiado ✓')).catch(()=>prompt('Copia:',t));
    else prompt('Copia:',t);
  };
  window.refreshFisio = function(){ renderFisio(); };

  function setDefaultFisioRange(){
    const to=todayISO();
    const d=new Date(); d.setDate(d.getDate()-13);
    const from=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    const a=document.getElementById('fisio-from'), b=document.getElementById('fisio-to');
    if(a) a.value=from; if(b) b.value=to;
  }

  loadLocal();
  setDefaultFisioRange();
  renderHome();
  showTab('home');
  loadCloud().then(function(){ renderHome(); });
})();
