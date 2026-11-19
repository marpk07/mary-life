  function histLine(exId){
    const logs=lastLogsForExercise(exId, 2);
    if(!logs.length) return '<div class="hist muted">Sin historial aún</div>';
    return '<div class="hist">'+logs.map(l=>{
      const top=l.sets.map(s=>{
        var u=s.unit==='kg'?'kg':(s.unit==='bw'?'PC':'lb');
        if(s.unit==='bw'||s.weight){
          var wpart = s.unit==='bw' ? 'PC' : ((s.weight||'?')+u);
          var extra = s.reps ? ('×'+(s.reps||'?')) : '';
          if(s.sec) extra += (extra?' ':'')+s.sec+'s';
          return wpart+extra;
        }
        if(s.sec) return s.sec+'s'+(s.reps?(' ×'+s.reps):'');
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
          if(!set.unit) set.unit='lb';
          h+='<div class="set-row" style="flex-wrap:wrap">';
          h+='<span class="set-n">S'+(si+1)+'</span>';
          if(ex.mode==='load' || ex.mode==='reps'){
            var u=set.unit||'lb';
            if(u!=='bw') h+='<input type="number" step="0.5" placeholder="Peso" value="'+(set.weight||'')+'" onchange="updSet('+ei+','+si+',\'weight\',this.value)" style="min-width:4rem;flex:1">';
            h+='<select onchange="updSet('+ei+','+si+',\'unit\',this.value)" style="width:auto;min-width:4.2rem;flex:0">';
            h+='<option value="lb"'+(u==='lb'?' selected':'')+'>Lb</option>';
            h+='<option value="kg"'+(u==='kg'?' selected':'')+'>Kg</option>';
            h+='<option value="bw"'+(u==='bw'?' selected':'')+'>Peso libre</option>';
            h+='</select>';
            h+='<input type="number" placeholder="Reps" value="'+(set.reps||'')+'" onchange="updSet('+ei+','+si+',\'reps\',this.value)" style="min-width:3.5rem;flex:1">';
            h+='<input type="number" placeholder="Seg" value="'+(set.sec||'')+'" onchange="updSet('+ei+','+si+',\'sec\',this.value)" style="min-width:3.5rem;flex:1" title="Opcional: segundos">';
          } else if(ex.mode==='time'||ex.mode==='iso'){
            h+='<input type="number" placeholder="Seg" value="'+(set.sec||'')+'" onchange="updSet('+ei+','+si+',\'sec\',this.value)" style="min-width:4rem;flex:1">';
            h+='<input type="number" placeholder="Reps" value="'+(set.reps||'')+'" onchange="updSet('+ei+','+si+',\'reps\',this.value)" style="min-width:3.5rem;flex:1">';
            var u2=set.unit||'lb';
            if(u2!=='bw') h+='<input type="number" step="0.5" placeholder="Peso" value="'+(set.weight||'')+'" onchange="updSet('+ei+','+si+',\'weight\',this.value)" style="min-width:3.5rem;flex:1">';
            h+='<select onchange="updSet('+ei+','+si+',\'unit\',this.value)" style="width:auto;min-width:4.2rem;flex:0">';
            h+='<option value="lb"'+(u2==='lb'?' selected':'')+'>Lb</option>';
            h+='<option value="kg"'+(u2==='kg'?' selected':'')+'>Kg</option>';
            h+='<option value="bw"'+(u2==='bw'?' selected':'')+'>Peso libre</option>';
            h+='</select>';
          } else {
            h+='<input type="number" placeholder="Reps" value="'+(set.reps||'')+'" onchange="updSet('+ei+','+si+',\'reps\',this.value)">';
            h+='<input type="number" placeholder="Seg" value="'+(set.sec||'')+'" onchange="updSet('+ei+','+si+',\'sec\',this.value)">';
          }
          h+='<input type="number" step="0.5" min="0" max="10" placeholder="RPE" value="'+(set.rpe||'')+'" onchange="updSet('+ei+','+si+',\'rpe\',this.value)" style="min-width:3rem;flex:0.7">';
          h+='<button type="button" class="btn btn-ghost btn-sm" style="flex:0 0 auto;color:#b0405a" title="Quitar serie" onclick="removeSet('+ei+','+si+')">✕</button>';
          h+='</div>';
        });
        h+='<button type="button" class="btn btn-ghost btn-sm" onclick="addSet('+ei+')">+ Serie</button>';
        h+='<input class="note-in" placeholder="Nota del ejercicio" value="'+(ex.note||'').replace(/"/g,'&quot;')+'" onchange="updExNote('+ei+',this.value)">';
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
    h+='<button type="button" class="btn btn-pink" style="width:100%;margin-top:.75rem" onclick="saveActiveSession()">💾 Guardar / actualizar sesión</button>';
    h+='</div>';
    box.innerHTML=h;
  }

  window.toggleSkip = function(ei){ active.exercises[ei].skipped=!active.exercises[ei].skipped; renderSession(); };
  window.updSet = function(ei,si,f,v){ active.exercises[ei].sets[si][f]=v; if(f==='unit') renderSession(); };
  window.updExNote = function(ei,v){ active.exercises[ei].note=v; };
  window.addSet = function(ei){
    var ss=active.exercises[ei].sets, last=ss[ss.length-1];
    ss.push({ reps:'', weight:'', unit:(last&&last.unit)||'lb', sec:'', rpe:'' });
    renderSession();
  };
  window.removeSet = function(ei,si){
    var ex=active.exercises[ei];
    if(ex.sets.length<=1){ alert('Cada ejercicio necesita al menos 1 serie. Si no lo hiciste, marca "Saltar".'); return; }
    var s=ex.sets[si];
    if((s.reps||s.weight||s.sec||s.rpe) && !confirm('¿Quitar la serie '+(si+1)+'? Tiene datos escritos.')) return;
    ex.sets.splice(si,1); renderSession();
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
    const fromEl=document.getElementById('hist-from');
    const toEl=document.getElementById('hist-to');
    const from=(fromEl&&fromEl.value)||'';
    const to=(toEl&&toEl.value)||'';
    let list=(store.sessions||[]).slice();
    if(from) list=list.filter(s=>s.date>=from);
    if(to) list=list.filter(s=>s.date<=to);
    if(!list.length){
      box.innerHTML='<p class="muted">'+(store.sessions.length?'No hay sesiones en ese rango.':'Aún no hay sesiones.')+'</p>';
      return;
    }
    let h='';
    list.slice(0,60).forEach(s=>{
      h+='<div class="glass pad hist-card">';
      h+='<div class="row-between"><b>'+s.title+'</b><span class="muted">'+s.date+'</span></div>';
      const bits=[];
      if(s.durationMin) bits.push(s.durationMin+' min');
      if(s.kcal) bits.push(s.kcal+' kcal');
      if(s.effort) bits.push('Esf. '+s.effort);
      if(s.pain!==''&&s.pain!=null) bits.push('Dolor '+s.pain+'/10');
      if(bits.length) h+='<div class="muted">'+bits.join(' · ')+'</div>';
      if(s.sessionNote) h+='<div class="muted">'+s.sessionNote+'</div>';
      h+='<div class="timer-row" style="margin-top:.4rem;gap:.35rem;flex-wrap:wrap">';
      h+='<button type="button" class="btn btn-pink btn-sm" onclick="editSession(\''+s.id+'\')">✏️ Editar</button>';
      h+='<button type="button" class="btn btn-ghost btn-sm" onclick="viewSession(\''+s.id+'\')">Ver</button>';
      h+='<button type="button" class="btn btn-ghost btn-sm" onclick="deleteSession(\''+s.id+'\')">🗑 Borrar</button>';
      h+='</div></div>';
    });
    box.innerHTML=h;
  }
  window.refreshHistory = function(){ renderHistory(); };

  window.editSession = function(id){
    const s=store.sessions.find(x=>x.id===id);
    if(!s){ alert('Sesión no encontrada'); return; }
    active=JSON.parse(JSON.stringify(s));
    (active.exercises||[]).forEach(ex=>{
      (ex.sets||[]).forEach(set=>{ if(!set.unit) set.unit='lb'; });
    });
    stopTimer();
    showTab('session');
    renderSession();
  };

  window.deleteSession = function(id){
    if(!confirm('¿Borrar esta sesión? No se puede deshacer.')) return;
    store.sessions=(store.sessions||[]).filter(s=>s.id!==id);
    saveLocal();
    saveCloud();
    if(active&&active.id===id){ active=null; showTab('history'); }
    renderHistory();
  };

  window.viewSession = function(id){
    const s=store.sessions.find(x=>x.id===id);
    if(!s) return;
    let t=s.title+' · '+s.date+'\n\n';
    (s.exercises||[]).forEach(ex=>{
      if(ex.skipped){ t+='— '+ex.name+' (saltado)\n'; return; }
      t+=ex.name+'\n';
      (ex.sets||[]).forEach((set,i)=>{
        let line='  S'+(i+1)+': ';
        if(set.unit==='bw') line+='PC'+(set.reps?(' × '+set.reps):'');
        else if(set.weight) line+=set.weight+(set.unit==='kg'?'kg':'lb')+' × '+(set.reps||'?');
        else if(set.sec) line+=set.sec+'s'+(set.reps?(' × '+set.reps):'');
        else line+=(set.reps||'?')+' reps';
        if(set.sec && set.weight) line+=' · '+set.sec+'s';
        if(set.rpe) line+=' · RPE '+set.rpe;
        if(set.pr) line+=' · '+set.pr;
        t+=line+'\n';
      });
      if(ex.note) t+='  Nota: '+ex.note+'\n';
    });
    if(s.pain) t+='\nDolor: '+s.pain+'/10 · '+(s.painWhere||'')+' · '+(s.painWhen||'');
    if(s.sessionNote) t+='\nSesión: '+s.sessionNote;
    if(s.durationMin||s.kcal||s.hrAvg) t+='\nReloj: '+(s.durationMin||'—')+' min · '+(s.kcal||'—')+' kcal · FC '+(s.hrAvg||'—');
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
        const sets=(ex.sets||[]).filter(x=>x.reps||x.sec||x.weight).map(x=>{
          if(x.unit==='bw') return 'PC'+(x.reps?('×'+x.reps):'')+(x.sec?(' '+x.sec+'s'):'');
          if(x.weight) return x.weight+(x.unit==='kg'?'kg':'lb')+(x.reps?('×'+x.reps):'')+(x.sec?(' '+x.sec+'s'):'');
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
    box.innerHTML='<pre class="report">'+text.replace(/</g,'&lt;')+'</pre><button type="button" class="btn btn-pink" onclick="copyFisio()">📋 Copiar para la fisio</button>';
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

