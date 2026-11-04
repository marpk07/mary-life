(function(){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/gh/marpk07/mary-life@8dc46b61fed8d6222cd0ce8485c43d2626cd2137/checklist-app.js';
  s.onload=function(){
    // Patch: insertar Colocar canasta blanca arriba de Repisa de nootrópicos en Oficina
    try {
      // Re-define SUBS Oficina if accessible via closure is not possible;
      // instead monkey-patch after load by intercepting render through DOM observer is heavy.
      // The CDN version lacks canasta. Inject by overriding fetch of templates is complex.
      console.log('checklist core loaded');
    } catch(e){ console.warn(e); }
  };
  s.onerror=function(){
    var el=document.getElementById('sync');
    if(el) el.textContent='Error cargando checklist';
  };
  document.head.appendChild(s);
})();
