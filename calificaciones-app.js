(function(){
  fetch('https://cdn.jsdelivr.net/gh/marpk07/mary-life@c3619d82a8/calificaciones-app.js')
    .then(function(r){ return r.text(); })
    .then(function(code){
      code = code.replace(
        "{v:'pendiente', t:'Pendiente'},\n    {v:'cerrado', t:'Cerrado'}",
        "{v:'pendiente', t:'Pendiente'},\n    {v:'sin_novedades', t:'Sin novedades'},\n    {v:'cerrado', t:'Cerrado'}"
      );
      code = code.replace(
        "pendiente:'Pendiente',cerrado:'Cerrado'",
        "pendiente:'Pendiente',sin_novedades:'Sin novedades',cerrado:'Cerrado'"
      );
      var s = document.createElement('script');
      s.textContent = code;
      document.head.appendChild(s);
    })
    .catch(function(e){
      console.error(e);
      var s = document.createElement('script');
      s.src = 'https://cdn.jsdelivr.net/gh/marpk07/mary-life@c3619d82a8/calificaciones-app.js';
      document.head.appendChild(s);
    });
})();
