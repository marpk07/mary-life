/* MARY alimentación · parche salsas v2 (base por pote + editar comidas) */
(function(){
  function num(v){var n=parseFloat(String(v).replace(',','.'));return isNaN(n)?0:n;}
  function toast(m){var t=document.getElementById('toast');if(!t)return;t.textContent=m;t.style.display='block';setTimeout(function(){t.style.display='none';},1800);}
  function dayEl(){return document.getElementById('day');}
  function today(){var d=new Date();return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');}
  function getStore(){
    try{var r=localStorage.getItem('MARY_ALIM_MARTIN_V1');if(r){var p=JSON.parse(r);if(p&&p.days)return p;}}catch(e){}
    return {days:{},updatedAt:null};
  }
  function saveStore(store){
    try{localStorage.setItem('MARY_ALIM_MARTIN_V1',JSON.stringify(store));}catch(e){}
  }
  function ensure(store, day){
    if(!store.days[day]) store.days[day]={meals:[],pots:[],note:''};
    var d=store.days[day]; if(!d.meals)d.meals=[]; if(!d.pots)d.pots=[];
    return d;
  }

  function enhanceSalsaUI(){
    var list=document.getElementById('salsa-list'); if(!list) return;
    var cards=list.querySelectorAll('.salsa-card');
    var day=dayEl()?dayEl().value:today();
    var store=getStore();
    var d=ensure(store, day);
    cards.forEach(function(card,i){
      if(card.querySelector('[data-base-field]')) return;
      var pot=d.pots[i]; if(!pot) return;
      var weights=card.querySelector('.salsa-weights'); if(!weights) return;
      var baseVal=(pot.base===''||pot.base==null)?'':pot.base;
      var div=document.createElement('div');
      div.innerHTML='<label>Base (ayer o al abrir)</label><input type="number" step="1" data-base-field="1" value="'+baseVal+'" placeholder="ej. 408">';
      weights.insertBefore(div, weights.firstChild);
      var inp=div.querySelector('input');
      inp.addEventListener('change', function(){
        var store2=getStore(); var d2=ensure(store2, dayEl().value||today());
        if(!d2.pots[i]) return;
        d2.pots[i].base=inp.value===''?'':num(inp.value);
        store2.updatedAt=Date.now();
        saveStore(store2);
        applyBaseAsPrevHack();
        toast('Base guardada');
      });
    });
  }

  function patchSave(){
    if(!window.saveSalsas || window.saveSalsas.__patched) return;
    var orig=window.saveSalsas;
    window.saveSalsas=function(){
      try{
        var day=dayEl().value||today();
        var store=getStore(); var d=ensure(store, day);
        document.querySelectorAll('#salsa-list .salsa-card').forEach(function(row,i){
          if(!d.pots[i]) return;
          var baseInp=row.querySelector('[data-base-field]');
          if(baseInp) d.pots[i].base=baseInp.value===''?'':num(baseInp.value);
        });
        store.updatedAt=Date.now();
        saveStore(store);
        applyBaseAsPrevHack();
      }catch(e){console.warn(e);}
      return orig.apply(this, arguments);
    };
    window.saveSalsas.__patched=true;
  }

  function patchAddPot(){
    if(!window.addSalsaPot || window.addSalsaPot.__patched) return;
    var orig=window.addSalsaPot;
    window.addSalsaPot=function(){
      var nameEl=document.getElementById('salsa-add-name');
      var name=nameEl?nameEl.value:'Hershey';
      var b=prompt('Base de este pote (g). Si es nueva abierta hoy: peso al abrir (ej. 408). Si viene de ayer: deja vacío.','');
      var day=dayEl().value||today();
      var store=getStore(); var d=ensure(store, day);
      var pot={id:'s'+Date.now(),name:name,weight:'',mid:'',base:''};
      if(b!==null&&b!=='') pot.base=num(b);
      d.pots.push(pot);
      store.updatedAt=Date.now();
      saveStore(store);
      try{ orig.apply(this, arguments); }catch(e){}
      setTimeout(function(){
        var store2=getStore(); var d2=ensure(store2, day);
        if(d2.pots.length){
          var last=d2.pots[d2.pots.length-1];
          if(last && last.name===name && (last.base===''||last.base==null) && pot.base!=='') last.base=pot.base;
          saveStore(store2);
        }
        applyBaseAsPrevHack();
        enhanceSalsaUI();
      }, 150);
    };
    window.addSalsaPot.__patched=true;
  }

  function patchAddFood(){
    if(!window.addFood || window.addFood.__patched) return;
    var orig=window.addFood;
    window.addFood=function(id){
      var day=dayEl().value||today();
      var store=getStore(); var d=ensure(store, day);
      var existing=d.meals.findIndex(function(m){return m.id===id && !m.custom;});
      if(existing>=0){
        var cur=d.meals[existing];
        var isPct=id==='panqueca100';
        var isGram=!!cur.byGram;
        var def=isPct?String(cur.qty||100):(isGram?String(cur.grams||cur.qty||0):String(cur.qty||1));
        var name=cur.name||id;
        var v=prompt(name+' ya está. Nueva cantidad total:', def);
        if(v==null||v==='') return;
        var qty=num(v);
        if(isGram) d.meals[existing]={id:id,name:name,qty:qty,grams:qty,byGram:true};
        else if(isPct) d.meals[existing]={id:id,name:name,qty:qty||100};
        else d.meals[existing]={id:id,name:name,qty:qty||1};
        store.updatedAt=Date.now();
        saveStore(store);
        toast('Actualizado');
        setTimeout(function(){ location.reload(); }, 400);
        return;
      }
      return orig.apply(this, arguments);
    };
    window.addFood.__patched=true;
  }

  function applyBaseAsPrevHack(){
    var day=dayEl()?dayEl().value:today();
    var store=getStore();
    var d=ensure(store, day);
    var dt=new Date(day+'T12:00:00'); dt.setDate(dt.getDate()-1);
    var prev=dt.getFullYear()+'-'+String(dt.getMonth()+1).padStart(2,'0')+'-'+String(dt.getDate()).padStart(2,'0');
    var pd=ensure(store, prev);
    var byName={};
    (pd.pots||[]).forEach(function(p){ if(!byName[p.name]) byName[p.name]=[]; byName[p.name].push(p); });
    var counts={};
    (d.pots||[]).forEach(function(p){
      if(p.base===''||p.base==null) return;
      if(!counts[p.name]) counts[p.name]=0;
      var idx=counts[p.name]++;
      if(!byName[p.name]) byName[p.name]=[];
      while(byName[p.name].length<=idx){
        byName[p.name].push({id:'h'+Date.now()+idx,name:p.name,weight:'',mid:''});
      }
      byName[p.name][idx].weight=num(p.base);
    });
    var names=[];
    (pd.pots||[]).forEach(function(p){ if(names.indexOf(p.name)<0) names.push(p.name); });
    (d.pots||[]).forEach(function(p){ if(names.indexOf(p.name)<0) names.push(p.name); });
    var newPrev=[];
    names.forEach(function(name){ (byName[name]||[]).forEach(function(p){ newPrev.push(p); }); });
    if(newPrev.length){ pd.pots=newPrev; saveStore(store); }
  }

  function hookShowTab(){
    if(!window.showTab || window.showTab.__patched) return;
    var orig=window.showTab;
    window.showTab=function(id){
      var r=orig.apply(this, arguments);
      if(id==='salsas'){
        setTimeout(function(){ enhanceSalsaUI(); applyBaseAsPrevHack(); }, 50);
      }
      return r;
    };
    window.showTab.__patched=true;
  }

  function boot(){
    patchSave(); patchAddPot(); patchAddFood(); hookShowTab();
    setTimeout(function(){ enhanceSalsaUI(); }, 800);
    setTimeout(function(){ enhanceSalsaUI(); }, 2000);
  }

  if(document.readyState==='complete') setTimeout(boot, 600);
  else window.addEventListener('load', function(){ setTimeout(boot, 600); });
})();
