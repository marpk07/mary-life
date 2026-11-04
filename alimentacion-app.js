(async function(){
  try {
    var b='';
    for (var i=0;i<10;i++) {
      var r=await fetch('alim-b64-'+i+'.txt?v=20261104s2');
      b+=await r.text();
    }
    (0,eval)(atob(b));
  } catch(e) {
    console.error(e);
    var el=document.getElementById('sync'); if(el) el.textContent='Error cargando alimentación';
  }
})();
