/* Patch v20 — estable: core intacto + inicio salsa + manual día + borrar OK */
(function () {
  var LS = 'MARY_ALIM_MARTIN_V1';
  var COL = 'mary_alimentacion';
  var DOC = 'martin_data';
  var REAL_DAYS = {
    '2026-11-02': { kcal: 2026, p: 109, c: 254, g: 61 },
    '2026-11-03': { kcal: 2387, p: 137, c: 302, g: 67 },
    '2026-11-04': { kcal: 2934, p: 163, c: 362, g: 91 },
    '2026-11-05': { kcal: 2583, p: 123, c: 348, g: 76 },
    '2026-11-06': { kcal: 1946, p: 108, c: 239, g: 59 },
    '2026-11-07': { kcal: 2357, p: 124, c: 273, g: 84 },
    '2026-11-08': { kcal: 2480, p: 127, c: 331, g: 72 }
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
  function loadLocal() {
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
  function saveLocal(store) {
    try {
      localStorage.setItem(LS, JSON.stringify(store));
    } catch (e) {}
  }
  function ensureLocal(store, day) {
    if (!store.days[day]) store.days[day] = { meals: [], pots: [], note: '' };
    if (!store.days[day].meals) store.days[day].meals = [];
    if (!store.days[day].pots) store.days[day].pots = [];
    return store.days[day];
  }
  function seedRealDays() {
    var store = loadLocal();
    Object.keys(REAL_DAYS).forEach(function (day) {
      var d = ensureLocal(store, day);
      var m = REAL_DAYS[day];
      d.manual = {
        kcal: m.kcal,
        p: m.p,
        c: m.c,
        g: m.g,
        note: 'notion'
      };
    });
    store.updatedAt = Date.now();
    saveLocal(store);
    // no pisar comidas/pots de la nube: merge solo manual
    try {
      if (window.firebase && firebase.apps && firebase.apps.length) {
        var db = firebase.firestore();
        db.collection(COL)
          .doc(DOC)
          .get()
          .then(function (snap) {
            var cloud = snap.exists ? snap.data() : { days: {} };
            if (!cloud.days) cloud.days = {};
            Object.keys(REAL_DAYS).forEach(function (day) {
              if (!cloud.days[day]) cloud.days[day] = { meals: [], pots: [], note: '' };
              cloud.days[day].manual = {
                kcal: REAL_DAYS[day].kcal,
                p: REAL_DAYS[day].p,
                c: REAL_DAYS[day].c,
                g: REAL_DAYS[day].g,
                note: 'notion'
              };
            });
            cloud.updatedAt = Date.now();
            return db.collection(COL).doc(DOC).set(cloud, { merge: true });
          })
          .catch(function () {});
      }
    } catch (e) {}
  }

  function hasManual(d) {
    return !!(d && d.manual && (num(d.manual.kcal) || num(d.manual.p)));
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

  // ——— Salsas: el core pide peso de AYER. Añadimos "Inicio hoy" para no depender de ayer ———
  function enhanceSalsaCards() {
    var list = document.getElementById('salsa-list');
    if (!list) return;
    var store = loadLocal();
    var day = dayVal();
    var d = ensureLocal(store, day);
    // sincronizar pots desde el store global del core si existe
    try {
      if (typeof window.ensure === 'function') {
        var coreDay = window.ensure(day);
        if (coreDay && coreDay.pots) d.pots = coreDay.pots;
      }
    } catch (e) {}

    var cards = list.querySelectorAll('.salsa-card');
    cards.forEach(function (card, i) {
      if (card.querySelector('[data-inicio-field]')) return;
      var pot = (d.pots && d.pots[i]) || {};
      var row = document.createElement('div');
      row.setAttribute('data-inicio-field', '1');
      row.style.marginTop = '0.4rem';
      row.innerHTML =
        '<label>Inicio hoy (g) — si no hay cierre de ayer</label>' +
        '<input type="number" step="1" inputmode="decimal" value="' +
        (pot.inicio !== '' && pot.inicio != null ? pot.inicio : '') +
        '" placeholder="peso al empezar el día">';
      var input = row.querySelector('input');
      input.addEventListener('change', function () {
        var val = input.value === '' ? '' : num(input.value);
        // escribir en core store
        try {
          var cd = typeof window.ensure === 'function' ? window.ensure(dayVal()) : null;
          if (cd && cd.pots && cd.pots[i]) {
            cd.pots[i].inicio = val;
            if (typeof window.persist === 'function') window.persist();
            else if (typeof window.persistFull === 'function') window.persistFull();
          }
        } catch (e) {}
        // local mirror
        var st = loadLocal();
        var dd = ensureLocal(st, dayVal());
        if (!dd.pots[i]) dd.pots[i] = { name: pot.name || '', weight: '', mid: '' };
        dd.pots[i].inicio = val;
        saveLocal(st);
        // refrescar consumo
        if (typeof window.renderSalsas === 'function') {
          window.renderSalsas();
          setTimeout(enhanceSalsaCards, 50);
          setTimeout(fixSalsaMissing, 80);
        }
        toast('Inicio guardado');
      });
      // insertar antes de los pesos intermedio/cierre
      var weights = card.querySelector('.salsa-weights');
      if (weights) card.insertBefore(row, weights);
      else card.appendChild(row);
    });

    // ayuda
    var tab = document.getElementById('tab-salsas');
    if (tab && !tab.querySelector('[data-salsa-help]')) {
      var help = document.createElement('p');
      help.className = 'muted';
      help.setAttribute('data-salsa-help', '1');
      help.innerHTML =
        '<b>Cómo llenar salsas</b><br>' +
        '1. <b>Inicio hoy</b> = peso al empezar (o el cierre de ayer si lo tienes)<br>' +
        '2. <b>Intermedio</b> = peso en la noche (opcional)<br>' +
        '3. <b>Cierre</b> = peso al final<br>' +
        'Consumo = Inicio − Cierre (si no hay inicio, usa el cierre de ayer).';
      var first = tab.querySelector('.glass') || tab.firstChild;
      if (first) tab.insertBefore(help, first);
    }
  }

  function fixSalsaMissing() {
    // Parchear el cálculo: si falta peso de ayer pero hay inicio hoy, usarlo
    if (typeof window.salsaConsumo !== 'function') return;
    if (window._salsaConsumoPatched) return;
    window._salsaConsumoPatched = true;
    var orig = window.salsaConsumo;
    // no siempre exportado; intentamos vía redefinición del render
    // Alternativa: reescribir el bloque de consumo en el DOM
  }

  // Reemplazar mensajes "Falta peso" calculando con inicio
  function rewriteSalsaConsumoUI() {
    var box = document.getElementById('salsa-consumo');
    if (!box) return;
    var day = dayVal();
    var store = loadLocal();
    var d = ensureLocal(store, day);
    try {
      if (typeof window.ensure === 'function') {
        var cd = window.ensure(day);
        if (cd && cd.pots) d.pots = cd.pots;
      }
    } catch (e) {}

    function potW(p, field) {
      if (!p) return null;
      if (field === 'mid') {
        if (p.mid !== '' && p.mid != null) return num(p.mid);
        if (p.weight !== '' && p.weight != null) return num(p.weight);
        return null;
      }
      if (p.weight !== '' && p.weight != null) return num(p.weight);
      if (p.mid !== '' && p.mid != null) return num(p.mid);
      return null;
    }
    function potInicio(p) {
      if (p && p.inicio !== '' && p.inicio != null) return num(p.inicio);
      return null;
    }

    // prev day pots
    var prev;
    try {
      var pd = new Date(day + 'T12:00:00');
      pd.setDate(pd.getDate() - 1);
      var prevStr =
        pd.getFullYear() +
        '-' +
        String(pd.getMonth() + 1).padStart(2, '0') +
        '-' +
        String(pd.getDate()).padStart(2, '0');
      if (typeof window.ensure === 'function') prev = window.ensure(prevStr).pots || [];
      else prev = (ensureLocal(store, prevStr).pots || []);
    } catch (e) {
      prev = [];
    }

    var todayP = d.pots || [];
    function byName(list) {
      var map = {};
      (list || []).forEach(function (p) {
        if (!map[p.name]) map[p.name] = [];
        map[p.name].push(p);
      });
      return map;
    }
    var tMap = byName(todayP);
    var pMap = byName(prev);
    var names = {};
    Object.keys(tMap).forEach(function (n) {
      names[n] = 1;
    });
    Object.keys(pMap).forEach(function (n) {
      names[n] = 1;
    });

    function calc(mode) {
      var out = [];
      Object.keys(names).forEach(function (name) {
        var ta = tMap[name] || [];
        var pa = pMap[name] || [];
        var n = Math.max(ta.length, pa.length);
        for (var i = 0; i < n; i++) {
          var cur = potW(ta[i], mode === 'mid' ? 'mid' : 'final');
          var prevW = potW(pa[i], 'final');
          var ini = potInicio(ta[i]);
          // base = inicio hoy si existe, si no cierre de ayer
          var base = ini != null ? ini : prevW;
          if (cur == null || base == null) {
            out.push({
              name: name,
              idx: i,
              missing: true,
              grams: null,
              base: base,
              cur: cur
            });
          } else {
            out.push({
              name: name,
              idx: i,
              missing: false,
              grams: Math.max(0, base - cur),
              base: base,
              cur: cur
            });
          }
        }
      });
      return out;
    }

    function block(title, sc) {
      var h = '<div class="sec">' + title + '</div>';
      if (!sc.length) h += '<p class="muted">Sin datos.</p>';
      sc.forEach(function (s) {
        var label = s.name + (s.idx ? ' #' + (s.idx + 1) : '');
        if (s.missing) {
          h +=
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">Falta <b>Inicio hoy</b> o cierre de ayer, y el peso de ahora</div></div></div>';
        } else if (!s.grams) {
          h +=
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">sin consumo · ' +
            r0(s.base) +
            'g → ' +
            r0(s.cur) +
            'g</div></div></div>';
        } else {
          h +=
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">' +
            r0(s.base) +
            'g → ' +
            r0(s.cur) +
            'g = <b>' +
            r0(s.grams) +
            ' g</b></div></div></div>';
        }
      });
      return h;
    }

    box.innerHTML =
      block('Consumo provisional (intermedio)', calc('mid')) +
      block('Consumo final (cierre)', calc('final'));
  }

  // ——— Manual del día (formulario 4 campos) ———
  function injectManualForm() {
    var tab = document.getElementById('tab-dia');
    if (!tab) return;
    var existing = tab.querySelector('[data-manual-form]');
    var store = loadLocal();
    var d = ensureLocal(store, dayVal());
    var man = d.manual || {};
    var html =
      '<div class="sec" style="margin-top:0">Totales del día (manual)</div>' +
      '<p class="muted" style="margin:.2rem 0 .4rem">Si llenas esto, el reporte usa estos números (no suma comida encima).</p>' +
      '<div class="grid2">' +
      '<div><label>kcal</label><input type="number" id="man-kcal" inputmode="decimal" value="' +
      (man.kcal != null ? man.kcal : '') +
      '"></div>' +
      '<div><label>Proteína</label><input type="number" id="man-p" inputmode="decimal" value="' +
      (man.p != null ? man.p : '') +
      '"></div>' +
      '<div><label>Carbos</label><input type="number" id="man-c" inputmode="decimal" value="' +
      (man.c != null ? man.c : '') +
      '"></div>' +
      '<div><label>Grasas</label><input type="number" id="man-g" inputmode="decimal" value="' +
      (man.g != null ? man.g : '') +
      '"></div></div>' +
      '<div class="row" style="margin-top:.4rem">' +
      '<button type="button" class="btn btn-main" id="man-save">💾 Guardar totales</button>' +
      '<button type="button" class="btn btn-ghost" id="man-clear">Quitar</button></div>';
    if (existing) {
      existing.innerHTML = html;
    } else {
      var box = document.createElement('div');
      box.className = 'glass';
      box.setAttribute('data-manual-form', '1');
      box.innerHTML = html;
      var kpis = document.getElementById('kpis');
      if (kpis && kpis.parentElement) kpis.parentElement.insertBefore(box, kpis);
      else tab.insertBefore(box, tab.firstChild);
      existing = box;
    }
    var saveBtn = document.getElementById('man-save');
    var clearBtn = document.getElementById('man-clear');
    if (saveBtn) {
      saveBtn.onclick = function () {
        var st = loadLocal();
        var dd = ensureLocal(st, dayVal());
        dd.manual = {
          kcal: num(document.getElementById('man-kcal').value),
          p: num(document.getElementById('man-p').value),
          c: num(document.getElementById('man-c').value),
          g: num(document.getElementById('man-g').value),
          note: 'manual'
        };
        saveLocal(st);
        // mirror to core if possible
        try {
          if (typeof window.ensure === 'function') {
            var cd = window.ensure(dayVal());
            cd.manual = dd.manual;
            if (typeof window.persist === 'function') window.persist();
          }
        } catch (e) {}
        toast('Totales guardados');
        injectManualForm();
      };
    }
    if (clearBtn) {
      clearBtn.onclick = function () {
        var st = loadLocal();
        var dd = ensureLocal(st, dayVal());
        dd.manual = null;
        saveLocal(st);
        try {
          if (typeof window.ensure === 'function') {
            window.ensure(dayVal()).manual = null;
            if (typeof window.persist === 'function') window.persist();
          }
        } catch (e) {}
        toast('Totales quitados');
        injectManualForm();
      };
    }
  }

  // ——— Reportes: usar manual si existe, si no core dayTotals ———
  function dayTotalsSafe(day) {
    var store = loadLocal();
    var d = ensureLocal(store, day);
    try {
      if (typeof window.ensure === 'function') {
        var cd = window.ensure(day);
        if (cd && cd.manual) d.manual = cd.manual;
      }
    } catch (e) {}
    if (hasManual(d)) {
      return {
        kcal: r0(d.manual.kcal),
        p: r0(d.manual.p),
        c: r0(d.manual.c),
        g: r0(d.manual.g)
      };
    }
    if (typeof window.dayTotals === 'function') {
      try {
        return window.dayTotals(day);
      } catch (e) {}
    }
    return { kcal: 0, p: 0, c: 0, g: 0 };
  }

  window.renderReport = function () {
    seedRealDays();
    var from = document.getElementById('r-from') && document.getElementById('r-from').value;
    var to = document.getElementById('r-to') && document.getElementById('r-to').value;
    if (!from || !to) return;
    var days = daysInRange(from, to);
    var rows = days.map(function (day) {
      return { day: day, t: dayTotalsSafe(day) };
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
    seedRealDays();
    var from = document.getElementById('r-from') && document.getElementById('r-from').value;
    var to = document.getElementById('r-to') && document.getElementById('r-to').value;
    if (!from || !to) return alert('Elige rango');
    var days = daysInRange(from, to);
    var rows = days.map(function (day) {
      return { day: day, t: dayTotalsSafe(day) };
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

  // Envolver showTab para mejorar salsas SIN reemplazar renderMeals del core
  var _showTab = window.showTab;
  window.showTab = function (id) {
    if (typeof _showTab === 'function') _showTab(id);
    if (id === 'salsas') {
      setTimeout(function () {
        enhanceSalsaCards();
        rewriteSalsaConsumoUI();
      }, 80);
    }
    if (id === 'dia') setTimeout(injectManualForm, 80);
    if (id === 'reportes') setTimeout(function () {
      window.renderReport();
    }, 80);
  };

  // Tras guardar salsas del core, re-aplicar mejoras
  var _saveSalsas = window.saveSalsas;
  window.saveSalsas = function () {
    if (typeof _saveSalsas === 'function') _saveSalsas();
    setTimeout(function () {
      enhanceSalsaCards();
      rewriteSalsaConsumoUI();
    }, 60);
  };

  // Asegurar que delMeal del core sigue existiendo (no lo tocamos)
  // Solo refuerzo: si alguien llama delMeal y falla, reintentar

  function start() {
    seedRealDays();
    injectManualForm();
    var tabS = document.getElementById('tab-salsas');
    if (tabS && !tabS.classList.contains('hidden')) {
      enhanceSalsaCards();
      rewriteSalsaConsumoUI();
    }
    var el = document.getElementById('day');
    if (el && !el._v20) {
      el._v20 = true;
      el.addEventListener('change', function () {
        setTimeout(function () {
          injectManualForm();
          enhanceSalsaCards();
          rewriteSalsaConsumoUI();
        }, 100);
      });
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 1200);
    });
  else setTimeout(start, 1200);
})();
