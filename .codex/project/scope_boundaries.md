# Límites del sistema

## Incluido

- App híbrida Android.
- Login obligatorio.
- Roles: ciclista y administrador.
- Rutas oficiales creadas por administradores.
- Mapas, POIs, offline, GPS y recorridos.
- Incidencias con fotos y moderación/revisión.
- Valoraciones solo para rutas completadas.
- Asistente online Laravel/OpenAI con contexto público verificado.
- Panel administrativo.
- Estadísticas y exportaciones.

## Excluido explícitamente

- Usuarios invitados.
- Login con Google/Facebook.
- App nativa pura en Kotlin.
- Soporte prioritario iOS.
- Navegación por voz.
- Recalcular ruta automáticamente al desviarse.
- Videos en incidencias.
- Importar rutas GPX/GeoJSON por administrador.
- Creación pública de rutas por ciclistas.
- Red social entre ciclistas.
- Chat entre usuarios.
- Pagos, reservas o compras.
- Denuncias de comentarios.
- Filtro automático de lenguaje ofensivo.
- Chatbot offline.

## Reglas para cambios de alcance

Si una tarea intenta agregar algo excluido, primero consultar al usuario. Si el usuario confirma, actualizar `README.md` y `.codex/project/scope_boundaries.md`.

## Límites del agente IA

- El agente no debe inventar rutas, POIs, distancias, desniveles, reportes ni clima.
- El modelo no genera cards ni enlaces; Laravel decide las referencias visuales autorizadas.
- No se expone al usuario final lenguaje técnico como Laravel, OpenAI, API, base de datos, parser, tools o moderación.
- El chatbot no funciona offline.
- La ubicación no bloquea toda la app: solo limita funciones de cercanía, navegación/progreso y clima exacto.
