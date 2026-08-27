# Definition of Done

Un cambio se considera terminado solo cuando:

- Coincide con el alcance, reglas de dominio y criterios de aceptación aplicables.
- Valida entradas no confiables y aplica autorización por registro en servidor.
- Incluye migración para cambios de schema, pruebas cuando el riesgo lo requiere y documentación/decisión actualizada.
- No expone secretos, datos sensibles, detalles técnicos innecesarios ni rutas de storage.
- Maneja estados pertinentes: carga, vacío, error, sin conexión, permiso y feedback de mutaciones.
- Ejecuta las verificaciones proporcionales y reporta únicamente resultados realmente observados.
- Respeta Laravel/Fortify/Eloquent/Pest/Wayfinder/Capacitor en lugar de introducir patrones incompatibles.
- Las APIs de librería se verifican con Context7 o Laravel Boost; los cambios shadcn/ui reutilizan componentes instalados y revisan su documentación/compatibilidad actual.
- En rendimiento, parte de una línea base y conserva cambios solo si superan la variación normal.
- En Android, no se confunde build/CI con validación en dispositivo cuando intervienen GPS, cámara, permisos, offline o notificaciones.

Para cambios complejos, progreso y decisiones se actualizan en `.codex/progress/` y el plan relevante.
