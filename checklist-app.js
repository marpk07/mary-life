(async function(){
  try{
    var b='';
    for(var i=0;i<6;i++){
      var r=await fetch('checklist-b64-'+i+'.txt?v=20261104b');
      b+=await r.text();
    }
    (0,eval)(atob(b));
  }catch(e){
    console.error(e);
    var s=document.getElementById('sync'); if(s) s.textContent='Error cargando checklist';
  }
})();
