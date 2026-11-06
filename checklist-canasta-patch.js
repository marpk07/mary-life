/* Canasta blanca v3: inject, marks, WhatsApp */
(function(){
  var CANASTA = 'Colocar canasta blanca';
  var PEOPLE = ['Valery','Laura','Mary'];
  var ICONS = {ok:'✅',partial:'☑️',martin:'👱',post:'*️⃣'};
  var CYCLE = ['','ok','partial','martin','post'];

  function getStore(){
    try{
      var r=localStorage.getItem('MARY_CHECKLIST_V1');
      return r?JSON.parse(r):null;
    }catch(e){ return null; }
  }
  function saveStore(store){
    try{
      store.updatedAt=Date.now();
      localStorage.setItem('MARY_CHECKLIST_V1', JSON.stringify(store));
    }catch(e){}
  }
  function today(){
    var d=new Date();
    return d.getFullYear()+'-'+String(d.getMonth()+1).padStart(2,'0')+'-'+String(d.getDate()).padStart(2,'0');
  }
  function currentDay(){
    var el=document.getElementById('day');
    return (el&&el.value)||today();
  }
  function findOficinaItem(store, day){
    if(!store||!store.days||!store.days[day]) return null;
    var d=store.days[day];
    var groups=d.groups||[];
    for(var gi=0;gi<groups.length;gi++){
      var items=groups[gi].items||[];
      for(var ii=0;ii<items.length;ii++){
        var n=(items[ii].name||'');
        if(n==='Oficina' || n.indexOf('Oficina')>=0) return items[ii];
      }
    }
    return null;
  }
  function ensureSubs(item){
    if(!item.subs) item.subs={};
    if(!item.subs[CANASTA]) item.subs[CANASTA]={Valery:'',Laura:'',Mary:''};
    return item.subs[CANASTA];
  }
  function cycleMark(person){
    var store=getStore();
    var day=currentDay();
    var item=findOficinaItem(store, day);
    if(!item){ alert('No encontré Oficina en el día. Carga una plantilla con Oficina.'); return; }
    var marks=ensureSubs(item);
    var cur=marks[person]||'';
    var idx=CYCLE.indexOf(cur);
    marks[person]=CYCLE[(idx+1)%CYCLE.length];
    saveStore(store);
    // Also call native if available so cloud sync happens
    if(typeof window.cycleSub==='function'){
      try{
        // Find item id
        var id=item.id;
        if(id) window.cycleSub(id, CANASTA, person);
      }catch(e){}
    }
    inject(true);
  }
  function inject(force){
    var lists=document.querySelectorAll('#day-list .sub-list');
    lists.forEach(function(list){
      var prev=list.previousElementSibling;
      if(!prev||!prev.classList.contains('item-row')) return;
      var nameEl=prev.querySelector('.item-name');
      if(!nameEl) return;
      if((nameEl.textContent||'').indexOf('Oficina')<0) return;

      var existing=list.querySelector('[data-canasta="1"]');
      if(existing && !force) return;
      if(existing) existing.remove();

      var store=getStore();
      var item=findOficinaItem(store, currentDay());
      var marks=item?ensureSubs(item):{Valery:'',Laura:'',Mary:''};

      var row=document.createElement('div');
      row.className='sub-item';
      row.setAttribute('data-canasta','1');
      var span=document.createElement('span');
      span.textContent=CANASTA;
      row.appendChild(span);
      var marksDiv=document.createElement('div');
      marksDiv.className='marks';
      PEOPLE.forEach(function(p){
        var val=marks[p]||'';
        var mk=document.createElement('div');
        mk.className='mk'+(val?(' on-'+val):'');
        mk.style.cssText='width:28px;height:28px;font-size:.8rem';
        mk.textContent=ICONS[val]||'';
        mk.title=p;
        mk.onclick=function(ev){
          ev.stopPropagation();
          cycleMark(p);
        };
        marksDiv.appendChild(mk);
      });
      row.appendChild(marksDiv);

      var children=list.children;
      var inserted=false;
      for(var i=0;i<children.length;i++){
        var txt=(children[i].textContent||'').toLowerCase();
        if(txt.indexOf('nootr')>=0||txt.indexOf('repisa')>=0||txt.indexOf('suplement')>=0){
          list.insertBefore(row, children[i]);
          inserted=true;
          break;
        }
      }
      if(!inserted){
        if(children.length>=3) list.insertBefore(row, children[3]);
        else list.insertBefore(row, children[0]||null);
      }
    });
  }

  // Patch buildMsg / copy to include canasta if missing from SUBS
  // cycleSub already stores in item.subs so copyWhatsApp should pick it up if expandAll uses item.subs

  var obs=new MutationObserver(function(){ inject(false); });
  function start(){
    var root=document.getElementById('day-list');
    if(root) obs.observe(root,{childList:true,subtree:true});
    inject(false);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 700); });
  else setTimeout(start, 700);
})();
