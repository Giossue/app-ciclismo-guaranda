# Estrategia de pruebas

| Riesgo | Cobertura esperada |
| --- | --- |
| Reglas de negocio puras | Pest unitario/dataset. |
| Rutas, validación y policies | Pest feature, incluyendo rechazo y acceso a registro ajeno. |
| Migraciones/PostGIS | Migración verificable y compatibilidad SQLite solo cuando el test local lo requiera. |
| Integraciones | Fakes/mocks de HTTP y errores, timeout o respuesta inválida. |
| React/Inertia | Tipos, lint, formato y estados de UI; smoke/manual según la interacción. |
| Android/nativo | Dispositivo real para permisos, GPS, cámara, offline, sincronización y notificaciones. |

Datos de prueba deterministas, factories y fakes no deben requerir servicios externos ni secretos. Para pruebas Pest, usa `.agents/skills/pest-testing/SKILL.md`.
