/* Patch v13 — Salsas Inicio/Fin + sandwich sync + reporte PDF claro */
(function () {
  var LS = 'MARY_ALIM_MARTIN_V1';
  var LS_EXTRA = 'MARY_ALIM_EXTRA_MEALS_V1';
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
    'Queso parmesano': { kcal: 431, p: 38, c: 4, g: 29 },
    'Arroz cocido': { kcal: 130, p: 2.7, c: 28, g: 0.3 },
    'Papa cruda': { kcal: 77, p: 2, c: 17, g: 0.1 },
    'Tilapia cruda': { kcal: 96, p: 20.1, c: 0, g: 1.7 },
    'Tilapia cocida': { kcal: 128, p: 26, c: 0, g: 2.7 }
  };
  var FOODS_FIXED = {
    yopro15: { kcal: 159, p: 15, c: 20, g: 2 },
    yopro23: { kcal: 171, p: 23, c: 13, g: 3 },
    gatorade: { kcal: 120, p: 0, c: 30, g: 0 },
    panqueca100: { kcal: 432, p: 48, c: 34, g: 9, pct: true },
    banano: { kcal: 53, p: 1, c: 14, g: 0 },
    arroz_mantequilla: { kcal: 308, p: 5.4, c: 56.4, g: 6 },
    sudado: { kcal: 313, p: 43.8, c: 0.2, g: 15.4 },
    napolitana: { kcal: 560, p: 62, c: 14, g: 29 },
    mini_sandwich: { kcal: 413, p: 21.2, c: 55.4, g: 11.5 }
  };
  var EXTRA_FOODS = [
    {
      id: 'mini_sandwich',
      name: 'Mini sandwich tilapia',
      cat: 'Meal prep',
      hint: '1 unidad · tilapia, queso y mayonesa',
      kcal: 413,
      p: 21.2,
      c: 55.4,
      g: 11.5
    }
  ];
  var SALSA_NAMES = [
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

  function num(v) {
    var n = parseFloat(String(v == null ? '' : v).replace(',', '.'));
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
    }, 2200);
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
  function fmtDM(day) {
    if (!day) return '';
    var p = String(day).split('-');
    if (p.length !== 3) return day;
    return p[2] + '/' + p[1] + '/' + p[0];
  }
  function fmtShort(day) {
    if (!day) return '';
    var p = String(day).split('-');
    if (p.length !== 3) return day;
    return p[2] + '/' + p[1];
  }
  function loadStore() {
    try {
      var r = localStorage.getItem(LS);
      if (!r) return { days: {}, extraMeals: {}, updatedAt: null };
      var p = JSON.parse(r);
      if (!p.days) p.days = {};
      if (!p.extraMeals) p.extraMeals = {};
      return p;
    } catch (e) {
      return { days: {}, extraMeals: {}, updatedAt: null };
    }
  }
  function migrateExtraIntoStore(store) {
    // Migrar LS_EXTRA viejo → store.extraMeals (se sincroniza con Firebase)
    try {
      var r = localStorage.getItem(LS_EXTRA);
      if (r) {
        var old = JSON.parse(r);
        if (old && typeof old === 'object') {
          if (!store.extraMeals) store.extraMeals = {};
          Object.keys(old).forEach(function (day) {
            var list = old[day] || [];
            if (!store.extraMeals[day]) store.extraMeals[day] = [];
            list.forEach(function (m) {
              var exists = store.extraMeals[day].some(function (x) {
                return x.id === m.id && x.qty === m.qty && x.kcal === m.kcal;
              });
              if (!exists) store.extraMeals[day].push(m);
            });
          });
        }
      }
    } catch (e) {}
  }
  function getExtraMeals(day) {
    var store = loadStore();
    migrateExtraIntoStore(store);
    return ((store.extraMeals && store.extraMeals[day]) || []).slice();
  }
  function setExtraMeals(day, meals) {
    var store = loadStore();
    if (!store.extraMeals) store.extraMeals = {};
    store.extraMeals[day] = meals || [];
    persistFull(store);
    // también mirror en LS_EXTRA por compatibilidad
    try {
      var extra = {};
      try {
        extra = JSON.parse(localStorage.getItem(LS_EXTRA) || '{}') || {};
      } catch (e2) {
        extra = {};
      }
      extra[day] = meals || [];
      localStorage.setItem(LS_EXTRA, JSON.stringify(extra));
    } catch (e) {}
  }
  function ensureDay(store, day) {
    if (!store.days[day]) store.days[day] = { meals: [], pots: [], note: '' };
    var d = store.days[day];
    if (!d.meals) d.meals = [];
    if (!d.pots) d.pots = [];
    return d;
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
  function potLabel(p) {
    var base = p.name || 'Salsa';
    if (p.label && String(p.label).trim()) return base + ' · ' + String(p.label).trim();
    return base;
  }
  function macrosPer100(name, grams) {
    var m = PER100[name];
    if (!m || !grams) return { kcal: 0, p: 0, c: 0, g: 0 };
    var f = num(grams) / 100;
    return { kcal: m.kcal * f, p: m.p * f, c: m.c * f, g: m.g * f };
  }
  function mealMacros(m) {
    if (!m) return { kcal: 0, p: 0, c: 0, g: 0 };
    if (m.custom || m._salsaAuto || m._patchExtra)
      return { kcal: num(m.kcal), p: num(m.p), c: num(m.c), g: num(m.g) };
    if (m.byGram || m.salsa)
      return macrosPer100(m.name, m.grams || m.qty);
    var f = FOODS_FIXED[m.id];
    if (f) {
      var mult = num(m.qty) || 1;
      if (f.pct) mult = mult / 100;
      return { kcal: f.kcal * mult, p: f.p * mult, c: f.c * mult, g: f.g * mult };
    }
    if (m.name && PER100[m.name]) return macrosPer100(m.name, m.grams || m.qty);
    return { kcal: num(m.kcal), p: num(m.p), c: num(m.c), g: num(m.g) };
  }
  function isSalsaMeal(m) {
    if (!m) return false;
    if (m._salsaAuto || m.salsa) return true;
    var n = String(m.name || '').toLowerCase();
    if (n.indexOf('· salsas') >= 0 || n.indexOf('· salsa') >= 0) return true;
    if (/\(salsa\)/i.test(m.name || '')) return true;
    for (var i = 0; i < SALSA_NAMES.length; i++) {
      var sn = SALSA_NAMES[i].toLowerCase();
      if (n === sn || n.indexOf(sn) === 0) {
        if (n.indexOf('sudado') < 0 && n.indexOf('napolitana') < 0) return true;
      }
    }
    return false;
  }
  function buildSalsaTotals(pots) {
    var byName = {};
    (pots || []).forEach(function (p) {
      var gr = potConsumo(p);
      if (gr == null || gr <= 0) return;
      var key = p.name || 'Salsa';
      if (!byName[key]) byName[key] = { grams: 0, labels: [] };
      byName[key].grams += gr;
      if (p.label && String(p.label).trim()) byName[key].labels.push(String(p.label).trim());
    });
    return byName;
  }
  function syncSalsaMeals(d) {
    d.meals = (d.meals || []).filter(function (m) {
      return !isSalsaMeal(m);
    });
    (d.pots || []).forEach(function (p) {
      if ((p.fin === '' || p.fin == null) && p.weight !== '' && p.weight != null) {
        p.fin = num(p.weight);
      }
      p.weight = '';
      p.mid = '';
      if (p.base !== undefined) p.base = '';
    });
    var byName = buildSalsaTotals(d.pots);
    Object.keys(byName).forEach(function (name) {
      var info = byName[name];
      var gr = info.grams;
      if (gr <= 0) return;
      var mac = macrosPer100(name, gr);
      var labelPart = '';
      if (info.labels.length === 1) labelPart = ' · ' + info.labels[0];
      else if (info.labels.length > 1) labelPart = ' · varios';
      d.meals.push({
        _salsaAuto: true,
        id: 'salsa_' + name.replace(/\s+/g, '_').slice(0, 24),
        name: name + labelPart + ' (' + r0(gr) + ' g) · salsa',
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
    migrateExtraIntoStore(store);
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
          .set(Object.assign({}, store, { updatedAt: store.updatedAt }), { merge: true })
          .then(function () {
            var el = document.getElementById('sync');
            if (el) el.textContent = '☁ Sincronizado · ' + new Date().toLocaleTimeString();
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
  function copyText(t) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(
        function () {
          toast('Copiado ✓');
        },
        function () {
          prompt('Copia', t);
        }
      );
    } else prompt('Copia', t);
  }

  function patchDayTotals(day) {
    var store = loadStore();
    var d = ensureDay(store, day);
    var total = { kcal: 0, p: 0, c: 0, g: 0 };
    var lines = [];

    (d.meals || []).forEach(function (m) {
      if (m._salsaAuto || isSalsaMeal(m) || m._patchExtra) return;
      var mac = mealMacros(m);
      total.kcal += mac.kcal;
      total.p += mac.p;
      total.c += mac.c;
      total.g += mac.g;
      lines.push({ m: m, mac: mac, kind: 'food' });
    });

    getExtraMeals(day).forEach(function (m) {
      var mac = mealMacros(m);
      total.kcal += mac.kcal;
      total.p += mac.p;
      total.c += mac.c;
      total.g += mac.g;
      lines.push({ m: m, mac: mac, kind: 'extra' });
    });

    var byName = buildSalsaTotals(d.pots);
    Object.keys(byName).forEach(function (name) {
      var info = byName[name];
      var gr = info.grams;
      if (gr <= 0) return;
      var mac = macrosPer100(name, gr);
      total.kcal += mac.kcal;
      total.p += mac.p;
      total.c += mac.c;
      total.g += mac.g;
      var labelPart = '';
      if (info.labels.length === 1) labelPart = ' · ' + info.labels[0];
      else if (info.labels.length > 1) labelPart = ' · varios';
      lines.push({
        m: { name: name + labelPart, grams: gr, salsa: true },
        mac: mac,
        kind: 'salsa'
      });
    });

    return {
      kcal: r0(total.kcal),
      p: r0(total.p),
      c: r0(total.c),
      g: r0(total.g),
      lines: lines
    };
  }

  function daysInRange(from, to) {
    var out = [];
    if (!from || !to) return out;
    var d = new Date(from + 'T12:00:00');
    var end = new Date(to + 'T12:00:00');
    while (d <= end) {
      out.push(
        d.getFullYear() +
          '-' +
          String(d.getMonth() + 1).padStart(2, '0') +
          '-' +
          String(d.getDate()).padStart(2, '0')
      );
      d.setDate(d.getDate() + 1);
    }
    return out;
  }

  function patchPeriodDetail(days) {
    var counts = {};
    var salsaGrams = {};
    days.forEach(function (day) {
      var store = loadStore();
      var d = ensureDay(store, day);
      (d.meals || []).forEach(function (m) {
        if (m._salsaAuto || isSalsaMeal(m)) return;
        var key = m.name || m.id || 'otro';
        if (!counts[key]) counts[key] = { qty: 0, times: 0, isPct: false };
        counts[key].qty += num(m.qty) || 1;
        counts[key].times += 1;
        if (m.id === 'panqueca100' || key === 'Panquecas') counts[key].isPct = true;
      });
      getExtraMeals(day).forEach(function (m) {
        var key = m.name || m.id || 'otro';
        if (!counts[key]) counts[key] = { qty: 0, times: 0, isPct: false };
        counts[key].qty += num(m.qty) || 1;
        counts[key].times += 1;
      });
      var byName = buildSalsaTotals(d.pots);
      Object.keys(byName).forEach(function (name) {
        if (!salsaGrams[name]) salsaGrams[name] = 0;
        salsaGrams[name] += byName[name].grams;
      });
    });
    return { counts: counts, salsaGrams: salsaGrams };
  }

  function renderDayFromPatch() {
    var store = loadStore();
    var day = dayVal();
    var d = ensureDay(store, day);
    syncSalsaMeals(d);
    persistFull(store);

    var list = document.getElementById('meals-list');
    var kpis = document.getElementById('kpis');
    if (!list) return;

    var t = patchDayTotals(day);
    var html = '';
    var extraIdx = 0;

    t.lines.forEach(function (L) {
      var m = L.m;
      var mac = L.mac;
      var label = m.name || m.id || 'Alimento';
      if (L.kind === 'salsa') {
        label = label + ' (' + r0(m.grams) + ' g) · salsa';
      } else if (m.byGram && m.grams) {
        label = label + ' (' + r0(m.grams) + ' g)';
      } else if (m.qty && m.qty !== 1 && !m.byGram) {
        label = label + ' × ' + m.qty;
      }
      var delBtn = '';
      if (L.kind === 'extra') {
        delBtn =
          '<button type="button" class="btn btn-ghost" onclick="window._patchDelExtra(' +
          extraIdx +
          ')">✕</button>';
        extraIdx++;
      } else if (L.kind === 'food') {
        delBtn =
          '<button type="button" class="btn btn-ghost" onclick="window._patchDelCoreByName(\'' +
          String(m.name || m.id || '').replace(/'/g, '') +
          '\')">✕</button>';
      } else {
        delBtn = '<span class="muted" style="font-size:.7rem">auto</span>';
      }
      html +=
        '<div class="item">' +
        '<div><b>' +
        label +
        '</b><div class="muted">' +
        r0(mac.kcal) +
        ' kcal | ' +
        r0(mac.p) +
        ' g P | ' +
        r0(mac.c) +
        ' g C | ' +
        r0(mac.g) +
        ' g G</div></div>' +
        delBtn +
        '</div>';
    });

    if (!html) {
      html =
        '<p class="muted">Sin comidas aún. Agrega alimentos o completa Inicio/Fin en Salsas.</p>';
    }
    list.innerHTML = html;

    if (kpis) {
      kpis.innerHTML =
        '<div class="kpi"><div class="n">' +
        t.kcal +
        '</div><div class="l">kcal</div></div>' +
        '<div class="kpi"><div class="n">' +
        t.p +
        ' g</div><div class="l">Proteína</div></div>' +
        '<div class="kpi"><div class="n">' +
        t.c +
        ' g</div><div class="l">Carbos</div></div>' +
        '<div class="kpi"><div class="n">' +
        t.g +
        ' g</div><div class="l">Grasas</div></div>';
    }

    injectExtraFoods();
  }

  window._patchDelCoreByName = function (name) {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    var idx = -1;
    for (var i = 0; i < d.meals.length; i++) {
      var m = d.meals[i];
      if (m._salsaAuto || isSalsaMeal(m)) continue;
      if ((m.name || m.id) === name) {
        idx = i;
        break;
      }
    }
    if (idx < 0) return;
    d.meals.splice(idx, 1);
    persistFull(store);
    renderDayFromPatch();
    toast('Eliminado');
  };

  window._patchDelExtra = function (eidx) {
    var day = dayVal();
    var extra = getExtraMeals(day);
    extra.splice(eidx, 1);
    setExtraMeals(day, extra);
    renderDayFromPatch();
    toast('Eliminado');
  };

  window._addExtraFood = function (id) {
    var f = null;
    for (var i = 0; i < EXTRA_FOODS.length; i++) {
      if (EXTRA_FOODS[i].id === id) f = EXTRA_FOODS[i];
    }
    if (!f) return;
    var v = prompt('Cantidad de "' + f.name + '" (unidades)', '1');
    if (v == null || v === '') return;
    var qty = num(v) || 1;
    var day = dayVal();
    var extra = getExtraMeals(day);
    extra.push({
      _patchExtra: true,
      id: f.id,
      name: f.name,
      qty: qty,
      custom: true,
      kcal: Math.round(f.kcal * qty * 10) / 10,
      p: Math.round(f.p * qty * 10) / 10,
      c: Math.round(f.c * qty * 10) / 10,
      g: Math.round(f.g * qty * 10) / 10
    });
    setExtraMeals(day, extra);
    renderDayFromPatch();
    toast(f.name + (qty !== 1 ? ' × ' + qty : '') + ' agregado');
  };

  function injectExtraFoods() {
    var box = document.getElementById('food-quick');
    if (!box) return;
    EXTRA_FOODS.forEach(function (f) {
      if (box.querySelector('[data-extra="' + f.id + '"]')) return;
      var btn = document.createElement('button');
      btn.type = 'button';
      btn.className = 'food-btn';
      btn.setAttribute('data-extra', f.id);
      btn.innerHTML =
        '<b>' +
        f.name +
        '</b><div class="muted">' +
        f.cat +
        ' · ' +
        f.hint +
        '</div>';
      btn.onclick = function () {
        window._addExtraFood(f.id);
      };
      if (box.firstChild) box.insertBefore(btn, box.firstChild);
      else box.appendChild(btn);
    });
  }

  window.copyAlimentos = function () {
    applyAndSave();
    var day = dayVal();
    var t = patchDayTotals(day);
    var msg = 'REGISTRO DE ALIMENTOS Y MACROS\n\n';
    t.lines.forEach(function (L) {
      var m = L.m;
      var mac = L.mac;
      var label = m.name || 'Alimento';
      if (L.kind === 'salsa') label = label + ' (' + r0(m.grams) + ' g)';
      else if (m.byGram && m.grams) label = label + ' (' + r0(m.grams) + ' g)';
      else if (m.qty && m.qty !== 1) label = label + ' (' + m.qty + ')';
      msg +=
        '• ' +
        label +
        ': ' +
        r0(mac.kcal) +
        ' kcal | ' +
        r0(mac.p) +
        ' g P | ' +
        r0(mac.c) +
        ' g C | ' +
        r0(mac.g) +
        ' g G\n';
    });
    msg +=
      '\n------------------------------\n' +
      fmtDM(day) +
      '\nCalorías: ' +
      t.kcal +
      ' kcal\nProteínas: ' +
      t.p +
      ' g\nCarbohidratos: ' +
      t.c +
      ' g\nGrasas: ' +
      t.g +
      ' g';
    copyText(msg);
  };

  window.copyConsumoSalsas = function () {
    applyAndSave();
    var day = dayVal();
    var store = loadStore();
    var d = ensureDay(store, day);
    var msg = 'Consumo salsas ' + fmtShort(day) + '\n';
    var any = false;
    (d.pots || []).forEach(function (p) {
      var ini = potInicio(p);
      var fin = potFin(p);
      var gr = potConsumo(p);
      var label = potLabel(p);
      any = true;
      if (ini == null || fin == null) msg += label + ': (sin datos)\n';
      else if (!gr) msg += label + ': sin consumo\n';
      else msg += label + ' ' + r0(ini) + 'g-' + r0(fin) + 'g: ' + r0(gr) + 'g\n';
    });
    if (!any) msg += '(sin potes)\n';
    copyText(msg.trim());
  };

  window.copyCierreSalsas = function () {
    applyAndSave();
    var day = dayVal();
    var store = loadStore();
    var d = ensureDay(store, day);
    var msg = 'Cierre salsas ' + fmtShort(day) + '\n';
    (d.pots || []).forEach(function (p) {
      var fin = potFin(p);
      var w = fin == null ? '—' : r0(fin) + 'g';
      msg += potLabel(p) + ' ' + w + '\n';
    });
    copyText(msg.trim());
  };

  // ——— REPORTE + PDF ———
  window.exportPDF = function () {
    applyAndSave();
    var from = document.getElementById('r-from') && document.getElementById('r-from').value;
    var to = document.getElementById('r-to') && document.getElementById('r-to').value;
    if (!from || !to) {
      alert('Elige rango de fechas');
      return;
    }
    var days = daysInRange(from, to);
    var rows = days.map(function (day) {
      return { day: day, t: patchDayTotals(day) };
    });
    var withData = rows.filter(function (r) {
      return r.t.kcal > 0;
    });
    var n = withData.length || 1;
    var sum = { kcal: 0, p: 0, c: 0, g: 0 };
    withData.forEach(function (r) {
      sum.kcal += r.t.kcal;
      sum.p += r.t.p;
      sum.c += r.t.c;
      sum.g += r.t.g;
    });
    var det = patchPeriodDetail(days);

    var maxK = withData[0],
      minK = withData[0],
      maxP = withData[0],
      minP = withData[0];
    withData.forEach(function (r) {
      if (r.t.kcal > maxK.t.kcal) maxK = r;
      if (r.t.kcal < minK.t.kcal) minK = r;
      if (r.t.p > maxP.t.p) maxP = r;
      if (r.t.p < minP.t.p) minP = r;
    });

    try {
      var jsPDF = window.jspdf.jsPDF;
      var doc = new jsPDF({ unit: 'pt', format: 'a4' });
      var purple = [124, 58, 160];
      var pink = [236, 72, 153];
      var lilac = [248, 244, 255];

      // Header más ancho para que no corte fechas
      doc.setFillColor(lilac[0], lilac[1], lilac[2]);
      doc.rect(0, 0, 595, 78, 'F');
      doc.setFillColor(purple[0], purple[1], purple[2]);
      doc.roundedRect(40, 18, 515, 22, 10, 10, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10);
      doc.setTextColor(255, 255, 255);
      doc.text(
        ('MACROS MARTÍN · ' + fmtDM(from) + ' → ' + fmtDM(to)).toUpperCase(),
        52,
        33
      );
      doc.setFillColor(pink[0], pink[1], pink[2]);
      doc.roundedRect(40, 48, 90, 16, 8, 8, 'F');
      doc.setFontSize(9);
      doc.text('Reporte', 52, 59);

      var y = 95;
      doc.autoTable({
        startY: y,
        head: [['kcal prom.', 'P', 'C', 'G']],
        body: [
          [
            Math.round(sum.kcal / n),
            Math.round(sum.p / n) + ' g',
            Math.round(sum.c / n) + ' g',
            Math.round(sum.g / n) + ' g'
          ]
        ],
        headStyles: { fillColor: lilac, textColor: purple },
        margin: { left: 40, right: 40 }
      });

      // Máx / mín
      if (withData.length) {
        y = doc.lastAutoTable.finalY + 10;
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(9);
        doc.setTextColor(80, 60, 100);
        doc.text(
          'Más kcal: ' +
            maxK.t.kcal +
            ' (' +
            fmtDM(maxK.day) +
            ')   ·   Menos kcal: ' +
            minK.t.kcal +
            ' (' +
            fmtDM(minK.day) +
            ')',
          40,
          y
        );
        doc.text(
          'Más proteína: ' +
            maxP.t.p +
            ' g (' +
            fmtDM(maxP.day) +
            ')   ·   Menos proteína: ' +
            minP.t.p +
            ' g (' +
            fmtDM(minP.day) +
            ')',
          40,
          y + 14
        );
        y = y + 24;
      } else {
        y = doc.lastAutoTable.finalY + 12;
      }

      // Alimentos: Veces = cuántas veces se registró; Detalle = total unidades o %
      var foodBody = Object.keys(det.counts).map(function (name) {
        var c = det.counts[name];
        var detalle;
        if (c.isPct || name === 'Panquecas') {
          detalle = c.times + ' veces · % sumado ' + r0(c.qty);
        } else {
          detalle =
            c.times +
            ' veces · total ' +
            (Math.round(c.qty * 10) / 10) +
            ' uds';
        }
        return [name, String(c.times), detalle];
      });
      if (foodBody.length) {
        doc.autoTable({
          startY: y,
          head: [['Alimento', 'Veces', 'Detalle']],
          body: foodBody,
          headStyles: { fillColor: lilac, textColor: purple },
          margin: { left: 40, right: 40 },
          columnStyles: { 0: { cellWidth: 180 }, 1: { cellWidth: 50 }, 2: { cellWidth: 240 } }
        });
        y = doc.lastAutoTable.finalY + 12;
      }

      var salsaBody = Object.keys(det.salsaGrams).map(function (name) {
        return [name, r0(det.salsaGrams[name]) + ' g'];
      });
      if (salsaBody.length) {
        doc.autoTable({
          startY: y,
          head: [['Salsa', 'Consumo del período']],
          body: salsaBody,
          headStyles: { fillColor: lilac, textColor: purple },
          margin: { left: 40, right: 40 }
        });
        y = doc.lastAutoTable.finalY + 12;
      }

      doc.autoTable({
        startY: y,
        head: [['Día', 'kcal', 'P', 'C', 'G']],
        body: rows.map(function (r) {
          return [fmtDM(r.day), r.t.kcal, r.t.p, r.t.c, r.t.g];
        }),
        headStyles: { fillColor: lilac, textColor: purple },
        margin: { left: 40, right: 40 }
      });

      doc.save('macros_martin_' + from + '_' + to + '.pdf');
      toast('PDF listo');
    } catch (e) {
      console.error(e);
      alert('Error PDF: ' + (e && e.message ? e.message : e));
    }
  };

  window.renderReport = function () {
    applyAndSave();
    var from = document.getElementById('r-from') && document.getElementById('r-from').value;
    var to = document.getElementById('r-to') && document.getElementById('r-to').value;
    if (!from || !to) return;
    var days = daysInRange(from, to);
    var rows = days.map(function (day) {
      return { day: day, t: patchDayTotals(day) };
    });
    var withData = rows.filter(function (r) {
      return r.t.kcal > 0;
    });
    var n = withData.length || 1;
    var sum = { kcal: 0, p: 0, c: 0, g: 0 };
    withData.forEach(function (r) {
      sum.kcal += r.t.kcal;
      sum.p += r.t.p;
      sum.c += r.t.c;
      sum.g += r.t.g;
    });
    var avg = {
      kcal: r0(sum.kcal / n),
      p: r0(sum.p / n),
      c: r0(sum.c / n),
      g: r0(sum.g / n)
    };
    var maxK = withData[0],
      minK = withData[0],
      maxP = withData[0],
      minP = withData[0];
    withData.forEach(function (r) {
      if (!maxK || r.t.kcal > maxK.t.kcal) maxK = r;
      if (!minK || r.t.kcal < minK.t.kcal) minK = r;
      if (!maxP || r.t.p > maxP.t.p) maxP = r;
      if (!minP || r.t.p < minP.t.p) minP = r;
    });
    var det = patchPeriodDetail(days);

    var html =
      '<div class="sec" style="margin-top:0">Resumen ' +
      fmtDM(from) +
      ' → ' +
      fmtDM(to) +
      '</div>';
    html +=
      '<div class="grid2">' +
      '<div class="kpi"><div class="v">' +
      avg.kcal +
      '</div><div class="l">kcal prom.</div></div>' +
      '<div class="kpi"><div class="v">' +
      avg.p +
      ' g</div><div class="l">P prom.</div></div>' +
      '<div class="kpi"><div class="v">' +
      avg.c +
      ' g</div><div class="l">C prom.</div></div>' +
      '<div class="kpi"><div class="v">' +
      avg.g +
      ' g</div><div class="l">G prom.</div></div></div>';

    if (withData.length) {
      html +=
        '<p class="muted" style="margin-top:.75rem">Más kcal: <b>' +
        maxK.t.kcal +
        '</b> (' +
        fmtDM(maxK.day) +
        ') · Menos kcal: <b>' +
        minK.t.kcal +
        '</b> (' +
        fmtDM(minK.day) +
        ')</p>';
      html +=
        '<p class="muted">Más proteína: <b>' +
        maxP.t.p +
        ' g</b> (' +
        fmtDM(maxP.day) +
        ') · Menos proteína: <b>' +
        minP.t.p +
        ' g</b> (' +
        fmtDM(minP.day) +
        ')</p>';
    }

    html += '<div class="sec">Alimentos del período</div>';
    Object.keys(det.counts).forEach(function (name) {
      var c = det.counts[name];
      var detTxt;
      if (c.isPct || name === 'Panquecas') {
        detTxt = c.times + ' veces · % sumado: ' + r0(c.qty);
      } else {
        detTxt =
          c.times + ' veces · total: ' + Math.round(c.qty * 10) / 10 + ' uds';
      }
      html +=
        '<div class="item"><div><b>' +
        name +
        '</b><div class="muted">' +
        detTxt +
        '</div></div></div>';
    });

    html += '<div class="sec">Salsas del período</div>';
    Object.keys(det.salsaGrams).forEach(function (name) {
      html +=
        '<div class="item"><div><b>' +
        name +
        '</b><div class="muted">' +
        r0(det.salsaGrams[name]) +
        ' g</div></div></div>';
    });
    if (!Object.keys(det.salsaGrams).length) {
      html += '<p class="muted">Sin consumo de salsas en el rango.</p>';
    }

    html += '<div class="sec">Por día</div>';
    rows.forEach(function (r) {
      html +=
        '<div class="item"><div><b>' +
        fmtDM(r.day) +
        '</b><div class="muted">' +
        r.t.kcal +
        ' kcal | ' +
        r.t.p +
        ' P | ' +
        r.t.c +
        ' C | ' +
        r.t.g +
        ' G</div></div></div>';
    });

    var box = document.getElementById('report-box');
    if (box) box.innerHTML = html;
  };

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
      '• Eso se suma <b>una sola vez</b> a los macros del día<br>' +
      '• Dos potes de la misma salsa → se <b>suman</b> en un total<br>' +
      '• Rellenaron hoy → <b>Rellené</b>';
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
          var mac = gr != null ? macrosPer100(p.name, gr) : null;
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
          var mac = macrosPer100(p.name, gr);
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
    toast('Guardado · abre Día para ver el total');
  };

  var _saveDay = window.saveDay;
  window.saveDay = async function () {
    applyAndSave();
    if (typeof _saveDay === 'function') {
      try {
        await _saveDay();
      } catch (e) {}
    }
    setTimeout(renderDayFromPatch, 80);
    setTimeout(renderDayFromPatch, 350);
  };

  var _showTab = window.showTab;
  window.showTab = function (id) {
    if (id === 'dia') applyAndSave();
    if (typeof _showTab === 'function') _showTab(id);
    if (id === 'salsas') setTimeout(renderSalsasSimple, 30);
    if (id === 'dia') {
      setTimeout(renderDayFromPatch, 40);
      setTimeout(renderDayFromPatch, 200);
      setTimeout(renderDayFromPatch, 500);
    }
    if (id === 'reportes') setTimeout(function () {
      if (typeof window.renderReport === 'function') window.renderReport();
    }, 80);
  };

  function watchMealsList() {
    var root = document.getElementById('meals-list');
    if (!root || root._patchObs) return;
    root._patchObs = true;
    var timer = null;
    var rendering = false;
    new MutationObserver(function () {
      if (rendering) return;
      if (timer) clearTimeout(timer);
      timer = setTimeout(function () {
        var tab = document.getElementById('tab-dia');
        if (tab && !tab.classList.contains('hidden')) {
          rendering = true;
          try {
            renderDayFromPatch();
          } finally {
            setTimeout(function () {
              rendering = false;
            }, 100);
          }
        }
      }, 80);
    }).observe(root, { childList: true, subtree: true });
  }

  function hookDay() {
    var el = document.getElementById('day');
    if (!el || el._salsaHooked) return;
    el._salsaHooked = true;
    el.addEventListener('change', function () {
      setTimeout(function () {
        applyAndSave();
        renderSalsasSimple();
        renderDayFromPatch();
      }, 100);
    });
  }

  function start() {
    ensureDulceOption();
    improveHelp();
    hookDay();
    watchMealsList();
    // Migrar y subir a Firebase para sync teléfono/PC
    var store = loadStore();
    migrateExtraIntoStore(store);
    persistFull(store);
    applyAndSave();
    injectExtraFoods();
    var tabS = document.getElementById('tab-salsas');
    if (tabS && !tabS.classList.contains('hidden')) renderSalsasSimple();
    var tabD = document.getElementById('tab-dia');
    if (tabD && !tabD.classList.contains('hidden')) renderDayFromPatch();
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 900);
    });
  else setTimeout(start, 900);
})();
