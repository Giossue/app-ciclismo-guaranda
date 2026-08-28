# Regla MCP Context7

El agente tiene acceso al MCP de Context7 para consultar documentación actualizada de librerías, frameworks y herramientas.

## Cuándo usar Context7

Usa Context7 cuando una tarea dependa de APIs, configuraciones o patrones de librerías externas, especialmente:

- Capacitor y plugins nativos Android.
- Leaflet, MapLibre, OpenStreetMap, TileServer GL.
- OSRM, GraphHopper, OpenRouteService.
- PostGIS y consultas geoespaciales.
- React, Inertia, Vite, Tailwind, shadcn/ui.
- Laravel, Fortify, Wayfinder, Pest, Laravel Sanctum.
- n8n y consumo de webhooks.
- Open-Meteo.

## Flujo obligatorio

1. Primero usa `resolve-library-id` para obtener el ID correcto de la librería.
2. Luego usa `query-docs` con una pregunta concreta.
3. No inventes nombres de métodos, opciones, parámetros ni configuraciones si pueden verificarse.
4. No envíes secretos, tokens, dominios privados ni credenciales a Context7.

## Relación con Laravel Boost

Dentro de `ciclismo-guaranda/`, Laravel Boost está instalado. Si la tarea trata de paquetes Laravel instalados en el proyecto, prioriza las herramientas/documentación de Boost cuando estén disponibles. Usa Context7 como apoyo para librerías externas o cuando Boost no cubra la necesidad.
