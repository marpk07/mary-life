(function(){
  function boot(){
    if(typeof window.viewSession !== 'function'){ setTimeout(boot, 80); return; }
    if(typeof window.refreshHistory !== 'function'){
      window.refreshHistory = function(){
        if(typeof window.showTab === 'function') window.showTab('history');
      };
    }
    window.deleteSessionER = function(id){
      if(typeof window.deleteSession === 'function') return window.deleteSession(id);
      if(!confirm('¿Borrar esta sesión?')) return;
      try {
        var raw = localStorage.getItem('mary_entreno_rehab_v1');
        var data = raw ? JSON.parse(raw) : {sessions:[]};
        data.sessions = (data.sessions || []).filter(function(s){ return s.id !== id; });
        data.updatedAt = Date.now();
        localStorage.setItem('mary_entreno_rehab_v1', JSON.stringify(data));
        if(window.refreshHistory) window.refreshHistory();
      } catch(e){ console.warn(e); }
    };
    var _show = window.showTab;
    if(_show && !_show._histPatched){
      window.showTab = function(tab){
        _show(tab);
        if(tab === 'history') setTimeout(function(){ if(window.refreshHistory) window.refreshHistory(); }, 30);
      };
      window.showTab._histPatched = true;
    }
  }
  boot();
})();
