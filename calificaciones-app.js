(function () {
  function injectSyncFix(code) {
    // Estado sin novedades (parche previo)
    code = code.replace(
      "{v:'pendiente', t:'Pendiente'},\n    {v:'cerrado', t:'Cerrado'}",
      "{v:'pendiente', t:'Pendiente'},\n    {v:'sin_novedades', t:'Sin novedades'},\n    {v:'cerrado', t:'Cerrado'}"
    );
    code = code.replace(
      "pendiente:'Pendiente',cerrado:'Cerrado'",
      "pendiente:'Pendiente',sin_novedades:'Sin novedades',cerrado:'Cerrado'"
    );

    // Helpers de merge (antes de loadCloud)
    var helpers =
      "function _dayScore(d){\n" +
      "  if(!d||typeof d!=='object') return 0;\n" +
      "  var n=0;\n" +
      "  try{\n" +
      "    var ev=d.evaluations||{};\n" +
      "    Object.keys(ev).forEach(function(k){\n" +
      "      var e=ev[k]; if(!e) return;\n" +
      "      if(e.prod!==''&&e.prod!=null) n+=2;\n" +
      "      if(e.proact!==''&&e.proact!=null) n+=2;\n" +
      "      if(e.prodNote) n+=1; if(e.proactNote) n+=1;\n" +
      "      if(e.status&&e.status!=='ok') n+=1;\n" +
      "      (e.discounts||[]).forEach(function(x){ if(x&&(x.amount||x.reason)) n+=1; });\n" +
      "    });\n" +
      "    var ac=d.activities||{};\n" +
      "    Object.keys(ac).forEach(function(k){ if(ac[k]&&String(ac[k]).trim()) n+=3; });\n" +
      "    var pm=d.pendientesManana||{};\n" +
      "    Object.keys(pm).forEach(function(k){ if(pm[k]&&String(pm[k]).trim()) n+=2; });\n" +
      "    if(d.hoursMary!==''&&d.hoursMary!=null) n+=1;\n" +
      "    if(d.hoursPending!==''&&d.hoursPending!=null) n+=1;\n" +
      "  }catch(e){}\n" +
      "  return n;\n" +
      "}\n" +
      "function _mergeDay(a,b){\n" +
      "  if(!a) return b||{}; if(!b) return a;\n" +
      "  if(_dayScore(b)>_dayScore(a)){\n" +
      "    var t=a; a=b; b=t;\n" +
      "  }\n" +
      "  var out=Object.assign({},b,a);\n" +
      "  out.evaluations=Object.assign({},b.evaluations||{},a.evaluations||{});\n" +
      "  Object.keys(out.evaluations).forEach(function(k){\n" +
      "    var ea=(a.evaluations||{})[k], eb=(b.evaluations||{})[k];\n" +
      "    if(ea&&eb) out.evaluations[k]=Object.assign({},eb,ea);\n" +
      "  });\n" +
      "  out.activities=Object.assign({},b.activities||{},a.activities||{});\n" +
      "  Object.keys(Object.assign({},b.activities||{},a.activities||{})).forEach(function(k){\n" +
      "    var ta=(a.activities&&a.activities[k])||'';\n" +
      "    var tb=(b.activities&&b.activities[k])||'';\n" +
      "    out.activities[k]=String(ta).trim().length>=String(tb).trim().length?ta:tb;\n" +
      "  });\n" +
      "  out.pendientesManana=Object.assign({},b.pendientesManana||{},a.pendientesManana||{});\n" +
      "  Object.keys(Object.assign({},b.pendientesManana||{},a.pendientesManana||{})).forEach(function(k){\n" +
      "    var ta=(a.pendientesManana&&a.pendientesManana[k])||'';\n" +
      "    var tb=(b.pendientesManana&&b.pendientesManana[k])||'';\n" +
      "    out.pendientesManana[k]=String(ta).trim().length>=String(tb).trim().length?ta:tb;\n" +
      "  });\n" +
      "  if((a.hoursMary===''||a.hoursMary==null)&&(b.hoursMary!==''&&b.hoursMary!=null)) out.hoursMary=b.hoursMary;\n" +
      "  if((a.hoursPending===''||a.hoursPending==null)&&(b.hoursPending!==''&&b.hoursPending!=null)) out.hoursPending=b.hoursPending;\n" +
      "  return out;\n" +
      "}\n" +
      "function _mergeStores(local, cloud){\n" +
      "  local=local||{days:{}}; cloud=cloud||{days:{}};\n" +
      "  var out={days:{},openPendientesMaster:[],updatedAt:Math.max(local.updatedAt||0,cloud.updatedAt||0)};\n" +
      "  var all={};\n" +
      "  Object.keys(local.days||{}).forEach(function(k){all[k]=1;});\n" +
      "  Object.keys(cloud.days||{}).forEach(function(k){all[k]=1;});\n" +
      "  Object.keys(all).forEach(function(day){\n" +
      "    out.days[day]=_mergeDay((local.days||{})[day],(cloud.days||{})[day]);\n" +
      "  });\n" +
      "  var lo=local.openPendientesMaster||[], co=cloud.openPendientesMaster||[];\n" +
      "  out.openPendientesMaster=lo.length>=co.length?lo.map(function(x){return Object.assign({},x);}):co.map(function(x){return Object.assign({},x);});\n" +
      "  if(!out.openPendientesMaster.length) out.openPendientesMaster=(typeof DEFAULT_OPENS!=='undefined'?DEFAULT_OPENS:[]).map(function(x){return Object.assign({},x);});\n" +
      "  return out;\n" +
      "}\n";

    if (code.indexOf('function loadCloud') >= 0 && code.indexOf('_mergeStores') < 0) {
      code = code.replace('async function loadCloud()', helpers + 'async function loadCloud()');
    }

    // Reemplazar cuerpo de loadCloud: siempre fusionar nube + local
    var loadRe =
      /async function loadCloud\(\)\{[\s\S]*?\n  \}/;
    var loadNew =
      'async function loadCloud(){\n' +
      "    if(!db){ setStatus('Sin nube · solo local'); return; }\n" +
      '    try {\n' +
      "      setStatus('Sincronizando…');\n" +
      '      const snap = await db.collection(COL).doc(DOC).get();\n' +
      '      if (snap.exists) {\n' +
      '        const cloud = snap.data() || {};\n' +
      '        const localCopy = { days: store.days||{}, openPendientesMaster: store.openPendientesMaster||[], updatedAt: store.updatedAt||0 };\n' +
      '        store = _mergeStores(localCopy, cloud);\n' +
      '        if (!store.days) store.days = {};\n' +
      '        if(!store.openPendientesMaster || !store.openPendientesMaster.length){\n' +
      '          store.openPendientesMaster = DEFAULT_OPENS.map(x=>({...x}));\n' +
      '        }\n' +
      '        saveLocal();\n' +
      '      }\n' +
      "      setStatus('☁ Firebase listo · datos unidos PC/celular');\n" +
      '    } catch(e){\n' +
      "      console.warn('cloud load', e);\n" +
      "      setStatus('Local (nube no disponible)');\n" +
      '    }\n' +
      '  }';
    if (loadRe.test(code)) code = code.replace(loadRe, loadNew);

    // saveCloud: leer nube, merge, luego escribir (no pisar días del otro dispositivo)
    var saveRe =
      /async function saveCloud\(\)\{[\s\S]*?\n  \}/;
    var saveNew =
      'async function saveCloud(){\n' +
      '    if(!db) return;\n' +
      '    try {\n' +
      '      var snap = await db.collection(COL).doc(DOC).get();\n' +
      '      if (snap.exists) {\n' +
      '        var cloud = snap.data() || {};\n' +
      '        store = _mergeStores(store, cloud);\n' +
      '      }\n' +
      '      store.updatedAt = Date.now();\n' +
      '      saveLocal();\n' +
      '      await db.collection(COL).doc(DOC).set({days:store.days, openPendientesMaster:store.openPendientesMaster, updatedAt:store.updatedAt});\n' +
      "      setStatus('☁ Guardado en Firebase · ' + new Date().toLocaleTimeString());\n" +
      '    } catch(e){\n' +
      "      console.warn('cloud save', e);\n" +
      "      setStatus('Guardado local (error nube)');\n" +
      '    }\n' +
      '  }';
    if (saveRe.test(code)) code = code.replace(saveRe, saveNew);

    return code;
  }

  fetch('https://cdn.jsdelivr.net/gh/marpk07/mary-life@c3619d82a8/calificaciones-app.js')
    .then(function (r) {
      return r.text();
    })
    .then(function (code) {
      code = injectSyncFix(code);
      var s = document.createElement('script');
      s.textContent = code;
      document.head.appendChild(s);
    })
    .catch(function (e) {
      console.error(e);
      var s = document.createElement('script');
      s.src =
        'https://cdn.jsdelivr.net/gh/marpk07/mary-life@c3619d82a8/calificaciones-app.js';
      document.head.appendChild(s);
    });
})();
