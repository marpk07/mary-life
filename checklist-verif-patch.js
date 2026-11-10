/* Checklist patch — gel inodoro + espejo baño en Verificación */
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

  function ensureItemsInDay(store, day) {
    if (!store || !store.days || !store.days[day]) return false;
    var d = store.days[day];
    if (!d.groups) return false;
    var changed = false;
    d.groups.forEach(function (g) {
      var title = (g.title || '').toLowerCase();
      if (title.indexOf('verific') < 0) return;
      if (!g.items) g.items = [];
      EXTRA.forEach(function (name) {
        var exists = g.items.some(function (it) {
          return (it.name || it) === name;
        });
        if (!exists) {
          g.items.push({
            id: 'v' + Date.now() + Math.random().toString(36).slice(2, 6),
            name: name,
            mark: '',
            subs: {}
          });
          changed = true;
        }
      });
    });
    return changed;
  }

  function injectIntoCatalog() {
    // Si el core expone CATALOG / AREA_ITEMS, ampliar Verificación
    try {
      if (typeof window.CATALOG === 'object' && window.CATALOG) {
        if (!window.CATALOG['Verificación']) window.CATALOG['Verificación'] = [];
        EXTRA.forEach(function (n) {
          if (window.CATALOG['Verificación'].indexOf(n) < 0)
            window.CATALOG['Verificación'].push(n);
        });
      }
    } catch (e) {}
  }

  function apply() {
    injectIntoCatalog();
    var store = getStore();
    if (!store) return;
    var day = dayVal();
    if (ensureItemsInDay(store, day)) {
      saveStore(store);
      // re-render si existe
      if (typeof window.renderDay === 'function') window.renderDay();
      else if (typeof window.render === 'function') window.render();
      else if (typeof window.showTab === 'function') {
        /* force soft refresh by toggling */
      }
    }
  }

  // Tras cargar plantilla, también inyectar
  var _applyTemplate = window.applyTemplate;
  if (typeof _applyTemplate === 'function') {
    window.applyTemplate = function (day, tplId) {
      _applyTemplate(day, tplId);
      setTimeout(apply, 50);
    };
  }

  var _showTab = window.showTab;
  if (typeof _showTab === 'function') {
    window.showTab = function (id) {
      _showTab(id);
      if (id === 'hoy' || id === 'day' || !id) setTimeout(apply, 80);
    };
  }

  function start() {
    apply();
    var el = document.getElementById('day');
    if (el && !el._verifPatch) {
      el._verifPatch = true;
      el.addEventListener('change', function () {
        setTimeout(apply, 100);
      });
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 900);
    });
  else setTimeout(start, 900);
})();
