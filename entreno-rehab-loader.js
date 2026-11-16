(function(){
  function inject(code){
    var s=document.createElement('script');
    s.textContent=code;
    document.head.appendChild(s);
  }
  function loadPatch(){
    var s=document.createElement('script');
    s.src='entreno-rehab-hist-patch.js?v=7';
    document.head.appendChild(s);
  }
  var files = [
    'entreno-rehab-app.p1.js?v=7',
    'entreno-rehab-app.r0.js?v=7',
    'entreno-rehab-app.r1.js?v=7',
    'entreno-rehab-app.r2.js?v=7'
  ];
  Promise.all(files.map(function(u){ return fetch(u).then(function(r){ return r.text(); }); }))
    .then(function(parts){
      inject(parts.join(''));
      loadPatch();
    })
    .catch(function(e){
      console.error(e);
      document.getElementById('sync-status').textContent = 'Error cargando app';
    });
})();
