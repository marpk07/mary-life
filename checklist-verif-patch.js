/* Checklist: CSS original marcas + gel/espejo */
(function () {
  if (!document.getElementById('cl-mk-css')) {
    var s = document.createElement('style');
    s.id = 'cl-mk-css';
    s.textContent =
      '.item-row{display:grid;grid-template-columns:1fr auto;gap:.35rem;align-items:center;padding:.45rem .35rem;border-bottom:1px solid rgba(244,114,182,.1)}' +
      '.item-row:last-child{border-bottom:none}' +
      '.item-name{font-size:.82rem;line-height:1.3}' +
      '.marks{display:flex;gap:.25rem}' +
      '.mk{width:36px;height:36px;border-radius:10px;border:1px solid var(--border);background:rgba(255,255,255,.05);display:flex;align-items:center;justify-content:center;font-size:1rem;cursor:pointer;user-select:none}' +
      '.mk.on-ok{background:rgba(34,197,94,.25);border-color:rgba(34,197,94,.5)}' +
      '.mk.on-partial{background:rgba(148,163,184,.22);border-color:rgba(148,163,184,.45)}' +
      '.mk.on-martin{background:rgba(167,139,250,.25);border-color:rgba(167,139,250,.5)}' +
      '.mk.on-post{background:rgba(251,191,36,.2);border-color:rgba(251,191,36,.45)}' +
      '.person-lbl{font-size:.58rem;font-weight:800;color:var(--muted);text-align:center;margin-bottom:.15rem}' +
      '.group{border:1px solid var(--border);border-radius:14px;margin-bottom:.55rem;overflow:hidden;background:rgba(15,10,20,.3)}' +
      '.group-h{display:flex;align-items:center;justify-content:space-between;gap:.4rem;padding:.65rem .75rem;background:rgba(124,58,160,.25);cursor:pointer}' +
      '.group-h b{font-size:.85rem}' +
      '.group-body{padding:.35rem .55rem .55rem}' +
      '.sub-list{margin:.2rem 0 .35rem;padding-left:.5rem;border-left:2px solid rgba(244,114,182,.25)}' +
      '.sub-item{font-size:.78rem;padding:.3rem 0;display:flex;justify-content:space-between;align-items:center;gap:.3rem}' +
      '.sub-toggle{font-size:.72rem;color:var(--muted);cursor:pointer}' +
      '.tpl-card{border:1px solid var(--border);border-radius:14px;padding:.7rem;margin-bottom:.45rem;background:rgba(15,10,20,.35);cursor:pointer}' +
      '.tpl-card.on{border-color:rgba(244,114,182,.55);background:rgba(236,72,153,.12)}' +
      '.tpl-card b{display:block;font-size:.88rem}' +
      '.sug{padding:.35rem 0}' +
      '@media(max-width:560px){.mk{width:32px;height:32px;font-size:.9rem}}';
    document.head.appendChild(s);
  }

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
    if (!store || !store.days || !store.days[day]) return false;
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
    if (ensureExtraInDay(store, dayVal())) {
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
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 400);
    });
  else setTimeout(start, 400);
})();
