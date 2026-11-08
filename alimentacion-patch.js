/* Patch v8 — Inicio/Fin + gramos visibles + total por tipo de salsa */
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
  var SALSA_NAMES = Object.keys(PER100);

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

  function isOldSalsaMeal(m) {
    if (!m) return false;
    if (m._salsaAuto) return true;
    if (m.salsa) return true;
    var n = String(m.name || '').toLowerCase();
    if (n.indexOf('· salsas') >= 0 || n.indexOf('· salsa') >= 0) return true;
    if (/\(salsa\)/i.test(m.name || '')) return true;
    if (m.byGram || m.grams != null) {
      for (var i = 0; i < SALSA_NAMES.length; i++) {
        var sn = SALSA_NAMES[i].toLowerCase();
        if (n === sn || n.indexOf(sn) === 0) {
          if (n.indexOf('sudado') < 0 && n.indexOf('napolitana') < 0) return true;
        }
      }
    }
    return false;
  }

  function syncSalsaMeals(d) {
    // 1) Quitar residuales
    d.meals = (d.meals || []).filter(function (m) {
      return !isOldSalsaMeal(m);
    });
    // 2) Potes limpios (sin weight/mid para que el core viejo no calcule)
    (d.pots || []).forEach(function (p) {
      if ((p.fin === '' || p.fin == null) && p.weight !== '' && p.weight != null) {
        p.fin = num(p.weight);
      }
      p.weight = '';
      p.mid = '';
      if (p.base !== undefined) p.base = '';
    });
    // 3) Sumar por TIPO de salsa (name) → un solo total del día
    var byName = {};
    (d.pots || []).forEach(function (p) {
      var gr = potConsumo(p);
      if (gr == null || gr <= 0) return;
      var key = p.name || 'Salsa';
      if (!byName[key]) byName[key] = { grams: 0, labels: [] };
      byName[key].grams += gr;
      if (p.label && String(p.label).trim()) {
        byName[key].labels.push(String(p.label).trim());
      }
    });
    Object.keys(byName).forEach(function (name) {
      var info = byName[name];
      var gr = info.grams;
      if (gr <= 0) return;
      var mac = macrosFor(name, gr);
      var labelPart = '';
      if (info.labels.length === 1) labelPart = ' · ' + info.labels[0];
      else if (info.labels.length > 1) labelPart = ' · varios';
      // Nombre con gramos visibles: "Leche condensada tradicional (131 g) · salsa"
      var display =
        name + labelPart + ' (' + r0(gr) + ' g) · salsa';
      d.meals.push({
        _salsaAuto: true,
        id: 'salsa_' + name.replace(/\s+/g, '_').slice(0, 20),
        name: display,
        qty: 1,
        grams: gr,
        custom: true,
        kcal: r0(mac.kcal),
        p: r0(mac.p),
        c: r0(mac.c),
        g: r0(mac.g)
      });
    });
  }

  function persistFull(store) {
    store.updatedAt = Date.now();
    try {
      localStorage.setItem(LS, JSON.stringify(store));
    } catch (e) {}
    try {
      if (window.firebase && firebase.apps && firebase.apps.length) {
        firebase
          .firestore()
          .collection(COL)
          .doc(DOC)
          .set(Object.assign({}, store, { updatedAt: store.updatedAt }), {
            merge: true
          })
          .then(function () {
            var el = document.getElementById('sync');
            if (el)
              el.textContent =
                '☁ Salsas · ' + new Date().toLocaleTimeString();
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
    syncSalsaMeals(d);
    persistFull(store);
    return d;
  }

  function cleanDayDom() {
    var list = document.getElementById('meals-list');
    if (!list) return;
    list.querySelectorAll('.item').forEach(function (item) {
      var t = (item.textContent || '').toLowerCase();
      if (t.indexOf('· salsas') >= 0) item.remove();
    });
  }

  function ensureDulceOption() {
    var sel = document.getElementById('salsa-add-name');
    if (!sel) return;
    SALSA_NAMES.forEach(function (n) {
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
      '• <b>Inicio</b> y <b>Fin</b> → consumo = Inicio − Fin<br>' +
      '• Si Inicio = Fin → <b>0 g</b> (no va al día)<br>' +
      '• Dos potes de la misma salsa → se <b>suman</b> en un solo total<br>' +
      '• Etiqueta solo para distinguirlo aquí (cocina / mesa)';
  }

  function renderSalsasSimple() {
    ensureDulceOption();
    improveHelp();
    var list = document.getElementById('salsa-list');
    var cons = document.getElementById('salsa-consumo');
    if (!list) return;
    var store = loadStore();
    var d = ensureDay(store, dayVal());

    if (!(d.pots || []).length) {
      list.innerHTML =
        '<p class="muted">Sin potes. Elige una salsa y pulsa <b>+ Otra</b>.</p>';
    } else {
      list.innerHTML = d.pots
        .map(function (p, i) {
          var ini = p.inicio !== '' && p.inicio != null ? p.inicio : '';
          var fin = p.fin !== '' && p.fin != null ? p.fin : '';
          var gr = potConsumo(p);
          var mac = gr != null ? macrosFor(p.name, gr) : null;
          var consTxt =
            gr == null
              ? '<span class="muted">Completa Inicio y Fin</span>'
              : gr === 0
                ? '<b>0 g</b> · no se suma al día'
                : '<b>' +
                  r0(gr) +
                  ' g</b> → día · ' +
                  r0(mac.kcal) +
                  ' kcal';
          return (
            '<div class="salsa-card">' +
            '<div class="salsa-head"><div style="flex:1">' +
            '<div style="font-size:.72rem;color:var(--muted)">Tipo</div>' +
            '<input value="' +
            String(p.name || '').replace(/"/g, '&quot;') +
            '" onchange="window._salsaUpd(' +
            i +
            ',\'name\',this.value)" style="width:100%"></div>' +
            '<button type="button" class="btn btn-ghost" onclick="window._salsaDel(' +
            i +
            ')">✕</button></div>' +
            '<div style="margin:.35rem 0"><label>Etiqueta</label>' +
            '<input value="' +
            String(p.label || '').replace(/"/g, '&quot;') +
            '" placeholder="cocina / mesa…" onchange="window._salsaUpd(' +
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
      var totalK = 0;
      var rows = (d.pots || [])
        .map(function (p) {
          var gr = potConsumo(p);
          var label = potLabel(p);
          if (gr == null)
            return (
              '<div class="item"><div><b>' +
              label +
              '</b><div class="muted">Falta Inicio o Fin</div></div></div>'
            );
          if (gr === 0)
            return (
              '<div class="item"><div><b>' +
              label +
              '</b><div class="muted">0 g (no va al día)</div></div></div>'
            );
          var mac = macrosFor(p.name, gr);
          totalK += mac.kcal;
          return (
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">' +
            r0(gr) +
            ' g · ' +
            r0(mac.kcal) +
            ' kcal</div></div></div>'
          );
        })
        .join('');
      cons.innerHTML =
        '<div class="sec" style="margin-top:0">Se suma al día: ' +
        r0(totalK) +
        ' kcal</div>' +
        (rows || '<p class="muted">Sin datos aún.</p>');
    }
  }

  window._salsaUpd = function (i, field, val) {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    if (!d.pots[i]) return;
    if (field === 'inicio' || field === 'fin') {
      d.pots[i][field] = val === '' ? '' : num(val);
    } else d.pots[i][field] = val;
    d.pots[i].weight = '';
    d.pots[i].mid = '';
    syncSalsaMeals(d);
    persistFull(store);
    renderSalsasSimple();
    var gr = potConsumo(d.pots[i]);
    if (gr == null) toast('Guardado');
    else if (gr === 0) toast('0 g · no se suma al día');
    else toast(r0(gr) + ' g → día');
  };

  window._salsaDel = function (i) {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    d.pots.splice(i, 1);
    syncSalsaMeals(d);
    persistFull(store);
    renderSalsasSimple();
    toast('Pote quitado');
  };

  window._salsaRelleno = function (i) {
    var v = prompt('Peso AHORA tras rellenar (g) = nuevo Inicio', '');
    if (v == null || v === '') return;
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    if (!d.pots[i]) return;
    d.pots[i].inicio = num(v);
    d.pots[i].fin = '';
    d.pots[i].weight = '';
    d.pots[i].mid = '';
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
      'Inicio de "' + name + (label ? ' #' + label : '') + '" (g)',
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
    toast('Guardado. En Día verás el total por salsa');
  };

  var _saveDay = window.saveDay;
  window.saveDay = async function () {
    applyAndSave();
    if (typeof _saveDay === 'function') {
      try {
        await _saveDay();
      } catch (e) {}
    }
    setTimeout(function () {
      applyAndSave();
      cleanDayDom();
    }, 400);
  };

  var _showTab = window.showTab;
  window.showTab = function (id) {
    if (id === 'dia') applyAndSave();
    if (typeof _showTab === 'function') _showTab(id);
    if (id === 'salsas') setTimeout(renderSalsasSimple, 40);
    if (id === 'dia') {
      setTimeout(function () {
        applyAndSave();
        cleanDayDom();
      }, 150);
      setTimeout(cleanDayDom, 400);
    }
  };

  function hookDay() {
    var el = document.getElementById('day');
    if (!el || el._salsaHooked) return;
    el._salsaHooked = true;
    el.addEventListener('change', function () {
      setTimeout(function () {
        applyAndSave();
        renderSalsasSimple();
        cleanDayDom();
      }, 120);
    });
  }

  function start() {
    ensureDulceOption();
    improveHelp();
    hookDay();
    applyAndSave();
    cleanDayDom();
    var tab = document.getElementById('tab-salsas');
    if (tab && !tab.classList.contains('hidden')) renderSalsasSimple();
    var root = document.getElementById('meals-list');
    if (root && !root._salsaCleanObs) {
      root._salsaCleanObs = true;
      new MutationObserver(function () {
        cleanDayDom();
      }).observe(root, { childList: true, subtree: true });
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 1000);
    });
  else setTimeout(start, 1000);
})();
