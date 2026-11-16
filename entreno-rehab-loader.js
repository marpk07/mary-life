(function(){
  function loadScript(src, then){
    var s=document.createElement('script');
    s.src=src;
    s.onload=then;
    s.onerror=function(){ console.error('fail', src); };
    document.head.appendChild(s);
  }
  // Prefer single file if present and not placeholder
  fetch('entreno-rehab-app.js?v=5').then(function(r){ return r.text(); }).then(function(t){
    if(t && t.indexOf('TEMPLATES')>=0 && t.indexOf('PLACEHOLDER')<0 && t.indexOf('Cargando app completa')<0){
      var s=document.createElement('script'); s.textContent=t; document.head.appendChild(s);
      loadScript('entreno-rehab-hist-patch.js?v=5');
    } else {
      Promise.all([
        fetch('entreno-rehab-app.p1.js?v=5').then(function(r){return r.text();}),
        fetch('entreno-rehab-app.p2.js?v=5').then(function(r){return r.text();})
      ]).then(function(p){
        var s=document.createElement('script'); s.textContent=p[0]+p[1]; document.head.appendChild(s);
        loadScript('entreno-rehab-hist-patch.js?v=5');
      });
    }
  }).catch(function(e){ console.error(e); });
})();
