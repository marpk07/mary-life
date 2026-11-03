(function(){
  const LS='MARY_ALIM_MARTIN_V1';
  const PER100={
    'Arroz cocido':{kcal:130,p:2.7,c:28,g:0.3},
    'Papa cruda':{kcal:77,p:2,c:17,g:0.1},
    'Tilapia cruda':{kcal:96,p:20.1,c:0,g:1.7},
    'Tilapia cocida':{kcal:128,p:26,c:0,g:2.7},
    'Hershey':{kcal:535,p:7.5,c:60,g:30},
    'Miel':{kcal:304,p:0.3,c:82.4,g:0},
    'Leche condensada tradicional':{kcal:314,p:8,c:57,g:6},
    'Leche condensada La Lechera':{kcal:321,p:7.5,c:54.9,g:8},
    'Mayonesa':{kcal:680,p:1,c:1,g:75},
    'Nutella':{kcal:542,p:6.3,c:58,g:31},
    'Cocada':{kcal:323,p:7,c:51,g:10},
    'Mantequilla':{kcal:717,p:0.85,c:0.06,g:81.1},
    'Queso parmesano':{kcal:431,p:38,c:4,g:29}
  };
  const FOODS=[
    {id:'arroz_g',name:'Arroz cocido',cat:'Base',byGram:true,unit:'g'},
    {id:'papa_g',name:'Papa cruda',cat:'Base',byGram:true,unit:'g'},
    {id:'tilapia_cruda',name:'Tilapia cruda',cat:'Base',byGram:true,unit:'g'},
    {id:'tilapia_cocida',name:'Tilapia cocida',cat:'Base',byGram:true,unit:'g'},
    {id:'arroz_mantequilla',name:'Arroz con mantequilla',cat:'Marmita',kcal:308,p:5.4,c:56.4,g:6,unit:'porción'},
    {id:'sudado',name:'Sudado de pescado / salsa roja',cat:'Marmita',kcal:313,p:43.8,c:0.2,g:15.4,unit:'porción'},
    {id:'napolitana',name:'Tilapia a la napolitana',cat:'Marmita',kcal:560,p:62,c:14,g:29,unit:'porción'},
    {id:'yopro15',name:'YoPro 15g proteína',cat:'Bebida',kcal:159,p:15,c:20,g:2,unit:'botella'},
    {id:'yopro23',name:'YoPro 23g proteína',cat:'Bebida',kcal:171,p:23,c:13,g:3,unit:'botella'},
    {id:'gatorade',name:'Gatorade 500ml',cat:'Bebida',kcal:120,p:0,c:30,g:0,unit:'botella'},
    {id:'panqueca100',name:'Panquecas',cat:'Panqueca',kcal:432,p:48,c:34,g:9,unit:'%',pct:true},
    {id:'banano',name:'Banano (1 un. / 60g)',cat:'Fruta',kcal:53,p:1,c:14,g:0,unit:'unidad'}
  ];
  let store={days:{}};
  try{const r=localStorage.getItem(LS);if(r)store=Object.assign({days:{}},JSON.parse(r));}catch(e){}
  if(!store.days)store.days={};
  function today(){const d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function prevDay(iso){const d=new Date(iso+'T12:00:00');d.setDate(d.getDate()-1);return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function fmtDM(iso){const p=iso.split('-');return p[2]+'/'+p[1]+'/'+p[0];}
  function fmtShort(iso){const p=iso.split('-');return parseInt(p[2],10)+'.'+parseInt(p[1],10);}
  function num(v){const n=parseFloat(String(v).replace(',','.'));return isNaN(n)?0:n;}
  function r0(n){return Math.round(Number(n)||0);}
  function toast(m){const t=document.getElementById('toast');t.textContent=m;t.style.display='block';setTimeout(()=>t.style.display='none',1800);}
  function persist(){try{localStorage.setItem(LS,JSON.stringify(store));}catch(e){}}
  function ensure(day){
    if(!store.days[day]) store.days[day]={meals:[],pots:[],note:''};
    const d=store.days[day];
    if(!d.meals) d.meals=[];
    if(!d.pots) d.pots=[];
    if(d.salsaWeights && typeof d.salsaWeights==='object' && !d._migrated){
      Object.keys(d.salsaWeights).forEach(function(name){
        const w=d.salsaWeights[name];
        if(w!==''&&w!=null) d.pots.push({id:'m'+Math.random().toString(36).slice(2,7),name:name,weight:num(w)});
      });
      d._migrated=true;
    }
    if(!d.pots.length){
      ['Hershey','Miel','Leche condensada tradicional','Mayonesa','Nutella','Cocada'].forEach(function(name){
        d.pots.push({id:'s'+Math.random().toString(36).slice(2,7),name:name,weight:''});
      });
    }
    return d;
  }
  function per100Macros(name, grams){
    const m=PER100[name]; if(!m||!grams) return {kcal:0,p:0,c:0,g:0};
    const f=num(grams)/100;
    return {kcal:m.kcal*f,p:m.p*f,c:m.c*f,g:m.g*f};
  }
  function mealMacros(m){
    if(m.custom) return {kcal:num(m.kcal),p:num(m.p),c:num(m.c),g:num(m.g)};
    if(m.byGram||m.salsa) return per100Macros(m.name, m.grams||m.qty);
    const f=FOODS.find(x=>x.id===m.id);
    if(!f) return {kcal:0,p:0,c:0,g:0};
    if(f.byGram) return per100Macros(f.name, m.qty);
    let mult=num(m.qty)||1;
    if(f.pct) mult=mult/100;
    return {kcal:f.kcal*mult,p:f.p*mult,c:f.c*mult,g:f.g*mult};
  }
  function salsaConsumo(day){
    const todayP=ensure(day).pots||[];
    const prevP=ensure(prevDay(day)).pots||[];
    function byName(list){
      const map={};
      list.forEach(function(p){ if(!map[p.name]) map[p.name]=[]; map[p.name].push(p); });
      return map;
    }
    const tMap=byName(todayP), pMap=byName(prevP);
    const names=Object.keys(Object.assign({},tMap,pMap));
    const out=[];
    names.forEach(function(name){
      const ta=tMap[name]||[], pa=pMap[name]||[];
      const n=Math.max(ta.length,pa.length);
      for(var i=0;i<n;i++){
        const tw=ta[i]&&ta[i].weight!==''&&ta[i].weight!=null?num(ta[i].weight):null;
        const pw=pa[i]&&pa[i].weight!==''&&pa[i].weight!=null?num(pa[i].weight):null;
        if(tw==null||pw==null) out.push({name:name,idx:i,grams:null,missing:true,prev:pw,cur:tw});
        else out.push({name:name,idx:i,grams:Math.max(0,pw-tw),missing:false,prev:pw,cur:tw});
      }
    });
    return out;
  }
  function dayTotals(day){
    const d=ensure(day);
    let kcal=0,p=0,c=0,g=0; const lines=[];
    (d.meals||[]).forEach(function(m){ const mac=mealMacros(m); kcal+=mac.kcal;p+=mac.p;c+=mac.c;g+=mac.g; lines.push({m:m,mac:mac,auto:false}); });
    salsaConsumo(day).forEach(function(s){
      if(s.missing||!s.grams) return;
      const mac=per100Macros(s.name,s.grams);
      kcal+=mac.kcal;p+=mac.p;c+=mac.c;g+=mac.g;
      lines.push({m:{name:s.name+(s.idx?(' #'+(s.idx+1)):''),grams:s.grams,salsa:true},mac:mac,auto:true});
    });
    return {kcal:r0(kcal),p:r0(p),c:r0(c),g:r0(g),lines:lines};
  }
  window.showTab=function(id){
    ['dia','salsas','reportes'].forEach(function(t){
      document.getElementById('tab-'+t).classList.toggle('hidden',t!==id);
      document.querySelector('.tab[data-t="'+t+'"]').classList.toggle('on',t===id);
    });
    if(id==='salsas') renderSalsas();
    if(id==='dia') renderMeals();
  };
  function renderKPIs(){
    const day=document.getElementById('day').value||today();
    const t=dayTotals(day);
    document.getElementById('kpis').innerHTML='<div class="kpi"><div class="v">'+t.kcal+'</div><div class="l">kcal</div></div><div class="kpi"><div class="v">'+t.p+' g</div><div class="l">Proteína</div></div><div class="kpi"><div class="v">'+t.c+' g</div><div class="l">Carbos</div></div>';
  }
  function renderMeals(){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    const box=document.getElementById('meals-list');
    const t=dayTotals(day);
    if(!t.lines.length) box.innerHTML='<p class="muted">Sin comidas registradas.</p>';
    else box.innerHTML=t.lines.map(function(L){
      const m=L.m, mac=L.mac;
      let label=m.name;
      if(m.salsa||m.byGram) label+=' ('+r0(m.grams||m.qty)+' g)';
      else if(m.id&&FOODS.find(f=>f.id===m.id&&f.pct)) label+=' ('+(m.qty||100)+'%)';
      else if(m.qty&&m.qty!=1) label+=' × '+m.qty;
      if(L.auto) label+=' · salsas';
      let del='';
      if(!L.auto){ const realIdx=d.meals.findIndex(x=>x===m||(x.id===m.id&&x.qty===m.qty&&x.name===m.name)); if(realIdx>=0) del='<button type="button" class="btn btn-ghost" onclick="delMeal('+realIdx+')">✕</button>'; }
      return '<div class="item"><div><b>'+label+'</b><div class="muted">'+r0(mac.kcal)+' kcal | '+r0(mac.p)+' g P | '+r0(mac.c)+' g C | '+r0(mac.g)+' g G</div></div>'+del+'</div>';
    }).join('');
    document.getElementById('food-quick').innerHTML=FOODS.map(function(f){
      const hint=f.byGram?'por gramos':(f.pct?'por %':'cantidad');
      return '<button type="button" class="food-btn" onclick="addFood(\''+f.id+'\')"><b>'+f.name+'</b><div class="muted">'+f.cat+' · '+hint+'</div></button>';
    }).join('');
    renderKPIs();
  }
  window.addFood=function(id){
    const f=FOODS.find(x=>x.id===id); if(!f) return;
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    let qty=1;
    if(f.byGram){
      const v=prompt('Gramos de '+f.name+' (ej. 100)','100');
      if(v==null||v==='') return; qty=num(v);
      d.meals.push({id:f.id,name:f.name,qty:qty,grams:qty,byGram:true});
    } else if(f.pct){
      const v=prompt('Porcentaje de panqueca (ej. 70 o 100)','100');
      if(v==null||v==='') return; qty=num(v)||100;
      d.meals.push({id:f.id,name:f.name,qty:qty});
    } else {
      const v=prompt('Cantidad de '+f.name+' (ej. 1)','1');
      if(v==null||v==='') return; qty=num(v)||1;
      d.meals.push({id:f.id,name:f.name,qty:qty});
    }
    persist(); renderMeals(); toast('Agregado · guardado');
  };
  window.delMeal=function(i){ const day=document.getElementById('day').value||today(); ensure(day).meals.splice(i,1); persist(); renderMeals(); };
  window.openCustom=function(){
    const name=prompt('Nombre del alimento'); if(!name) return;
    const kcal=prompt('kcal','0'); const p=prompt('Proteína g','0'); const c=prompt('Carbos g','0'); const g=prompt('Grasas g','0');
    ensure(document.getElementById('day').value||today()).meals.push({custom:true,name:name,kcal:num(kcal),p:num(p),c:num(c),g:num(g),qty:1});
    persist(); renderMeals();
  };
  function renderSalsas(){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    document.getElementById('salsa-list').innerHTML=(d.pots||[]).map(function(p,i){
      return '<div class="salsa-row"><div><label>Salsa</label><input value="'+String(p.name).replace(/"/g,'&quot;')+'" onchange="updPot('+i+',\'name\',this.value)"></div><div><label>Peso (g)</label><input type="number" step="1" value="'+(p.weight===''||p.weight==null?'':p.weight)+'" onchange="updPot('+i+',\'weight\',this.value)"></div><button type="button" class="btn btn-ghost" onclick="delPot('+i+')">✕</button></div>';
    }).join('')||'<p class="muted">Sin salsas.</p>';
    const sc=salsaConsumo(day);
    document.getElementById('salsa-consumo').innerHTML=sc.map(function(s){
      const label=s.name+(s.idx?(' #'+(s.idx+1)):'');
      if(s.missing) return '<div class="item"><div><b>'+label+'</b><div class="muted">Falta peso hoy o ayer</div></div></div>';
      if(!s.grams) return '<div class="item"><div><b>'+label+'</b><div class="muted">sin consumo ('+r0(s.prev)+'g → '+r0(s.cur)+'g)</div></div></div>';
      const mac=per100Macros(s.name,s.grams);
      return '<div class="item"><div><b>'+label+': '+r0(s.grams)+' g</b><div class="muted">'+r0(s.prev)+'g → '+r0(s.cur)+'g · '+r0(mac.kcal)+' kcal</div></div></div>';
    }).join('')||'<p class="muted">Sin datos.</p>';
    renderKPIs();
  }
  window.updPot=function(i,field,val){
    const d=ensure(document.getElementById('day').value||today());
    if(!d.pots[i]) return;
    if(field==='weight') d.pots[i].weight=(val===''?'':num(val)); else d.pots[i][field]=val;
    persist();
  };
  window.delPot=function(i){ ensure(document.getElementById('day').value||today()).pots.splice(i,1); persist(); renderSalsas(); };
  window.addSalsaPot=function(){
    const name=document.getElementById('salsa-add-name').value;
    ensure(document.getElementById('day').value||today()).pots.push({id:'s'+Date.now(),name:name,weight:''});
    persist(); renderSalsas();
  };
  window.saveSalsas=function(){
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    document.querySelectorAll('#salsa-list .salsa-row').forEach(function(row,i){
      if(!d.pots[i]) return;
      const inputs=row.querySelectorAll('input');
      if(inputs[0]) d.pots[i].name=inputs[0].value;
      if(inputs[1]) d.pots[i].weight=inputs[1].value===''?'':num(inputs[1].value);
    });
    persist(); renderSalsas(); renderMeals(); toast('Salsas guardadas ✓');
  };
  window.saveDay=function(){ try{saveSalsas();}catch(e){persist();} toast('Día guardado ✓'); };
  window.copyAlimentos=function(){
    persist();
    const day=document.getElementById('day').value||today();
    const t=dayTotals(day);
    let msg='REGISTRO DE ALIMENTOS Y MACROS\n\n';
    t.lines.forEach(function(L){
      const m=L.m, mac=L.mac; let label=m.name;
      if(m.salsa||m.byGram) label+=' ('+r0(m.grams||m.qty)+' g)';
      else if(m.id&&FOODS.find(f=>f.id===m.id&&f.pct)) label+=' ('+(m.qty||100)+'%)';
      else if(m.qty&&m.qty!=1&&!m.custom) label+=' ('+m.qty+')';
      msg+='• '+label+': '+r0(mac.kcal)+' kcal | '+r0(mac.p)+' g P | '+r0(mac.c)+' g C | '+r0(mac.g)+' g G\n';
    });
    msg+='\n------------------------------\n'+fmtDM(day)+'\nCalorías: '+t.kcal+' kcal\nProteínas: '+t.p+' g\nCarbohidratos: '+t.c+' g\nGrasas: '+t.g+' g';
    copyText(msg);
  };
  window.copyConsumoSalsas=function(){
    persist();
    const day=document.getElementById('day').value||today();
    const sc=salsaConsumo(day);
    let msg='Consumo salsas '+fmtShort(day)+'\n';
    sc.forEach(function(s){
      const label=s.name+(s.idx?(' #'+(s.idx+1)):'');
      if(s.missing) msg+=label+': (sin datos)\n';
      else if(!s.grams) msg+=label+': sin consumo\n';
      else msg+=label+' '+r0(s.prev)+'g -'+r0(s.grams)+'g: '+r0(s.grams)+'g\n';
    });
    copyText(msg.trim());
  };
  window.copyCierreSalsas=function(){
    persist();
    const day=document.getElementById('day').value||today();
    const d=ensure(day);
    let msg='Cierre salsas '+fmtShort(day)+'\n';
    (d.pots||[]).forEach(function(p){ msg+=p.name+' '+(p.weight===''||p.weight==null?'—':(r0(num(p.weight))+'g'))+'\n'; });
    copyText(msg.trim());
  };
  function copyText(t){ if(navigator.clipboard) navigator.clipboard.writeText(t).then(()=>toast('Copiado ✓')).catch(()=>prompt('Copia',t)); else prompt('Copia',t); }
  window.setRange=function(n){
    const to=today(); const d=new Date(to+'T12:00:00'); d.setDate(d.getDate()-(n-1));
    document.getElementById('r-from').value=d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
    document.getElementById('r-to').value=to;
  };
  function daysInRange(from,to){
    const out=[]; if(!from||!to) return out;
    let d=new Date(from+'T12:00:00'); const end=new Date(to+'T12:00:00');
    while(d<=end){ out.push(d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0')); d.setDate(d.getDate()+1); }
    return out;
  }
  let chart;
  window.renderReport=function(){
    const from=document.getElementById('r-from').value, to=document.getElementById('r-to').value;
    const days=daysInRange(from,to);
    const rows=days.map(day=>({day,t:dayTotals(day)}));
    const withData=rows.filter(r=>r.t.kcal>0); const n=withData.length||1;
    const sum={kcal:0,p:0,c:0,g:0}; withData.forEach(r=>{sum.kcal+=r.t.kcal;sum.p+=r.t.p;sum.c+=r.t.c;sum.g+=r.t.g;});
    const avg={kcal:r0(sum.kcal/n),p:r0(sum.p/n),c:r0(sum.c/n),g:r0(sum.g/n)};
    let maxK=withData[0],minK=withData[0],maxP=withData[0],minP=withData[0];
    withData.forEach(r=>{ if(!maxK||r.t.kcal>maxK.t.kcal)maxK=r; if(!minK||r.t.kcal<minK.t.kcal)minK=r; if(!maxP||r.t.p>maxP.t.p)maxP=r; if(!minP||r.t.p<minP.t.p)minP=r; });
    let html='<div class="sec" style="margin-top:0">Resumen '+fmtDM(from)+' → '+fmtDM(to)+'</div>';
    html+='<div class="grid2"><div class="kpi"><div class="v">'+avg.kcal+'</div><div class="l">kcal prom.</div></div><div class="kpi"><div class="v">'+avg.p+' g</div><div class="l">P prom.</div></div><div class="kpi"><div class="v">'+avg.c+' g</div><div class="l">C prom.</div></div><div class="kpi"><div class="v">'+avg.g+' g</div><div class="l">G prom.</div></div></div>';
    if(withData.length){ html+='<p class="muted" style="margin-top:.75rem">Máx kcal: <b>'+maxK.t.kcal+'</b> ('+fmtDM(maxK.day)+') · Mín kcal: <b>'+minK.t.kcal+'</b> ('+fmtDM(minK.day)+')</p><p class="muted">Máx proteína: <b>'+maxP.t.p+' g</b> ('+fmtDM(maxP.day)+') · Mín proteína: <b>'+minP.t.p+' g</b> ('+fmtDM(minP.day)+')</p>'; }
    html+='<div class="sec">Por día</div><div style="overflow-x:auto"><table style="width:100%;font-size:.8rem;border-collapse:collapse"><tr style="color:#c4b5d4;text-align:left"><th style="padding:.35rem">Día</th><th>kcal</th><th>P</th><th>C</th><th>G</th></tr>';
    rows.forEach(r=>{ html+='<tr style="border-top:1px solid rgba(244,114,182,.15)"><td style="padding:.35rem">'+fmtDM(r.day)+'</td><td>'+r.t.kcal+'</td><td>'+r.t.p+'</td><td>'+r.t.c+'</td><td>'+r.t.g+'</td></tr>'; });
    html+='</table></div>';
    document.getElementById('report-box').innerHTML=html;
    if(chart) chart.destroy();
    chart=new Chart(document.getElementById('chart-kcal'),{type:'bar',data:{labels:rows.map(r=>r.day.slice(5)),datasets:[{label:'kcal',data:rows.map(r=>r.t.kcal),backgroundColor:'rgba(236,72,153,.55)'},{label:'Proteína',data:rows.map(r=>r.t.p),backgroundColor:'rgba(167,139,250,.55)'}]},options:{plugins:{legend:{labels:{color:'#c4b5d4'}}},scales:{x:{ticks:{color:'#c4b5d4'}},y:{ticks:{color:'#c4b5d4'},grid:{color:'rgba(255,255,255,.06)'}}}}});
  };
  window.exportPDF=function(){
    const from=document.getElementById('r-from').value, to=document.getElementById('r-to').value;
    if(!from||!to){alert('Elige rango');return;}
    const days=daysInRange(from,to);
    const rows=days.map(day=>({day,t:dayTotals(day)}));
    const withData=rows.filter(r=>r.t.kcal>0); const n=withData.length||1;
    const sum={kcal:0,p:0,c:0,g:0}; withData.forEach(r=>{sum.kcal+=r.t.kcal;sum.p+=r.t.p;sum.c+=r.t.c;sum.g+=r.t.g;});
    try{
      const {jsPDF}=window.jspdf; const doc=new jsPDF({unit:'pt',format:'a4'});
      const purple=[124,58,160], pink=[236,72,153], lilac=[248,244,255];
      doc.setFillColor(...lilac); doc.rect(0,0,595,70,'F');
      doc.setFillColor(...purple); doc.roundedRect(40,22,220,18,9,9,'F');
      doc.setFont('helvetica','bold'); doc.setFontSize(8); doc.setTextColor(255,255,255);
      doc.text(('Macros Martín · '+fmtDM(from)+' → '+fmtDM(to)).toUpperCase(),50,34);
      doc.setFillColor(...pink); doc.roundedRect(40,46,100,16,8,8,'F');
      doc.setFontSize(9); doc.text('Reporte',52,57);
      doc.autoTable({startY:90,head:[['kcal prom.','P','C','G']],body:[[Math.round(sum.kcal/n),Math.round(sum.p/n)+' g',Math.round(sum.c/n)+' g',Math.round(sum.g/n)+' g']],headStyles:{fillColor:lilac,textColor:purple},margin:{left:40,right:40}});
      doc.autoTable({startY:doc.lastAutoTable.finalY+12,head:[['Día','kcal','P','C','G']],body:rows.map(r=>[fmtDM(r.day),r.t.kcal,r.t.p,r.t.c,r.t.g]),headStyles:{fillColor:lilac,textColor:purple},margin:{left:40,right:40}});
      doc.save('macros_martin_'+from+'_'+to+'.pdf');
    }catch(e){console.error(e);alert('Error PDF');}
  };
  document.getElementById('day').value=today();
  document.getElementById('day').addEventListener('change',function(){renderMeals();renderSalsas();});
  document.getElementById('r-to').value=today();
  setRange(7);
  renderMeals();
})();
