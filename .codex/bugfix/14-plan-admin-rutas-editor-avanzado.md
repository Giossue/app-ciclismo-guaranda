# 14 — Plan: editor avanzado de rutas en administración

## Estado

Pendiente de aprobación.

## Feedback recibido

- En administrador, al elegir/dibujar una ruta debe existir botón para obtener la ubicación actual.
- Para marcar la ruta debe permitir varios puntos del recorrido, no solo punto A → punto B.
- El administrador debe poder configurar el perímetro/trayecto considerando calles o caminos específicos.
- Al seleccionar fotos adicionales de rutas debe mostrarse vista previa en carrusel.
- Al seleccionar el perímetro/trazado debe llenarse automáticamente desnivel positivo y negativo según coordenadas.
- En admin y ciclista el contraste del trazado de ruta no es legible.
- Agregar modo satélite.

## Observación técnica actual

- `resources/js/components/admin/routes/route-geometry-editor.tsx` usa Leaflet.draw y técnicamente permite una polyline con múltiples vértices, pero la UX actual puede hacer pensar que solo es punto A → punto B porque:
  - el badge acepta mínimo 2 puntos,
  - existe fallback de inicio/final en línea recta,
  - no hay una guía fuerte para añadir varios vértices,
  - no hay botón de ubicación actual en el editor admin.
- El formulario `resources/js/pages/admin/routes/partials/route-form.tsx` permite subir imagen principal y adicionales, pero no muestra previsualización/carrusel de archivos seleccionados antes de guardar.
- El cálculo actual de distancia usa geometría local, pero no calcula desnivel positivo/negativo automáticamente.
- El mapa usa solo tiles OSM estándar; no hay selector de capa satélite.

## Plan propuesto

### 1. Ubicación actual en editor admin

- Agregar botón `Usar mi ubicación` o `Centrar en mi ubicación` dentro del editor de geometría.
- Pedir permiso de geolocalización con `navigator.geolocation`.
- Centrar el mapa en la ubicación del admin y mostrar marcador temporal.
- No sobrescribir el trazado existente automáticamente; solo centrar/ayudar.
- Mostrar estado claro: solicitando, permiso denegado, ubicación obtenida.

### 2. Dibujo multipunto real

- Mantener polyline como geometría oficial, no polygon/perímetro cerrado, porque el dominio define rutas como `LineString`.
- Cambiar copy visual:
  - “Marca todos los puntos del recorrido, siguiendo cada calle o sendero”.
  - “No dibujes solo inicio y final salvo que el trayecto sea realmente recto”.
- Elevar la validación visual:
  - Mínimo técnico: 2 puntos.
  - Recomendación UX: 4+ puntos para rutas reales.
- Agregar badge de advertencia cuando solo hay 2 puntos: “Trazado incompleto / línea recta”.
- Si se aprueba validación dura, exigir más de 2 puntos en backend para rutas no triviales; revisar impacto en rutas circulares o trayectos muy cortos.

### 3. Contraste del trazado

- Cambiar estilo de polyline en admin y ciclista para que sea visible sobre mapa claro y satélite:
  - trazo principal grueso,
  - posible borde/halo externo,
  - colores semánticos consistentes,
  - inicio/final diferenciados.
- Evitar que el color dependa de `--primary` si en modo claro/oscuro pierde contraste con el tile.
- Coordinar con `.codex/bugfix/13-plan-contraste-tema-botones.md`.

### 4. Modo satélite

- Agregar control de capas en mapas:
  - Mapa estándar OSM.
  - Satélite/híbrido si se define proveedor permitido.
- Antes de implementar, verificar fuente/licencia/costo. Opciones posibles:
  - tiles propios/TileServer GL,
  - proveedor público compatible,
  - capa satélite con atribución correcta.
- No hardcodear claves de proveedores en frontend ni APK.

### 5. Previsualización/carrusel de imágenes adicionales

- En `route-form.tsx`, al seleccionar `additional_images[]`, generar previews locales con `URL.createObjectURL`.
- Mostrar carrusel/lista horizontal mobile-first con:
  - miniatura,
  - nombre del archivo,
  - tamaño aproximado,
  - botón quitar antes de enviar si se implementa selección controlada.
- Mantener preview de portada principal.
- Agregar fallback para imágenes existentes en edición.

### 6. Desnivel automático

- Calcular desnivel positivo/negativo a partir de la elevación por coordenada.
- Necesita servicio externo o dataset local. Opciones:
  - OpenTopoData/Open-Elevation u otro endpoint libre,
  - API del motor de rutas si entrega elevación,
  - DEM propio futuro.
- Debe pasar por backend Laravel, no directo desde frontend si hay claves/límites.
- Flujo recomendado:
  - al cambiar el trazado, enviar coordenadas al backend,
  - backend obtiene elevaciones,
  - calcula ascenso/descenso acumulado,
  - devuelve `positive_elevation_m` y `negative_elevation_m`,
  - si falla, deja campos editables manualmente.

## Archivos que se tocarían después de aprobar

- `resources/js/components/admin/routes/route-geometry-editor.tsx`.
- `resources/js/pages/admin/routes/partials/route-form.tsx`.
- `resources/js/components/routes/route-map.tsx`.
- Posible nuevo servicio/controlador backend para elevación.
- Requests/tests de rutas si se endurece validación de puntos.
- Configuración `.env` si se usa proveedor externo de elevación o tiles.

## Datos/BD

- No se espera migración: ya existen campos de desnivel en métricas de ruta.
- Puede requerir corrección de datos reales de rutas existentes si su GeoJSON tiene solo dos puntos.

## Criterios de aceptación

- Admin puede centrar el mapa con ubicación actual.
- Admin puede dibujar claramente múltiples puntos del trayecto.
- La UI advierte cuando el trazado es una simple línea A → B.
- Las fotos adicionales seleccionadas se previsualizan antes de guardar.
- El desnivel se llena automáticamente cuando el servicio de elevación responde; si no responde, el formulario sigue permitiendo edición manual.
- El trazado se ve bien en mapa claro, oscuro/satélite y móvil.
- El mapa permite alternar entre estándar y satélite sin exponer claves.

## Validación mínima cuando se implemente

- `npm run types:check`.
- `npm run lint:check`.
- `npm run build`.
- Tests PHP si se agrega endpoint de elevación.
- Prueba manual: crear/editar ruta con 5+ puntos, ubicación actual, fotos adicionales y cálculo de desnivel.

## Avance implementado

- Agregado botón `Usar mi ubicación` en el editor admin de ruta.
- Agregado toggle de capa `Mapa/Satélite` en el editor admin.
- Se refuerza UX multipunto con advertencia cuando solo hay inicio/final.
- Se agregó preview horizontal de imágenes adicionales de rutas antes de guardar.
- Se mejoró color/contraste del trazo en mapas.

## Pendiente

- Desnivel positivo/negativo automático queda pendiente de servicio de elevación/backend. No se implementó sin proveedor definido para evitar inventar API o exponer claves.
