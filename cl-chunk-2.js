window.__CL=(window.__CL||'')+`ado del bolso','Cinta POLAR','AirPod Max','AirPods blancos'
    ],
    'Cuidados Nalito':[
      'Desayuno','Refuerzo disciplinario','Paseo 1','Correa 1','Confinamiento',
      'Peinado 1','Cena','Paseo 2','Correa 2','Omega 3 semanal (si aplica)',
      'Cepillado de dientes','Peinado','Zanahorias','Plan running'
    ],
    'Para cargar':[
      'Power Bank blanco','Power Bank negro','AirPods Max negros',
      'AirPods blancos','Apple Watch','iPhone 17','iPhone 12','iPhone Dúo',
      'Cubo de luz 1','Cubo de luz 2','Luz tubo','Luz cuadrada potente','Micrófonos'
    ],
    'Nevera':[
      'Vaso de agua','Vasos de jugo','Jarra de jugo','Jarra de agua','Plátanos (10)',
      'Marmita disponible','Red Bull Zero','Gaseosa Zero','YoPro','Zanahorias Nalito',
      'Gatorade','Hielo','Leche condensada','Dulce de leche','Nevera limpia (interior y exterior)'
    ],
    'Despensa':['Nutella (frasco envasado)','Miel','Sobres de jugo','Plátanos'],
    'Habitación Closet':[
      'Barrer','Trapear','Todo organizado','Ropa doblada/colgada','Nada en el piso',
      'Zapatos organizados','Basura retirada','Superficies despejadas','Revisar baño',
      'Limpiar inodoro (si es necesario)','Limpiar lavamanos (si es necesario)',
      'Verificar toallas','Verificar pañitos'
    ],
    'Sala':[
      'Barrer','Trapear','Todo en su lugar','Nada sobre muebles','Mesa limpia',
      'Limpiar área de Nalito','Cojines organizados'
    ],
    'Sala de Billar':[
      'Barrer','Trapear','Todo organizado','Nada fuera de lugar','Mesa limpia',
      'Luces apagadas','Puertas y ventanas revisadas'
    ],
    'Baño segundo piso / cocina':[
      'Barrer','Trapear','Revisar baño','Limpiar inodoro (si es necesario)',
      'Limpiar lavamanos (si es necesario)','Limpiar espejo'
    ],
    'Triple verificación':[
      'Oficina','Maleta de Gym','Sorines','Macros'
    ]
  };

  const TEMPLATES={
    rapida:{
      id:'rapida',
      name:'Checklist rápida / prioridad',
      desc:'Orden de prioridad diario',
      groups:[
        {title:'Oficina', items:['Oficina']},
        {title:'Cocina', items:[
          'Hacer panquecas','Dejar vasos de jugo','Dejar vaso de agua','Contar YoPro',
          'Verificar stock mínimo','Verificar Red Bull','Verificar Gatorade',
          'Dejar marmita descongelada o descongelándose','Pesar salsas','Dejar 10 bananos',
          'Cocina limpia','Mesada con nootrópicos y balanza','Nutella de stock','Pasar macros'
        ]},
        {title:'Habitación principal', items:[
          'Stack nocturno','Taponcitos','Servilletas','Parches / diclofenaco','Gatorade'
        ]},
        {title:'Baño · Hab. principal', items:['Verificar SORINE','Verificar pañitos']},
        {title:'Maleta del gym', items:['Hacer la checklist completa de maleta del gym']},
        {title:'Nalito', items:['Paseo','Cepillado de dientes','Peinado','Zanahorias','Plan running']},
        {title:'Checklist para cargar', items:[
          'Power Bank blanco con batería','Power Bank negro con batería','AirPods Max negros',
          'AirPods blancos','Apple Watch','iPhone 17 con batería','iPhone 12 con batería','iPhone Dúo'
        ]},
        {title:'Verificación', items:[
          'Verificar Baño - H. Principal',
          'Verificar Baño - H. Closet',
          'Verificar Baño - Oficina',
          'Verificar Habitación Closet',
          'Verificar Sala en orden',
          'Verificar Lavandería en orden',
          'Verificar Terraza en orden',
          'Verificar cuarto de contenido + cosas cargadas'
        ]},
        {title:'Triple verificación', items:[
          'Oficina','Maleta de Gym','Sorines','Macros'
        ]},
        {title:'Checklist cerrada', items:[
          'Enviar la checklist de cuidados de Nalito',
          'Checklist verificada'
        ]}
      ]
    },
    clm:{
      id:'clm',
      name:'Checklist maestra (CLM)',
      desc:'Recorrido completo por áreas',
      groups:[
        {title:'Baño segundo piso / cocina', items:['Baño segundo piso / cocina']},
        {title:'CLM · noche anterior', items:[
          'Verificar maleta del gym (lo que faltó la noche anterior)',
          'Oficina (si aplica)',
          'Habitación de Martín (Preparación nocturna / Stack nocturno)',
          'Baño · H. Principal','Habitación Closet','Baño · H. Closet','Baño · Oficina'
        ]},
        {title:'Cocina', items:['Cocina']},
        {title:'Cuidados Nalito', items:['Cuidados Nalito']},
        {title:'Despensa', items:['Despensa']`;
