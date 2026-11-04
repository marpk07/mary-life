(function(){
  window.__ALIM=[];
  var i=0, n=16;
  function loadNext(){
    if(i>=n){
      var f=document.createElement('script');
      f.src='alims-final.js?v=fix3';
      document.head.appendChild(f);
      return;
    }
    var sc=document.createElement('script');
    sc.src='alims-'+i+'.js?v=fix3';
    sc.onload=function(){ i++; loadNext(); };
    sc.onerror=function(){ var el=document.getElementById('sync'); if(el) el.textContent='Error part '+i; };
    document.head.appendChild(sc);
  }
  loadNext();
})();
