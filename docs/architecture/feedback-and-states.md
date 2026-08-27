# Feedback y estados

Todo flujo declara qué ocurre antes, durante y después de una acción.

| Estado | Patrón |
| --- | --- |
| Carga inicial | Skeleton o indicador que preserva estructura. |
| Pending mutación | Control deshabilitado/indicador y prevención de duplicados. |
| Éxito rutinario | Sonner breve y actualización de datos. |
| Error corregible | Error junto al campo o acción de reintento clara. |
| Error inesperado | Mensaje seguro, contexto útil y reintento/alternativa; detalles en logs. |
| Sin conexión | Estado visible, qué funciona localmente y cuándo se sincronizará. |
| Permiso/GPS | Explicar capacidad y siguiente acción sin bloquear funciones no dependientes. |
| Conflicto/versión offline | Informar datos desactualizados y ofrecer recarga/sincronización segura. |

No usar banners persistentes para resultados ya resueltos ni toasts para errores que el usuario deba corregir en un formulario.
