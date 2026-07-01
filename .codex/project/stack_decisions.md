# Decisiones de stack

## Stack principal

```txt
Backend: Laravel 13
Arquitectura: Monolito modular + API REST
Auth: Laravel built-in auth / Fortify
Frontend: React 19 + Inertia 3 + TypeScript + Vite
UI: Tailwind CSS v4 + shadcn/ui
Testing: Pest 4
Rutas tipadas: Wayfinder
Base de datos: PostgreSQL + PostGIS
App móvil: Capacitor Android
Offline: SQLite local + filesystem
Mapas: Leaflet + OpenStreetMap / TileServer GL
Rutas: OSRM / GraphHopper / OpenRouteService según necesidad
IA: webhook externo n8n
Clima: Open-Meteo dentro del flujo n8n/backend
Colas: Laravel Jobs + Redis
```

## Decisiones relevantes

- La aplicación se desarrolla dentro de `ciclismo-guaranda/`.
- El backend y frontend conviven en el starter Laravel React/Inertia.
- Capacitor empaqueta la app Android a partir del frontend.
- El sistema no contiene lógica de IA propia: consume n8n.
- El APK no debe contener secretos.
- El mapa offline completo de Ecuador debe planificarse por tamaño y almacenamiento.

## Starter kit instalado

- React starter kit.
- Laravel built-in authentication.
- Sin teams.
- Pest.
- Laravel Boost.
- Email verification, registration, 2FA, passkeys y password confirmation habilitados.
