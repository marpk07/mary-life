(function(){
  const PEOPLE = ['Mary','Laura','Valery'];
  const LS = 'mary_calificaciones_v1';
  const COL = 'mary_calificaciones';
  const DOC = 'team_data';
  let store = { days: {}, openPendientesMaster: [], updatedAt: null };
  let db = null;
  const firebaseConfig = {
    apiKey: "AIzaSyCnhvfyXpwJdYOQFCvsyHDhgW9F3X7ARR4",
    authDomain: "marpk-816dd.firebaseapp.com",
    projectId: "marpk-816dd",
    storageBucket: "marpk-816dd.firebasestorage.app",
    messagingSenderId: "189644122232",
    appId: "1:189644122232:web:ed7894f1510a373d44658d"
  };
  try {
    if (!firebase.apps.length) firebase.initializeApp(firebaseConfig);
    db = firebase.firestore();
  } catch (e) { console.warn('Firebase init', e); }

  const DEFAULT_OPENS = [
    {id:'odon', title:'Procedimiento odontología', status:'en_espera', note:''},
    {id:'maite', title:'Documentación Maite', status:'en_proceso', note:''},
    {id:'suplemento', title:'Suplemento', status:'pendiente', note:''},
    {id:'apple', title:'Venta de equipos Apple', status:'en_proceso', note:''},
    {id:'monitor', title:'Transporte de monitor', status:'en_espera', note:''},
    {id:'mudanza', title:'Mudanza', status:'en_proceso', note:''},
    {id:'nalito', title:'Profilaxis Nalito', status:'en_espera', note:''},
    {id:'eco', title:'Ecocardiograma Doppler', status:'en_espera', note:''},
    {id:'bicimoto', title:'Bicimoto', status:'pendiente', note:''},
    {id:'joyas', title:'Joyas / otorrino', status:'en_proceso', note:''}
  ];
  const OPEN_STATUS = [
    {v:'en_espera', t:'En espera'},
    {v:'en_proceso', t:'En proceso'},
    {v:'pendiente', t:'Pendiente'},
    {v:'sin_novedades', t:'Sin novedades'},
    {v:'cerrado', t:'Cerrado'}
  ];
  function openStatusLabel(s){
    const m={en_espera:'En espera',en_proceso:'En proceso',pendiente:'Pendiente',sin_novedades:'Sin novedades',cerrado:'Cerrado'};
    return m[s]||s||'—';
  }
