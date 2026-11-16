(function(){
  const LS = 'mary_entreno_rehab_v1';
  const COL = 'mary_entreno_rehab';
  const DOC = 'sessions_data';
  const PHASE = 'v3_nov2026';

  const TEMPLATES = {
    cal_piernas: {
      id:'cal_piernas', kind:'calentamiento', title:'Calentamiento piernas',
      hint:'~8–10 min · dinámico, sin estirar estático antes de cargar',
      exercises:[
        {id:'cp1', name:'Bicicleta suave', mode:'time', targetSec:300, sets:1, note:'5 min, resistencia baja'},
        {id:'cp2', name:'Círculos de pierna de pie (adelante/atrás)', mode:'reps', targetReps:10, sets:2, note:'Por pierna, controlado'},
        {id:'cp3', name:'Círculos / balanceo lateral de pierna', mode:'reps', targetReps:10, sets:2, note:'De pie, hacia los lados'},
        {id:'cp4', name:'Rotación de cadera de pie', mode:'reps', targetReps:10, sets:2, note:'Giro suave de la pierna'},
        {id:'cp5', name:'Zancada dinámica + inclinación de torso', mode:'reps', targetReps:8, sets:2, note:'Por lado; te inclinas adelante/atrás con control'},
        {id:'cp6', name:'Rotación de piernas sentada', mode:'reps', targetReps:10, sets:2, note:'Sentada, abre/cierra o rota con control'},
        {id:'cp7', name:'Puente de glúteo', mode:'reps', targetReps:10, sets:1, note:'Sin peso'},
        {id:'cp8', name:'Sentadilla sin peso', mode:'reps', targetReps:10, sets:1, note:'Rango cómodo, sin dolor de tendón'}
      ]
    },
    cal_torso: {
      id:'cal_torso', kind:'calentamiento', title:'Calentamiento torso (Push/Pull)',
      hint:'~8–10 min · movilidad dinámica',
      exercises:[
        {id:'ct1', name:'Caminata suave', mode:'time', targetSec:180, sets:1, note:'3 min'},
        {id:'ct2', name:'Círculos de hombros', mode:'reps', targetReps:12, sets:2, note:'Adelante y atrás'},
        {id:'ct3', name:'Círculos de brazos', mode:'reps', targetReps:12, sets:2, note:'Amplios, sin dolor'},
        {id:'ct4', name:'Apertura de pecho', mode:'time', targetSec:30, sets:2, note:'Manos atrás o en marco, suave'},
        {id:'ct5', name:'Rotación de tronco de pie', mode:'reps', targetReps:10, sets:2, note:'Por lado'},
        {id:'ct6', name:'Gato-camello', mode:'reps', targetReps:10, sets:1, note:'Lento'},
        {id:'ct7', name:'Serie ligera del 1.er ejercicio del día', mode:'reps', targetReps:12, sets:1, note:'Peso muy liviano · activa el patrón'}
      ]
    },
    rehab_b1: {
      id:'rehab_b1', kind:'rehab', title:'Rehab Bloque 1 · Cuádriceps y flexores',
      hint:'3×15 base · isométricos sin irritar el tendón · ~15 min',
      exercises:[
        {id:'r1a', name:'Extensión de cuádriceps isométrica', mode:'iso', targetReps:15, sets:3, holdSec:25, note:'Sentada, extiende y sostén. Aprieta fuerte, sin dolor. 20–30 s.'},
        {id:'r1b', name:'Extensión isométrica + abd/aducción con obstáculo', mode:'reps', targetReps:15, sets:3, note:'Pasa la pierna por encima del objeto: dentro y fuera.'},
        {id:'r1c', name:'Elevación de pierna recta (SLR)', mode:'reps', targetReps:15, sets:3, note:'Boca arriba, eleva hasta la altura de la otra rodilla.'},
        {id:'r1d', name:'Dead bug', mode:'reps', targetReps:15, sets:3, note:'Brazo y pierna contrarios; sin arquear la espalda.'},
        {id:'r1e', name:'Marcha con pausa', mode:'iso', targetReps:15, sets:3, holdSec:5, note:'Rodilla a 90° · mantén 5 s · alterna.'},
        {id:'r1f', name:'Sitting leg raise (rodilla al pecho)', mode:'reps', targetReps:15, sets:3, note:'Boca arriba, flexiona cadera y baja con control.'}
      ]
    },
    rehab_b2: {
      id:'rehab_b2', kind:'rehab', title:'Rehab Bloque 2 · Lumbar y glúteos',
      hint:'3×15 · tronco estable · ~15 min',
      exercises:[
        {id:'r2a', name:'Bird-dog', mode:'reps', targetReps:15, sets:3, note:'Cuatro apoyos; brazo y pierna contrarios, cadera nivelada.'},
        {id:'r2b', name:'Gato-camello', mode:'reps', targetReps:15, sets:3, note:'Movimiento lento.'},
        {id:'r2c', name:'Puente de glúteo a una pierna', mode:'reps', targetReps:15, sets:3, note:'Sin girar la pelvis.'},
        {id:'r2d', name:'Patada trasera en cuadrupedia', mode:'reps', targetReps:15, sets:3, note:'Sin arquear la lumbar.'},
        {id:'r2e', name:'Hip thrust', mode:'reps', targetReps:15, sets:3, note:'Pausa 1 s arriba.'},
        {id:'r2f', name:'Clamshell (almeja)', mode:'reps', targetReps:15, sets:3, note:'Abre rodilla sin girar pelvis.'}
      ]
    },
    movilidad: {
      id:'movilidad', kind:'movilidad', title:'Movilidad y estiramiento (cuerpo completo)',
      hint:'20–25 min · mié/dom o cuando toque · sin dolor',
      exercises:[
        {id:'m1', name:'Gato-camello', mode:'reps', targetReps:10, sets:1, note:'Lento'},
        {id:'m2', name:'Postura del niño', mode:'time', targetSec:40, sets:1, note:'30–45 s'},
        {id:'m3', name:'Rotación torácica en cuadrupedia', mode:'reps', targetReps:8, sets:1, note:'Por lado'},
        {id:'m4', name:'Estiramiento flexor de cadera', mode:'time', targetSec:40, sets:1, note:'30–45 s por lado'},
        {id:'m5', name:'Isquios acostada con banda/toalla', mode:'time', targetSec:40, sets:1, note:'30–45 s por lado'},
        {id:'m6', name:'Figura 4 (glúteo)', mode:'time', targetSec:40, sets:1, note:'30–45 s por lado'},
        {id:'m7', name:'Pantorrilla en pared', mode:'time', targetSec:30, sets:1, note:'30–45 s por lado'},
        {id:'m8', name:'Pecho en marco de puerta', mode:'time', targetSec:30, sets:1, note:'Sin forzar hombro'},
        {id:'m9', name:'Rodillas al pecho + rotación lumbar', mode:'time', targetSec:30, sets:1, note:'Por lado'},
        {id:'m10', name:'Cuádriceps (opcional)', mode:'time', targetSec:25, sets:1, note:'Si molesta el tendón, sáltalo', optional:true}
      ]
    },
    piernas_a: {
      id:'piernas_a', kind:'gym', title:'Piernas A (suave)',
      hint:'Peso moderado · molestia ≤3–4/10 · sin subir peso estas 4 sem',
      exercises:[
        {id:'pa1', name:'Prensa 45° (pies ancho hombros)', mode:'load', targetReps:12, sets:3, note:'Rodilla ~90°. 3×12–15'},
        {id:'pa2', name:'Curl femoral sentada', mode:'load', targetReps:12, sets:3, note:'Baja en 3 s'},
        {id:'pa3', name:'Aductores en máquina', mode:'load', targetReps:12, sets:3, note:'Pausa 1 s al cerrar'},
        {id:'pa4', name:'Elevación de talones', mode:'load', targetReps:12, sets:3, note:'Lenta, pausa abajo y arriba'}
      ]
    },
    piernas_b: {
      id:'piernas_b', kind:'gym', title:'Piernas B · Glúteos y multífidos',
      hint:'Moderado · sin sentadilla ni step-up ni extensión de cuádriceps con peso',
      exercises:[
        {id:'pb1', name:'Hiperextensión (silla romana)', mode:'load', targetReps:12, sets:3, note:'Hasta línea recta, pausa 2 s'},
        {id:'pb2', name:'Hip thrust (máquina o barra)', mode:'load', targetReps:10, sets:4, note:'4×8–12 · rodilla 90°'},
        {id:'pb3', name:'Peso muerto rumano ligero', mode:'load', targetReps:10, sets:3, note:'Espalda neutra'},
        {id:'pb4', name:'Pull-through polea baja', mode:'load', targetReps:12, sets:3, note:'Bisagra de cadera'},
        {id:'pb5', name:'Patada de glúteo (recorrido corto)', mode:'load', targetReps:12, sets:2, note:'Antes del ángulo que duele'},
        {id:'pb6', name:'Abductores en máquina', mode:'load', targetReps:15, sets:3, note:'Series largas, sin impulso'}
      ]
    },
    push: {
      id:'push', kind:'gym', title:'Push (Pecho/Hombros)',
      hint:'Tu rutina · solo llenas peso y reps · Lbs',
      exercises:[
        {id:'pu1', name:'Press de banca plano (barra o mancuerna)', mode:'load', targetReps:8, sets:4, note:'8–10 reps'},
        {id:'pu2', name:'Press inclinado (máquina o mancuernas)', mode:'load', targetReps:10, sets:4, note:'10–12 reps'},
        {id:'pu3', name:'Press militar (mancuernas o barra)', mode:'load', targetReps:8, sets:3, note:'8–10 reps'},
        {id:'pu4', name:'Elevaciones laterales con mancuernas', mode:'load', targetReps:12, sets:4, note:'12–15 reps'},
        {id:'pu5', name:'Extensión de tríceps en polea alta', mode:'load', targetReps:10, sets:3, note:'10–12 reps'},
        {id:'pu6', name:'Press francés o fondos en paralelas', mode:'load', targetReps:10, sets:3, note:'10–12 reps'}
      ]
    },
    pull: {
      id:'pull', kind:'gym', title:'Pull (Espalda + Bíceps)',
      hint:'Tu rutina · solo llenas peso y reps · Lbs',
      exercises:[
        {id:'pl1', name:'Jalón al pecho (Lat Pulldown)', mode:'load', targetReps:8, sets:4, note:'8–12 reps'},
        {id:'pl2', name:'Remo en polea baja sentado', mode:'load', targetReps:8, sets:4, note:'8–12 reps'},
        {id:'pl3', name:'Remo mancuerna a una mano', mode:'load', targetReps:10, sets:3, note:'10–12 reps'},
        {id:'pl4', name:'Face pulls', mode:'load', targetReps:12, sets:3, note:'12–15 reps'},
        {id:'pl5', name:'Curl bíceps mancuernas (martillo o alternado)', mode:'load', targetReps:10, sets:3, note:'10–12 reps'},
        {id:'pl6', name:'Curl polea baja o barra Z', mode:'load', targetReps:10, sets:3, note:'10–12 reps'}
      ]
    }
  };

  let store = { sessions: [], updatedAt: null };
  let db = null;
  let active = null;
  let timer = { exId:null, left:0, total:0, iv:null };

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
  } catch(e){ console.warn(e); }

