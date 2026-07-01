# Offline, SQLite y sincronización

## Objetivo

Permitir que el ciclista use rutas descargadas, mapa offline, POIs, recorrido GPS e incidencias sin conexión.

## Datos locales en Android

- Usuario autenticado/token seguro.
- Rutas descargadas.
- Geometrías GeoJSON.
- Mapa offline de Ecuador o paquete cartográfico disponible.
- POIs descargados.
- Imágenes descargadas.
- Incidencias activas validadas al momento de descarga.
- Recorrido activo.
- Puntos GPS pendientes.
- Incidencias creadas offline.
- Fotos pendientes.
- Cola local de sincronización.

## Reglas de sincronización

- Toda acción offline se guarda localmente.
- Al recuperar conexión, se sincroniza con servidor.
- Manejar estados: pendiente, enviado, error.
- Reintentar de forma controlada.
- No duplicar incidencias ni puntos GPS.
- Registrar versión de ruta descargada.
- Avisar si una ruta descargada está desactualizada.

## Qué no funciona offline

- Chatbot n8n.
- Clima actualizado.
- Nuevas rutas no descargadas.
- Actualización en tiempo real de incidencias.

## Riesgos

- Tamaño del mapa offline de Ecuador.
- Almacenamiento insuficiente en celulares.
- Consumo de batería con GPS.
- Conflictos de sincronización.
