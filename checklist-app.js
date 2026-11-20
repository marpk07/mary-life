(function () {
  var URL =
    "https://cdn.jsdelivr.net/gh/marpk07/mary-life@8dc46b61fed8d6222cd0ce8485c43d2626cd2137/checklist-app.js";
  var ANCHOR =
    "        {title:'Resto CLM', items:['Cocina','Nevera','Oficina','Sala','Sala de Billar','Maleta Gym']}\n      ]\n    }\n  }";
  var EXTRA =
    ",\n" +
    "    oficina_viaje:{\n" +
    "      id:'oficina_viaje',\n" +
    "      name:'Oficina · Durante el viaje (Santorini)',\n" +
    "      desc:'Valery · seguimiento especial viaje Martín',\n" +
    "      groups:[\n" +
    "        {title:'Limpieza y orden oficina', items:[\n" +
    "          'Barrer',\n" +
    "          'Limpiar PC',\n" +
    "          'Limpiar escritorio',\n" +
    "          'Limpiar entorno',\n" +
    "          'Dejar organizada la repisa de nootrópicos',\n" +
    "          'Sin objetos sobre el escritorio',\n" +
    "          'Desinfectar repisas'\n" +
    "        ]},\n" +
    "        {title:'Preparación / stock (confirmar protocolo médico vigente)', items:[\n" +
    "          'Verificar Ritalin en polvo',\n" +
    "          'Preparar 5 dosis de Ritalin 0.28–0.29 (unidad por confirmar · solo protocolo médico)',\n" +
    "          'Preparar 10 dosis de la lista 0.35 (unidad y sustancia por confirmar · solo protocolo)',\n" +
    "          'Dejar Ritalin molido (si aplica protocolo)'\n" +
    "        ]},\n" +
    "        {title:'Óptica y aseo', items:[\n" +
    "          'Pañito para lentes',\n" +
    "          'Líquido para lentes',\n" +
    "          'Servilletas disponibles',\n" +
    "          'Alcohol spray',\n" +
    "          'Gotas de ojos',\n" +
    "          'Humectante de labios'\n" +
    "        ]},\n" +
    "        {title:'Cables y carga', items:[\n" +
    "          'Cable USB-C blanco',\n" +
    "          'Power Bank negro',\n" +
    "          'Power Bank blanco',\n" +
    "          'AirPods Max cargando'\n" +
    "        ]},\n" +
    "        {title:'Ropa / salida', items:[\n" +
    "          'Cinturón',\n" +
    "          'Casaca'\n" +
    "        ]}\n" +
    "      ]\n" +
    "    },\n" +
    "    bolso_torneos_viaje:{\n" +
    "      id:'bolso_torneos_viaje',\n" +
    "      name:'Bolso de torneos · Durante el viaje',\n" +
    "      desc:'Preparar bolso + video al grupo ops (Laura y Mary)',\n" +
    "      groups:[\n" +
    "        {title:'Antes de cerrar', items:[\n" +
    "          'Preparar el bolso del torneo siguiendo esta checklist',\n" +
    "          'Enviar el video al grupo de operaciones con Laura y Mary para verificación'\n" +
    "        ]},\n" +
    "        {title:'Suplementos / stack', items:[\n" +
    "          'Ritalin (según protocolo vigente)',\n" +
    "          'Suplemento',\n" +
    "          'Magtein',\n" +
    "          'Theanine',\n" +
    "          'Alpha-GPC'\n" +
    "        ]},\n" +
    "        {title:'Audio y enfoque', items:[\n" +
    "          'AirPods blancos',\n" +
    "          'AirPods Max negros',\n" +
    "          'Balaclava',\n" +
    "          'Taponcitos',\n" +
    "          'Cubre cartas'\n" +
    "        ]},\n" +
    "        {title:'Personal', items:[\n" +
    "          'Billetera',\n" +
    "          'Líquido de lentes',\n" +
    "          'Paño de lentes',\n" +
    "          'Lentes de sol',\n" +
    "          'Hidratante de labios',\n" +
    "          'Servilletas'\n" +
    "        ]},\n" +
    "        {title:'Energía y carga', items:[\n" +
    "          'Power Bank blanco',\n" +
    "          'Power Bank negro',\n" +
    "          'Gatorade',\n" +
    "          'YoPro',\n" +
    "          'YoPro con cafeína',\n" +
    "          'Red Bull'\n" +
    "        ]}\n" +
    "      ]\n" +
    "    },\n" +
    "    nocturna_viaje:{\n" +
    "      id:'nocturna_viaje',\n" +
    "      name:'Checklist nocturna · Viaje / Valery',\n" +
    "      desc:'Día siguiente + preparación Martín + Valery',\n" +
    "      groups:[\n" +
    "        {title:'1 · Revisión y preparación del día siguiente', items:[\n" +
    "          'Revisar el stock de bebidas y las provisiones necesarias',\n" +
    "          'Organizar y hacer a Martín las preguntas o dudas sobre encargos, compras y gestiones del día siguiente (con antelación)',\n" +
    "          'Organizar el entorno; dejar áreas limpias y las cosas de Martín en orden'\n" +
    "        ]},\n" +
    "        {title:'2 · Preparación nocturna de Martín', items:[\n" +
    "          'Dejar el stack de nootrópicos según el protocolo establecido (sin modificar dosis)',\n" +
    "          'Dejar la melatonina según el protocolo vigente',\n" +
    "          'Dejar servilletas',\n" +
    "          'Dejar taponcitos para los oídos',\n" +
    "          'Dejar bebida, preferentemente sin azúcar',\n" +
    "          'Verificar que el reloj esté cargando o tenga batería',\n" +
    "          'Verificar que el celular esté cargando o tenga batería',\n" +
    "          'Cargar los AirPods blancos',\n" +
    "          'Cargar los AirPods Max negros'\n" +
    "        ]},\n" +
    "        {title:'3 · Valery — preparación personal', items:[\n" +
    "          'Dejar mis cosas personales listas',\n" +
    "          'Preparar la ropa del día siguiente'\n" +
    "        ]}\n" +
    "      ]\n" +
    "    }";

  fetch(URL)
    .then(function (r) {
      return r.text();
    })
    .then(function (code) {
      if (code.indexOf("oficina_viaje") === -1 && code.indexOf(ANCHOR) !== -1) {
        code = code.replace(
          ANCHOR,
          "        {title:'Resto CLM', items:['Cocina','Nevera','Oficina','Sala','Sala de Billar','Maleta Gym']}\n      ]\n    }" +
            EXTRA +
            "\n  }"
        );
      }
      var s = document.createElement("script");
      s.textContent = code;
      document.head.appendChild(s);
      console.log("checklist core OK (+ plantillas viaje)");
    })
    .catch(function (e) {
      console.error(e);
      var el = document.getElementById("sync");
      if (el) el.textContent = "Error cargando checklist";
      var s = document.createElement("script");
      s.src = URL;
      document.head.appendChild(s);
    });
})();
