# 15 — Plan: POIs admin, placeholders, imágenes y sugerencias por mapa

## Estado

Pendiente de aprobación.

## Feedback recibido

- No hay placeholders suficientes en formularios de POIs.
- En POIs, las imágenes solo se manejan como texto/rutas; debe ser más usable.
- Cuando un usuario registra/sugiere un punto de interés, solo debería ver los detalles de categoría dependiendo del punto de interés.
- En detalle de ruta del usuario, sugerir un POI debe ser mediante mapa, no campos de latitud/longitud.

## Observación técnica actual

### Admin POIs

- `resources/js/pages/admin/pois/partials/poi-form.tsx` muestra campos base y muchos detalles por categoría en la misma pantalla.
- Actualmente se muestran todas las secciones: comida, tienda, hospedaje, taller, salud.
- El usuario/admin debe ignorar manualmente lo que no corresponde.
- Las imágenes se ingresan como `images_text` con formato `path|descripción`; no hay input de archivo ni preview.
- Las rutas asociadas también se ingresan como texto con IDs (`route_id|obligatorio|km|observación`), lo cual es frágil.
- Hay pocos placeholders en datos base como nombre, descripción, observaciones, dirección, teléfono.

### Sugerencia de POI por ciclista

- En `resources/js/pages/routes/show.tsx`, `PoiSuggestionForm` tiene campos opcionales `latitude` y `longitude` numéricos.
- No hay mapa para elegir punto.
- El usuario puede confundirse o no saber coordenadas.

## Plan propuesto

### 1. Placeholders y ayuda clara en admin POIs

- Agregar placeholders reales según campo:
  - Nombre: “Ej. Mirador de la Cruz”.
  - Descripción: “Qué encontrará el ciclista en este lugar”.
  - Observaciones: “Referencia, acceso, seguridad, temporada”.
  - Dirección: “Ej. A 200 m del parque central”.
  - Teléfono: “Ej. 0999999999”.
- Agregar textos de ayuda breves para formatos complejos mientras se reemplazan por UI mejorada.

### 2. Mostrar solo detalles de la categoría seleccionada

- Convertir `poi_category_id` en estado React controlado.
- Mostrar dinámicamente solo la sección correspondiente:
  - comida,
  - tienda,
  - hospedaje,
  - taller,
  - salud,
  - mirador sin detalles extra si no aplica.
- En edición, iniciar con la categoría guardada.
- Si el admin cambia categoría, advertir que detalles anteriores de otra categoría se reemplazarán al guardar.
- Mantener validación backend segura: solo guardar detalles compatibles con la categoría final.

### 3. Imágenes de POIs con input y preview

- Reemplazar o complementar `images_text` con `images[]` tipo archivo.
- Guardar archivos en disco `public` bajo `pois/`.
- Mostrar preview antes de guardar.
- En edición, mostrar imágenes existentes y permitir agregar nuevas.
- Definir si se permitirá eliminar imágenes existentes desde UI en esta fase.
- Mantener `images_text` solo como campo avanzado si aún se necesita importar rutas internas.

### 4. Asociación de POIs a rutas sin escribir IDs manuales

- Reemplazar `route_links_text` por selector múltiple de rutas activas/borrador.
- Por cada ruta seleccionada permitir:
  - obligatorio sí/no,
  - km desde inicio,
  - observación.
- Evitar que el admin tenga que copiar IDs desde una lista.

### 5. Sugerir POI desde mapa en ciclista

- En `PoiSuggestionForm`, reemplazar lat/lng manual por selector en mapa.
- Opciones:
  - botón “Usar mi ubicación actual”,
  - click/tap en mapa para colocar marcador,
  - arrastrar marcador si Leaflet lo permite.
- Guardar latitud/longitud como hidden inputs.
- Si el usuario no elige ubicación, mantenerla opcional solo si el dominio lo permite; preferido: pedir punto en mapa.
- Mostrar feedback claro: “Punto seleccionado: lat, lng”.

### 6. Detalles de categoría en sugerencia de ciclista

- Para el ciclista, no mostrar todos los campos complejos de admin.
- Mostrar campos simples dependientes de categoría:
  - comida: tipo de comida/recomendación opcional,
  - taller: servicio que ofrece,
  - hospedaje: referencia/precio aproximado,
  - salud: tipo de atención,
  - tienda: qué vende,
  - mirador: referencia/atractivo.
- Si esto requiere guardar nuevos campos en sugerencias, evaluar si el esquema actual lo soporta. Si no, guardar en `description` con formato claro o crear migración si se justifica.

## Archivos que se tocarían después de aprobar

- `resources/js/pages/admin/pois/partials/poi-form.tsx`.
- `app/Http/Controllers/Admin/PoiController.php`.
- `app/Http/Requests/Admin/Concerns/ValidatesPoiPayload.php`.
- `resources/js/pages/routes/show.tsx` (`PoiSuggestionForm`).
- `app/Http/Controllers/Cyclist/PoiSuggestionController.php`.
- Requests de sugerencia de POI.
- Posibles tests de admin POIs y sugerencias de ciclista.

## Datos/BD

- Para imágenes por archivo en POIs, probablemente no requiere migración si ya existe tabla de imágenes POI.
- Si se agregan campos estructurados a sugerencias de ciclistas, puede requerir migración; alternativa inicial: guardar detalle extra en descripción.
- Datos reales de POIs/imágenes se cargarán desde admin o BD, no con seeders automáticos.

## Criterios de aceptación

- El formulario admin de POI tiene placeholders útiles.
- Solo se ven detalles de la categoría seleccionada.
- Admin puede subir imágenes de POI sin escribir rutas manualmente.
- Admin puede asociar POI a rutas sin copiar IDs.
- Ciclista sugiere POI seleccionando punto en mapa.
- Ciclista solo ve campos relevantes a la categoría sugerida.

## Validación mínima cuando se implemente

- Tests focalizados de POIs y sugerencias.
- `vendor/bin/pint --dirty --format agent` si se toca PHP.
- `php artisan test --compact --filter=Poi`.
- `npm run types:check`.
- `npm run lint:check`.
- `npm run build`.
- Prueba manual mobile: crear POI, subir imágenes, asociar rutas, sugerir POI desde mapa.

## Avance implementado

- Agregados placeholders en formulario admin de POIs.
- Detalles admin por categoría ahora se muestran según la categoría seleccionada.
- POIs admin aceptan subida de imágenes con preview y guardado en disco público.
- Sugerencia de POI del ciclista ahora usa mapa/click o ubicación actual; no muestra campos manuales de latitud/longitud.

## Pendiente

- Asociación POI-ruta aún conserva campo avanzado por texto; queda pendiente selector estructurado por ruta con obligatorio/km/observación.
