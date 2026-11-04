(function(){
  const LS='MARY_CHECKLIST_V1';
  const COL='mary_checklist';
  const DOC='ops_data';
  const firebaseConfig={
    apiKey:"AIzaSyCnhvfyXpwJdYOQFCvsyHDhgW9F3X7ARR4",
    authDomain:"marpk-816dd.firebaseapp.com",
    projectId:"marpk-816dd",
    storageBucket:"marpk-816dd.firebasestorage.app",
    messagingSenderId:"189644122232",
    appId:"1:189644122232:web:ed7894f1510a373d44658d"
  };
  let db=null;
  try{ if(window.firebase){ if(!firebase.apps.length) firebase.initializeApp(firebaseConfig); db=firebase.firestore(); } }catch(e){ console.warn(e); }

  const PEOPLE=['Valery','Laura','Mary'];
  const STATUS_CYCLE=['','ok','partial','martin','post'];
  const STATUS_ICON={ok:'✅',partial:'☑️',martin:'👱',post:'*️⃣'};

  const SUBS={
    'Oficina':[
      'Limpiar PC','Limpiar escritorio','Limpiar entorno',
      'Repisa de nootrópicos organizada','Desinfectar repisas',
      'Sin objetos sobre el escritorio','Verificar Ritalin en polvo',
      'Dejar Ritalin molido','Preparar 5 dosis de Ritalin 0.28-0.29',
      'Preparar 10 dosis de K 0.35','Stack oficina organizado',
      'Pañito para lentes','Líquido para lentes','Servilletas disponibles',
      'Alcohol spray','Gotas de ojos','Humectante de labios',
      'Cable USB-C blanco','Cinturón','Casaca',
      'Power Bank negro','Power Bank blanco','AirPods Max','AirPods blancos'
    ],
    'Cocina':[
      'Barrer','Trapear','Platos limpios y guardados','Encimera limpia',
      'Nada fuera de lugar','Airfryer limpia','Microondas limpio','Limpiar hornillas','Sacar basura',
      'Hacer panquecas','Dejar vasos de jugo','Dejar vaso de agua','Contar YoPro',
      'Verificar stock mínimo','Verificar Red Bull','Verificar Gatorade',
      'Dejar marmita descongelada o descongelándose','Pesar salsas','Dejar 10 bananos',
      'Cocina limpia','Mesada con nootrópicos y balanza','Nutella de stock','Pasar macros'
    ],
    'Habitación principal':[
      'Barrer','Trapear','Cama tendida','Entorno organizado',
      'Mesa de noche organizada con protocolo nocturno','Verificar tapones','Verificar parches',
      'Verificar stack nocturno completo','AirPods cargados','iPhone 12 cargado',
      'Gatorade sin azúcar + stack nocturno preparado + taponcitos','Servilletas',
      'Antialérgico','Diclofenaco','Verificar SORINE en baño','Verificar stock de SORINE en baño'
    ],
    'Baño · Hab. principal':[
      'Barrer','Trapear','Todo organizado','Nada fuera de lugar','Superficies limpias',
      'Basura retirada','Revisar baño','Limpiar inodoro (si es necesario)',
      'Limpiar lavamanos (si es necesario)','Verificar toallas','Verificar pañitos','Verificar SORINE'
    ],
    'Maleta Gym':[
      '2 Toallas (Nike y sin marca)','Camisillas de repuesto','Gatorade','Stanley preparada',
      'Red Bull Zero','Sal','Aceite','Perfume','Pre-workout','Straps','Muñequeras',
      'Lentes limpios','Estuche de lentes + Pañito','Aceite fuera del bolso','Llaves',
      'Antialérgico','Casco al lado del bolso','Cinta POLAR','AirPod Max','AirPods blancos'
    ],
    'Cuidados Nalito':[
      'Desayuno','Refuerzo disciplinario','Paseo 1','Correa 1','Confinamiento',
      'Peinado 1','Cena','Paseo 2','Correa 2','Omega 3 semanal (si aplica)',
      'Cepillado de dientes','Peinado','Zanahorias'
    ],
    'Para cargar':[
      'Power Bank blanco','Power Bank negro','AirPods Max negros',
      'AirPods blancos','Apple Watch','iPhone 17','iPhone 12','iPhone Dúo',
      'Cubo de luz 1','Cubo de luz 2','Luz tubo','Luz cuadrada potente','Micrófonos'
    ],
    'Nevera':[
      'Vaso de agua','Vasos de jugo','Jarra de jugo','Jarra de agua','Plátanos (10)',
      'Marmita disponible','Red Bull Zero','Gaseosa Zero','YoPro','Zanahorias Nalito',
      'Gatorade','Hielo','Leche condensada','Dulce de leche','Nevera limpia (interior y exterior)'
    ],
    'Despensa':['Nutella (frasco envasado)','Miel','Sobres de jugo','Plátanos'],
    'Habitación Closet':[
      'Barrer','Trapear','Todo organizado','Ropa doblada/colgada','Nada en el piso',
      'Zapatos organizados','Basura retirada','Superficies despejadas','Revisar baño',
      'Limpiar inodoro (si es necesario)','Limpiar lavamanos (si es necesario)',
      'Verificar toallas','Verificar pañitos'
    ],
    'Sala':[
      'Barrer','Trapear','Todo en su lugar','Nada sobre muebles','Mesa limpia',
      'Limpiar área de Nalito','Cojines organizados'
    ],
    'Sala de Billar':[
      'Barrer','Trapear','Todo organizado','Nada fuera de lugar','Mesa limpia',
      'Luces apagadas','Puertas y ventanas revisadas'
    ],
    'Baño segundo piso / cocina':[
      'Barrer','Trapear','Revisar baño','Limpiar inodoro (si es necesario)',
      'Limpiar lavamanos (si es necesario)','Limpiar espejo'
    ],
    'Triple verificación':[
      'Oficina','Maleta de Gym','Sorines','Macros'
    ]
  };

  const TEMPLATES={
    rapida:{
      id:'rapida',
      name:'Checklist rápida / prioridad',
      desc:'Orden de prioridad diario',
      groups:[
        {title:'Oficina', items:['Oficina']},
        {title:'Cocina', items:[
          'Hacer panquecas','Dejar vasos de jugo','Dejar vaso de agua','Contar YoPro',
          'Verificar stock mínimo','Verificar Red Bull','Verificar Gatorade',
          'Dejar marmita descongelada o descongelándose','Pesar salsas','Dejar 10 bananos',
          'Cocina limpia','Mesada con nootrópicos y balanza','Nutella de stock','Pasar macros'
        ]},
        {title:'Habitación principal', items:[
          'Stack nocturno','Taponcitos','Servilletas','Parches / diclofenaco','Gatorade'
        ]},
        {title:'Baño · Hab. principal', items:['Verificar SORINE','Verificar pañitos']},
        {title:'Maleta del gym', items:['Hacer la checklist completa de maleta del gym']},
        {title:'Nalito', items:['Paseo','Cepillado de dientes','Peinado','Zanahorias']},
        {title:'Checklist para cargar', items:[
          'Power Bank blanco con batería','Power Bank negro con batería','AirPods Max negros',
          'AirPods blancos','Apple Watch','iPhone 17 con batería','iPhone 12 con batería','iPhone Dúo'
        ]},
        {title:'Verificación', items:[
          'Verificar Baño - H. Principal',
          'Verificar Baño - H. Closet',
          'Verificar Baño - Oficina',
          'Verificar Habitación Closet',
          'Verificar Sala en orden',
          'Verificar Lavandería en orden',
          'Verificar Terraza en orden',
          'Verificar cuarto de contenido + cosas cargadas'
        ]},
        {title:'Triple verificación', items:[
          'Oficina','Maleta de Gym','Sorines','Macros'
        ]},
        {title:'Checklist cerrada', items:[
          'Enviar la checklist de cuidados de Nalito',
          'Checklist verificada · Valery',
          'Checklist verificada · Laura',
          'Checklist verificada · Mary'
        ]}
      ]
    },
    clm:{
      id:'clm',
      name:'Checklist maestra (CLM)',
      desc:'Recorrido completo por áreas',
      groups:[
        {title:'Baño segundo piso / cocina', items:['Baño segundo piso / cocina']},
        {title:'CLM · noche anterior', items:[
          'Verificar maleta del gym (lo que faltó la noche anterior)',
          'Oficina (si aplica)',
          'Habitación de Martín (Preparación nocturna / Stack nocturno)',
          'Baño · H. Principal','Habitación Closet','Baño · H. Closet','Baño · Oficina'
        ]},
        {title:'Cocina', items:['Cocina']},
        {title:'Cuidados Nalito', items:['Cuidados Nalito']},
        {title:'Despensa', items:['Despensa']},
        {title:'Habitación Baño / productos', items:['Habitación Baño / productos']},
        {title:'Habitación Closet', items:['Habitación Closet']},
        {title:'Habitación de Martín', items:['Habitación de Martín']},
        {title:'Maleta Gym', items:['Maleta Gym']},
        {title:'Nevera', items:['Nevera']},
        {title:'Oficina', items:['Oficina']},
        {title:'Para cargar · Contenido', items:['Cubo de luz 1','Cubo de luz 2','Luz tubo','Luz cuadrada potente','Micrófonos']},
        {title:'Para cargar · General', items:[
          'Power Bank blanco','Power Bank negro','AirPods Max negros',
          'AirPods blancos','Apple Watch','iPhone 17','iPhone 12'
        ]},
        {title:'Sala', items:['Sala']},
        {title:'Sala de Billar', items:['Sala de Billar']},
        {title:'Doble verificación', items:['Maleta gym','Oficina','Macros','Sorines']},
        {title:'Ambas / extras', items:[
          'Verificar Lavandería en orden','Verificar Terraza en orden',
          'Enviar checklist de cuidados de Nalito','Nootrópicos para el día',
          'Balanza en el mesón','Pasar checklist de cosas cargando','Pasar stock de bebidas'
        ]}
      ]
    },
    clm_no:{
      id:'clm_no',
      name:'CLM · No fuimos noche anterior',
      desc:'Variante cuando no hubo salida',
      groups:[
        {title:'CLM · No fuimos noche anterior', items:[
          'Maleta Gym','Oficina',
          'Habitación de Martín (Preparación nocturna / Stack nocturno)',
          'Baño · H. Principal','Habitación Closet','Baño · H. Closet','Baño · Oficina'
        ]},
        {title:'Laura · extras', items:[
          'Pesar salsas dulces y consumo','Conteo de bananos','Conteo de YoPro',
          'Panquecas','Pasar alimentación de Martín (calcular y enviar calorías)',
          'Cuidado de Nalito','Cocina','Nevera','Despensa'
        ]},
        {title:'Resto CLM', items:['Cocina','Nevera','Oficina','Sala','Sala de Billar','Maleta Gym']}
      ]
    }
  };

  const AREA_ALIASES={
    'Oficina':'Oficina','Cocina':'Cocina','Habitación de Martín':'Habitación principal',
    'Habitación principal':'Habitación principal','Maleta Gym':'Maleta Gym',
    'Hacer la checklist completa de maleta del gym':'Maleta Gym',
    'Cuidados Nalito':'Cuidados Nalito','Cuidados Nailito':'Cuidados Nalito',
    'Nevera':'Nevera','Despensa':'Despensa',
    'Habitación Closet':'Habitación Closet','Sala':'Sala','Sala de Billar':'Sala de Billar',
    'Baño segundo piso / cocina':'Baño segundo piso / cocina',
    'Baño · Hab. principal':'Baño · Hab. principal',
    'Habitación Baño / productos':'Baño · Hab. principal'
  };

  const GROUP_PRESETS = {
    'Verificación': [
      'Verificar Baño - H. Principal',
      'Verificar Baño - H. Closet',
      'Verificar Baño - Oficina',
      'Verificar Habitación Closet',
      'Verificar Sala en orden',
      'Verificar Lavandería en orden',
      'Verificar Terraza en orden',
      'Verificar cuarto de contenido + cosas cargadas'
    ],
    'Checklist cerrada': [
      'Enviar la checklist de cuidados de Nalito',
      'Checklist verificada · Valery',
      'Checklist verificada · Laura',
      'Checklist verificada · Mary'
    ],
    'Nalito': ['Paseo','Cepillado de dientes','Peinado','Zanahorias']
  };

  const ADDABLE_AREAS = [
    'Oficina','Cocina','Habitación principal','Baño · Hab. principal','Maleta Gym',
    'Cuidados Nalito','Para cargar','Nevera','Despensa','Habitación Closet',
    'Sala','Sala de Billar','Baño segundo piso / cocina','Verificación','Checklist cerrada'
  ];

  window.addAreaToToday = function(areaName){
    const day = document.getElementById('day').value || today();
    const d = ensure(day);
    var norm=function(s){ return (s||'').toLowerCase().replace(/nailito/g,'nalito').trim(); };
    var hit=-1;
    for (var i=0;i<d.groups.length;i++){
      if (norm(d.groups[i].title) === norm(areaName)) { hit=i; break; }
    }
    if (hit>=0) {
      if(!confirm('"'+d.groups[hit].title+'" ya está. ¿Reemplazarla por la versión completa con subchecks?')) return;
      d.groups.splice(hit,1);
    }
    var names = GROUP_PRESETS[areaName] || [areaName];
    d.groups.push({
      title: areaName,
      items: names.map(function(n, idx){
        return { id:'i'+Date.now()+idx, name: n, marks: blankMarks(), subs:{} };
      })
    });
    persist();
    renderHoy();
    toast(hit>=0 ? ('Reemplazada: '+areaName) : ('Área añadida: '+areaName));
  };

  function weekdaySuggestions(iso){
    const d=new Date(iso+'T12:00:00');
    const wd=d.getDay();
    const list=[{text:'Barrer',rule:'Todos los días'}];
    if(wd===2) list.push({text:'Revisión stock de alimentos',rule:'Martes'});
    if(wd===3){
      list.push({text:'Revisión de stock de nootrópicos',rule:'Miércoles'});
      list.push({text:'Revisión de zapatillas',rule:'Miércoles'});
    }
    if(wd===6) list.push({text:'Lavar la bici/moto y cargar la batería',rule:'Sábado'});
    return list;
  }

  let store={days:{},updatedAt:null};

  function setStatus(m){ const el=document.getElementById('sync'); if(el) el.textContent=m||''; }
  function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function fmtDM(iso){const p=(iso||'').split('-'); if(p.length<3) return iso; return p[2]+'/'+p[1]+'/'+p[0];}
  function toast(m){const t=document.getElementById('toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',1800);}
  function loadLocal(){ try{const r=localStorage.getItem(LS);if(r){const p=JSON.parse(r);if(p&&typeof p==='object'){store=Object.assign({days:{},updatedAt:null},p);}}}catch(e){} if(!store.days) store.days={}; }
  function saveLocal(){ try{localStorage.setItem(LS,JSON.stringify(store));}catch(e){} }
  async function loadCloud(){
    if(!db){ setStatus('Sin nube · solo local'); return; }
    try{
      setStatus('Sincronizando…');
      const snap=await db.collection(COL).doc(DOC).get();
      if(snap.exists){
        const d=snap.data();
        if(d && (!store.updatedAt || (d.updatedAt||0)>=store.updatedAt)){ store=d; if(!store.days) store.days={}; saveLocal(); }
      }
      setStatus('☁ Firebase listo');
    }catch(e){ console.warn(e); setStatus('Local (nube no disponible)'); }
  }
  async function saveCloud(){
    if(!db) return;
    try{
      store.updatedAt=Date.now();
      await db.collection(COL).doc(DOC).set({...store, updatedAt:store.updatedAt},{merge:true});
      setStatus('☁ Guardado · '+new Date().toLocaleTimeString());
    }catch(e){ console.warn(e); setStatus('Error al guardar en nube'); }
  }
  function persist(){ saveLocal(); saveCloud(); }

  function ensure(day){
    if(!store.days[day]) store.days[day]={templateId:null,groups:[],extra:[],notes:'',openSubs:{}};
    const d=store.days[day];
    if(!d.groups) d.groups=[];
    if(!d.extra) d.extra=[];
    if(!d.openSubs) d.openSubs={};
    if(d.notes==null) d.notes='';
    return d;
  }

  function blankMarks(){ return {Valery:'',Laura:'',Mary:''}; }

  function applyTemplate(day, tplId){
    const tpl=TEMPLATES[tplId]; if(!tpl) return;
    const d=ensure(day);
    d.templateId=tplId;
    d.groups=tpl.groups.map(function(g){
      return {
        title:g.title,
        items:g.items.map(function(name){
          return {id:'i'+Math.random().toString(36).slice(2,8), name:name, marks:blankMarks(), subs:{}};
        })
      };
    });
    persist();
  }

  function findItem(d, itemId){
    for(var gi=0;gi<d.groups.length;gi++){
      const items=d.groups[gi].items||[];
      for(var ii=0;ii<items.length;ii++){
        if(items[ii].id===itemId) return items[ii];
      }
    }
    for(var ei=0;ei<d.extra.length;ei++){
      if(d.extra[ei].id===itemId) return d.extra[ei];
    }
    return null;
  }

  window.showTab=function(id){
    ['hoy','plantillas','sugerencias'].forEach(function(t){
      document.getElementById('tab-'+t).classList.toggle('hidden',t!==id);
      const btn=document.querySelector('.tab[data-t="'+t+'"]');
      if(btn) btn.classList.toggle('on',t===id);
    });
    if(id==='hoy') renderHoy();
    if(id==='plantillas') renderPlantillas();
    if(id==='sugerencias') renderRules();
  };

  function renderPlantillas(){
    document.getElementById('tpl-list').innerHTML=Object.keys(TEMPLATES).map(function(id){
      const t=TEMPLATES[id];
      const day=document.getElementById('day').value||today();
      const on=ensure(day).templateId===id?' on':'';
      return '<div class="tpl-card'+on+'" onclick="pickTemplate(\''+id+'\')"><b>'+t.name+'</b><div class="muted">'+t.desc+' · '+t.groups.length+' bloques</div></div>';
    }).join('');
  }

  window.pickTemplate=function(id){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    if(d.templateId===id && d.groups.length){
      if(!confirm('Ya tienes esta plantilla cargada. ¿Recargar desde cero? (se pierden marcas de hoy)')) return;
    }
    applyTemplate(day,id);
    toast('Plantilla cargada');
    showTab('hoy');
  };

  function renderRules(){
    const day=document.getElementById('day').value||today();
    const sug=weekdaySuggestions(day);
    let html='<div class="sec" style="margin-top:0">Para '+fmtDM(day)+'</div>';
    html+=sug.map(function(s){
      return '<div class="sug"><b>'+s.text+'</b><div class="muted">'+s.rule+'</div><button type="button" class="btn btn-ghost" style="margin-top:.35rem" onclick="addSuggestion(\''+s.text.replace(/'/g,"\\'")+'\')">+ Añadir a Hoy</button></div>';
    }).join('');
    html+='<div class="sec">Calendario fijo</div>';
    html+='<div class="item-row"><div class="item-name">Todos los días → <b>Barrer</b></div></div>';
    html+='<div class="item-row"><div class="item-name">Martes → <b>Revisión stock de alimentos</b></div></div>';
    html+='<div class="item-row"><div class="item-name">Miércoles → <b>Revisión stock de nootrópicos</b> · <b>Revisión de zapatillas</b></div></div>';
    html+='<div class="item-row"><div class="item-name">Sábado → <b>Lavar bici/moto y cargar batería</b></div></div>';
    document.getElementById('rules-box').innerHTML=html;
  }

  window.addSuggestion=function(text){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    d.extra.push({id:'e'+Date.now(),name:text,marks:blankMarks(),subs:{},fromSug:true});
    persist(); toast('Añadido a Hoy'); showTab('hoy');
  };

  function markBtn(person, val, itemId){
    const icon=STATUS_ICON[val]||'';
    const cls=val?(' on-'+val):'';
    return '<div><div class="person-lbl">'+person[0]+'</div><div class="mk'+cls+'" onclick="cycleMark(\''+itemId+'\',\''+person+'\')">'+icon+'</div></div>';
  }

  function renderItem(item, d){
    const areaKey=AREA_ALIASES[item.name];
    const hasSub=!!(areaKey && SUBS[areaKey]);
    const open=!!d.openSubs[item.id];
    let html='<div class="item-row"><div class="item-name">'+item.name;
    if(hasSub) html+=' <span class="sub-toggle" onclick="toggleSub(\''+item.id+'\')">'+(open?'▾ subchecks':'▸ subchecks')+'</span>';
    html+='</div><div class="marks">';
    PEOPLE.forEach(function(p){ html+=markBtn(p, (item.marks&&item.marks[p])||'', item.id); });
    html+='</div></div>';
    if(hasSub && open){
      html+='<div class="sub-list">';
      SUBS[areaKey].forEach(function(sn){
        if(!item.subs) item.subs={};
        if(!item.subs[sn]) item.subs[sn]=blankMarks();
        html+='<div class="sub-item"><span>'+sn+'</span><div class="marks">';
        PEOPLE.forEach(function(p){
          const val=(item.subs[sn]&&item.subs[sn][p])||'';
          const icon=STATUS_ICON[val]||'';
          const cls=val?(' on-'+val):'';
          html+='<div class="mk'+cls+'" style="width:28px;height:28px;font-size:.8rem" onclick="cycleSub(\''+item.id+'\',\''+sn.replace(/'/g,"\\'")+'\',\''+p+'\')">'+icon+'</div>';
        });
        html+='</div></div>';
      });
      html+='</div>';
    }
    return html;
  }

  window.toggleSub=function(itemId){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    d.openSubs[itemId]=!d.openSubs[itemId];
    persist(); renderHoy();
  };

  window.cycleMark=function(itemId, person){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    const item=findItem(d,itemId); if(!item) return;
    if(!item.marks) item.marks=blankMarks();
    const cur=item.marks[person]||'';
    const idx=STATUS_CYCLE.indexOf(cur);
    item.marks[person]=STATUS_CYCLE[(idx+1)%STATUS_CYCLE.length];
    persist(); renderHoy();
  };

  window.cycleSub=function(itemId, subName, person){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    const item=findItem(d,itemId); if(!item) return;
    if(!item.subs) item.subs={};
    if(!item.subs[subName]) item.subs[subName]=blankMarks();
    const cur=item.subs[subName][person]||'';
    const idx=STATUS_CYCLE.indexOf(cur);
    item.subs[subName][person]=STATUS_CYCLE[(idx+1)%STATUS_CYCLE.length];
    persist(); renderHoy();
  };

  function renderHoy(){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    const tpl=d.templateId&&TEMPLATES[d.templateId]?TEMPLATES[d.templateId]:null;
    document.getElementById('active-tpl').innerHTML=tpl
      ?('<b>'+tpl.name+'</b><div class="muted">'+tpl.desc+'</div>')
      :'Ninguna · ve a <b>Plantillas</b> y elige una';
    document.getElementById('notes').value=d.notes||'';

    const sug=weekdaySuggestions(day);
    document.getElementById('sug-box').innerHTML=sug.map(function(s){
      return '<div class="chip" onclick="addSuggestion(\''+s.text.replace(/'/g,"\\'")+'\')">＋ '+s.text+' <span class="muted">('+s.rule+')</span></div>';
    }).join('')||'<span class="muted">Sin sugerencias extra</span>';

    document.getElementById('today-extra').innerHTML=(d.extra||[]).map(function(item){
      return renderItem(item,d)+'<div style="text-align:right;margin-bottom:.35rem"><button type="button" class="btn btn-ghost" onclick="delExtra(\''+item.id+'\')">Quitar</button></div>';
    }).join('')||'<p class="muted">Sin actividades puntuales de hoy.</p>';

    if(!d.groups.length){
      document.getElementById('day-list').innerHTML='<p class="muted">Elige una plantilla en la pestaña Plantillas.</p>';
    } else {
      document.getElementById('day-list').innerHTML=d.groups.map(function(g,gi){
        let h='<div class="group"><div class="group-h"><b>'+g.title+'</b>'+
          '<button type="button" class="btn btn-ghost" style="padding:.25rem .55rem;font-size:.68rem" onclick="event.stopPropagation();removeGroup('+gi+')">✕ Quitar</button>'+
          '</div><div class="group-body">';
        (g.items||[]).forEach(function(item){ h+=renderItem(item,d); });
        h+='</div></div>';
        return h;
      }).join('');
    }

    var ca=document.getElementById('copy-areas');
    if(ca){
      if(!d.groups.length) ca.innerHTML='<span class="muted">Carga una plantilla primero</span>';
      else ca.innerHTML=d.groups.map(function(g,gi){
        return '<button type="button" class="btn btn-ghost" onclick="copyArea('+gi+',false)">📋 '+g.title+'</button>'+
               '<button type="button" class="btn btn-ghost" onclick="copyArea('+gi+',true)">□ '+g.title+' vacía</button>';
      }).join('');
    }

    var ap = document.getElementById('add-areas');
    if (ap) {
      ap.innerHTML = ADDABLE_AREAS.map(function(a){
        return '<button type="button" class="btn btn-ghost" onclick="addAreaToToday(\''+a.replace(/'/g,"\\'")+'\')">＋ '+a+'</button>';
      }).join('');
    }
  }

  window.addTodayItem=function(){
    const txt=(document.getElementById('add-today-txt').value||'').trim();
    if(!txt) return;
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    d.extra.push({id:'e'+Date.now(),name:txt,marks:blankMarks(),subs:{}});
    document.getElementById('add-today-txt').value='';
    persist(); renderHoy();
  };

  window.addCustomItem=function(){
    const txt=(document.getElementById('add-item-txt').value||'').trim();
    if(!txt) return;
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    d.extra.push({id:'e'+Date.now(),name:txt,marks:blankMarks(),subs:{}});
    document.getElementById('add-item-txt').value='';
    persist(); renderHoy(); toast('Añadido hoy ✓');
  };

  window.delExtra=function(id){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    d.extra=(d.extra||[]).filter(function(x){return x.id!==id;});
    persist(); renderHoy();
  };

  window.removeGroup=function(gi){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    if(!d.groups[gi]) return;
    var title=d.groups[gi].title||'este bloque';
    if(!confirm('¿Quitar "'+title+'" de la checklist de hoy?')) return;
    d.groups.splice(gi,1);
    persist();
    renderHoy();
    toast('Quitado: '+title);
  };

  window.saveDay=async function(){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    d.notes=document.getElementById('notes').value||'';
    persist();
    await saveCloud();
    toast('Guardado ✓');
  };

  function statusLine(marks){
    if(!marks) return '';
    const parts=[];
    PEOPLE.forEach(function(p){
      const v=marks[p];
      if(v&&STATUS_ICON[v]) parts.push(p[0]+STATUS_ICON[v]);
    });
    return parts.join(' ');
  }

  function dumpItem(item, opts){
    opts = opts || {};
    const empty = !!opts.empty;
    const nosubs = !!opts.nosubs;
    const areaKey = opts.forceLeaf ? null : (AREA_ALIASES[item.name] || null);
    const hasAreaSubs = !!(areaKey && SUBS[areaKey]);

    if (hasAreaSubs && !nosubs) {
      let out = '';
      if (opts.showParentHeader) {
        const st = empty ? '' : statusLine(item.marks);
        out += (st ? st + ' ' : '□ ') + item.name + '\n';
      }
      SUBS[areaKey].forEach(function(sn){
        const sm = (item.subs && item.subs[sn]) || null;
        if (empty) {
          out += '□ ' + sn + '\n';
        } else {
          const sst = statusLine(sm);
          if (sst) out += sst + ' ' + sn + '\n';
          else if (opts.expandAll) out += '□ ' + sn + '\n';
        }
      });
      return out;
    }

    const st = empty ? '' : statusLine(item.marks);
    let line = (st ? st + ' ' : '□ ') + item.name + '\n';
    if (!nosubs && !empty && item.subs) {
      Object.keys(item.subs).forEach(function(sn){
        const sst = statusLine(item.subs[sn]);
        if (sst) line += '  · ' + sst + ' ' + sn + '\n';
      });
    }
    return line;
  }

  function buildMsg(opts){
    opts = opts || {};
    const day = document.getElementById('day').value || today();
    const d = ensure(day);
    d.notes = document.getElementById('notes').value || '';
    const tpl = d.templateId && TEMPLATES[d.templateId] ? TEMPLATES[d.templateId].name : 'Checklist';
    let msg = '';

    if (opts.areaOnly) {
      msg = '*' + (opts.areaTitle || 'Área') + '* · ' + fmtDM(day) + '\n\n';
      var isTriple = /triple\s*verific/i.test(opts.areaTitle || '');
      (opts.items || []).forEach(function(it){
        msg += dumpItem(it, {
          empty: !!opts.empty,
          nosubs: false,
          expandAll: (!!opts.empty || !!opts.expandAll) && !isTriple,
          showParentHeader: false,
          forceLeaf: isTriple
        });
      });
    } else {
      msg = '✅ *' + (opts.empty ? 'Plantilla ' : '') + tpl + '* · ' + fmtDM(day) + '\n\n';

      if (d.extra && d.extra.length) {
        msg += '*Añadido hoy*\n';
        d.extra.forEach(function(it){
          msg += dumpItem(it, { empty: !!opts.empty, nosubs: !!opts.nosubs, expandAll: false });
        });
        msg += '\n';
      }

      (d.groups || []).forEach(function(g){
        msg += '*' + g.title + '*\n';
        var isTriple = /triple\s*verific/i.test(g.title || '');
        (g.items || []).forEach(function(it){
          msg += dumpItem(it, {
            empty: !!opts.empty,
            nosubs: !!opts.nosubs,
            expandAll: !!opts.empty && !opts.nosubs && !isTriple,
            showParentHeader: false,
            forceLeaf: isTriple
          });
        });
        msg += '\n';
      });

      if (!opts.empty && d.notes && d.notes.trim()) {
        msg += '*Notas*\n' + d.notes.trim() + '\n';
      }
    }

    return msg;
  }

  function doCopy(msg){
    if (navigator.clipboard) navigator.clipboard.writeText(msg).then(function(){ toast('Copiado a WhatsApp ✓'); }).catch(function(){ prompt('Copia', msg); });
    else prompt('Copia', msg);
  }

  window.copyWhatsApp = function(mode){
    const day = document.getElementById('day').value || today();
    ensure(day).notes = document.getElementById('notes').value || '';
    persist();
    mode = mode || 'full';
    if (mode === 'empty') doCopy(buildMsg({ empty: true, nosubs: false }));
    else if (mode === 'nosubs') doCopy(buildMsg({ empty: false, nosubs: true }));
    else doCopy(buildMsg({ empty: false, nosubs: false }));
  };

  window.copyArea = function(gi, empty){
    const day = document.getElementById('day').value || today();
    const d = ensure(day);
    const g = d.groups[gi]; if (!g) return;
    doCopy(buildMsg({
      areaOnly: true,
      areaTitle: g.title,
      items: g.items || [],
      empty: !!empty,
      expandAll: true
    }));
  };

  document.getElementById('notes').addEventListener('change',function(){
    const day=document.getElementById('day').value||today();
    ensure(day).notes=this.value;
    persist();
  });

  (async function init(){
    loadLocal();
    await loadCloud();
    document.getElementById('day').value=today();
    document.getElementById('day').addEventListener('change',function(){ renderHoy(); renderRules(); });
    renderHoy();
    renderPlantillas();
  })();
})();
