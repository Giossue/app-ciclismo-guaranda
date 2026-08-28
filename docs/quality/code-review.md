# Revisión de código

Reportar primero hallazgos, por severidad: **Crítico**, **Requerido**, **Considerar**, **Nit** o **FYI**. Cada hallazgo incluye archivo/línea, impacto y remedio estructural.

Revisar como mínimo:

- Bugs, pérdida de datos, regresiones y límites del producto.
- Validación, Policies, roles, propiedad de recursos, archivos y secretos.
- Migraciones, compatibilidad PostgreSQL/PostGIS, N+1, paginación y operaciones costosas.
- Contratos Laravel ↔ Inertia/API, Wayfinder y estados de UI.
- Fallos de OpenAI/servicios externos, offline/sync y comportamiento Android cuando sea afectado.
- Pruebas, comandos de verificación y documentación/progreso faltantes.

Si no hay hallazgos, declararlo junto con riesgos residuales. No sustituir una revisión por un resumen del diff.
