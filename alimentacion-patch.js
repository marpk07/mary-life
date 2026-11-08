/* Patch v4 — Salsas simples: Inicio + Fin manual, etiqueta, sin depender del día anterior */
(function () {
  var PER100 = {
    Hershey: { kcal: 535, p: 7.5, c: 60, g: 30 },
    Miel: { kcal: 304, p: 0.3, c: 82.4, g: 0 },
    'Leche condensada tradicional': { kcal: 314, p: 8, c: 57, g: 6 },
    'Leche condensada La Lechera': { kcal: 321, p: 7.5, c: 54.9, g: 8 },
    Mayonesa: { kcal: 680, p: 1, c: 1, g: 75 },
    Nutella: { kcal: 542, p: 6.3, c: 58, g: 31 },
    'Dulce de leche': { kcal: 335, p: 6.4, c: 62, g: 7 },
    Cocada: { kcal: 323, p: 7, c: 51, g: 10 },
    Mantequilla: { kcal: 717, p: 0.85, c: 0.06, g: 81.1 },
    'Queso parmesano': { kcal: 431, p: 38, c: 4, g: 29 }
  };

  function num(v) {
    var n = parseFloat(String(v).replace(',', '.'));
    return isNaN(n) ? 0 : n;
  }
  function r0(n) {
    return Math.round(Number(n) || 0);
  }
  function toast(m) {
    var t = document.getElementById('toast');
    if (!t) return;
    t.textContent = m;
    t.style.display = 'block';
    setTimeout(function () {
      t.style.display = 'none';
    }, 1800);
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
  function loadStore() {
    try {
      var r = localStorage.getItem('MARY_ALIM_MARTIN_V1');
      if (!r) return { days: {}, updatedAt: null };
      var p = JSON.parse(r);
      if (!p.days) p.days = {};
      return p;
    } catch (e) {
      return { days: {}, updatedAt: null };
    }
  }
  function saveStore(store) {
    try {
      store.updatedAt = Date.now();
      localStorage.setItem('MARY_ALIM_MARTIN_V1', JSON.stringify(store));
    } catch (e) {}
  }
  function ensureDay(store, day) {
    if (!store.days[day]) store.days[day] = { meals: [], pots: [], note: '' };
    var d = store.days[day];
    if (!d.meals) d.meals = [];
    if (!d.pots) d.pots = [];
    return d;
  }
  function potLabel(p) {
    var base = p.name || 'Salsa';
    if (p.label && String(p.label).trim()) return base + ' · ' + String(p.label).trim();
    return base;
  }
  function potInicio(p) {
    if (p.inicio !== '' && p.inicio != null) return num(p.inicio);
    return null;
  }
  function potFin(p) {
    if (p.fin !== '' && p.fin != null) return num(p.fin);
    if (p.weight !== '' && p.weight != null) return num(p.weight);
    return null;
  }
  function potConsumo(p) {
    var a = potInicio(p);
    var b = potFin(p);
    if (a == null || b == null) return null;
    return Math.max(0, a - b);
  }
  function macrosFor(name, grams) {
    var m = PER100[name];
    if (!m || !grams) return { kcal: 0, p: 0, c: 0, g: 0 };
    var f = num(grams) / 100;
    return { kcal: m.kcal * f, p: m.p * f, c: m.c * f, g: m.g * f };
  }

  /** Escribe comidas auto de salsa para que los macros del día cuenten bien */
  function syncSalsaMeals(d) {
    d.meals = (d.meals || []).filter(function (m) {
      return !m._salsaAuto;
    });
    (d.pots || []).forEach(function (p) {
      var g = potConsumo(p);
      if (g == null || g <= 0) return;
      d.meals.push({
        _salsaAuto: true,
        salsa: true,
        byGram: true,
        name: potLabel(p),
        grams: g,
        qty: g,
        custom: false
      });
    });
  }

  function ensureDulceOption() {
    var sel = document.getElementById('salsa-add-name');
    if (!sel) return;
    var names = [
      'Hershey',
      'Miel',
      'Leche condensada tradicional',
      'Leche condensada La Lechera',
      'Mayonesa',
      'Nutella',
      'Dulce de leche',
      'Cocada',
      'Mantequilla',
      'Queso parmesano'
    ];
    var have = {};
    for (var i = 0; i < sel.options.length; i++) have[sel.options[i].text] = true;
    names.forEach(function (n) {
      if (!have[n]) {
        var o = document.createElement('option');
        o.text = n;
        o.value = n;
        sel.appendChild(o);
      }
    });
  }

  function improveHelp() {
    var tab = document.getElementById('tab-salsas');
    if (!tab) return;
    var muted = tab.querySelector('.muted');
    if (!muted) return;
    muted.innerHTML =
      '<b>Cómo llenar (simple)</b><br>' +
      '1. Cada pote tiene <b>Inicio</b> (peso al empezar el día de Martín) y <b>Fin</b> (peso al cerrar).<br>' +
      '2. <b>Consumo = Inicio − Fin</b>. No hace falta el día de ayer.<br>' +
      '3. Si hay 2 Nutella, pon una <b>etiqueta</b> (ej. cocina / mesa) para no confundirlas.<br>' +
      '4. Si Lau rellenó la miel hoy: pon el peso nuevo en <b>Inicio</b> (botón “Rellené”).';
  }

  function renderSalsasSimple() {
    ensureDulceOption();
    improveHelp();
    var list = document.getElementById('salsa-list');
    var cons = document.getElementById('salsa-consumo');
    if (!list) return;

    var store = loadStore();
    var day = dayVal();
    var d = ensureDay(store, day);

    // Migrar weight → fin si no hay fin
    (d.pots || []).forEach(function (p) {
      if ((p.fin === '' || p.fin == null) && p.weight !== '' && p.weight != null) p.fin = p.weight;
    });

    if (!(d.pots || []).length) {
      list.innerHTML = '<p class="muted">Sin potes. Elige una salsa abajo y pulsa <b>+ Otra</b>.</p>';
    } else {
      list.innerHTML = d.pots
        .map(function (p, i) {
          var ini = p.inicio !== '' && p.inicio != null ? p.inicio : '';
          var fin = p.fin !== '' && p.fin != null ? p.fin : p.weight !== '' && p.weight != null ? p.weight : '';
          var g = potConsumo(p);
          var mac = g != null ? macrosFor(p.name, g) : null;
          var consTxt =
            g == null
              ? '<span class="muted">Completa Inicio y Fin para ver consumo</span>'
              : '<b>' +
                r0(g) +
                ' g</b> consumidos · ' +
                r0(mac.kcal) +
                ' kcal · P ' +
                r0(mac.p) +
                ' · C ' +
                r0(mac.c) +
                ' · G ' +
                r0(mac.g);
          return (
            '<div class="salsa-card" data-pot="' +
            i +
            '">' +
            '<div class="salsa-head">' +
            '<div style="flex:1">' +
            '<div style="font-size:.72rem;color:var(--muted);margin-bottom:.15rem">Tipo</div>' +
            '<input value="' +
            String(p.name || '').replace(/"/g, '&quot;') +
            '" onchange="window._salsaUpd(' +
            i +
            ',\'name\',this.value)" style="width:100%">' +
            '</div>' +
            '<button type="button" class="btn btn-ghost" onclick="window._salsaDel(' +
            i +
            ')">✕</button>' +
            '</div>' +
            '<div style="margin:.35rem 0">' +
            '<label>Etiqueta (para distinguir, ej. cocina / mesa / pote nuevo)</label>' +
            '<input value="' +
            String(p.label || '').replace(/"/g, '&quot;') +
            '" placeholder="opcional" onchange="window._salsaUpd(' +
            i +
            ',\'label\',this.value)">' +
            '</div>' +
            '<div class="salsa-weights">' +
            '<div><label>Inicio (g)</label>' +
            '<input type="number" step="1" inputmode="decimal" value="' +
            ini +
            '" placeholder="peso al empezar" onchange="window._salsaUpd(' +
            i +
            ',\'inicio\',this.value)"></div>' +
            '<div><label>Fin (g)</label>' +
            '<input type="number" step="1" inputmode="decimal" value="' +
            fin +
            '" placeholder="peso al cerrar" onchange="window._salsaUpd(' +
            i +
            ',\'fin\',this.value)"></div>' +
            '</div>' +
            '<div style="margin-top:.45rem;font-size:.8rem">' +
            consTxt +
            '</div>' +
            '<div class="row" style="margin-top:.4rem">' +
            '<button type="button" class="btn btn-ghost" onclick="window._salsaRelleno(' +
            i +
            ')">🔄 Rellené / pote nuevo</button>' +
            '</div>' +
            '</div>'
          );
        })
        .join('');
    }

    // Resumen consumo
    if (cons) {
      var rows = (d.pots || [])
        .map(function (p) {
          var g = potConsumo(p);
          var label = potLabel(p);
          if (g == null)
            return (
              '<div class="item"><div><b>' +
              label +
              '</b><div class="muted">Falta Inicio o Fin</div></div></div>'
            );
          if (!g)
            return (
              '<div class="item"><div><b>' +
              label +
              '</b><div class="muted">0 g</div></div></div>'
            );
          var mac = macrosFor(p.name, g);
          return (
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">' +
            r0(g) +
            ' g · ' +
            r0(mac.kcal) +
            ' kcal</div></div></div>'
          );
        })
        .join('');
      cons.innerHTML =
        '<div class="sec" style="margin-top:0">Consumo del día (Inicio − Fin)</div>' +
        (rows || '<p class="muted">Sin datos aún.</p>');
    }
  }

  window._salsaUpd = function (i, field, val) {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    if (!d.pots[i]) return;
    if (field === 'inicio' || field === 'fin') {
      d.pots[i][field] = val === '' ? '' : num(val);
      if (field === 'fin') d.pots[i].weight = d.pots[i][field];
    } else {
      d.pots[i][field] = val;
    }
    syncSalsaMeals(d);
    saveStore(store);
    renderSalsasSimple();
  };

  window._salsaDel = function (i) {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    d.pots.splice(i, 1);
    syncSalsaMeals(d);
    saveStore(store);
    renderSalsasSimple();
    toast('Pote quitado');
  };

  window._salsaRelleno = function (i) {
    var v = prompt(
      '¿Cuánto pesa el pote AHORA después de rellenar o abrir uno nuevo? (g)\n\nEso será el nuevo Inicio de hoy.',
      ''
    );
    if (v == null || v === '') return;
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    if (!d.pots[i]) return;
    d.pots[i].inicio = num(v);
    d.pots[i].fin = '';
    d.pots[i].weight = '';
    d.pots[i].mid = '';
    if (!d.pots[i].label) d.pots[i].label = 'relleno ' + today().slice(5);
    syncSalsaMeals(d);
    saveStore(store);
    renderSalsasSimple();
    toast('Inicio actualizado · ' + num(v) + ' g');
  };

  // Override add / save / del
  window.addSalsaPot = function () {
    ensureDulceOption();
    var sel = document.getElementById('salsa-add-name');
    var name = (sel && sel.value) || 'Nutella';
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    var same = (d.pots || []).filter(function (p) {
      return p.name === name;
    }).length;
    var label = same ? String(same + 1) : '';
    var ini = prompt(
      'Inicio de "' +
        name +
        (label ? ' #' + label : '') +
        '" (g)\n\nPeso actual al empezar a contar hoy.\nDéjalo vacío si aún no pesaste.',
      ''
    );
    d.pots.push({
      id: 's' + Date.now(),
      name: name,
      label: label,
      inicio: ini === '' || ini == null ? '' : num(ini),
      fin: '',
      weight: '',
      mid: ''
    });
    syncSalsaMeals(d);
    saveStore(store);
    renderSalsasSimple();
    toast('Pote agregado');
  };

  window.delPot = function (i) {
    window._salsaDel(i);
  };

  window.updPot = function (i, field, val) {
    // map old fields
    if (field === 'weight') field = 'fin';
    if (field === 'mid') return; // ya no usamos intermedio en UI simple
    window._salsaUpd(i, field, val);
  };

  window.saveSalsas = function () {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    syncSalsaMeals(d);
    saveStore(store);
    renderSalsasSimple();
    toast('Salsas guardadas ✓');
    // try native cloud save
    if (typeof window.saveDay === 'function') {
      try {
        /* saveDay may re-read DOM */
      } catch (e) {}
    }
  };

  var _showTab = window.showTab;
  window.showTab = function (id) {
    if (typeof _showTab === 'function') _showTab(id);
    if (id === 'salsas') setTimeout(renderSalsasSimple, 50);
  };

  // Re-render when day changes
  function hookDay() {
    var el = document.getElementById('day');
    if (!el || el._salsaHooked) return;
    el._salsaHooked = true;
    el.addEventListener('change', function () {
      setTimeout(renderSalsasSimple, 80);
    });
  }

  // Edit meal buttons (keep from v3)
  function addEditButtons() {
    var list = document.getElementById('meals-list');
    if (!list) return;
    list.querySelectorAll('.item').forEach(function (item) {
      if (item.querySelector('[data-edit-btn]')) return;
      if ((item.textContent || '').indexOf('auto salsa') >= 0) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'btn btn-ghost';
      btn.setAttribute('data-edit-btn', '1');
      btn.textContent = '✎';
      btn.style.cssText = 'padding:.25rem .5rem;font-size:.7rem;margin-left:.25rem';
      btn.onclick = function (ev) {
        ev.stopPropagation();
        var label = ((item.querySelector('b') || item).textContent || '').replace(/\s*\(.*$/, '').trim();
        var store = loadStore();
        var d = ensureDay(store, dayVal());
        var found = -1;
        for (var i = 0; i < d.meals.length; i++) {
          if (d.meals[i]._salsaAuto) continue;
          if ((d.meals[i].name || '') === label || (d.meals[i].name || '').indexOf(label) >= 0) {
            found = i;
            break;
          }
        }
        if (found < 0) {
          toast('No encontré el alimento');
          return;
        }
        var m = d.meals[found];
        var cur = m.grams != null ? m.grams : m.qty || 1;
        var v = prompt('Nueva cantidad de ' + (m.name || label), String(cur));
        if (v == null || v === '') return;
        var n = num(v);
        if (m.byGram || m.grams != null) {
          m.qty = n;
          m.grams = n;
        } else {
          m.qty = n || 1;
        }
        saveStore(store);
        toast('Actualizado');
        setTimeout(function () {
          location.reload();
        }, 400);
      };
      item.appendChild(btn);
    });
  }

  function start() {
    ensureDulceOption();
    improveHelp();
    hookDay();
    // If salsas tab visible, render
    var tab = document.getElementById('tab-salsas');
    if (tab && !tab.classList.contains('hidden')) renderSalsasSimple();
    addEditButtons();
    var root = document.getElementById('meals-list');
    if (root) {
      new MutationObserver(function () {
        addEditButtons();
      }).observe(root, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 900);
    });
  else setTimeout(start, 900);
})();
