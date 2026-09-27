# MARY · Life Suite 💗

Aplicación unificada que reúne las 4 áreas de tu vida:

| Sección | Descripción |
|---------|-------------|
| 🏠 **Dashboard** | Pantalla de inicio con acceso rápido |
| ♠️ **Póker** | Sesiones, leaks, tridents, estudio, reportes |
| 💪 **Fitness** | Alimentación, cardio, fuerza, peso, medidas |
| 🕊️ **Espiritual** | Diario devocional, Biblia, planes de estudio |
| 📅 **Daily Planner** | Schedule, goals, hábitos, rutinas, meal plan |

## Diseño
- Menú **lateral** (sidebar)
- Colores unificados **rosado + morado**
- Icono de **corazón** para el celular (PWA)

## Cómo desplegar en Vercel

1. Sube esta carpeta a un nuevo repositorio de GitHub.
2. En Vercel → New Project → importa el repo.
3. Framework Preset: **Other** (o dejar por defecto).
4. Root Directory: la carpeta `mary-life` (si subiste solo esta carpeta, déjalo vacío).
5. Deploy.

## Estructura

```
mary-life/
├── index.html          ← Shell principal (sidebar + dashboard)
├── modules/
│   ├── poker.html
│   ├── fitness.html
│   ├── espiritual.html
│   └── planner.html
└── README.md
```

Cada módulo conserva **toda** su funcionalidad original (Firebase, botones, filtros, etc.).
