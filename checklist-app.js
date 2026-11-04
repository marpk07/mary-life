(function(){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/gh/marpk07/mary-life@8dc46b61fed8d6222cd0ce8485c43d2626cd2137/checklist-app.js';
  s.onload=function(){ console.log('checklist core loaded from CDN'); };
  s.onerror=function(){
    var el=document.getElementById('sync');
    if(el) el.textContent='Error cargando checklist';
  };
  document.head.appendChild(s);
})();
