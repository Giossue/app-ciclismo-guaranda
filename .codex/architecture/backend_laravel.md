# Backend Laravel

## Ubicación

`ciclismo-guaranda/`

## Stack instalado

- Laravel 13.
- Fortify / auth integrada.
- Inertia Laravel v3.
- Wayfinder.
- Pest.
- Laravel Boost.
- Pint.
- Larastan.

## Organización recomendada

Usar arquitectura modular sin romper convenciones Laravel:

```txt
app/
├── Actions/
│   ├── Routes/
│   ├── POIs/
│   ├── Incidents/
│   ├── Tracks/
│   └── Sync/
├── Http/
│   ├── Controllers/
│   ├── Requests/
│   └── Resources/
├── Models/
├── Policies/
└── Services/
    ├── Maps/
    ├── Routing/
    ├── Offline/
    └── N8n/
```

Crear carpetas nuevas solo cuando exista necesidad real.

## API REST

Usar REST para:

- Login/token si aplica.
- Listar rutas activas.
- Detalle de ruta.
- Descargar paquete offline.
- Sincronizar recorridos/puntos GPS.
- Crear incidencias.
- Favoritos.
- Valoraciones.
- Chatbot webhook proxy.

## Reglas

- Controladores delgados.
- Form Requests para entradas complejas.
- Resources para respuestas API.
- Policies para autorización.
- Jobs para tareas pesadas: procesamiento de imágenes, sincronización, llamadas externas.
- Seeders para catálogos: roles, géneros, estados, categorías, tipos.
