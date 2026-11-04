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
      'Nada fuera de lu`;
