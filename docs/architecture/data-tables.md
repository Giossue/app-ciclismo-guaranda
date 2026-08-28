# Colecciones, listas y tablas

- Para ciclistas, prioriza listas/card compactas sobre tablas horizontales; para administración, una tabla puede usarse si conserva acceso móvil y no oculta acciones críticas.
- La fuente de datos debe ser paginada cuando el conjunto pueda crecer. Filtros, búsqueda, orden y paginación usan contrato de backend consistente.
- Diferencia colección vacía de resultado vacío por filtro y de fallo al cargar; cada uno tiene acción útil.
- Columnas/filas muestran labels, fecha localizada, badge de estado y acciones permitidas por rol/estado. Evita IDs crudos.
- No ejecutar relaciones por fila: backend carga lo necesario y la respuesta evita geometrías/imágenes grandes que la vista no utiliza.
- Acciones destructivas no se disparan por toque accidental; las repetibles deben mostrar pending y evitar doble envío.

Si se introduce una tabla común, documenta su contrato y no crees una variante de filtros/paginación por módulo.
