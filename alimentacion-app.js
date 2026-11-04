(function(){
  var s=document.createElement('script');
  s.src='https://cdn.jsdelivr.net/gh/marpk07/mary-life@e4adffa63cf9861c7f32bad03ee4233f316cf492/alimentacion-app.js';
  s.onerror=function(){
    var el=document.getElementById('sync');
    if(el) el.textContent='Error cargando alimentación';
  };
  document.head.appendChild(s);
})();
