window.__CL=(window.__CL||'')+`(function(){
  const LS='MARY_CHECKLIST_V1';
  const COL='mary_checklist';
  const DOC='ops_data';
  const firebaseConfig={
    apiKey:"AIzaSyCnhvfyXpwJdYOQFCvsyHDhgW9F3X7ARR4",
    authDomain:"marpk-816dd.firebaseapp.com",
    projectId:"marpk-816dd",
    storageBucket:"marpk-816dd.firebasestorage.app",
    messagingSenderId:"189644122232",
    appId:"1:189644122232:web:ed7894f1510a373d44658d"
  };
  let db=null;
  try{ if(window.firebase){ if(!firebase.apps.length) firebase.initializeApp(firebaseConfig); db=firebase.firestore(); } }catch(e){ console.warn(e); }

  const PEOPLE=['Valery','Laura','Mary'];
  const STATUS_CYCLE=['','ok','partial','martin','post'];
  const STATUS_ICON={ok:'✅',partial:'☑️',martin:'👱',post:'*️⃣'};

  const SUBS={
    'Oficina':[
      'Limpiar PC','Limpiar escritorio','Limpiar entorno',
      'Colocar canasta blanca','Repisa de nootrópicos organizada','Desinfectar repisas',
      'Sin objetos sobre el escritorio','Verificar Ritalin en polvo',
      'Dejar Ritalin molido','Preparar 5 dosis de Ritalin 0.28-0.29',
      'Preparar 10 dosis de K 0.35','Stack oficina organizado',
      'Pañito para lentes','Líquido para lentes','Servilletas disponibles',
      'Alcohol spray','Gotas de ojos','Humectante de labios',
      'Cable USB-C blanco','Cinturón','Casaca',
      'Power Bank negro','Power Bank blanco','AirPods Max','AirPods blancos'
    ],
    'Cocina':[
      'Barrer','Trapear','Platos limpios y guardados','Encimera limpia',
      'Nada fuera de lugar','Airfryer limpia','Microondas limpio','Limpiar hornillas','Sacar basura',
      'Hacer panquecas','Dejar vasos de jugo','Dejar vaso de agua','Contar YoPro',
      'Verificar stock mínimo','Verificar Red Bull','Verificar Gatorade',
      'Dejar marmita descongelada o descongelándose','Pesar salsas','Dejar 10 bananos',
      'Cocina limpia','Mesada con nootrópicos y balanza','Nutella de stock','Pasar macros'
    ],
    'Habitación principal':[
      'Barrer','Trapear','Cama tendida','Entorno organizado',
      'Mesa de noche organizada con protocolo nocturno','Verificar tapones','Verificar parches',
      'Verificar stack nocturno completo','AirPods cargados','iPhone 12 cargado',
      'Gatorade sin azúcar + stack nocturno preparado + taponcitos','Servilletas',
      'Antialérgico','Diclofenaco','Verificar SORINE en baño','Verificar stock de SORINE en baño'
    ],
    'Baño · Hab. principal':[
      'Barrer','Trapear','Todo organizado','Nada fuera de lugar','Superficies limpias',
      'Basura retirada','Revisar baño','Limpiar inodoro (si es necesario)',
      'Limpiar lavamanos (si es necesario)','Verificar toallas','Verificar pañitos','Verificar SORINE'
    ],
    'Maleta Gym':[
      '2 Toallas (Nike y sin marca)','Camisillas de repuesto','Gatorade','Stanley preparada',
      'Red Bull Zero','Sal','Aceite','Perfume','Pre-workout','Straps','Muñequeras',
      'Lentes limpios','Estuche de lentes + Pañito','Aceite fuera del bolso','Llaves',
      'Antialérgico','Casco al lado del bolso','Cinta POLAR','AirPod Max','AirPods blancos'
    ],
    'Cuidados Nalito':[
      'Desayuno','Refuerzo disciplinario','Paseo 1','Correa 1','Confinamiento',
      'Peinado 1','Cena','Paseo 2','Correa 2','Omega 3 semanal (si aplica)',
      'Cepillado de dientes','Peinado','Zanahorias','Plan running'
    ],
    'Para cargar':[
      'Power Bank blanco','Power Bank negro','AirPods Max negros',
      'AirPods blancos','Apple Watch','iPhone 17','iPhone 12','iPhone Dúo',
      'Cubo de `;
