/* Patch v3: Dulce de leche, editar cantidad, base de salsas clara */
(function(){
  var PER100_EXTRA = {
    'Dulce de leche': {kcal:335, p:6.4, c:62, g:7}
  };

  function num(v){ var n=parseFloat(String(v).replace(',','.')); return isNaN(n)?0:n; }
  function toast(m){ var t=document.getElementById('toast'); if(!t) return; t.textContent=m; t.style.display='block'; setTimeout(function(){ t.style.display='none'; }, 1800); }

  // Add Dulce de leche to select
  function ensureDulceOption(){
    var sel=document.getElementById('salsa-add-name');
    if(!sel) return;
    var found=false;
    for(var i=0;i<sel.options.length;i++){ if(sel.options[i].text==='Dulce de leche') found=true; }
    if(!found){
      var o=document.createElement('option');
      o.text='Dulce de leche'; o.value='Dulce de leche';
      sel.appendChild(o);
    }
  }

  // Improve help text
  function improveHelp(){
    var tab=document.getElementById('tab-salsas');
    if(!tab) return;
    var muted=tab.querySelector('.muted');
    if(muted && muted.textContent.indexOf('Base')>=0){
      muted.innerHTML='<b>Base hoy</b> = peso con el que <b>Martín empieza el día</b>. Si alguien (Valery, etc.) comió antes, pon el peso <b>actual</b> al empezar, no el de ayer. Si el pote sigue igual que ayer, deja Base vacío. <b>Intermedio</b> (~11pm) · <b>Cierre</b> (~1am). Consumo = Base − peso. Puedes tener varios potes del mismo.';
    }
  }

  // Wrap addFood to allow editing existing by asking
  var _addFood = window.addFood;
  window.addFood = function(id){
    // Call original
    if(typeof _addFood==='function') return _addFood(id);
  };

  // Better edit: add edit buttons via DOM observer if missing
  function addEditButtons(){
    var list=document.getElementById('meals-list');
    if(!list) return;
    var items=list.querySelectorAll('.item');
    items.forEach(function(item, idx){
      if(item.querySelector('[data-edit-btn]')) return;
      // skip auto salsa lines
      if((item.textContent||'').indexOf('auto salsa')>=0) return;
      var row=item.querySelector('.row') || item;
      var btn=document.createElement('button');
      btn.type='button';
      btn.className='btn btn-ghost';
      btn.setAttribute('data-edit-btn','1');
      btn.textContent='✎';
      btn.style.cssText='padding:.25rem .5rem;font-size:.7rem;margin-left:.25rem';
      btn.onclick=function(ev){
        ev.stopPropagation();
        editMealByDom(item, idx);
      };
      // Find a place to put it
      var last=item.lastElementChild;
      if(last && last.classList && last.classList.contains('row')){
        last.appendChild(btn);
      } else {
        item.appendChild(btn);
      }
    });
  }

  function editMealByDom(itemEl, visualIdx){
    // Try window.editMeal if exists
    if(typeof window.editMeal==='function'){
      // Find real index - prompt for quantity based on label
      var label=(itemEl.querySelector('b')||itemEl).textContent||'';
      var name=label.replace(/\s*\(.*$/,'').trim();
      var qtyMatch=label.match(/\((\d+(?:[.,]\d+)?)\s*(g|%)?\)/);
      var cur=qtyMatch?qtyMatch[1]:'1';
      var unit=qtyMatch&&qtyMatch[2]?qtyMatch[2]:'';
      var msg=unit==='g'?('Gramos de '+name):(unit==='%'?('% de '+name):('Cantidad de '+name));
      var v=prompt(msg, cur);
      if(v==null||v==='') return;
      // Use del+add approach via prompts that user already knows
      // Better: find meal in store via localStorage
      try{
        var raw=localStorage.getItem('MARY_ALIM_MARTIN_V1');
        if(!raw){ toast('Sin datos locales'); return; }
        var store=JSON.parse(raw);
        var dayEl=document.getElementById('day');
        var day=dayEl?dayEl.value:null;
        if(!day||!store.days||!store.days[day]){ toast('Día no encontrado'); return; }
        var meals=store.days[day].meals||[];
        // Find matching meal by name
        var found=-1;
        for(var i=0;i<meals.length;i++){
          if((meals[i].name||'')===name || (meals[i].name||'').indexOf(name)>=0){ found=i; break; }
        }
        if(found<0){ toast('No encontré el alimento'); return; }
        var m=meals[found];
        var n=num(v);
        if(m.byGram||m.grams!=null){ m.qty=n; m.grams=n; }
        else if(m.id==='panqueca100'){ m.qty=n||100; }
        else { m.qty=n||1; }
        store.updatedAt=Date.now();
        localStorage.setItem('MARY_ALIM_MARTIN_V1', JSON.stringify(store));
        toast('Cantidad actualizada · recarga o cambia de día y vuelve');
        // Trigger re-render if possible
        if(typeof window.saveDay==='function'){
          // Force by changing day briefly
          var d=document.getElementById('day');
          if(d){ var v0=d.value; d.value=''; d.value=v0; d.dispatchEvent(new Event('change')); }
        }
        // Reload page section
        setTimeout(function(){ location.reload(); }, 600);
      }catch(e){ console.error(e); toast('Error al editar'); }
      return;
    }
    toast('Edición no disponible aún');
  }

  // Enhance addSalsaPot prompt if possible
  var _addSalsa = window.addSalsaPot;
  window.addSalsaPot = function(){
    ensureDulceOption();
    if(typeof _addSalsa==='function'){
      // Intercept by temporarily replacing prompt - too fragile
      return _addSalsa();
    }
  };

  // Observe meals list for edit buttons
  function start(){
    ensureDulceOption();
    improveHelp();
    addEditButtons();
    var root=document.getElementById('meals-list');
    if(root){
      var obs=new MutationObserver(function(){ addEditButtons(); });
      obs.observe(root,{childList:true,subtree:true});
    }
  }

  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 1000); });
  else setTimeout(start, 1000);
})();
