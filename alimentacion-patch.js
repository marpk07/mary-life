/* Patch v5 — Salsas Inicio/Fin + consumo sumado a macros del día */
(function () {
  var LS = 'MARY_ALIM_MARTIN_V1';
  var COL = 'mary_alimentacion';
  var DOC = 'martin_data';
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
      var r = localStorage.getItem(LS);
      if (!r) return { days: {}, updatedAt: null };
      var p = JSON.parse(r);
      if (!p.days) p.days = {};
      return p;
    } catch (e) {
      return { days: {}, updatedAt: null };
    }
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
  function mealMacros(m) {
    if (m.custom) return { kcal: num(m.kcal), p: num(m.p), c: num(m.c), g: num(m.g) };
    if (m.salsa || m.byGram || m.grams != null)
      return macrosFor((m.name || '').split(' · ')[0], m.grams || m.qty);
    // fallback by name key
    var key = (m.name || '').split(' · ')[0];
    if (PER100[key] && (m.grams || m.qty))
      return macrosFor(key, m.grams || m.qty);
    return { kcal: 0, p: 0, c: 0, g: 0 };
  }

  function syncSalsaMeals(d) {
    d.meals = (d.meals || []).filter(function (m) {
      return !m._salsaAuto;
    });
    (d.pots || []).forEach(function (p) {
      var g = potConsumo(p);
      if (g == null || g <= 0) return;
      var mac = macrosFor(p.name, g);
      d.meals.push({
        _salsaAuto: true,
        salsa: true,
        byGram: true,
        name: potLabel(p),
        grams: g,
        qty: g,
        custom: false,
        kcal: mac.kcal,
        p: mac.p,
        c: mac.c,
        g: mac.g
      });
    });
  }

  function dayTotalsFromStore(d) {
    var kcal = 0,
      p = 0,
      c = 0,
      g = 0;
    var lines = [];
    (d.meals || []).forEach(function (m) {
      var mac = m._salsaAuto
        ? { kcal: num(m.kcal), p: num(m.p), c: num(m.c), g: num(m.g) }
        : mealMacros(m);
      // if non-auto meal has known food id macros missing, still try
      if (!m._salsaAuto && !m.custom && !m.byGram && !m.salsa) {
        // leave as zero if unknown — CDN handles real foods in its own render
      }
      kcal += mac.kcal;
      p += mac.p;
      c += mac.c;
      g += mac.g;
      lines.push({ m: m, mac: mac });
    });
    return { kcal: r0(kcal), p: r0(p), c: r0(c), g: r0(g), lines: lines };
  }

  function persistFull(store) {
    store.updatedAt = Date.now();
    try {
      localStorage.setItem(LS, JSON.stringify(store));
    } catch (e) {}
    // Firebase
    try {
      if (window.firebase && firebase.apps && firebase.apps.length) {
        var db = firebase.firestore();
        db.collection(COL)
          .doc(DOC)
          .set(
            Object.assign({}, store, { updatedAt: store.updatedAt }),
            { merge: true }
          )
          .then(function () {
            var el = document.getElementById('sync');
            if (el)
              el.textContent =
                '☁ Salsas + macros · ' + new Date().toLocaleTimeString();
          })
          .catch(function (e) {
            console.warn(e);
          });
      }
    } catch (e) {
      console.warn(e);
    }
  }

  function applyAndSave() {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    // migrate weight→fin
    (d.pots || []).forEach(function (p) {
      if ((p.fin === '' || p.fin == null) && p.weight !== '' && p.weight != null)
        p.fin = p.weight;
    });
    syncSalsaMeals(d);
    persistFull(store);
    return { store: store, d: d };
  }

  /** Actualiza KPIs y lista de comidas para que se vea el consumo de salsas */
  function refreshDayUI() {
    var store = loadStore();
    var day = dayVal();
    var d = ensureDay(store, day);
    syncSalsaMeals(d);

    // KPIs: sumar salsas a lo que ya muestra la app si se puede
    var salsaKcal = 0,
      salsaP = 0,
      salsaC = 0,
      salsaG = 0;
    var salsaLines = [];
    (d.pots || []).forEach(function (p) {
      var g = potConsumo(p);
      if (g == null || g <= 0) return;
      var mac = macrosFor(p.name, g);
      salsaKcal += mac.kcal;
      salsaP += mac.p;
      salsaC += mac.c;
      salsaG += mac.g;
      salsaLines.push({ label: potLabel(p), grams: g, mac: mac });
    });

    var kpis = document.getElementById('kpis');
    if (kpis && salsaLines.length) {
      // Read current numbers if present, else just show salsa-aware totals from meals+salsa
      var t = dayTotalsFromStore(d);
      // Prefer summing only salsa on top of non-auto meals that CDN rendered —
      // safer: recompute from all meals in store that are not unknown foods
      // For foods the CDN added, mealMacros may be 0; so add salsa to visible KPI values.
      var vs = kpis.querySelectorAll('.kpi .v');
      if (vs.length >= 4) {
        var curK = parseInt(String(vs[0].textContent).replace(/[^0-9]/g, ''), 10) || 0;
        var curP = parseInt(String(vs[1].textContent).replace(/[^0-9]/g, ''), 10) || 0;
        var curC = parseInt(String(vs[2].textContent).replace(/[^0-9]/g, ''), 10) || 0;
        var curG = parseInt(String(vs[3].textContent).replace(/[^0-9]/g, ''), 10) || 0;
        // Avoid double-count: strip previous salsa if data-salsa-added
        if (kpis.getAttribute('data-salsa-added') === '1') {
          // already includes — recompute from store only
          vs[0].textContent = String(t.kcal);
          vs[1].textContent = t.p + ' g';
          vs[2].textContent = t.c + ' g';
          vs[3].textContent = t.g + ' g';
        } else {
          // CDN totals may already miss salsa; add salsa
          // If store non-salsa meals empty, use CDN + salsa
          var nonSalsa = (d.meals || []).filter(function (m) {
            return !m._salsaAuto;
          });
          if (nonSalsa.length === 0) {
            vs[0].textContent = String(r0(curK + salsaKcal));
            vs[1].textContent = r0(curP + salsaP) + ' g';
            vs[2].textContent = r0(curC + salsaC) + ' g';
            vs[3].textContent = r0(curG + salsaG) + ' g';
          } else {
            // Use full store totals if we have auto meals synced
            vs[0].textContent = String(t.kcal);
            vs[1].textContent = t.p + ' g';
            vs[2].textContent = t.c + ' g';
            vs[3].textContent = t.g + ' g';
          }
        }
        kpis.setAttribute('data-salsa-added', '1');
      }
    }

    // Meals list: append salsa rows if missing
    var list = document.getElementById('meals-list');
    if (list && salsaLines.length) {
      // remove old injected
      list.querySelectorAll('[data-salsa-line]').forEach(function (el) {
        el.remove();
      });
      salsaLines.forEach(function (s) {
        var div = document.createElement('div');
        div.className = 'item';
        div.setAttribute('data-salsa-line', '1');
        div.innerHTML =
          '<div><b>' +
          s.label +
          ' (' +
          r0(s.grams) +
          ' g)</b><div class="muted">' +
          r0(s.mac.kcal) +
          ' kcal · P ' +
          r0(s.mac.p) +
          ' · C ' +
          r0(s.mac.c) +
          ' · G ' +
          r0(s.mac.g) +
          ' · salsa</div></div>';
        list.appendChild(div);
      });
      if (list.querySelector('.muted') && list.children.length === salsaLines.length + 1) {
        // empty state only — remove "sin comidas" if present
        var empty = list.querySelector('p.muted');
        if (empty) empty.remove();
      }
    }
  }

  function ensureDulceOption() {
    var sel = document.getElementById('salsa-add-name');
    if (!sel) return;
    [
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
    ].forEach(function (n) {
      var found = false;
      for (var i = 0; i < sel.options.length; i++)
        if (sel.options[i].text === n) found = true;
      if (!found) {
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
      '<b>Cómo llenar</b><br>' +
      '• <b>Inicio</b> = peso al empezar el día de Martín · <b>Fin</b> = peso al cerrar<br>' +
      '• Consumo = Inicio − Fin (se suma solo a los macros del día)<br>' +
      '• Dos potes iguales → usa <b>etiqueta</b> (cocina / mesa)<br>' +
      '• Si rellenaron hoy → botón <b>Rellené</b> y pon el peso nuevo en Inicio';
  }

  function renderSalsasSimple() {
    ensureDulceOption();
    improveHelp();
    var list = document.getElementById('salsa-list');
    var cons = document.getElementById('salsa-consumo');
    if (!list) return;

    var store = loadStore();
    var d = ensureDay(store, dayVal());
    (d.pots || []).forEach(function (p) {
      if ((p.fin === '' || p.fin == null) && p.weight !== '' && p.weight != null)
        p.fin = p.weight;
    });

    if (!(d.pots || []).length) {
      list.innerHTML =
        '<p class="muted">Sin potes. Elige una salsa y pulsa <b>+ Otra</b>.</p>';
    } else {
      list.innerHTML = d.pots
        .map(function (p, i) {
          var ini = p.inicio !== '' && p.inicio != null ? p.inicio : '';
          var fin =
            p.fin !== '' && p.fin != null
              ? p.fin
              : p.weight !== '' && p.weight != null
                ? p.weight
                : '';
          var g = potConsumo(p);
          var mac = g != null ? macrosFor(p.name, g) : null;
          var consTxt =
            g == null
              ? '<span class="muted">Completa Inicio y Fin para ver consumo</span>'
              : '<b>' +
                r0(g) +
                ' g</b> → se suman a macros del día · ' +
                r0(mac.kcal) +
                ' kcal';
          return (
            '<div class="salsa-card">' +
            '<div class="salsa-head">' +
            '<div style="flex:1"><div style="font-size:.72rem;color:var(--muted)">Tipo</div>' +
            '<input value="' +
            String(p.name || '').replace(/"/g, '&quot;') +
            '" onchange="window._salsaUpd(' +
            i +
            ',\'name\',this.value)" style="width:100%"></div>' +
            '<button type="button" class="btn btn-ghost" onclick="window._salsaDel(' +
            i +
            ')">✕</button></div>' +
            '<div style="margin:.35rem 0"><label>Etiqueta (cocina / mesa / etc.)</label>' +
            '<input value="' +
            String(p.label || '').replace(/"/g, '&quot;') +
            '" placeholder="opcional" onchange="window._salsaUpd(' +
            i +
            ',\'label\',this.value)"></div>' +
            '<div class="salsa-weights">' +
            '<div><label>Inicio (g)</label><input type="number" step="1" inputmode="decimal" value="' +
            ini +
            '" placeholder="al empezar" onchange="window._salsaUpd(' +
            i +
            ',\'inicio\',this.value)"></div>' +
            '<div><label>Fin (g)</label><input type="number" step="1" inputmode="decimal" value="' +
            fin +
            '" placeholder="al cerrar" onchange="window._salsaUpd(' +
            i +
            ',\'fin\',this.value)"></div></div>' +
            '<div style="margin-top:.45rem;font-size:.8rem">' +
            consTxt +
            '</div>' +
            '<div class="row" style="margin-top:.4rem">' +
            '<button type="button" class="btn btn-ghost" onclick="window._salsaRelleno(' +
            i +
            ')">🔄 Rellené / pote nuevo</button></div></div>'
          );
        })
        .join('');
    }

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
          var mac = macrosFor(p.name, g);
          return (
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">' +
            r0(g) +
            ' g · ' +
            r0(mac.kcal) +
            ' kcal (en macros del día)</div></div></div>'
          );
        })
        .join('');
      cons.innerHTML =
        '<div class="sec" style="margin-top:0">Consumo → macros del día</div>' +
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
    } else d.pots[i][field] = val;
    syncSalsaMeals(d);
    persistFull(store);
    renderSalsasSimple();
    // mark kpis dirty so next dia view recalculates
    var kpis = document.getElementById('kpis');
    if (kpis) kpis.removeAttribute('data-salsa-added');
    toast(
      potConsumo(d.pots[i]) != null
        ? 'Consumo ' + r0(potConsumo(d.pots[i])) + ' g → macros del día'
        : 'Guardado'
    );
  };

  window._salsaDel = function (i) {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    d.pots.splice(i, 1);
    syncSalsaMeals(d);
    persistFull(store);
    renderSalsasSimple();
    var kpis = document.getElementById('kpis');
    if (kpis) kpis.removeAttribute('data-salsa-added');
    toast('Pote quitado');
  };

  window._salsaRelleno = function (i) {
    var v = prompt(
      'Peso AHORA tras rellenar o abrir pote nuevo (g)\nQuedará como Inicio de hoy.',
      ''
    );
    if (v == null || v === '') return;
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    if (!d.pots[i]) return;
    d.pots[i].inicio = num(v);
    d.pots[i].fin = '';
    d.pots[i].weight = '';
    if (!d.pots[i].label) d.pots[i].label = 'relleno';
    syncSalsaMeals(d);
    persistFull(store);
    renderSalsasSimple();
    toast('Inicio = ' + num(v) + ' g');
  };

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
        '" (g)\nPeso al empezar hoy. Vacío = después.',
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
    persistFull(store);
    renderSalsasSimple();
    toast('Pote agregado');
  };

  window.delPot = function (i) {
    window._salsaDel(i);
  };
  window.updPot = function (i, field, val) {
    if (field === 'weight') field = 'fin';
    if (field === 'mid') return;
    window._salsaUpd(i, field, val);
  };

  window.saveSalsas = function () {
    applyAndSave();
    renderSalsasSimple();
    var kpis = document.getElementById('kpis');
    if (kpis) kpis.removeAttribute('data-salsa-added');
    toast('Salsas guardadas · consumo en macros del día');
  };

  var _saveDay = window.saveDay;
  window.saveDay = async function () {
    applyAndSave();
    if (typeof _saveDay === 'function') {
      try {
        await _saveDay();
      } catch (e) {
        toast('Día guardado (local + salsas)');
      }
    } else toast('Guardado');
    var kpis = document.getElementById('kpis');
    if (kpis) kpis.removeAttribute('data-salsa-added');
  };

  var _showTab = window.showTab;
  window.showTab = function (id) {
    if (typeof _showTab === 'function') _showTab(id);
    if (id === 'salsas') setTimeout(renderSalsasSimple, 40);
    if (id === 'dia') {
      setTimeout(function () {
        applyAndSave();
        refreshDayUI();
      }, 80);
    }
  };

  function hookDay() {
    var el = document.getElementById('day');
    if (!el || el._salsaHooked) return;
    el._salsaHooked = true;
    el.addEventListener('change', function () {
      setTimeout(function () {
        renderSalsasSimple();
        var kpis = document.getElementById('kpis');
        if (kpis) kpis.removeAttribute('data-salsa-added');
        refreshDayUI();
      }, 100);
    });
  }

  // When meals list re-renders, re-inject salsa lines
  function watchMeals() {
    var root = document.getElementById('meals-list');
    if (!root || root._salsaObs) return;
    root._salsaObs = true;
    new MutationObserver(function () {
      setTimeout(refreshDayUI, 30);
    }).observe(root, { childList: true });
  }

  function start() {
    ensureDulceOption();
    improveHelp();
    hookDay();
    watchMeals();
    applyAndSave();
    var tab = document.getElementById('tab-salsas');
    if (tab && !tab.classList.contains('hidden')) renderSalsasSimple();
    var dia = document.getElementById('tab-dia');
    if (dia && !dia.classList.contains('hidden')) refreshDayUI();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 1000);
    });
  else setTimeout(start, 1000);
})();
