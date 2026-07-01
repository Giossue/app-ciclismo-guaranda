# Base de datos PostgreSQL + PostGIS

## Objetivo

Usar PostgreSQL como base principal y PostGIS para rutas, POIs, incidencias y puntos GPS.

## Reglas geográficas

- Usar WGS84 / SRID 4326.
- Guardar GeoJSON para consumo frontend.
- Guardar también geometrías PostGIS cuando se requieran consultas espaciales eficientes.
- Crear índices espaciales para rutas, POIs, incidencias y puntos GPS.

## Entidades principales

- Usuarios, roles, géneros, consentimientos.
- Rutas, categorías, estados, geometrías, métricas, imágenes.
- POIs, categorías, horarios, imágenes, sugerencias y reportes.
- Incidencias, tipos, estados y archivos.
- Recorridos y puntos GPS.
- Favoritos, valoraciones, comentarios y archivos multimedia de experiencias.
- Descargas, consultas y cola de sincronización.
- Conversaciones/mensajes IA.
- Notificaciones y auditoría.

## Tablas agregadas en bugfix de testers

- `archivos_valoracion_ruta`: archivos de imagen/video vinculados a valoraciones aprobables de ruta; guarda path, tipo, MIME, tamaño y orden, no binarios.

## Convenciones

- Usar `created_at`, `updated_at` y `deleted_at` cuando aplique.
- Preferir eliminación lógica para trazabilidad.
- Catálogos iniciales mediante seeders.
- No guardar binarios de imágenes en base de datos; guardar ruta/URL y metadatos.

## Consultas espaciales esperadas

- POIs cercanos a una ruta.
- Incidencias activas cercanas o asociadas a ruta.
- Avance aproximado del usuario sobre ruta oficial.
- Validación de recorrido completado al 90%.
