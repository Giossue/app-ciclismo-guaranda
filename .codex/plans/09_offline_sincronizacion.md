# Fase 09 — Offline y sincronización

Estado: `Completado`

## Objetivo

Permitir uso de rutas descargadas, mapa offline, recorridos e incidencias sin conexión.

## Tareas

- Configurar SQLite local en Android.
- Descargar ruta y datos asociados.
- Descargar o empaquetar mapa offline de Ecuador.
- Guardar POIs e imágenes.
- Cola local de sincronización.
- Sincronizar recorridos, puntos GPS, incidencias y fotos.
- Detectar ruta descargada desactualizada.
- Validar almacenamiento disponible.

## Criterios de finalización

- Ruta descargada funciona sin internet.
- Incidencia offline se sincroniza después.
- Recorrido offline se sincroniza después.
- Estados de sincronización son visibles.


## Resultado implementado

- Se agregaron endpoints autenticados para paquete offline de ruta, registro de descarga y sincronización de eventos offline.
- El paquete offline incluye datos base de ruta, GeoJSON, métricas, recomendaciones, observaciones, POIs con horarios/imágenes e incidencias en revisión.
- Se implementó cola local en IndexedDB para WebView/navegador, con estados `pendiente`, `enviado` y `error`.
- Se sincronizan incidencias offline, fotos base64 de incidencias y recorridos finalizados con puntos GPS.
- Se detecta si una descarga local está desactualizada comparando versión descargada contra `route_version` actual.
- La UI de detalle de ruta muestra estado online/offline, descarga local, almacenamiento estimado, cola pendiente y acciones de sincronización.
- No se creó migración nueva ni se aplicaron cambios de BD remota: el esquema existente ya contenía `descargas_ruta` y `entradas_cola_sincronizacion`.

## Nota de alcance

La fase queda funcional para backend + WebView mediante IndexedDB. SQLite nativo Android y empaquetado/descarga del mapa offline de Ecuador quedan para `12_capacitor_android.md`, donde se seleccionarán plugins Capacitor y estrategia cartográfica definitiva.
