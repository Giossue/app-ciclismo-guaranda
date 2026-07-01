# Dominio: rutas ciclistas

## Reglas principales

- Solo administradores crean rutas.
- Ciclistas no proponen rutas.
- Rutas creadas manualmente en mapa.
- No importar GPX/GeoJSON en primera versión.
- Se permiten rutas circulares.
- Una ruta puede tener puntos intermedios o POIs obligatorios.

## Estados

- Borrador: solo admin.
- Activa: visible para ciclistas.
- Inactiva: visible solo admin, no se elimina físicamente.

## Versionado

- Cada ruta tiene `version_ruta`.
- Si una ruta descargada queda desactualizada, la app avisa al usuario.
- No se conservan versiones históricas completas.

## Categorías

- Familiar.
- MTB.
- Urbana.
- Montaña.
- Turística.

## Dificultad

Manual por administrador, considerando:

- Distancia.
- Desnivel positivo.
- Tipo de vía.
- Tiempo estimado.
- Experiencia requerida.

## Datos obligatorios

Nombre, descripción, categoría, dificultad, estado, inicio, final, geometría, imagen principal, métricas, tipo de vía, recomendaciones, observaciones y POIs cuando aplique.
