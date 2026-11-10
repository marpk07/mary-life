/* Patch v17 — auto-carga PDF 02-05/11 + formulario macros completo */
(function () {
  var LS = 'MARY_ALIM_MARTIN_V1';
  var COL = 'mary_alimentacion';
  var DOC = 'martin_data';
  var PDF_DAYS = {
    '2026-11-02': { kcal: 1878, p: 105, c: 228, g: 58 },
    '2026-11-03': { kcal: 1696, p: 120, c: 177, g: 54 },
    '2026-11-04': { kcal: 3107, p: 164, c: 406, g: 91 },
    '2026-11-05': { kcal: 2583, p: 123, c: 348, g: 76 }
  };
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
    }, 3000);
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
  function saveLocalOnly(store) {
    try {
      localStorage.setItem(LS, JSON.stringify(store));
    } catch (e) {}
  }
  function ensureDay(store, day) {
    if (!store.days[day]) store.days[day] = { meals: [], pots: [], note: '' };
    var d = store.days[day];
    if (!d.meals) d.meals = [];
    if (!d.pots) d.pots = [];
    return d;
  }
  function dayHasData(d) {
    if (!d) return false;
    if (d.manual && (num(d.manual.kcal) || num(d.manual.p))) return true;
    if (d.meals && d.meals.length) return true;
    return false;
  }
  /** Fuerza los 4 días del PDF si faltan */
  function seedPdfDays(store) {
    var added = 0;
    Object.keys(PDF_DAYS).forEach(function (day) {
      var d = ensureDay(store, day);
      var m = PDF_DAYS[day];
      // Solo rellenar si no hay manual o está vacío
      if (!d.manual || !(num(d.manual.kcal) || num(d.manual.p))) {
        d.manual = {
          kcal: m.kcal,
          p: m.p,
          c: m.c,
          g: m.g,
          note: 'pdf-auto'
        };
        added++;
      }
    });
    return added;
  }
  function writeCloud(store) {
    store.updatedAt = Date.now();
    saveLocalOnly(store);
    try {
      if (!(window.firebase && firebase.apps && firebase.apps.length)) return;
      firebase
        .firestore()
        .collection(COL)
        .doc(DOC)
        .set(
          {
            days: store.days,
            extraMeals: store.extraMeals || {},
            updatedAt: store.updatedAt
          },
          { merge: true }
        )
        .then(function () {
          var el = document.getElementById('sync');
          if (el) {
            var n = 0;
            Object.keys(store.days || {}).forEach(function (k) {
              if (dayHasData(store.days[k])) n++;
            });
            el.textContent =
              '☁ ' + n + ' días con datos · ' + new Date().toLocaleTimeString();
          }
        })
        .catch(function (e) {
          console.warn(e);
        });
    } catch (e) {
      console.warn(e);
    }
  }
  function mealMacros(m) {
    if (!m) return { kcal: 0, p: 0, c: 0, g: 0 };
    if (m.custom || m._salsaAuto || m._patchExtra || m._manualDay)
      return { kcal: num(m.kcal), p: num(m.p), c: num(m.c), g: num(m.g) };
    if (m.byGram || m.salsa) {
      var per = PER100[m.name];
      if (!per) return { kcal: 0, p: 0, c: 0, g: 0 };
      var f = num(m.grams || m.qty) / 100;
      return {
        kcal: per.kcal * f,
        p: per.p * f,
        c: per.c * f,
        g: per.g * f
      };
    }
    var fx = FOODS_FIXED[m.id];
    if (fx) {
      var mult = num(m.qty) || 1;
      if (fx.pct) mult = mult / 100;
      return {
        kcal: fx.kcal * mult,
        p: fx.p * mult,
        c: fx.c * mult,
        g: fx.g * mult
      };
    }
    return { kcal: num(m.kcal), p: num(m.p), c: num(m.c), g: num(m.g) };
  }
  function getExtraMeals(day) {
    var store = loadStore();
    return ((store.extraMeals && store.extraMeals[day]) || []).slice();
  }
  function potConsumo(p) {
    if (p.inicio === '' || p.inicio == null || p.fin === '' || p.fin == null)
      return null;
    return Math.max(0, num(p.inicio) - num(p.fin));
  }
  function macrosPer100(name, grams) {
    var m = PER100[name];
    if (!m || !grams) return { kcal: 0, p: 0, c: 0, g: 0 };
    var f = num(grams) / 100;
    return { kcal: m.kcal * f, p: m.p * f, c: m.c * f, g: m.g * f };
  }
  function hybridSalsa(store, day) {
    var d = ensureDay(store, day);
    var out = {};
    (d.pots || []).forEach(function (p) {
      var gr = potConsumo(p);
      if (gr == null || gr <= 0) return;
      var n = p.name || 'Salsa';
      if (!out[n]) out[n] = 0;
      out[n] += gr;
    });
    return out;
  }

  function patchDayTotals(day) {
    var store = loadStore();
    var d = ensureDay(store, day);
    var total = { kcal: 0, p: 0, c: 0, g: 0 };
    var lines = [];

    if (
      d.manual &&
      (num(d.manual.kcal) ||
        num(d.manual.p) ||
        num(d.manual.c) ||
        num(d.manual.g))
    ) {
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
        m: { name: 'Registro manual del día', _manualDay: true },
        mac: mm,
        kind: 'manual'
      });
    }

    (d.meals || []).forEach(function (m) {
      if (m._salsaAuto || m._manualDay) return;
      var n = String(m.name || '').toLowerCase();
      if (n.indexOf('· salsa') >= 0) return;
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

    var salsa = hybridSalsa(store, day);
    Object.keys(salsa).forEach(function (name) {
      var gr = salsa[name];
      var mac = macrosPer100(name, gr);
      total.kcal += mac.kcal;
      total.p += mac.p;
      total.c += mac.c;
      total.g += mac.g;
      lines.push({
        m: { name: name, grams: gr },
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

  function injectManualForm() {
    var tab = document.getElementById('tab-dia');
    if (!tab) return;
    var existing = tab.querySelector('[data-manual-form]');
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    var man = d.manual || {};
    var html =
      '<div class="sec" style="margin-top:0">Registro manual del día</div>' +
      '<p class="muted" style="margin:.2rem 0 .45rem">Los 4 campos. Luego <b>Guardar macros</b>.</p>' +
      '<div class="grid2" style="margin-bottom:.4rem">' +
      '<div><label>kcal</label><input type="number" inputmode="decimal" id="man-kcal" value="' +
      (man.kcal != null && man.kcal !== '' ? man.kcal : '') +
      '"></div>' +
      '<div><label>Proteína (g)</label><input type="number" inputmode="decimal" id="man-p" value="' +
      (man.p != null && man.p !== '' ? man.p : '') +
      '"></div>' +
      '<div><label>Carbos (g)</label><input type="number" inputmode="decimal" id="man-c" value="' +
      (man.c != null && man.c !== '' ? man.c : '') +
      '"></div>' +
      '<div><label>Grasas (g)</label><input type="number" inputmode="decimal" id="man-g" value="' +
      (man.g != null && man.g !== '' ? man.g : '') +
      '"></div></div>' +
      '<div class="row">' +
      '<button type="button" class="btn btn-main" onclick="window._saveManualForm()">💾 Guardar macros</button>' +
      '<button type="button" class="btn btn-ghost" onclick="window._clearManualDay()">Quitar</button>' +
      '<button type="button" class="btn btn-pink" onclick="window._forcePdfSeed()">📋 Cargar 02–05/11 del PDF</button>' +
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
    } else tab.insertBefore(box, tab.firstChild);
  }

  window._saveManualForm = function () {
    var kcal = num(document.getElementById('man-kcal') && document.getElementById('man-kcal').value);
    var p = num(document.getElementById('man-p') && document.getElementById('man-p').value);
    var c = num(document.getElementById('man-c') && document.getElementById('man-c').value);
    var g = num(document.getElementById('man-g') && document.getElementById('man-g').value);
    if (!kcal && !p && !c && !g) {
      toast('Escribe al menos un valor');
      return;
    }
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    d.manual = { kcal: kcal, p: p, c: c, g: g, note: 'manual' };
    writeCloud(store);
    renderDayFromPatch();
    toast('Guardado: ' + r0(kcal) + ' kcal · ' + r0(p) + 'P · ' + r0(c) + 'C · ' + r0(g) + 'G');
  };

  window._clearManualDay = function () {
    var store = loadStore();
    var d = ensureDay(store, dayVal());
    d.manual = null;
    writeCloud(store);
    renderDayFromPatch();
    toast('Manual quitado');
  };

  window._forcePdfSeed = function () {
    var store = loadStore();
    Object.keys(PDF_DAYS).forEach(function (day) {
      var d = ensureDay(store, day);
      var m = PDF_DAYS[day];
      d.manual = { kcal: m.kcal, p: m.p, c: m.c, g: m.g, note: 'pdf' };
    });
    writeCloud(store);
    renderDayFromPatch();
    toast('PDF 02–05/11 cargado (kcal+P+C+G)');
    setTimeout(function () {
      if (typeof window.renderReport === 'function') window.renderReport();
    }, 400);
  };

  function renderDayFromPatch() {
    injectManualForm();
    var list = document.getElementById('meals-list');
    var kpis = document.getElementById('kpis');
    if (!list) return;
    var t = patchDayTotals(dayVal());
    var html = '';
    t.lines.forEach(function (L) {
      var m = L.m;
      var mac = L.mac;
      var label = m.name || 'Alimento';
      if (L.kind === 'salsa') label += ' (' + r0(m.grams) + ' g) · salsa';
      if (L.kind === 'manual') label = '✍️ ' + label;
      if (m.qty && m.qty !== 1 && L.kind !== 'manual') label += ' × ' + m.qty;
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
        ' g G</div></div></div>';
    });
    if (!html)
      html =
        '<p class="muted">Sin datos. Usa el formulario de arriba o <b>Cargar 02–05/11 del PDF</b>.</p>';
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
    // extra foods
    var box = document.getElementById('food-quick');
    if (box) {
      EXTRA_FOODS.forEach(function (f) {
        if (box.querySelector('[data-extra="' + f.id + '"]')) return;
        var btn = document.createElement('button');
        btn.type = 'button';
        btn.className = 'food-btn';
        btn.setAttribute('data-extra', f.id);
        btn.innerHTML =
          '<b>' + f.name + '</b><div class="muted">' + f.cat + ' · ' + f.hint + '</div>';
        btn.onclick = function () {
          var v = prompt('Cantidad de "' + f.name + '"', '1');
          if (v == null || v === '') return;
          var qty = num(v) || 1;
          var store = loadStore();
          if (!store.extraMeals) store.extraMeals = {};
          var day = dayVal();
          if (!store.extraMeals[day]) store.extraMeals[day] = [];
          store.extraMeals[day].push({
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
          writeCloud(store);
          renderDayFromPatch();
        };
        if (box.firstChild) box.insertBefore(btn, box.firstChild);
        else box.appendChild(btn);
      });
    }
  }

  window.renderReport = function () {
    // asegurar seed antes de reportar
    var store = loadStore();
    var added = seedPdfDays(store);
    if (added) writeCloud(store);

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

  window.exportPDF = function () {
    var store = loadStore();
    seedPdfDays(store);
    writeCloud(store);
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
  };

  window.copyAlimentos = function () {
    var t = patchDayTotals(dayVal());
    var msg = 'REGISTRO DE ALIMENTOS Y MACROS\n\n';
    t.lines.forEach(function (L) {
      msg +=
        '• ' +
        (L.m.name || '') +
        ': ' +
        r0(L.mac.kcal) +
        ' kcal | ' +
        r0(L.mac.p) +
        'P | ' +
        r0(L.mac.c) +
        'C | ' +
        r0(L.mac.g) +
        'G\n';
    });
    msg +=
      '\n' +
      fmtDM(dayVal()) +
      '\nCalorías: ' +
      t.kcal +
      '\nProteínas: ' +
      t.p +
      '\nCarbohidratos: ' +
      t.c +
      '\nGrasas: ' +
      t.g;
    if (navigator.clipboard)
      navigator.clipboard.writeText(msg).then(function () {
        toast('Copiado ✓');
      });
    else prompt('Copia', msg);
  };

  var _showTab = window.showTab;
  window.showTab = function (id) {
    if (typeof _showTab === 'function') _showTab(id);
    if (id === 'dia') setTimeout(renderDayFromPatch, 60);
    if (id === 'reportes')
      setTimeout(function () {
        window.renderReport();
      }, 80);
  };

  function start() {
    var store = loadStore();
    var added = seedPdfDays(store);
    writeCloud(store);
    if (added) toast('Se cargaron ' + added + ' días del PDF (02–05/11)');
    renderDayFromPatch();
    var el = document.getElementById('day');
    if (el && !el._hooked) {
      el._hooked = true;
      el.addEventListener('change', function () {
        setTimeout(renderDayFromPatch, 80);
      });
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 1000);
    });
  else setTimeout(start, 1000);
})();
