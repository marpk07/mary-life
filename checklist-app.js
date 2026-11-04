(async function(){
  try {
    window.__CL='';
    for (var i=0;i<9;i++) {
      await new Promise(function(res,rej){
        var s=document.createElement('script');
        s.src='cl-chunk-'+i+'.js?v=20261104e';
        s.onload=res; s.onerror=function(){rej(new Error('chunk '+i));};
        document.head.appendChild(s);
      });
    }
    (0,eval)(window.__CL);
    delete window.__CL;
  } catch(e) {
    console.error(e);
    var el=document.getElementById('sync'); if(el) el.textContent='Error cargando checklist';
  }
})();
