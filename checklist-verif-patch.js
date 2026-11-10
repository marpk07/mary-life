/* Checklist verif v2 — gel + espejo en Verificación */
(function () {
  var EXTRA = [
    'Verificar gel en el inodoro',
    'Verificar que el espejo del baño esté limpio'
  ];

  function getStore() {
    try {
      var r = localStorage.getItem('MARY_CHECKLIST_V1');
      return r ? JSON.parse(r) : null;
    } catch (e) {
      return null;
    }
  }
  function saveStore(store) {
    try {
      store.updatedAt = Date.now();
      localStorage.setItem('MARY_CHECKLIST_V1', JSON.stringify(store));
    } catch (e) {}
  }
  function today() {
    var d = new Date();
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }
  function dayVal() {
    var el = document.getElementById('day');
    return (el && el.value) || today();
  }

  function ensureExtraInDay(store, day) {
    if (!store) return false;
    if (!store.days) store.days = {};
    if (!store.days[day]) return false;
    var d = store.days[day];
    if (!d.groups) d.groups = [];
    var changed = false;
    var verif = null;
    for (var i = 0; i < d.groups.length; i++) {
      var t = (d.groups[i].title || '').toLowerCase();
      if (t.indexOf('verific') >= 0) {
        verif = d.groups[i];
        break;
      }
    }
    if (!verif && d.groups.length) {
      verif = { title: 'Verificación', items: [] };
      d.groups.push(verif);
      changed = true;
    }
    if (!verif) return false;
    if (!verif.items) verif.items = [];
    EXTRA.forEach(function (name) {
      var exists = verif.items.some(function (it) {
        return (it && (it.name || it)) === name;
      });
      if (!exists) {
        verif.items.push({
          id: 'vf' + Math.random().toString(36).slice(2, 9),
          name: name,
          mark: '',
          subs: {}
        });
        changed = true;
      }
    });
    return changed;
  }

  function refreshUI() {
    if (typeof window.renderHoy === 'function') window.renderHoy();
  }

  function apply() {
    var store = getStore();
    if (!store) return;
    var day = dayVal();
    if (ensureExtraInDay(store, day)) {
      saveStore(store);
      refreshUI();
    }
  }

  function hook() {
    if (typeof window.applyTemplate === 'function' && !window._verifHooked) {
      window._verifHooked = true;
      var orig = window.applyTemplate;
      window.applyTemplate = function (day, tplId) {
        orig(day, tplId);
        setTimeout(apply, 80);
      };
    }
    if (typeof window.showTab === 'function' && !window._verifShowTab) {
      window._verifShowTab = true;
      var st = window.showTab;
      window.showTab = function (id) {
        st(id);
        if (id === 'hoy') setTimeout(apply, 100);
      };
    }
  }

  function start() {
    hook();
    apply();
    var el = document.getElementById('day');
    if (el && !el._verif2) {
      el._verif2 = true;
      el.addEventListener('change', function () {
        setTimeout(apply, 120);
      });
    }
    setTimeout(hook, 600);
    setTimeout(apply, 800);
    setTimeout(apply, 1600);
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 500);
    });
  else setTimeout(start, 500);
})();
