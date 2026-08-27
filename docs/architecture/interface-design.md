# Diseño de interfaz operativo

Guaranda Go se usa en exterior y en administración. Cada pantalla debe ayudar a decidir o actuar, no narrar cómo está construida.

## Prioridades

- El contenido y acción principal se ven primero; acciones secundarias quedan agrupadas sin competir.
- Mantener contraste, targets táctiles cómodos, tipografía legible y estados críticos distinguibles sin depender solo del color.
- Mostrar métricas solo si cambian una decisión; evitar KPIs, tarjetas y texto de ayuda repetidos.
- Usar nombres de negocio y referencias humanas; los IDs, paths y metadatos del backend quedan ocultos.
- Administrador puede ver estado operativo y moderación; ciclista recibe información útil sin jerga interna.

## Elección de superficie

| Necesidad | Superficie |
| --- | --- |
| Consultar/filtrar muchos registros | Lista móvil o tabla administrativa con acciones por fila. |
| Crear/editar dato breve y reversible | Diálogo o Sheet. |
| Editor de ruta, recorrido, mapa o flujo de riesgo | Página completa por secciones. |
| Confirmar irreversible | Diálogo con contexto y confirmación reforzada. |
| Advertencia que sigue siendo relevante | Alert contextual, no toast. |
