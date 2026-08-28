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

## Decisiones n8n/tools

- n8n usa un nodo Agent conectado a modelo, memoria Postgres y tools HTTP.
- Las tools Laravel actuales son: `buscar_rutas`, `detalle_ruta`, `buscar_pois`, `progreso_ruta` y `alertas_ruta`.
- El clima se consulta desde n8n con Open-Meteo; si no hay ubicación se usa Guaranda como fallback.
- `buscar_rutas` y `buscar_pois` no deben enviar el mensaje completo del usuario como `query`; `query` solo sirve para nombres/lugares/necesidades concretas.
- Las tools Laravel se autentican con token de servidor (`GUARANDA_GO_AGENT_TOOL_TOKEN`) desde n8n; nunca desde frontend/APK.
