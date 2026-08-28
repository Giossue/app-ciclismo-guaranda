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
IA: Laravel + OpenAI Responses
Clima: pendiente de integración backend explícita
Colas: Laravel Jobs + Redis
```

## Decisiones relevantes

- La aplicación se desarrolla dentro de `ciclismo-guaranda/`.
- El backend y frontend conviven en el starter Laravel React/Inertia.
- Capacitor empaqueta la app Android a partir del frontend.
- Laravel encapsula la integración OpenAI; el frontend/APK no contiene claves ni invoca proveedores de IA directamente.
- El APK no debe contener secretos.
- El mapa offline completo de Ecuador debe planificarse por tamaño y almacenamiento.

## Starter kit instalado

- React starter kit.
- Laravel built-in authentication.
- Sin teams.
- Pest.
- Laravel Boost.
- Email verification, registration, 2FA, passkeys y password confirmation habilitados.

## Decisiones del asistente

- Laravel consulta OpenAI Responses con `store: false`, respuesta JSON Schema y timeout acotado.
- El contexto público se construye en Laravel desde rutas activas, POIs activos y alertas visibles; no existen tools HTTP ni token de n8n.
- Los embeddings `text-embedding-3-large`, pgvector e indexación de imágenes son una fase posterior, nunca requisito para el flujo inicial.
