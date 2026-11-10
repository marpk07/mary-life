(function(){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/gh/marpk07/mary-life@8dc46b61fed8d6222cd0ce8485c43d2626cd2137/alimentacion-app.js';
  s.onload=function(){
    var p=document.createElement('script');
    p.src='alimentacion-patch.js?v=20';
    document.head.appendChild(p);
  };
  s.onerror=function(){
    var el=document.getElementById('sync');
    if(el) el.textContent='Error cargando alimentación';
  };
  document.head.appendChild(s);
})();
