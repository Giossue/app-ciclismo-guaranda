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

### OSRM interno de Ecuador

- Producción ejecuta OSRM en un servicio Docker Compose independiente, sin dominio ni puerto público, preparado con el perfil `bicycle.lua` y datos de Ecuador de Geofabrik/OpenStreetMap.
- Laravel lo consume únicamente por `GUARANDA_GO_OSRM_URL` desde `config/guaranda.php`; la URL, el payload del motor y la red interna nunca llegan al navegador.
- `POST /admin/routes/routing-preview` es exclusivo de administradores y se limita a 20 solicitudes por minuto. Acepta entre dos y diez puntos validados, normaliza GeoJSON, distancia y tiempo, y no persiste nada.
- El editor administrativo usa este cálculo como primer trazado al elegir inicio/final. Si no hay una ruta o OSRM no está disponible, explica el fallo y permite dibujar/corregir manualmente sin bloquear el alta.
- El editor ofrece las capas visibles de OpenStreetMap y Esri World Imagery; la segunda se presenta como una opción de satélite para revisar visualmente el trazado. Al mostrarse dentro del diálogo administrativo, Leaflet recalcula el tamaño del mapa tras la animación para evitar un lienzo incompleto.

## Reglas

- Verificar documentación de cada motor con Context7 antes de implementar.
- Evitar depender de APIs pagadas si no hay presupuesto.
- Si un servicio falla, la app debe degradarse sin bloquear todo.
- Para rutas oficiales, el administrador revisa el trazado generado y puede corregirlo manualmente sobre el mapa antes de publicarlo.
- El alta y edición administrativa se organiza en cuatro pasos: datos, mapa, detalles y publicación. El proveedor técnico de enrutamiento se mantiene como valor interno por defecto, no como decisión visible en el formulario.

## Geodatos

- GeoJSON para frontend.
- PostGIS para consultas espaciales.
- SRID 4326.
