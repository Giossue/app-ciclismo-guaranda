# Checklist de aceptación

## Ruta creada correctamente

- Admin completa campos obligatorios.
- Admin dibuja/edita el recorrido en mapa, no escribe GeoJSON manualmente.
- Geometría LineString se guarda correctamente.
- Inicio/final se derivan del primer y último punto del trazado.
- Distancia se calcula desde el trazado y puede ajustarse si existe medición oficial.
- Tiene estado válido.
- Tiene categoría y dificultad.
- Tiene experiencia requerida por selección guiada.
- Tiene imagen principal subida como archivo con límite de 5 MB.
- Puede vincular POIs activos como puntos intermedios.
- Tiene métricas técnicas.
- Si está activa, aparece al ciclista.
- Si está inactiva, solo aparece al admin.

## Descarga offline exitosa

- Ruta se guarda localmente.
- GeoJSON visible sin internet.
- POIs visibles sin internet.
- Imágenes descargadas visibles sin internet.
- Mapa offline disponible según paquete instalado/descargado.
- Se registra versión descargada.
- La app avisa si no hay almacenamiento suficiente.

## Recorrido GPS válido

- Usuario inicia recorrido explícitamente.
- Se registra ubicación con consentimiento.
- Guarda puntos GPS cada 60 segundos.
- Calcula métricas.
- Permite pausar/reanudar/finalizar.
- Se considera válido si completa aproximadamente 90% de la ruta.

## Incidencia reportada correctamente

- Requiere login.
- Está asociada a una ruta.
- Tiene tipo, descripción y ubicación.
- Permite foto hasta 5 MB.
- Si está offline, queda en cola.
- Si está online, llega al servidor.
- Admin recibe notificación.
- No se muestra a ciclistas hasta revisión administrativa.

## Valoraciones y experiencias

- Usuario solo valora tras recorrido finalizado válido.
- Puede adjuntar hasta 4 fotos/videos por valoración.
- Cada archivo multimedia tiene límite de 20 MB.
- Comentarios y archivos se muestran públicamente solo cuando la valoración está aprobada.

## Chatbot n8n

- App envía solicitud al webhook configurado.
- Recibe JSON de `Respond to Webhook`.
- Muestra respuesta correctamente.
- Maneja error o timeout.
- No funciona offline.
- No expone secretos en APK/frontend.
- Si n8n todavía no está configurado, muestra aviso claro y no se cuenta como bug de la app.

## Administración sin placeholders

- `/admin/dashboard` muestra resumen real del sistema.
- `/admin/routes` gestiona rutas oficiales.
- `/admin/pois` gestiona POIs oficiales y asociaciones con rutas.
- `/admin/incidents` permite revisar incidencias.
- `/admin/users` permite gestionar usuarios.
- `/admin/ratings` permite moderar valoraciones.
- `/admin/catalogs` permite crear/actualizar catálogos del sistema.
- `/admin/statistics` muestra métricas/rankings con filtros por fecha.
- `/admin/statistics/export` descarga CSV.
- `/admin/settings` muestra configuración operativa sin secretos.
- No debe quedar texto de “siguiente fase” o módulo vacío en páginas admin.

## Despliegue web

- Dokploy despliega con Dockerfile propio.
- `https://ciclismo.devs-ueb.tech` responde HTTP 200.
- `APP_URL` usa HTTPS.
- `RUN_SEEDERS` está ausente o en `false` para no resembrar en cada deploy.
- Migraciones se ejecutan en deploy.
- No se exponen secretos de n8n, base de datos o APP_KEY.

## Android

- APK instala correctamente.
- Login funciona.
- Mapa carga en menos de 5 segundos en condiciones razonables.
- GPS funciona en dispositivo real.
- Offline funciona con ruta descargada.
- Cámara funciona para incidencias.
- La APK carga `https://ciclismo.devs-ueb.tech` desde `GUARANDA_GO_MOBILE_SERVER_URL` configurado en GitHub Actions.
