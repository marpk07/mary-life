(function () {
  fetch('https://cdn.jsdelivr.net/gh/marpk07/mary-life@c3619d82a8/calificaciones-app.js')
    .then(function (r) {
      return r.text();
    })
    .then(function (code) {
      code = code.replace(
        "{v:'pendiente', t:'Pendiente'},\n    {v:'cerrado', t:'Cerrado'}",
        "{v:'pendiente', t:'Pendiente'},\n    {v:'sin_novedades', t:'Sin novedades'},\n    {v:'cerrado', t:'Cerrado'}"
      );
      code = code.replace(
        "pendiente:'Pendiente',cerrado:'Cerrado'",
        "pendiente:'Pendiente',sin_novedades:'Sin novedades',cerrado:'Cerrado'"
      );
      // Mostrar formulario de inmediato; no bloquear la UI si Firebase tarda
      code = code.replace(
        "load().then(function(){ renderDayForm(); renderWeek(); setStatus(db ? '☁ Firebase listo' : 'Solo local'); });",
        "renderDayForm();\n" +
          "  setStatus(db ? 'Sincronizando…' : 'Solo local');\n" +
          "  load().then(function(){\n" +
          "    renderDayForm();\n" +
          "    renderWeek();\n" +
          "    setStatus(db ? '☁ Firebase listo' : 'Solo local');\n" +
          "  }).catch(function(e){\n" +
          "    console.warn(e);\n" +
          "    renderDayForm();\n" +
          "    setStatus('Local (error al sincronizar)');\n" +
          "  });"
      );
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
