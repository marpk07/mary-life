/* Patch v16 — Formulario macros kcal/P/C/G + carga rápida + merge seguro */
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
  // Datos del PDF 02–05/11 para recuperación rápida
  var PDF_DAYS = {
    '2026-11-02': { kcal: 1878, p: 105, c: 228, g: 58 },
    '2026-11-03': { kcal: 1696, p: 120, c: 177, g: 54 },
    '2026-11-04': { kcal: 3107, p: 164, c: 406, g: 91 },
    '2026-11-05': { kcal: 2583, p: 123, c: 348, g: 76 }
  };

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
    }, 2800);
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
  function dayRichness(d) {
    if (!d) return 0;
    var n = ((d.meals && d.meals.length) || 0) + ((d.pots && d.pots.length) || 0);
    if (d.manual && (d.manual.kcal || d.manual.p)) n += 5;
    return n;
  }
  function storeRichness(s) {
    if (!s || !s.days) return 0;
    var n = 0;
    Object.keys(s.days).forEach(function (k) {
      n += dayRichness(s.days[k]);
    });
    return n;
  }
  function mergeDay(a, b) {
    if (!a) return b || { meals: [], pots: [], note: '' };
    if (!b) return a;
    var out = {
      meals: [],
      pots: [],
      note: a.note || b.note || '',
      manual: a.manual || b.manual || null
    };
    if (b.manual && (!a.manual || (b.manual.kcal || 0) > (a.manual.kcal || 0)))
      out.manual = b.manual;
    var seen = {};
    function addMeals(list) {
      (list || []).forEach(function (m) {
        var key =
          (m.id || '') +
          '|' +
          (m.name || '') +
          '|' +
          (m.qty || '') +
          '|' +
          (m.grams || '') +
          '|' +
          (m.kcal || '');
        if (seen[key]) return;
        seen[key] = 1;
        out.meals.push(m);
      });
    }
    if ((a.meals || []).length >= (b.meals || []).length) {
      addMeals(a.meals);
      addMeals(b.meals);
    } else {
      addMeals(b.meals);
      addMeals(a.meals);
    }
    function potKey(p) {
      return (p.name || '') + '||' + (p.label || '') + '||' + (p.id || '');
    }
    var potMap = {};
    function mergePot(p) {
      if (!p) return;
      var k = potKey(p);
      if (!potMap[k]) {
        potMap[k] = JSON.parse(JSON.stringify(p));
        return;
      }
      var t = potMap[k];
      ['weight', 'mid', 'inicio', 'fin', 'base', 'label'].forEach(function (f) {
        if ((t[f] === '' || t[f] == null) && p[f] !== '' && p[f] != null) t[f] = p[f];
      });
    }
    (a.pots || []).forEach(mergePot);
    (b.pots || []).forEach(mergePot);
    out.pots = Object.keys(potMap).map(function (k) {
      return potMap[k];
    });
    return out;
  }
  function mergeStores(local, cloud) {
    var out = {
      days: {},
      extraMeals: {},
      updatedAt: Math.max(local.updatedAt || 0, cloud.updatedAt || 0)
    };
    var allDays = {};
    Object.keys(local.days || {}).forEach(function (k) {
      allDays[k] = 1;
    });
    Object.keys(cloud.days || {}).forEach(function (k) {
      allDays[k] = 1;
    });
    Object.keys(allDays).forEach(function (day) {
      out.days[day] = mergeDay(local.days && local.days[day], cloud.days && cloud.days[day]);
    });
    var allExtra = {};
    Object.keys(local.extraMeals || {}).forEach(function (k) {
      allExtra[k] = 1;
    });
    Object.keys(cloud.extraMeals || {}).forEach(function (k) {
      allExtra[k] = 1;
    });
    Object.keys(allExtra).forEach(function (day) {
      var a = (local.extraMeals && local.extraMeals[day]) || [];
      var b = (cloud.extraMeals && cloud.extraMeals[day]) || [];
      var seen = {};
      var list = [];
      a.concat(b).forEach(function (m) {
        var key = (m.id || '') + '|' + (m.qty || '') + '|' + (m.kcal || '');
        if (seen[key]) return;
        seen[key] = 1;
        list.push(m);
      });
      out.extraMeals[day] = list;
    });
    return out;
  }
  function getExtraMeals(day) {
    var store = loadStore();
    return ((store.extraMeals && store.extraMeals[day]) || []).slice();
  }
  function setExtraMeals(day, meals) {
    var store = loadStore();
    if (!store.extraMeals) store.extraMeals = {};
    store.extraMeals[day] = meals || [];
    saveLocalOnly(store);
    safeCloudWrite(store);
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
    if (m.custom || m._salsaAuto || m._patchExtra || m._manualDay)
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
    return false;
  }
  function buildSalsaTotalsNew(pots) {
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
  function softSyncSalsaMeals(d) {
    d.meals = (d.meals || []).filter(function (m) {
      return !m._salsaAuto;
    });
    var byName = buildSalsaTotalsNew(d.pots);
    Object.keys(byName).forEach(function (name) {
      var info = byName[name];
      var gr = info.grams;
      if (gr <= 0) return;
      var mac = macrosPer100(name, gr);
      d.meals.push({
        _salsaAuto: true,
        id: 'salsa_' + name.replace(/\s+/g, '_').slice(0, 24),
        name: name + ' (' + r0(gr) + ' g) · salsa',
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
  function saveLocalOnly(store) {
    try {
      localStorage.setItem(LS, JSON.stringify(store));
    } catch (e) {}
  }
  function safeCloudWrite(store) {
    try {
      if (!(window.firebase && firebase.apps && firebase.apps.length)) return;
      var db = firebase.firestore();
      db.collection(COL)
        .doc(DOC)
        .get()
        .then(function (snap) {
          var cloud = snap.exists ? snap.data() : { days: {}, updatedAt: 0 };
          if (!cloud.days) cloud.days = {};
          var merged = mergeStores(store, cloud);
          if (storeRichness(merged) < storeRichness(cloud) * 0.5 && storeRichness(cloud) > 5) {
            saveLocalOnly(mergeStores(cloud, store));
            return;
          }
          merged.updatedAt = Date.now();
          return db
            .collection(COL)
            .doc(DOC)
            .set(merged, { merge: false })
            .then(function () {
              saveLocalOnly(merged);
              updateSyncStatus(merged);
            });
        })
        .catch(function (e) {
          console.warn(e);
        });
    } catch (e) {
      console.warn(e);
    }
  }
  function applyAndSave() {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    softSyncSalsaMeals(d);
    saveLocalOnly(store);
    safeCloudWrite(store);
    return d;
  }
  function pullCloudMerge() {
    try {
      if (!(window.firebase && firebase.apps && firebase.apps.length))
        return Promise.resolve(loadStore());
      var db = firebase.firestore();
      return db
        .collection(COL)
        .doc(DOC)
        .get()
        .then(function (snap) {
          var local = loadStore();
          if (!snap.exists) {
            saveLocalOnly(local);
            updateSyncStatus(local);
            return local;
          }
          var cloud = snap.data() || {};
          if (!cloud.days) cloud.days = {};
          var merged =
            storeRichness(cloud) > storeRichness(local)
              ? mergeStores(cloud, local)
              : mergeStores(local, cloud);
          saveLocalOnly(merged);
          updateSyncStatus(merged);
          return merged;
        });
    } catch (e) {
      return Promise.resolve(loadStore());
    }
  }
  function updateSyncStatus(store) {
    var el = document.getElementById('sync');
    if (!el) return;
    var nd = Object.keys(store.days || {}).filter(function (k) {
      return dayRichness(store.days[k]) > 0;
    }).length;
    el.textContent =
      '☁ ' + nd + ' días con datos · ' + new Date().toLocaleTimeString();
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
  function prevDayStr(day) {
    var d = new Date(day + 'T12:00:00');
    d.setDate(d.getDate() - 1);
    return (
      d.getFullYear() +
      '-' +
      String(d.getMonth() + 1).padStart(2, '0') +
      '-' +
      String(d.getDate()).padStart(2, '0')
    );
  }
  function hybridSalsaGrams(store, day) {
    var d = ensureDay(store, day);
    var byName = buildSalsaTotalsNew(d.pots);
    if (Object.keys(byName).length) return byName;
    var prev = ensureDay(store, prevDayStr(day));
    function byNameList(list) {
      var map = {};
      (list || []).forEach(function (p) {
        if (!map[p.name]) map[p.name] = [];
        map[p.name].push(p);
      });
      return map;
    }
    var tMap = byNameList(d.pots);
    var pMap = byNameList(prev.pots);
    var names = {};
    Object.keys(tMap).forEach(function (n) {
      names[n] = 1;
    });
    Object.keys(pMap).forEach(function (n) {
      names[n] = 1;
    });
    var out = {};
    Object.keys(names).forEach(function (name) {
      var ta = tMap[name] || [];
      var pa = pMap[name] || [];
      var n = Math.max(ta.length, pa.length);
      for (var i = 0; i < n; i++) {
        var pw =
          pa[i] && pa[i].weight !== '' && pa[i].weight != null
            ? num(pa[i].weight)
            : null;
        var tw =
          ta[i] && ta[i].weight !== '' && ta[i].weight != null
            ? num(ta[i].weight)
            : null;
        if (pw == null || tw == null) continue;
        var gr = Math.max(0, pw - tw);
        if (gr <= 0) continue;
        if (!out[name]) out[name] = { grams: 0, labels: [] };
        out[name].grams += gr;
      }
    });
    return out;
  }

  function patchDayTotals(day) {
    var store = loadStore();
    var d = ensureDay(store, day);
    var total = { kcal: 0, p: 0, c: 0, g: 0 };
    var lines = [];

    if (d.manual && (num(d.manual.kcal) || num(d.manual.p) || num(d.manual.c) || num(d.manual.g))) {
      var mm = {
        kcal: num(d.manual.kcal),
        p: num(d.manual.p),
        c: num(d.manual.c),
        g: num(d.manual.g)
      };
      total.kcal += mm.kcal;
      total.p += mm.p;
      total.c += mm.c;
      total.g += mm.g;
      lines.push({
        m: {
          name: 'Registro manual del día',
          _manualDay: true,
          custom: true,
          kcal: mm.kcal,
          p: mm.p,
          c: mm.c,
          g: mm.g
        },
        mac: mm,
        kind: 'manual'
      });
    }

    (d.meals || []).forEach(function (m) {
      if (m._salsaAuto || isSalsaMeal(m) || m._patchExtra || m._manualDay) return;
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

    var byName = hybridSalsaGrams(store, day);
    Object.keys(byName).forEach(function (name) {
      var info = byName[name];
      var gr = info.grams;
      if (gr <= 0) return;
      var mac = macrosPer100(name, gr);
      total.kcal += mac.kcal;
      total.p += mac.p;
      total.c += mac.c;
      total.g += mac.g;
      lines.push({
        m: { name: name, grams: gr, salsa: true },
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
    var store = loadStore();
    var counts = {};
    var salsaGrams = {};
    days.forEach(function (day) {
      var d = ensureDay(store, day);
      if (d.manual && (num(d.manual.kcal) || num(d.manual.p))) {
        var key = 'Registro manual del día';
        if (!counts[key]) counts[key] = { qty: 0, times: 0, isPct: false };
        counts[key].times += 1;
        counts[key].qty += 1;
      }
      (d.meals || []).forEach(function (m) {
        if (m._salsaAuto || isSalsaMeal(m) || m._manualDay) return;
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
      var byName = hybridSalsaGrams(store, day);
      Object.keys(byName).forEach(function (name) {
        if (!salsaGrams[name]) salsaGrams[name] = 0;
        salsaGrams[name] += byName[name].grams;
      });
    });
    return { counts: counts, salsaGrams: salsaGrams };
  }

  function injectManualForm() {
    var tab = document.getElementById('tab-dia');
    if (!tab) return;
    var existing = tab.querySelector('[data-manual-form]');
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    var man = d.manual || {};

    var html =
      '<div class="sec" style="margin-top:0">Registro manual del día</div>' +
      '<p class="muted" style="margin:.2rem 0 .45rem">Escribe los 4 valores y pulsa Guardar. Sirve si Bayer (u otro) ya te dio el total.</p>' +
      '<div class="grid2" style="margin-bottom:.4rem">' +
      '<div><label>kcal</label><input type="number" inputmode="decimal" id="man-kcal" value="' +
      (man.kcal != null ? man.kcal : '') +
      '" placeholder="ej. 1878"></div>' +
      '<div><label>Proteína (g)</label><input type="number" inputmode="decimal" id="man-p" value="' +
      (man.p != null ? man.p : '') +
      '" placeholder="ej. 105"></div>' +
      '<div><label>Carbos (g)</label><input type="number" inputmode="decimal" id="man-c" value="' +
      (man.c != null ? man.c : '') +
      '" placeholder="ej. 228"></div>' +
      '<div><label>Grasas (g)</label><input type="number" inputmode="decimal" id="man-g" value="' +
      (man.g != null ? man.g : '') +
      '" placeholder="ej. 58"></div>' +
      '</div>' +
      '<div class="row">' +
      '<button type="button" class="btn btn-main" onclick="window._saveManualForm()">💾 Guardar macros</button>' +
      '<button type="button" class="btn btn-ghost" onclick="window._clearManualDay()">Quitar</button>' +
      '<button type="button" class="btn btn-pink" onclick="window._loadPdfDays()">📋 Cargar 02–05/11 del PDF</button>' +
      '</div>';

    if (existing) {
      existing.innerHTML = html;
      return;
    }
    var box = document.createElement('div');
    box.className = 'glass';
    box.setAttribute('data-manual-form', '1');
    box.innerHTML = html;
    var mealsList = document.getElementById('meals-list');
    if (mealsList && mealsList.parentElement && mealsList.parentElement.parentElement) {
      mealsList.parentElement.parentElement.insertBefore(box, mealsList.parentElement);
    } else {
      tab.insertBefore(box, tab.firstChild);
    }
  }

  window._saveManualForm = function () {
    var kcalEl = document.getElementById('man-kcal');
    var pEl = document.getElementById('man-p');
    var cEl = document.getElementById('man-c');
    var gEl = document.getElementById('man-g');
    if (!kcalEl) return;
    var kcal = num(kcalEl.value);
    var p = num(pEl && pEl.value);
    var c = num(cEl && cEl.value);
    var g = num(gEl && gEl.value);
    if (!kcal && !p && !c && !g) {
      toast('Escribe al menos un valor');
      return;
    }
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    d.manual = { kcal: kcal, p: p, c: c, g: g, note: 'manual' };
    saveLocalOnly(store);
    safeCloudWrite(store);
    renderDayFromPatch();
    toast(
      'Guardado: ' +
        r0(kcal) +
        ' kcal · ' +
        r0(p) +
        'P · ' +
        r0(c) +
        'C · ' +
        r0(g) +
        'G'
    );
  };

  window._clearManualDay = function () {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    d.manual = null;
    saveLocalOnly(store);
    safeCloudWrite(store);
    renderDayFromPatch();
    toast('Manual quitado');
  };

  window._loadPdfDays = function () {
    if (
      !confirm(
        '¿Cargar macros de 02, 03, 04 y 05/11/2026 desde el PDF (kcal+P+C+G)?'
      )
    )
      return;
    var store = loadStore();
    Object.keys(PDF_DAYS).forEach(function (day) {
      var d = ensureDay(store, day);
      var m = PDF_DAYS[day];
      d.manual = {
        kcal: m.kcal,
        p: m.p,
        c: m.c,
        g: m.g,
        note: 'pdf'
      };
    });
    saveLocalOnly(store);
    safeCloudWrite(store);
    renderDayFromPatch();
    toast('4 días del PDF cargados');
    // refrescar reporte si está visible
    if (typeof window.renderReport === 'function') {
      setTimeout(window.renderReport, 300);
    }
  };

  function renderDayFromPatch() {
    var store = loadStore();
    var day = dayVal();
    var d = ensureDay(store, day);
    softSyncSalsaMeals(d);
    saveLocalOnly(store);
    injectManualForm();

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
      if (L.kind === 'salsa') label = label + ' (' + r0(m.grams) + ' g) · salsa';
      else if (L.kind === 'manual') label = '✍️ ' + label;
      else if (m.byGram && m.grams) label = label + ' (' + r0(m.grams) + ' g)';
      else if (m.qty && m.qty !== 1 && !m.byGram) label = label + ' × ' + m.qty;
      var delBtn = '';
      if (L.kind === 'manual') {
        delBtn =
          '<button type="button" class="btn btn-ghost" onclick="window._clearManualDay()">✕</button>';
      } else if (L.kind === 'extra') {
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
        '<div class="item"><div><b>' +
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
        '<p class="muted">Sin comidas. Completa el formulario de arriba (kcal, P, C, G) y Guardar.</p>';
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
      if (m._salsaAuto || isSalsaMeal(m) || m._manualDay) continue;
      if ((m.name || m.id) === name) {
        idx = i;
        break;
      }
    }
    if (idx < 0) return;
    d.meals.splice(idx, 1);
    saveLocalOnly(store);
    safeCloudWrite(store);
    renderDayFromPatch();
  };

  window._patchDelExtra = function (eidx) {
    var day = dayVal();
    var extra = getExtraMeals(day);
    extra.splice(eidx, 1);
    setExtraMeals(day, extra);
    renderDayFromPatch();
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
    var byName = hybridSalsaGrams(store, day);
    var msg = 'Consumo salsas ' + fmtShort(day) + '\n';
    Object.keys(byName).forEach(function (name) {
      msg += name + ': ' + r0(byName[name].grams) + 'g\n';
    });
    if (!Object.keys(byName).length) msg += '(sin datos)\n';
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
      var w =
        fin != null
          ? r0(fin) + 'g'
          : p.weight !== '' && p.weight != null
            ? r0(num(p.weight)) + 'g'
            : '—';
      msg += potLabel(p) + ' ' + w + '\n';
    });
    copyText(msg.trim());
  };

  window.exportPDF = function () {
    pullCloudMerge().then(function () {
      var from = document.getElementById('r-from') && document.getElementById('r-from').value;
      var to = document.getElementById('r-to') && document.getElementById('r-to').value;
      if (!from || !to) return alert('Elige rango');
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
        var purple = [124, 58, 160],
          pink = [236, 72, 153],
          lilac = [248, 244, 255];
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
        doc.autoTable({
          startY: 95,
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
        var y = doc.lastAutoTable.finalY + 10;
        if (withData.length) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(9);
          doc.setTextColor(80, 60, 100);
          doc.text(
            'Más kcal: ' +
              maxK.t.kcal +
              ' (' +
              fmtDM(maxK.day) +
              ') · Menos kcal: ' +
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
              ') · Menos proteína: ' +
              minP.t.p +
              ' g (' +
              fmtDM(minP.day) +
              ')',
            40,
            y + 14
          );
          y += 28;
        }
        var foodBody = Object.keys(det.counts).map(function (name) {
          var c = det.counts[name];
          var detalle =
            c.isPct || name === 'Panquecas'
              ? c.times + ' veces · % sumado ' + r0(c.qty)
              : c.times + ' veces · total ' + Math.round(c.qty * 10) / 10 + ' uds';
          return [name, String(c.times), detalle];
        });
        if (foodBody.length) {
          doc.autoTable({
            startY: y,
            head: [['Alimento', 'Veces', 'Detalle']],
            body: foodBody,
            headStyles: { fillColor: lilac, textColor: purple },
            margin: { left: 40, right: 40 }
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
        alert('Error PDF');
      }
    });
  };

  window.renderReport = function () {
    pullCloudMerge().then(function () {
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
      } else {
        html +=
          '<p class="muted" style="margin-top:.75rem">Sin datos. En Día usa <b>Cargar 02–05/11 del PDF</b> o el formulario de macros.</p>';
      }
      html += '<div class="sec">Alimentos del período</div>';
      Object.keys(det.counts).forEach(function (name) {
        var c = det.counts[name];
        var detTxt =
          c.isPct || name === 'Panquecas'
            ? c.times + ' veces · % sumado: ' + r0(c.qty)
            : c.times + ' veces · total: ' + Math.round(c.qty * 10) / 10 + ' uds';
        html +=
          '<div class="item"><div><b>' +
          name +
          '</b><div class="muted">' +
          detTxt +
          '</div></div></div>';
      });
      if (!Object.keys(det.counts).length)
        html += '<p class="muted">Sin alimentos.</p>';
      html += '<div class="sec">Salsas del período</div>';
      Object.keys(det.salsaGrams).forEach(function (name) {
        html +=
          '<div class="item"><div><b>' +
          name +
          '</b><div class="muted">' +
          r0(det.salsaGrams[name]) +
          ' g</div></div></div>';
      });
      if (!Object.keys(det.salsaGrams).length)
        html += '<p class="muted">Sin salsas.</p>';
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
    });
  };

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

  function renderSalsasSimple() {
    ensureDulceOption();
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
                ? '<b>0 g</b>'
                : '<b>' + r0(gr) + ' g</b> → día · ' + r0(mac.kcal) + ' kcal';
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
            '" onchange="window._salsaUpd(' +
            i +
            ',\'inicio\',this.value)"></div>' +
            '<div><label>Fin (g)</label><input type="number" step="1" inputmode="decimal" value="' +
            fin +
            '" onchange="window._salsaUpd(' +
            i +
            ',\'fin\',this.value)"></div></div>' +
            '<div style="margin-top:.45rem;font-size:.8rem">' +
            consTxt +
            '</div></div>'
          );
        })
        .join('');
    }
    if (cons) {
      var byName = hybridSalsaGrams(store, dayVal());
      var totalK = 0;
      var rows = Object.keys(byName)
        .map(function (name) {
          var gr = byName[name].grams;
          var mac = macrosPer100(name, gr);
          totalK += mac.kcal;
          return (
            '<div class="item"><div><b>' +
            name +
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
        (rows || '<p class="muted">Sin datos.</p>');
    }
  }

  window._salsaUpd = function (i, field, val) {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    if (!d.pots[i]) return;
    if (field === 'inicio' || field === 'fin') {
      d.pots[i][field] = val === '' ? '' : num(val);
    } else d.pots[i][field] = val;
    softSyncSalsaMeals(d);
    saveLocalOnly(store);
    safeCloudWrite(store);
    renderSalsasSimple();
  };
  window._salsaDel = function (i) {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    d.pots.splice(i, 1);
    softSyncSalsaMeals(d);
    saveLocalOnly(store);
    safeCloudWrite(store);
    renderSalsasSimple();
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
    var ini = prompt('Inicio de "' + name + '" (g)', '');
    d.pots.push({
      id: 's' + Date.now(),
      name: name,
      label: same ? String(same + 1) : '',
      inicio: ini === '' || ini == null ? '' : num(ini),
      fin: '',
      weight: '',
      mid: ''
    });
    softSyncSalsaMeals(d);
    saveLocalOnly(store);
    safeCloudWrite(store);
    renderSalsasSimple();
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
    toast('Guardado');
  };

  var _saveDay = window.saveDay;
  window.saveDay = async function () {
    applyAndSave();
    if (typeof _saveDay === 'function') {
      try {
        await _saveDay();
      } catch (e) {}
    }
    setTimeout(renderDayFromPatch, 100);
  };

  var _showTab = window.showTab;
  window.showTab = function (id) {
    if (typeof _showTab === 'function') _showTab(id);
    if (id === 'salsas') setTimeout(renderSalsasSimple, 40);
    if (id === 'dia') setTimeout(renderDayFromPatch, 80);
    if (id === 'reportes')
      setTimeout(function () {
        if (typeof window.renderReport === 'function') window.renderReport();
      }, 100);
  };

  function start() {
    ensureDulceOption();
    pullCloudMerge().then(function () {
      injectExtraFoods();
      injectManualForm();
      var tabS = document.getElementById('tab-salsas');
      if (tabS && !tabS.classList.contains('hidden')) renderSalsasSimple();
      var tabD = document.getElementById('tab-dia');
      if (tabD && !tabD.classList.contains('hidden')) renderDayFromPatch();
    });
    var el = document.getElementById('day');
    if (el && !el._salsaHooked) {
      el._salsaHooked = true;
      el.addEventListener('change', function () {
        setTimeout(function () {
          renderSalsasSimple();
          renderDayFromPatch();
        }, 100);
      });
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 1100);
    });
  else setTimeout(start, 1100);
})();
