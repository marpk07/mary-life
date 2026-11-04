window.__ALIM=window.__ALIM||[];
(function(){
  try {
    var s=window.__ALIM.join('');
    delete window.__ALIM;
    (0,eval)(s);
  } catch(e) {
    console.error(e);
    var el=document.getElementById('sync'); if(el) el.textContent='Error: '+e.message;
  }
})();
