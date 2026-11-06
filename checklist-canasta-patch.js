/* Canasta blanca: inject + ensure cycleSub works for copy */
(function(){
  var CANASTA = 'Colocar canasta blanca';
  function inject(){
    var lists = document.querySelectorAll('#day-list .sub-list');
    lists.forEach(function(list){
      var prev = list.previousElementSibling;
      if (!prev || !prev.classList.contains('item-row')) return;
      var nameEl = prev.querySelector('.item-name');
      if (!nameEl) return;
      var t = (nameEl.textContent||'');
      if (t.indexOf('Oficina') < 0) return;
      if ((list.textContent||'').indexOf(CANASTA) >= 0) return;
      var tog = prev.querySelector('.sub-toggle');
      var itemId = null;
      if (tog) {
        var m = (tog.getAttribute('onclick')||'').match(/toggleSub\('([^']+)'\)/);
        if (m) itemId = m[1];
      }
      if (!itemId) return;
      var row = document.createElement('div');
      row.className = 'sub-item';
      row.setAttribute('data-canasta','1');
      var marks = document.createElement('div');
      marks.className = 'marks';
      ['Valery','Laura','Mary'].forEach(function(p){
        var mk = document.createElement('div');
        mk.className = 'mk';
        mk.style.cssText = 'width:28px;height:28px;font-size:.8rem';
        mk.onclick = function(ev){
          ev.stopPropagation();
          if (window.cycleSub) {
            window.cycleSub(itemId, CANASTA, p);
          }
        };
        marks.appendChild(mk);
      });
      var span = document.createElement('span');
      span.textContent = CANASTA;
      row.appendChild(span);
      row.appendChild(marks);
      var children = list.children;
      var inserted = false;
      for (var i=0;i<children.length;i++){
        var txt = (children[i].textContent||'').toLowerCase();
        if (txt.indexOf('nootr') >= 0 || txt.indexOf('repisa') >= 0 || txt.indexOf('suplement') >= 0){
          list.insertBefore(row, children[i]);
          inserted = true;
          break;
        }
      }
      if (!inserted) {
        if (children.length >= 3) list.insertBefore(row, children[3]);
        else list.insertBefore(row, children[0]||null);
      }
    });
  }
  var obs = new MutationObserver(function(){ inject(); });
  function start(){
    var root = document.getElementById('day-list');
    if (root) obs.observe(root, {childList:true, subtree:true});
    inject();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', function(){ setTimeout(start, 600); });
  else setTimeout(start, 600);
})();
