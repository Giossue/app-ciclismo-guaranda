# 11 — Plan: trazado real de rutas y navegación hacia el inicio

## Estado

Pendiente de aprobación.

## Feedback recibido

- “La ruta sigue mal, línea en blanco de por gusto y no marca el trayecto que toca recorrer”.
- “Si presionan en ver mi ubicación y iniciar recorrido te va a trazar una ruta en línea recta azul hasta el punto de inicio, no está siguiendo las calles o vías disponibles”.
- “Los puntos de inicio y llegada igual siguen sin conectarse por la ruta”.

## Separación del problema

Hay dos líneas distintas que el usuario puede confundir:

1. **Trazado oficial de la ruta**
   - Sale de `route.geojson`.
   - Se renderiza en `resources/js/components/routes/route-map.tsx` con `<GeoJSON />`.
   - Debe representar el recorrido real creado por administración.

2. **Conexión desde ubicación actual hasta el inicio**
   - Actualmente está hardcodeada como `<Polyline />` recta entre ubicación GPS y punto inicial.
   - El popup dice “línea referencial”, pero para testers se ve como ruta incorrecta.
   - Fue agregada en `.codex/bugfix/06-mapa-ciclista-navegacion.md` como ayuda rápida, pero ahora genera confusión.

## Contexto de documentación del repo

- `.codex/architecture/maps_routing.md` indica que el cálculo desde ubicación actual al inicio debe seguir calles/caminos.
- El mismo documento dice que motores posibles son OSRM, GraphHopper u OpenRouteService.
- También indica que las rutas oficiales las dibuja el administrador manualmente sobre mapa.
- `.codex/domain/routes.md` exige geometría, inicio/final y categorías para rutas oficiales.

## Causas probables

### Trazado oficial incorrecto

- El GeoJSON guardado en producción puede tener solo 2 puntos: inicio y final. Eso produce una línea recta.
- El editor actual con Leaflet.draw permite dibujar manualmente, pero no hace “snap to road”. Si el admin dibuja pocos vértices, seguirá viéndose recto o impreciso.
- El editor genera fallback con `lineFromCoordinates()` cuando hay inicio/final pero no GeoJSON válido; ese fallback también es una línea recta.
- Puede haber datos antiguos en producción creados antes del editor nuevo.

### Línea azul hacia el inicio

- `RouteMap` dibuja una línea recta explícita entre `userLocation` y `navigationRoute.start_latitude/start_longitude`.
- Esa línea no consulta calles/vías. Solo abre Google Maps externo para navegación real.

## Plan por etapas

### Etapa 1 — Corrección inmediata para no engañar al usuario

- Eliminar del mapa la línea recta azul de conexión hacia el inicio.
- Mantener el botón `Ir al inicio` abriendo Google Maps externo con `travelmode=bicycling`.
- Cambiar textos para que quede claro:
  - `Ubicación actual` solo muestra el punto GPS.
  - `Ir al inicio` abre navegación externa.
- No dibujar una ruta interna si todavía no tenemos motor de enrutamiento.

### Etapa 2 — Diagnóstico de geometría oficial

- Revisar en producción rutas activas y cantidad de coordenadas en `geometrias_ruta.geojson`.
- Identificar rutas con:
  - GeoJSON nulo,
  - GeoJSON inválido,
  - solo 2 puntos,
  - inicio/final fuera de los extremos del LineString,
  - coordenadas desalineadas con el trayecto real.
- Corregir datos reales desde admin o con SQL puntual si el usuario lo pide, no con seeders.

### Etapa 3 — Endurecer el editor de ruta

- En `RouteGeometryEditor`, advertir si la línea tiene muy pocos vértices para una ruta real.
- Evaluar validación mínima superior a 2 puntos para rutas no triviales.
- Mostrar ayuda visual: “No dibujes solo inicio/final; agrega vértices siguiendo la vía”.
- Evitar que el fallback de inicio/final parezca una ruta oficial válida cuando no hay GeoJSON real.

### Etapa 4 — Enrutamiento real por calles/caminos

- Implementar backend proxy para motor de rutas, no en frontend/APK con secretos.
- Opciones a evaluar con Context7 antes de implementar:
  - OSRM si se puede usar instancia pública/self-hosted sin costo y compatible con bicicleta/caminos locales.
  - GraphHopper si hay clave/presupuesto.
  - OpenRouteService si hay clave/presupuesto y límites aceptables.
- Uso inicial recomendado:
  - calcular ruta desde ubicación actual al inicio siguiendo calles/caminos,
  - devolver GeoJSON al frontend,
  - degradar silenciosamente a “abre Google Maps” si falla.
- No recalcular automáticamente cuando el usuario se desvía, siguiendo `.codex/architecture/maps_routing.md`.

## Archivos que se tocarían después de aprobar

- `resources/js/components/routes/route-map.tsx`.
- `resources/js/components/admin/routes/route-geometry-editor.tsx`.
- `resources/js/pages/admin/routes/partials/route-form.tsx` si se agregan avisos/validaciones UX.
- Requests de rutas admin si se endurece validación de GeoJSON.
- Posible nuevo controlador/servicio Laravel para routing proxy si se aprueba Etapa 4.
- Tests relacionados con visualización de mapa y gestión de rutas.

## Datos/BD

- No se espera migración para la corrección inmediata.
- Sí puede requerirse limpieza/corrección de GeoJSON real en producción para rutas ya creadas.
- Si se agrega motor de rutas, probablemente solo requiere variables `.env`, no schema.

## Criterios de aceptación

- Al presionar `Ubicación actual`, solo aparece la ubicación del usuario; no se dibuja una línea recta engañosa.
- `Ir al inicio` abre navegación externa o, si se implementa motor, muestra un trazado por calles/caminos.
- El trazado oficial conecta inicio y final mediante el GeoJSON real.
- Las rutas activas no deben aparecer como una simple recta salvo que realmente ese sea el trayecto.
- Si el motor externo falla, la app no bloquea mapa ni detalle.

## Validación mínima cuando se implemente

- Tests focalizados de mapa/rutas si existen.
- `npm run types:check`.
- `npm run lint:check`.
- `npm run build`.
- Prueba manual en producción/APK: ubicación actual, botón `Ir al inicio`, trazado oficial, inicio/final y popups.
