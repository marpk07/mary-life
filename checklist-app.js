(function(){
  var n = 7;
  var parts = new Array(n);
  var done = 0;
  function tryRun(){
    if(done < n) return;
    try {
      var code = atob(parts.join(''));
      (0, eval)(code);
    } catch(e) {
      console.error(e);
      var el = document.getElementById('sync');
      if(el) el.textContent = 'Error: ' + e.message;
    }
  }
  for (var i = 0; i < n; i++) {
    (function(i){
      fetch('cb64-'+i+'.txt?v=fix6').then(function(r){
        if(!r.ok) throw new Error('part '+i+' '+r.status);
        return r.text();
      }).then(function(t){ parts[i]=t.trim(); done++; tryRun(); })
      .catch(function(e){
        console.error(e);
        var el = document.getElementById('sync');
        if(el) el.textContent = 'Error: ' + e.message;
      });
    })(i);
  }
})();
