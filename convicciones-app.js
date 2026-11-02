(function(){
  const firebaseConfig={apiKey:"AIzaSyDummy-ReplaceIfNeeded",authDomain:"mapkr.firebaseapp.com",projectId:"mapkr",storageBucket:"mapkr.appspot.com",messagingSenderId:"123",appId:"1:123:web:abc"};
  let db=null;
  try{if(!firebase.apps.length)firebase.initializeApp(firebaseConfig);db=firebase.firestore();}catch(e){console.warn('Firebase init',e);}
  const LS_KEY='mary_convicciones_v1',COL='mapkr',DOC='convicciones_data';
  const PILARES=[
    {id:1,titulo:"Dios existe",pregunta:"¿Existe Dios? ¿Cómo lo sé?",tipo:"doctrina"},
    {id:2,titulo:"La Biblia es la Palabra de Dios",pregunta:"¿Es la Biblia realmente la Palabra de Dios? ¿Por qué confiar en ella?",tipo:"doctrina"},
    {id:3,titulo:"Jesús es Dios y es el único camino",pregunta:"¿Quién es Jesús realmente? ¿Es el único camino a Dios?",tipo:"doctrina"},
    {id:4,titulo:"Historia de la salvación (Antiguo Testamento)",pregunta:"¿Cuál es el hilo de la historia de Dios con la humanidad en el AT?",tipo:"historia"},
    {id:5,titulo:"Historia de la salvación (Nuevo Testamento)",pregunta:"¿Cómo se cumple y se completa la historia de salvación en el NT?",tipo:"historia"},
    {id:6,titulo:"El pecado y la naturaleza humana",pregunta:"¿Qué es el pecado? ¿Cuál es el estado del ser humano sin Cristo?",tipo:"doctrina"},
    {id:7,titulo:"La salvación por gracia mediante la fe",pregunta:"¿Cómo se salva una persona? ¿Qué papel tiene la gracia y la fe?",tipo:"doctrina"},
    {id:8,titulo:"El Espíritu Santo",pregunta:"¿Quién es el Espíritu Santo y qué hace en la vida del creyente?",tipo:"doctrina"},
    {id:9,titulo:"La Trinidad",pregunta:"¿Cómo puede Dios ser uno y tres al mismo tiempo?",tipo:"doctrina"},
    {id:10,titulo:"La iglesia",pregunta:"¿Qué es la iglesia y cuál es mi lugar en ella?",tipo:"doctrina"},
    {id:11,titulo:"Los sacramentos / ordenanzas",pregunta:"¿Qué son el bautismo y la cena del Señor? ¿Por qué importan?",tipo:"doctrina"},
    {id:12,titulo:"La oración",pregunta:"¿Por qué y cómo debo orar?",tipo:"practica"},
    {id:13,titulo:"La voluntad de Dios",pregunta:"¿Cómo conozco y sigo la voluntad de Dios para mi vida?",tipo:"practica"},
    {id:14,titulo:"El sufrimiento y el mal",pregunta:"Si Dios es bueno y poderoso, ¿por qué hay sufrimiento y mal?",tipo:"doctrina"},
    {id:15,titulo:"El fin de los tiempos y la esperanza eterna",pregunta:"¿Qué enseña la Biblia sobre el futuro, el juicio y la eternidad?",tipo:"doctrina"},
    {id:16,titulo:"La identidad en Cristo",pregunta:"¿Quién soy yo en Cristo? ¿Cómo define eso mi valor y propósito?",tipo:"practica"},
    {id:17,titulo:"El discipulado y la obediencia",pregunta:"¿Qué significa seguir a Jesús día a día?",tipo:"practica"},
    {id:18,titulo:"Plantilla de ficha de convicción",pregunta:"(Plantilla oficial del proyecto — usar para cada pilar)",tipo:"plantilla"},
    {id:19,titulo:"El amor y las relaciones",pregunta:"¿Cómo debo amar a Dios y al prójimo según la Escritura?",tipo:"practica"},
    {id:20,titulo:"El dinero y la mayordomía",pregunta:"¿Qué enseña la Biblia sobre el dinero, la generosidad y la mayordomía?",tipo:"practica"},
    {id:21,titulo:"La misión y el evangelismo",pregunta:"¿Cuál es mi responsabilidad de compartir el evangelio?",tipo:"practica"}
  ];
  let store={fichas:{},activity:[],updatedAt:null};
  let calCursor=new Date();
  let calSelected=null;
  function todayISO(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function recordActivity(pilarId,dateStr){
    if(!store.activity)store.activity=[];
    const d=dateStr||todayISO();
    const p=PILARES.find(x=>x.id===pilarId);
    const titulo=p?p.titulo:('Pilar '+pilarId);
    const exists=store.activity.some(a=>a.date===d&&a.pilarId===pilarId);
    if(!exists)store.activity.push({date:d,pilarId:pilarId,titulo:titulo,ts:Date.now()});
  }
  function activityForDate(dateStr){
    if(!store.activity)return [];
    return store.activity.filter(a=>a.date===dateStr);
  }
  function rebuildActivityFromFichas(){
    if(!store.activity)store.activity=[];
    const seen=new Set(store.activity.map(a=>a.date+'|'+a.pilarId));
    Object.keys(store.fichas||{}).forEach(function(id){
      const f=store.fichas[id];
      if(!f)return;
      const pid=+id;
      const p=PILARES.find(x=>x.id===pid);
      const titulo=p?p.titulo:('Pilar '+id);
      const dates=[];
      if(f.fecha)dates.push(String(f.fecha).slice(0,10));
      if(f.updatedAt){try{const u=new Date(f.updatedAt);if(!isNaN(u))dates.push(u.getFullYear()+'-'+String(u.getMonth()+1).padStart(2,'0')+'-'+String(u.getDate()).padStart(2,'0'));}catch(e){}}
      dates.forEach(function(d){
        if(!d||d.length<8)return;
        const key=d+'|'+pid;
        if(seen.has(key))return;
        seen.add(key);
        store.activity.push({date:d,pilarId:pid,titulo:titulo,ts:0});
      });
    });
  }
  function loadLocal(){try{const raw=localStorage.getItem(LS_KEY);if(raw){const p=JSON.parse(raw);if(p&&typeof p==='object'){store=p;if(!store.activity)store.activity=[];if(!store.fichas)store.fichas={};}}}catch(e){}}
  function saveLocal(){store.updatedAt=Date.now();try{localStorage.setItem(LS_KEY,JSON.stringify(store));}catch(e){}}
  async function loadCloud(){if(!db)return;try{const snap=await db.collection(COL).doc(DOC).get();if(snap.exists){const d=snap.data();if(d&&(!store.updatedAt||(d.updatedAt||0)>store.updatedAt)){store=d;if(!store.activity)store.activity=[];saveLocal();}}}catch(e){console.warn('cloud load',e);}}
  async function saveCloud(){if(!db)return;try{await db.collection(COL).doc(DOC).set({...store,updatedAt:Date.now()},{merge:true});}catch(e){console.warn('cloud save',e);}}
  async function load(){loadLocal();await loadCloud();rebuildActivityFromFichas();renderAll();}
  function save(){saveLocal();saveCloud();renderAll();}
  function estadoOf(f){if(!f)return 'pendiente';if(f.estado)return String(f.estado).toLowerCase();if((f.conviccion&&String(f.conviccion).trim().length>10)||(f.creo&&String(f.creo).trim().length>10))return 'revisado';return 'pendiente';}
  function isDone(id){return estadoOf(store.fichas[id])==='consolidado';}
  function progress(){const n=PILARES.filter(p=>isDone(p.id)).length;return{n,total:PILARES.length};}
  function badgeFor(estado){const e=(estado||'pendiente').toLowerCase();if(e==='consolidado')return{bg:'rgba(52,211,153,0.2)',c:'#34d399',t:'Consolidado'};if(e==='revisado')return{bg:'rgba(96,165,250,0.2)',c:'#60a5fa',t:'Revisado'};if(e==='en estudio'||e==='en_estudio')return{bg:'rgba(251,191,36,0.2)',c:'#fbbf24',t:'En estudio'};return{bg:'rgba(244,114,182,0.15)',c:'#f9a8d4',t:'Pendiente'};}
  function showT(t){document.querySelectorAll('.tab').forEach(b=>b.classList.toggle('active',b.dataset.t===t));var pi=document.getElementById('panel-inicio'),pp=document.getElementById('panel-pilares'),pf=document.getElementById('panel-fichas'),pc=document.getElementById('panel-calendario');if(pi)pi.style.display=t==='inicio'?'':'none';if(pp)pp.style.display=t==='pilares'?'':'none';if(pf)pf.style.display=t==='fichas'?'':'none';if(pc)pc.style.display=t==='calendario'?'':'none';if(t==='calendario')renderCal();}
  window.showT=showT;
  function renderAll(){const{n,total}=progress();if(document.getElementById('panel-calendario')&&document.getElementById('panel-calendario').style.display!=='none')try{renderCal();}catch(e){}document.getElementById('prog-label').textContent=n+' / '+total;document.getElementById('prog-fill').style.width=(n/total*100)+'%';const list=document.getElementById('pilares-list');list.innerHTML=PILARES.map(p=>{const f=store.fichas[p.id]||{};const est=estadoOf(f);const b=badgeFor(est);const done=est==='consolidado';return '<div class="pilar-card '+(done?'done':'')+'" onclick="openFicha('+p.id+')"><div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:flex-start;"><div><div style="font-weight:800;font-size:0.9rem;">'+p.id+'. '+p.titulo+'</div><div style="font-size:0.75rem;color:var(--muted);margin-top:0.25rem;line-height:1.35;">'+p.pregunta+'</div></div><span class="badge" style="background:'+b.bg+';color:'+b.c+';">'+b.t+'</span></div></div>';}).join('');const fl=document.getElementById('fichas-list');const filled=PILARES.filter(p=>store.fichas[p.id]);if(!filled.length){fl.innerHTML='<p style="color:var(--muted);font-size:0.85rem;text-align:center;padding:1.5rem;">Aún no hay fichas guardadas. Abre un pilar para empezar.</p>';}else{fl.innerHTML=filled.map(p=>{const f=store.fichas[p.id]||{};const est=estadoOf(f);const b=badgeFor(est);const preview=(f.sintesis||f.resumen||f.aprendizaje||f.creo||f.conviccion||'').slice(0,120);return '<div class="pilar-card" onclick="openFicha('+p.id+')"><div style="display:flex;justify-content:space-between;gap:0.5rem;align-items:flex-start;"><div style="font-weight:800;">'+p.id+'. '+p.titulo+'</div><span class="badge" style="background:'+b.bg+';color:'+b.c+';">'+b.t+'</span></div><div style="font-size:0.75rem;color:var(--muted);margin-top:0.3rem;">'+preview+(preview.length>=120?'…':'')+'</div><div style="margin-top:0.4rem;font-size:0.7rem;color:#c4b5fd;">Certeza: '+(f.certeza||'—')+' · '+(f.fecha||'')+'</div></div>';}).join('');}}
  function val(f,key,legacyKeys){if(f[key]!=null&&f[key]!=='')return f[key];if(legacyKeys){for(var i=0;i<legacyKeys.length;i++){if(f[legacyKeys[i]]!=null&&f[legacyKeys[i]]!=='')return f[legacyKeys[i]];}}return '';}
  function openFicha(id){const p=PILARES.find(x=>x.id===id);if(!p)return;const f=store.fichas[id]||{};const isStory=p.tipo==='historia';const est=estadoOf(f);const certeza=val(f,'certeza')||'';document.getElementById('modal-title').textContent='Pilar '+id+': '+p.titulo;document.getElementById('modal-body').innerHTML='<div style="margin-bottom:0.75rem;font-size:0.8rem;color:var(--muted);line-height:1.4;"><b>Pregunta guía del pilar:</b> '+p.pregunta+'</div>'+
    '<div class="sec-title">A. Identificación</div><div style="display:grid;gap:0.65rem;">'+'<div><label>Tema</label><input id="f-tema" value="'+esc(val(f,'tema')||p.titulo)+'"></div>'+'<div><label>Pregunta central</label><input id="f-pregunta" value="'+esc(val(f,'pregunta')||p.pregunta)+'"><div class="hint">Pregunta propia de este pilar (no genérica).</div></div>'+'<div><label>Fecha de estudio</label><input id="f-fecha" type="date" value="'+esc(val(f,'fecha'))+'"></div></div>'+
    '<div class="sec-title">B. Fundamento bíblico</div><div style="display:grid;gap:0.65rem;">'+'<div><label>Pasajes bíblicos principales</label><textarea id="f-biblia_principal">'+esc(val(f,'biblia_principal',['biblia']))+'</textarea></div>'+'<div><label>Pasajes bíblicos complementarios</label><textarea id="f-biblia_comp">'+esc(val(f,'biblia_comp'))+'</textarea></div>'+'<div><label>Contexto bíblico e histórico</label><textarea id="f-contexto">'+esc(val(f,'contexto'))+'</textarea></div>'+'<div><label>Palabras o conceptos importantes</label><textarea id="f-conceptos">'+esc(val(f,'conceptos'))+'</textarea></div></div>'+
    '<div class="sec-title">C. Comprensión</div><div style="display:grid;gap:0.65rem;">'+'<div><label>¿Qué dice el texto?</label><textarea id="f-texto_dice">'+esc(val(f,'texto_dice',['interp']))+'</textarea></div>'+'<div><label>¿Qué significa en su contexto?</label><textarea id="f-significa">'+esc(val(f,'significa'))+'</textarea></div>'+'<div><label>¿Qué enseñanza revela sobre Dios, Jesús o la humanidad?</label><textarea id="f-ensenanza">'+esc(val(f,'ensenanza'))+'</textarea></div>'+'<div><label>¿Qué relación tiene con otros pasajes bíblicos?</label><textarea id="f-relacion">'+esc(val(f,'relacion'))+'</textarea></div>'+'<div class="story-box '+(isStory?'show':'')+'"><div style="font-size:0.72rem;font-weight:800;color:#c4b5fd;margin-bottom:0.5rem;">Campos de historia (pilares 4 y 5)</div><div style="display:grid;gap:0.65rem;">'+'<div><label>Personajes / eventos clave</label><textarea id="f-personajes">'+esc(val(f,'personajes'))+'</textarea></div>'+'<div><label>Arco narrativo (problema → promesa → cumplimiento)</label><textarea id="f-arco">'+esc(val(f,'arco'))+'</textarea></div>'+'<div><label>Cómo apunta a Cristo</label><textarea id="f-cristo">'+esc(val(f,'cristo'))+'</textarea></div></div></div></div>'+
    '<div class="sec-title">D. Análisis y examen</div><div style="display:grid;gap:0.65rem;">'+'<div><label>¿Cuáles son las razones o evidencias que respaldan esta enseñanza?</label><textarea id="f-razones">'+esc(val(f,'razones',['analisis']))+'</textarea></div>'+'<div><label>¿Qué objeciones o preguntas pueden surgir?</label><textarea id="f-objeciones">'+esc(val(f,'objeciones'))+'</textarea></div>'+'<div><label>¿Cómo puedo responderlas bíblicamente?</label><textarea id="f-respuestas">'+esc(val(f,'respuestas'))+'</textarea></div>'+'<div><label>¿Qué dudas todavía tengo?</label><textarea id="f-dudas">'+esc(val(f,'dudas'))+'</textarea></div></div>'+
    '<div class="sec-title">E. Convicción personal</div><div style="display:grid;gap:0.65rem;">'+'<div><label>¿Qué creo sobre este tema?</label><textarea id="f-creo">'+esc(val(f,'creo',['conviccion']))+'</textarea></div>'+'<div><label>¿Por qué lo creo?</label><textarea id="f-porque">'+esc(val(f,'porque'))+'</textarea></div>'+'<div><label>¿Qué fundamento bíblico sostiene mi convicción?</label><textarea id="f-fundamento">'+esc(val(f,'fundamento'))+'</textarea></div>'+'<div><label>Nivel de certeza (1–5)</label><select id="f-certeza"><option value="">— Elegir —</option>'+[1,2,3,4,5].map(function(n){return '<option value="'+n+'" '+(String(certeza)===String(n)?'selected':'')+'>'+n+(n===1?' · muy débil':n===5?' · firme':'')+'</option>';}).join('')+(certeza&&!['1','2','3','4','5'].includes(String(certeza))?'<option value="'+esc(certeza)+'" selected>'+esc(certeza)+' (anterior)</option>':'')+'</select></div>'+'<div><label>¿Qué necesito seguir investigando?</label><textarea id="f-investigar">'+esc(val(f,'investigar'))+'</textarea></div></div>'+
    '<div class="sec-title">F. Transformación y aplicación</div><div style="display:grid;gap:0.65rem;">'+'<div><label>¿Qué cambia en mi manera de pensar?</label><textarea id="f-pensar">'+esc(val(f,'pensar'))+'</textarea></div>'+'<div><label>¿Cómo debe influir en mis decisiones y conducta?</label><textarea id="f-conducta">'+esc(val(f,'conducta',['aplicacion']))+'</textarea></div>'+'<div><label>¿Qué debo comenzar, cambiar o dejar de hacer?</label><textarea id="f-cambiar">'+esc(val(f,'cambiar'))+'</textarea></div>'+'<div><label>¿Cuál será mi acción concreta?</label><textarea id="f-accion">'+esc(val(f,'accion'))+'</textarea></div></div>'+
    '<div class="sec-title">G. Cierre y seguimiento</div><div style="display:grid;gap:0.65rem;padding-bottom:0.5rem;">'+'<div><label>Síntesis y principal aprendizaje</label><textarea id="f-sintesis">'+esc(val(f,'sintesis',['resumen','aprendizaje']))+'</textarea><div class="hint">Resume el pilar y lo más importante que aprendiste, en tus palabras.</div></div>'+'<div><label>Próximo paso</label><input id="f-proximo" value="'+esc(val(f,'proximo'))+'" placeholder="Qué falta investigar, revisar o estudiar después"><div class="hint">Indica qué queda por investigar, revisar o estudiar.</div></div>'+'<div><label>Estado del pilar</label><select id="f-estado">'+['pendiente','en estudio','revisado','consolidado'].map(function(s){return '<option value="'+s+'" '+(est===s?'selected':'')+'>'+s.charAt(0).toUpperCase()+s.slice(1)+'</option>';}).join('')+'</select></div></div>';
    document.getElementById('btn-save-ficha').onclick=function(){saveFicha(id);};
    document.getElementById('btn-copy-ficha').onclick=function(){copyFicha(id);};
    document.getElementById('btn-wa-sesion').onclick=function(){copyResumenSesion(id);};
    document.getElementById('btn-wa-final').onclick=function(){copyResumenFinal(id);};
    document.getElementById('modal').style.display='flex';}
  function esc(s){return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');}
  function closeModal(){document.getElementById('modal').style.display='none';}
  window.saveFicha=function(id){const get=(x)=>{const el=document.getElementById(x);return el?(el.value||''):'';};const prev=store.fichas[id]||{};store.fichas[id]=Object.assign({},prev,{tema:get('f-tema'),pregunta:get('f-pregunta'),fecha:get('f-fecha'),biblia_principal:get('f-biblia_principal'),biblia_comp:get('f-biblia_comp'),contexto:get('f-contexto'),conceptos:get('f-conceptos'),texto_dice:get('f-texto_dice'),significa:get('f-significa'),ensenanza:get('f-ensenanza'),relacion:get('f-relacion'),personajes:get('f-personajes'),arco:get('f-arco'),cristo:get('f-cristo'),razones:get('f-razones'),objeciones:get('f-objeciones'),respuestas:get('f-respuestas'),dudas:get('f-dudas'),creo:get('f-creo'),porque:get('f-porque'),fundamento:get('f-fundamento'),certeza:get('f-certeza'),investigar:get('f-investigar'),pensar:get('f-pensar'),conducta:get('f-conducta'),cambiar:get('f-cambiar'),accion:get('f-accion'),sintesis:get('f-sintesis'),resumen:get('f-sintesis'),aprendizaje:get('f-sintesis'),proximo:get('f-proximo'),estado:get('f-estado')||'pendiente',biblia:get('f-biblia_principal')||prev.biblia||'',conviccion:get('f-creo')||prev.conviccion||'',aplicacion:get('f-conducta')||prev.aplicacion||'',analisis:get('f-razones')||prev.analisis||'',interp:get('f-texto_dice')||prev.interp||'',updatedAt:new Date().toISOString()});var fd=get('f-fecha')||todayISO();recordActivity(id,fd);recordActivity(id,todayISO());save();closeModal();};
  window.openFicha=openFicha;window.closeModal=closeModal;
  function copyText(t){if(navigator.clipboard&&navigator.clipboard.writeText){return navigator.clipboard.writeText(t).then(function(){alert('Copiado ✓');}).catch(function(){fallbackCopy(t);});}return fallbackCopy(t);}
  function fallbackCopy(t){const ta=document.createElement('textarea');ta.value=t;document.body.appendChild(ta);ta.select();try{document.execCommand('copy');alert('Copiado ✓');}catch(e){prompt('Copia manualmente:',t);}document.body.removeChild(ta);}
  function hasText(v){return v!=null&&String(v).trim().length>0;}
  function addBlock(lines,title,value){if(!hasText(value))return;lines.push(title);lines.push(String(value).trim());lines.push('');}
  function copyResumenSesion(id){
    const p=PILARES.find(x=>x.id===id);const f=store.fichas[id]||{};
    const lines=[];
    lines.push('📲 *Resumen de sesión*');
    lines.push('');
    lines.push('✝️ *Pilar '+id+': '+(f.tema||p.titulo)+'*');
    if(hasText(f.pregunta||p.pregunta)){lines.push('❓ '+(f.pregunta||p.pregunta));}
    if(hasText(f.fecha)){lines.push('📅 Fecha de estudio: '+f.fecha);}
    lines.push('');
    addBlock(lines,'📖 *Pasajes estudiados*',f.biblia_principal||f.biblia);
    if(hasText(f.biblia_comp))addBlock(lines,'📎 *Pasajes complementarios*',f.biblia_comp);
    addBlock(lines,'🧠 *Comprensión*',f.texto_dice||f.interp||f.significa);
    addBlock(lines,'🔍 *Razones y evidencias*',f.razones||f.analisis);
    if(hasText(f.objeciones)||hasText(f.respuestas)){
      lines.push('⚖️ *Objeciones y respuestas*');
      if(hasText(f.objeciones))lines.push('Objeciones: '+String(f.objeciones).trim());
      if(hasText(f.respuestas))lines.push('Respuestas: '+String(f.respuestas).trim());
      lines.push('');
    }
    addBlock(lines,'💭 *Convicción provisional*',f.creo||f.conviccion);
    addBlock(lines,'🌱 *Aplicación personal*',f.accion||f.conducta||f.aplicacion);
    addBlock(lines,'✨ *Aprendizaje principal*',f.sintesis||f.resumen||f.aprendizaje);
    addBlock(lines,'🧭 *Dudas o próximos pasos*',f.proximo||f.dudas||f.investigar);
    lines.push('_Archivo personal · sesión en curso — no es conclusión definitiva_');
    const body=lines.filter((x,i)=>!(x===''&&lines[i-1]===''));
    if(body.filter(x=>x&&!x.startsWith('📲')&&!x.startsWith('✝️')&&!x.startsWith('_')&&x!=='').length<2){
      alert('Aún no hay contenido suficiente en esta ficha para un resumen de sesión.');
      return;
    }
    copyText(body.join('\n'));
  }
  function copyResumenFinal(id){
    const p=PILARES.find(x=>x.id===id);const f=store.fichas[id]||{};
    const est=estadoOf(f);
    const lines=[];
    lines.push('📖 *Resumen final del pilar*');
    lines.push('');
    lines.push('✝️ *Pilar '+id+': '+(f.tema||p.titulo)+'*');
    if(hasText(f.pregunta||p.pregunta))lines.push('❓ '+(f.pregunta||p.pregunta));
    lines.push('📌 Estado: '+est+(hasText(f.certeza)?' · Certeza: '+f.certeza+'/5':''));
    if(hasText(f.fecha))lines.push('📅 '+f.fecha);
    lines.push('');
    addBlock(lines,'1️⃣ *Fundamento bíblico principal*',f.biblia_principal||f.biblia);
    if(hasText(f.biblia_comp))addBlock(lines,'   Complementarios',f.biblia_comp);
    if(hasText(f.contexto))addBlock(lines,'   Contexto',f.contexto);
    const comp=[f.texto_dice||f.interp,f.significa,f.ensenanza].filter(hasText).join('\n\n');
    addBlock(lines,'2️⃣ *Comprensión y significado*',comp);
    addBlock(lines,'3️⃣ *Análisis y evidencias*',f.razones||f.analisis);
    if(hasText(f.objeciones)||hasText(f.respuestas)){
      lines.push('4️⃣ *Objeciones y respuestas*');
      if(hasText(f.objeciones))lines.push(String(f.objeciones).trim());
      if(hasText(f.respuestas))lines.push(String(f.respuestas).trim());
      lines.push('');
    }
    const conv=[f.creo||f.conviccion,f.porque,f.fundamento].filter(hasText).join('\n\n');
    addBlock(lines,'5️⃣ *Mi convicción personal y fundamentos*',conv);
    const apl=[f.pensar,f.conducta||f.aplicacion,f.cambiar,f.accion].filter(hasText).join('\n\n');
    addBlock(lines,'6️⃣ *Aplicación práctica*',apl);
    addBlock(lines,'7️⃣ *Síntesis y principal aprendizaje*',f.sintesis||f.resumen||f.aprendizaje);
    addBlock(lines,'8️⃣ *Dudas o investigaciones pendientes*',f.investigar||f.dudas||f.proximo);
    lines.push('9️⃣ *Estado final*: '+est+(hasText(f.certeza)?' · Certeza '+f.certeza+'/5':''));
    lines.push('');
    if(est==='consolidado')lines.push('_Convicción fundamentada según mi estudio actual_');
    else if(est==='revisado')lines.push('_Estudio revisado; aún puede profundizarse_');
    else lines.push('_En proceso — no es conclusión definitiva_');
    const body=lines.filter((x,i)=>!(x===''&&lines[i-1]===''));
    copyText(body.join('\n'));
  }
  window.copyResumenSesion=copyResumenSesion;
  window.copyResumenFinal=copyResumenFinal;
  function calShift(dir){calCursor=new Date(calCursor.getFullYear(),calCursor.getMonth()+dir,1);calSelected=null;renderCal();}
  function renderCal(){
    const y=calCursor.getFullYear(),m=calCursor.getMonth();
    const months=['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
    const title=document.getElementById('cal-title');
    if(title)title.textContent=months[m]+' '+y;
    const dows=document.getElementById('cal-dows');
    if(dows&&!dows.dataset.ready){
      dows.innerHTML=['Lun','Mar','Mié','Jue','Vie','Sáb','Dom'].map(d=>'<div class="cal-dow">'+d+'</div>').join('');
      dows.dataset.ready='1';
    }
    const first=new Date(y,m,1);
    let start=(first.getDay()+6)%7;
    const daysInMonth=new Date(y,m+1,0).getDate();
    const today=todayISO();
    let html='';
    for(let i=0;i<start;i++)html+='<div class="cal-day empty"></div>';
    for(let day=1;day<=daysInMonth;day++){
      const ds=y+'-'+String(m+1).padStart(2,'0')+'-'+String(day).padStart(2,'0');
      const acts=activityForDate(ds);
      const cls=['cal-day'];
      if(ds===today)cls.push('today');
      if(acts.length)cls.push('has');
      const chips=acts.slice(0,3).map(a=>'<div class="cal-chip">P'+a.pilarId+' '+(a.titulo||'').slice(0,14)+'</div>').join('');
      const more=acts.length>3?'<div class="cal-chip">+'+(acts.length-3)+'</div>':'';
      html+='<div class="'+cls.join(' ')+'" onclick="calPick(\''+ds+'\')"><div class="n">'+day+'</div><div class="chips">'+chips+more+'</div></div>';
    }
    const grid=document.getElementById('cal-grid');
    if(grid)grid.innerHTML=html;
    const det=document.getElementById('cal-detail');
    if(det){
      if(!calSelected){det.innerHTML='<p style="color:var(--muted);font-size:0.8rem;margin:0;">Toca un día con estudio para ver el detalle.</p>';}
      else {
        const acts=activityForDate(calSelected);
        if(!acts.length)det.innerHTML='<p style="color:var(--muted);font-size:0.8rem;">'+calSelected+': sin registros.</p>';
        else {
          det.innerHTML='<div style="font-weight:800;margin-bottom:0.5rem;">📅 '+calSelected+'</div>'+acts.map(a=>{
            return '<div class="pilar-card" style="margin-bottom:0.45rem;" onclick="openFicha('+a.pilarId+')"><div style="font-weight:800;font-size:0.85rem;">Pilar '+a.pilarId+': '+a.titulo+'</div><div style="font-size:0.7rem;color:var(--muted);margin-top:0.2rem;">Abrir ficha →</div></div>';
          }).join('');
        }
      }
    }
  }
  window.calShift=calShift;
  window.calPick=function(ds){calSelected=ds;renderCal();};
  window.renderCal=renderCal;
  function fichaLines(id){const p=PILARES.find(x=>x.id===id);const f=store.fichas[id]||{};const lines=['══════════════════════════════════','PILAR '+id+': '+(f.tema||p.titulo),'Pregunta guía: '+(f.pregunta||p.pregunta),'Fecha: '+(f.fecha||'—'),'Estado: '+(f.estado||estadoOf(f)),'Certeza: '+(f.certeza||'—'),'','── A. Identificación ──','Tema: '+(f.tema||p.titulo),'Pregunta central: '+(f.pregunta||p.pregunta),'','── B. Fundamento bíblico ──','Pasajes principales:',f.biblia_principal||f.biblia||'—','','Pasajes complementarios:',f.biblia_comp||'—','','Contexto:',f.contexto||'—','','Conceptos:',f.conceptos||'—','','── C. Comprensión ──','¿Qué dice el texto?:',f.texto_dice||f.interp||'—','','Significado:',f.significa||'—','','Enseñanza:',f.ensenanza||'—','','Relación otros pasajes:',f.relacion||'—',''];if(p.tipo==='historia'){lines.push('Personajes:',f.personajes||'—','','Arco:',f.arco||'—','','Apunta a Cristo:',f.cristo||'—','');}lines.push('── D. Análisis ──','Razones:',f.razones||f.analisis||'—','','Objeciones:',f.objeciones||'—','','Respuestas:',f.respuestas||'—','','Dudas:',f.dudas||'—','','── E. Convicción ──','¿Qué creo?:',f.creo||f.conviccion||'—','','¿Por qué?:',f.porque||'—','','Fundamento:',f.fundamento||'—','','Certeza: '+(f.certeza||'—'),'Investigar:',f.investigar||'—','','── F. Aplicación ──','Pensar:',f.pensar||'—','','Conducta:',f.conducta||f.aplicacion||'—','','Cambiar:',f.cambiar||'—','','Acción:',f.accion||'—','','── G. Cierre ──','Síntesis y principal aprendizaje:',f.sintesis||f.resumen||f.aprendizaje||'—','','Próximo paso (investigar/revisar/estudiar): '+(f.proximo||'—'),'Estado: '+(f.estado||estadoOf(f)),'══════════════════════════════════');return lines;}
  window.copyFicha=function(id){copyText(fichaLines(id).join('\n'));};
  window.copyAllFichas=function(){const parts=PILARES.filter(p=>store.fichas[p.id]).map(p=>fichaLines(p.id).join('\n'));if(!parts.length){alert('No hay fichas aún');return;}copyText('# Mis Convicciones cristianas\n\n'+parts.join('\n\n'));};
  window.exportTxt=function(){const parts=PILARES.map(p=>{if(store.fichas[p.id])return fichaLines(p.id).join('\n');return 'PILAR '+p.id+': '+p.titulo+'\n(sin ficha aún)\n';});const blob=new Blob(['MARY · Convicciones cristianas\n\n'+parts.join('\n\n')],{type:'text/plain;charset=utf-8'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='mary-convicciones.txt';a.click();};
  window.copyMarco=function(){const pr=progress();copyText('MARCO DEL PROYECTO — Construir mis convicciones cristianas\n\nObjetivo: documentar 21 pilares de fe de forma bíblica, ordenada y personal.\n\nEstructura de cada ficha:\nA. Identificación\nB. Fundamento bíblico\nC. Comprensión\nD. Análisis y examen\nE. Convicción personal\nF. Transformación y aplicación\nG. Cierre y seguimiento\n\nEstados: Pendiente → En estudio → Revisado → Consolidado\nProgreso consolidados: '+pr.n+' / '+pr.total);};
  window.reopen=openFicha;window.store=store;
  load();renderAll();showT('inicio');
})();