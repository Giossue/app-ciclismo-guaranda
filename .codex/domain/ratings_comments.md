# Dominio: favoritos, valoraciones y comentarios

## Favoritos

- Requiere login.
- El ciclista puede guardar rutas favoritas aunque no las haya recorrido.

## Valoraciones

- Solo se puede valorar una ruta completada.
- Una valoración por usuario por ruta.
- Calificación de 1 a 5.
- El usuario puede editar o eliminar su valoración.
- Las valoraciones rechazadas no cuentan en el promedio.
- Mostrar promedio y total de valoraciones aprobadas.

## Comentarios

- Pasan por moderación.
- Estados: pendiente, aprobado, oculto, rechazado.
- No hay filtro automático de palabras ofensivas en primera versión.
- No se permite denunciar comentarios en primera versión.
- El administrador puede responder comentarios.

## Reglas técnicas

- Reforzar con constraints únicos: `usuario + ruta`.
- Validar que exista recorrido válido antes de permitir valoración.
- Aplicar policies para edición/eliminación del propio comentario.
