/* Patch v21 — SOLO SALSAS bien: Base / Intermedio / Cierre + lista correcta */
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
    Mantequilla: { kcal: 717, p: 0.85, c: 0.06, g: 81.1 }
  };

  var SALSA_OPTIONS = [
    'Hershey',
    'Miel',
    'Leche condensada tradicional',
    'Leche condensada La Lechera',
    'Mayonesa',
    'Nutella',
    'Dulce de leche',
    'Cocada',
    'Mantequilla'
  ];

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
    }, 2500);
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
  function prevDay(day) {
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

  function getDay(day) {
    if (typeof window.ensure === 'function') return window.ensure(day);
    // fallback localStorage
    try {
      var r = localStorage.getItem('MARY_ALIM_MARTIN_V1');
      var store = r ? JSON.parse(r) : { days: {} };
      if (!store.days) store.days = {};
      if (!store.days[day]) store.days[day] = { meals: [], pots: [], note: '' };
      if (!store.days[day].pots) store.days[day].pots = [];
      if (!store.days[day].meals) store.days[day].meals = [];
      return store.days[day];
    } catch (e) {
      return { meals: [], pots: [], note: '' };
    }
  }

  function doPersist() {
    if (typeof window.persist === 'function') {
      window.persist();
      return;
    }
    try {
      // last resort: touch localStorage via ensure+saveLocal if core exposes it
      if (typeof window.saveLocal === 'function') window.saveLocal();
    } catch (e) {}
  }

  function potBase(p, prevPots, idx) {
    // 1) base explícita del pote
    if (p && p.base !== '' && p.base != null) return num(p.base);
    // 2) inicio (alias)
    if (p && p.inicio !== '' && p.inicio != null) return num(p.inicio);
    // 3) cierre de ayer del mismo índice/nombre
    if (prevPots && prevPots[idx]) {
      var prev = prevPots[idx];
      if (prev.weight !== '' && prev.weight != null) return num(prev.weight);
    }
    return null;
  }

  function potMid(p) {
    if (!p) return null;
    if (p.mid !== '' && p.mid != null) return num(p.mid);
    return null;
  }

  function potCierre(p) {
    if (!p) return null;
    if (p.weight !== '' && p.weight != null) return num(p.weight);
    return null;
  }

  function calcConsumo(day, mode) {
    // mode: 'mid' | 'final'
    var d = getDay(day);
    var prev = getDay(prevDay(day));
    var todayP = d.pots || [];
    var prevP = prev.pots || [];

    function byName(list) {
      var map = {};
      (list || []).forEach(function (p) {
        if (!map[p.name]) map[p.name] = [];
        map[p.name].push(p);
      });
      return map;
    }
    var tMap = byName(todayP);
    var pMap = byName(prevP);
    var names = {};
    Object.keys(tMap).forEach(function (n) {
      names[n] = 1;
    });
    Object.keys(pMap).forEach(function (n) {
      names[n] = 1;
    });

    var out = [];
    Object.keys(names).forEach(function (name) {
      var ta = tMap[name] || [];
      var pa = pMap[name] || [];
      var n = Math.max(ta.length, pa.length);
      for (var i = 0; i < n; i++) {
        var p = ta[i] || { name: name };
        var base = potBase(p, pa, i);
        // si el pote de hoy no tiene base pero el de ayer con mismo nombre sí tiene cierre
        if (base == null && pa[i] && pa[i].weight !== '' && pa[i].weight != null) {
          base = num(pa[i].weight);
        }
        var cur = mode === 'mid' ? potMid(p) : potCierre(p);
        // si mode mid y no hay mid, no forzar cierre
        if (mode === 'mid' && cur == null) {
          out.push({
            name: name,
            idx: i,
            missing: true,
            grams: null,
            base: base,
            cur: null,
            reason: 'Falta intermedio'
          });
          continue;
        }
        if (mode === 'final' && cur == null) {
          out.push({
            name: name,
            idx: i,
            missing: true,
            grams: null,
            base: base,
            cur: null,
            reason: 'Falta cierre'
          });
          continue;
        }
        if (base == null) {
          out.push({
            name: name,
            idx: i,
            missing: true,
            grams: null,
            base: null,
            cur: cur,
            reason: 'Falta Base (inicio hoy o cierre de ayer)'
          });
          continue;
        }
        var gr = Math.max(0, base - cur);
        out.push({
          name: name,
          idx: i,
          missing: false,
          grams: gr,
          base: base,
          cur: cur,
          reason: null
        });
      }
    });
    return out;
  }

  function macros(name, grams) {
    var m = PER100[name];
    if (!m || !grams) return { kcal: 0, p: 0, c: 0, g: 0 };
    var f = grams / 100;
    return { kcal: m.kcal * f, p: m.p * f, c: m.c * f, g: m.g * f };
  }

  function fixSelect() {
    var sel = document.getElementById('salsa-add-name');
    if (!sel) return;
    sel.innerHTML = '';
    SALSA_OPTIONS.forEach(function (n) {
      var o = document.createElement('option');
      o.text = n;
      o.value = n;
      sel.appendChild(o);
    });
  }

  function helpText() {
    var tab = document.getElementById('tab-salsas');
    if (!tab) return;
    var muted = tab.querySelector('.muted');
    if (muted) {
      muted.innerHTML =
        '<b>Cómo llenar</b><br>' +
        '• <b>Base</b> = peso al empezar el día (o el cierre de ayer si es el mismo pote)<br>' +
        '• <b>Intermedio</b> = peso en la noche (opcional)<br>' +
        '• <b>Cierre</b> = peso al final del día<br>' +
        '• Consumo = <b>Base − Cierre</b> (o Base − Intermedio si solo llenas intermedio)<br>' +
        'Pulsa <b>Guardar salsas</b> después de escribir.';
    }
  }

  window.renderSalsas = function () {
    fixSelect();
    helpText();
    var day = dayVal();
    var d = getDay(day);
    var list = document.getElementById('salsa-list');
    var cons = document.getElementById('salsa-consumo');
    if (!list) return;

    if (!(d.pots || []).length) {
      list.innerHTML =
        '<p class="muted">Sin potes. Elige una salsa arriba y pulsa <b>+ Otra</b>.</p>';
    } else {
      list.innerHTML = d.pots
        .map(function (p, i) {
          var base =
            p.base !== '' && p.base != null
              ? p.base
              : p.inicio !== '' && p.inicio != null
                ? p.inicio
                : '';
          var mid = p.mid !== '' && p.mid != null ? p.mid : '';
          var w = p.weight !== '' && p.weight != null ? p.weight : '';
          return (
            '<div class="salsa-card">' +
            '<div class="salsa-head">' +
            '<div style="flex:1">' +
            '<div style="font-size:.72rem;color:var(--muted)">Tipo</div>' +
            '<input data-f="name" data-i="' +
            i +
            '" value="' +
            String(p.name || '').replace(/"/g, '&quot;') +
            '" style="width:100%">' +
            '</div>' +
            '<button type="button" class="btn btn-ghost" data-del="' +
            i +
            '">✕</button>' +
            '</div>' +
            '<div class="salsa-weights">' +
            '<div><label>Base (inicio)</label>' +
            '<input type="number" step="1" inputmode="decimal" data-f="base" data-i="' +
            i +
            '" value="' +
            base +
            '" placeholder="g al empezar"></div>' +
            '<div><label>Intermedio</label>' +
            '<input type="number" step="1" inputmode="decimal" data-f="mid" data-i="' +
            i +
            '" value="' +
            mid +
            '" placeholder="g noche"></div>' +
            '<div><label>Cierre final</label>' +
            '<input type="number" step="1" inputmode="decimal" data-f="weight" data-i="' +
            i +
            '" value="' +
            w +
            '" placeholder="g final"></div>' +
            '</div></div>'
          );
        })
        .join('');

      // listeners sin pisar valores al re-render a medias
      list.querySelectorAll('input[data-f]').forEach(function (inp) {
        inp.addEventListener('change', function () {
          var i = parseInt(inp.getAttribute('data-i'), 10);
          var f = inp.getAttribute('data-f');
          var dayNow = dayVal();
          var dd = getDay(dayNow);
          if (!dd.pots[i]) return;
          if (f === 'name') {
            dd.pots[i].name = inp.value;
          } else if (f === 'base') {
            var v = inp.value === '' ? '' : num(inp.value);
            dd.pots[i].base = v;
            dd.pots[i].inicio = v; // alias
          } else if (f === 'mid') {
            dd.pots[i].mid = inp.value === '' ? '' : num(inp.value);
          } else if (f === 'weight') {
            dd.pots[i].weight = inp.value === '' ? '' : num(inp.value);
          }
          doPersist();
          renderConsumoOnly();
          toast('Guardado');
        });
      });
      list.querySelectorAll('[data-del]').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var i = parseInt(btn.getAttribute('data-del'), 10);
          var dd = getDay(dayVal());
          dd.pots.splice(i, 1);
          doPersist();
          window.renderSalsas();
          toast('Pote quitado');
        });
      });
    }

    renderConsumoOnly();
  };

  function renderConsumoOnly() {
    var cons = document.getElementById('salsa-consumo');
    if (!cons) return;
    var day = dayVal();
    var mid = calcConsumo(day, 'mid');
    var fin = calcConsumo(day, 'final');

    function block(title, sc) {
      var h = '<div class="sec">' + title + '</div>';
      if (!sc.length) {
        h += '<p class="muted">Sin potes.</p>';
        return h;
      }
      sc.forEach(function (s) {
        var label = s.name + (s.idx ? ' #' + (s.idx + 1) : '');
        if (s.missing) {
          h +=
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">' +
            (s.reason || 'Faltan datos') +
            '</div></div></div>';
        } else if (!s.grams) {
          h +=
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">0 g · ' +
            r0(s.base) +
            ' → ' +
            r0(s.cur) +
            '</div></div></div>';
        } else {
          var mac = macros(s.name, s.grams);
          h +=
            '<div class="item"><div><b>' +
            label +
            '</b><div class="muted">' +
            r0(s.base) +
            ' g → ' +
            r0(s.cur) +
            ' g = <b>' +
            r0(s.grams) +
            ' g</b> · ' +
            r0(mac.kcal) +
            ' kcal</div></div></div>';
        }
      });
      return h;
    }

    var totalK = 0;
    fin.forEach(function (s) {
      if (!s.missing && s.grams) totalK += macros(s.name, s.grams).kcal;
    });

    cons.innerHTML =
      '<div class="sec" style="margin-top:0">Se suma al día (cierre): <b>' +
      r0(totalK) +
      ' kcal</b></div>' +
      block('Consumo provisional (intermedio)', mid) +
      block('Consumo final (cierre)', fin);
  }

  window.addSalsaPot = function () {
    fixSelect();
    var sel = document.getElementById('salsa-add-name');
    var name = (sel && sel.value) || 'Nutella';
    var d = getDay(dayVal());
    if (!d.pots) d.pots = [];
    d.pots.push({
      id: 's' + Date.now(),
      name: name,
      base: '',
      inicio: '',
      mid: '',
      weight: ''
    });
    doPersist();
    window.renderSalsas();
    toast(name + ' agregada');
  };

  window.saveSalsas = function () {
    // leer todos los inputs por si no dispararon change
    var d = getDay(dayVal());
    var list = document.getElementById('salsa-list');
    if (list) {
      list.querySelectorAll('input[data-f]').forEach(function (inp) {
        var i = parseInt(inp.getAttribute('data-i'), 10);
        var f = inp.getAttribute('data-f');
        if (!d.pots[i]) return;
        if (f === 'name') d.pots[i].name = inp.value;
        else if (f === 'base') {
          var v = inp.value === '' ? '' : num(inp.value);
          d.pots[i].base = v;
          d.pots[i].inicio = v;
        } else if (f === 'mid') d.pots[i].mid = inp.value === '' ? '' : num(inp.value);
        else if (f === 'weight')
          d.pots[i].weight = inp.value === '' ? '' : num(inp.value);
      });
    }
    doPersist();
    window.renderSalsas();
    if (typeof window.renderMeals === 'function') window.renderMeals();
    toast('Salsas guardadas ✓');
  };

  window.delPot = function (i) {
    var d = getDay(dayVal());
    d.pots.splice(i, 1);
    doPersist();
    window.renderSalsas();
  };

  window.updPot = function (i, field, val) {
    var d = getDay(dayVal());
    if (!d.pots[i]) return;
    if (field === 'base' || field === 'inicio') {
      var v = val === '' ? '' : num(val);
      d.pots[i].base = v;
      d.pots[i].inicio = v;
    } else if (field === 'mid' || field === 'weight') {
      d.pots[i][field] = val === '' ? '' : num(val);
    } else d.pots[i][field] = val;
    doPersist();
    renderConsumoOnly();
  };

  // Reportes: no tocar lógica de comidas; solo totales Notion si hay manual
  function dayTotalsSafe(day) {
    var d = getDay(day);
    if (d.manual && (num(d.manual.kcal) || num(d.manual.p))) {
      return {
        kcal: r0(d.manual.kcal),
        p: r0(d.manual.p),
        c: r0(d.manual.c),
        g: r0(d.manual.g)
      };
    }
    if (typeof window.dayTotals === 'function') {
      try {
        // temporalmente usar nuestro calc de salsas no es trivial;
        // dayTotals del core sigue OK para comidas
        return window.dayTotals(day);
      } catch (e) {}
    }
    return { kcal: 0, p: 0, c: 0, g: 0 };
  }

  function seedManual() {
    Object.keys(REAL_DAYS).forEach(function (day) {
      var d = getDay(day);
      if (!d.manual || !d.manual.kcal) {
        d.manual = {
          kcal: REAL_DAYS[day].kcal,
          p: REAL_DAYS[day].p,
          c: REAL_DAYS[day].c,
          g: REAL_DAYS[day].g,
          note: 'notion'
        };
      }
    });
    doPersist();
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

  var _renderReport = window.renderReport;
  window.renderReport = function () {
    seedManual();
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
    var html =
      '<div class="sec" style="margin-top:0">Resumen ' +
      fmtDM(from) +
      ' → ' +
      fmtDM(to) +
      '</div>';
    html +=
      '<div class="grid2">' +
      '<div class="kpi"><div class="v">' +
      r0(sum.kcal / n) +
      '</div><div class="l">kcal prom.</div></div>' +
      '<div class="kpi"><div class="v">' +
      r0(sum.p / n) +
      ' g</div><div class="l">P prom.</div></div>' +
      '<div class="kpi"><div class="v">' +
      r0(sum.c / n) +
      ' g</div><div class="l">C prom.</div></div>' +
      '<div class="kpi"><div class="v">' +
      r0(sum.g / n) +
      ' g</div><div class="l">G prom.</div></div></div>';
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

  var _showTab = window.showTab;
  window.showTab = function (id) {
    if (typeof _showTab === 'function') _showTab(id);
    if (id === 'salsas') setTimeout(window.renderSalsas, 50);
    if (id === 'reportes') setTimeout(window.renderReport, 80);
  };

  var _copyConsumo = window.copyConsumoSalsas;
  window.copyConsumoSalsas = function () {
    window.saveSalsas();
    var day = dayVal();
    var fin = calcConsumo(day, 'final');
    var msg = 'Consumo salsas ' + fmtDM(day).slice(0, 5) + '\n';
    fin.forEach(function (s) {
      if (s.missing) msg += s.name + ': (faltan datos)\n';
      else msg += s.name + ': ' + r0(s.grams) + 'g\n';
    });
    if (navigator.clipboard)
      navigator.clipboard.writeText(msg.trim()).then(function () {
        toast('Copiado ✓');
      });
    else prompt('Copia', msg.trim());
  };

  function start() {
    fixSelect();
    helpText();
    seedManual();
    var tab = document.getElementById('tab-salsas');
    if (tab && !tab.classList.contains('hidden')) window.renderSalsas();
    var el = document.getElementById('day');
    if (el && !el._v21) {
      el._v21 = true;
      el.addEventListener('change', function () {
        setTimeout(function () {
          if (
            document.getElementById('tab-salsas') &&
            !document.getElementById('tab-salsas').classList.contains('hidden')
          )
            window.renderSalsas();
        }, 80);
      });
    }
  }

  if (document.readyState === 'loading')
    document.addEventListener('DOMContentLoaded', function () {
      setTimeout(start, 1100);
    });
  else setTimeout(start, 1100);
})();
