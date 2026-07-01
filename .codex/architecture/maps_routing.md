# Mapas, rutas y enrutamiento

## Visualización

- Frontend inicial: Leaflet.
- Datos cartográficos: OpenStreetMap.
- Servidor de mapas: TileServer GL o alternativa self-hosted si se requiere.
- Objetivo offline: mapa de Ecuador completo + rutas/datos descargados.

## Enrutamiento

Motores posibles:

- OSRM.
- GraphHopper.
- OpenRouteService.

Uso esperado:

- Calcular distancia desde ubicación actual al inicio siguiendo calles/caminos.
- Apoyar métricas técnicas.
- No recalcular automáticamente si el usuario se desvía.
- Navegación visual, sin voz.

## Reglas

- Verificar documentación de cada motor con Context7 antes de implementar.
- Evitar depender de APIs pagadas si no hay presupuesto.
- Si un servicio falla, la app debe degradarse sin bloquear todo.
- Para rutas oficiales, el administrador dibuja la ruta manualmente sobre el mapa.

## Geodatos

- GeoJSON para frontend.
- PostGIS para consultas espaciales.
- SRID 4326.
