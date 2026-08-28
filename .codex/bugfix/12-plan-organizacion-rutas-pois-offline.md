# 12 — Plan: organización de rutas, categorías, POIs e incidencia offline

## Estado

Pendiente de aprobación.

## Feedback recibido

- “En la parte de rutas, todo lo que se muestra podría desplegarse según las categorías porque se muestra todo en la misma pantalla y eso es abrumador”.
- “Hacer barras de navegación lateral aparte de la que está en este momento… el contenido se organiza mejor de esa manera”.
- “Ahorita hay muchas cosas y no se sabe en qué sección está”.
- “Añadir puntos de interés a la ruta. Acompañar de imágenes”.
- En incidencia offline aparece comportamiento duplicado: selector de tipo y campo de texto con el mismo concepto.

## Observación técnica actual

### Listado de rutas

- `resources/js/pages/routes/index.tsx` muestra:
  - encabezado,
  - mapa grande de todas las rutas activas,
  - tarjetas de rutas activas en una sola grilla,
  - sin filtros visibles por categoría.
- `Cyclist\RouteController@index` pagina 12 rutas activas y no envía catálogo de categorías para filtrar.

### Detalle de ruta

`resources/js/pages/routes/show.tsx` concentra muchas secciones seguidas:

- portada,
- mapa,
- recorrido GPS,
- favoritos/valoración,
- offline/sincronización,
- detalle,
- POIs,
- reporte de incidencia,
- sugerencia de POI,
- incidencias activas,
- comentarios.

Esto coincide con el feedback: el usuario no sabe en qué sección está.

### POIs

- El admin ya puede vincular POIs a rutas desde `route-form.tsx`.
- El detalle ya carga POIs con `images`, `hours` y `category`.
- El listado/index carga POIs solo con categoría; no carga imágenes en esa vista.
- El problema puede ser falta de datos vinculados en producción o presentación insuficiente.

### Incidencia offline duplicada

- En `OfflinePanel`, el formulario tiene:
  - `Select name="incident_type_id"` con label “Tipo de incidencia”.
  - `Input name="title"` con placeholder “Título de la incidencia”.
- En uso real, testers están repitiendo el tipo como título, por eso se percibe duplicado.

## Plan propuesto

### 1. Rutas por categoría en listado

- Agregar filtros/chips/tabs por categoría encima del mapa y/o encima de tarjetas:
  - Todas,
  - Familiar,
  - MTB,
  - Urbana,
  - Montaña,
  - Turística,
  - las que existan en BD.
- El filtro debe modificar query param, por ejemplo `?category=mtb` o `?category_id=...`.
- El backend debe enviar:
  - categorías disponibles,
  - categoría seleccionada,
  - conteo opcional por categoría si es rápido.
- Al filtrar, el mapa debe mostrar solo las rutas filtradas para reducir saturación.

### 2. Navegación secundaria en detalle de ruta

- No crear otra navegación global que compita con el bottom navbar/sidebar principal.
- Implementar navegación local de secciones:
  - En móvil: barra horizontal sticky con chips/anclas.
  - En desktop/tablet: rail lateral o índice en una columna secundaria.
- Secciones propuestas:
  - Mapa,
  - Recorrido,
  - Offline,
  - Detalle,
  - POIs,
  - Incidencias,
  - Valoraciones.
- Cada bloque debe tener `id` estable y título visible.
- El objetivo es orientación, no esconder funcionalidades importantes.

### 3. Reordenamiento de detalle para flujo ciclista

Orden recomendado mobile first:

1. Portada/resumen corto.
2. Mapa y botón `Ir al inicio`.
3. Acciones de recorrido GPS.
4. POIs de la ruta.
5. Detalles/recomendaciones.
6. Incidencias/reportar.
7. Offline/sincronización.
8. Favoritos/valoración/comentarios.

Razonamiento: durante una salida real, mapa, recorrido, POIs e incidencias son más urgentes que valoración.

### 4. POIs con imágenes

- Mantener POIs vinculados como parte de la ruta, alineado a `.codex/domain/pois.md`.
- Mejorar tarjetas de POI con imagen visible, categoría, km, dirección/referencia y teléfono si existe.
- Agregar fallback si POI no tiene imagen.
- En listado/mapa de rutas, cargar imágenes de POIs solo si se decide mostrar preview; si no, mantener liviano para performance.
- Revisar datos reales: rutas activas deben tener POIs asociados y fotos cargadas.

### 5. Formulario de incidencia offline sin duplicidad

Opción recomendada:

- Mantener `Tipo de incidencia` como selector obligatorio.
- Eliminar el campo manual `title` del formulario offline visible.
- Generar `title` automáticamente con el nombre del tipo o un texto claro, por ejemplo `Incidencia offline: {tipo}`.
- Mantener `description`, latitud y longitud.

Alternativa si se quiere conservar título:

- Cambiar label a “Título breve para identificar el reporte”.
- Placeholder: “Ej. Perro suelto en el puente”, evitando repetir el tipo.

## Archivos que se tocarían después de aprobar

- `app/Http/Controllers/Cyclist/RouteController.php`.
- `resources/js/pages/routes/index.tsx`.
- `resources/js/pages/routes/show.tsx`.
- `resources/js/components/routes/route-map.tsx` si se ajustan POI popups o carga de imágenes.
- Tipos compartidos en `resources/js/types` si cambia contrato de props.
- Tests de rutas/POIs/offline.

## Datos/BD

- No se espera migración.
- Puede requerir carga/vinculación de POIs reales en producción desde admin o BD.
- Si faltan imágenes de POIs, se corrige como dato real, no con seeder automático.

## Criterios de aceptación

- El listado de rutas permite filtrar por categoría y no muestra todo sin contexto.
- El mapa del listado respeta el filtro aplicado.
- El detalle muestra una navegación local clara de secciones.
- En móvil se puede entender rápidamente dónde está el usuario dentro del detalle.
- Los POIs vinculados aparecen con imagen o fallback, categoría y datos útiles.
- El formulario offline no induce a repetir “tipo de incidencia” como título.

## Validación mínima cuando se implemente

- Tests focalizados de `CyclistRouteVisibilityTest`, `RouteMapVisualizationTest` u otros equivalentes.
- `vendor/bin/pint --dirty --format agent` si se toca PHP.
- `php artisan test --compact --filter=Route` o filtro específico.
- `npm run types:check`.
- `npm run lint:check`.
- `npm run build`.
- Revisión manual mobile: listado, filtro, detalle, anclas, POIs, incidencia offline.
