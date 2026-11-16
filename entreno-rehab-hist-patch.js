(function(){
  function boot(){
    if(typeof window.viewSession !== 'function'){ setTimeout(boot, 80); return; }
    window.refreshHistory = function(){
      var box = document.getElementById('history-body');
      if(!box) return;
      var raw = localStorage.getItem('mary_entreno_rehab_v1');
      var data = raw ? JSON.parse(raw) : {sessions:[]};
      var fromEl = document.getElementById('hist-from');
      var toEl = document.getElementById('hist-to');
      var from = (fromEl && fromEl.value) || '';
      var to = (toEl && toEl.value) || '';
      var list = (data.sessions || []).slice();
      if(from) list = list.filter(function(s){ return s.date >= from; });
      if(to) list = list.filter(function(s){ return s.date <= to; });
      if(!list.length){
        box.innerHTML = '<p class="muted">' + ((data.sessions||[]).length ? 'No hay sesiones en ese rango.' : 'Aún no hay sesiones.') + '</p>';
        return;
      }
      var h = '';
      list.slice(0, 60).forEach(function(s){
        h += '<div class="glass pad hist-card">';
        h += '<div class="row-between"><b>' + s.title + '</b><span class="muted">' + s.date + '</span></div>';
        var bits = [];
        if(s.durationMin) bits.push(s.durationMin + ' min');
        if(s.kcal) bits.push(s.kcal + ' kcal');
        if(s.effort) bits.push('Esf. ' + s.effort);
        if(s.pain !== '' && s.pain != null) bits.push('Dolor ' + s.pain + '/10');
        if(bits.length) h += '<div class="muted">' + bits.join(' · ') + '</div>';
        h += '<div class="timer-row" style="margin-top:.4rem">';
        h += '<button type="button" class="btn btn-ghost btn-sm" onclick="viewSession(\'' + s.id + '\')">Ver</button>';
        h += '<button type="button" class="btn btn-ghost btn-sm" onclick="deleteSessionER(\'' + s.id + '\')">Borrar</button>';
        h += '</div></div>';
      });
      box.innerHTML = h;
    };
    window.deleteSessionER = function(id){
      if(!confirm('¿Borrar esta sesión?')) return;
      var raw = localStorage.getItem('mary_entreno_rehab_v1');
      var data = raw ? JSON.parse(raw) : {sessions:[]};
      data.sessions = (data.sessions || []).filter(function(s){ return s.id !== id; });
      data.updatedAt = Date.now();
      localStorage.setItem('mary_entreno_rehab_v1', JSON.stringify(data));
      window.refreshHistory();
    };
    var _show = window.showTab;
    window.showTab = function(tab){
      _show(tab);
      if(tab === 'history') setTimeout(function(){ window.refreshHistory(); }, 40);
    };
  }
  boot();
})();
