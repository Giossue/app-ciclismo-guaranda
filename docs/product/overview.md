# Producto — Guaranda Go

## Propósito

Guaranda Go acompaña el cicloturismo de la provincia de Bolívar mediante una app híbrida Android: rutas oficiales, mapas, POIs, recorridos GPS, uso offline, incidencias y recomendaciones asistidas.

## Usuarios

- **Ciclista:** consulta y descarga rutas, registra recorridos, reporta incidencias, guarda favoritas, valora rutas completadas y usa el asistente online.
- **Administrador:** publica y mantiene rutas/POIs, revisa incidencias y sugerencias, gestiona usuarios, modera valoraciones y consulta estadísticas.

No hay usuarios invitados: toda funcionalidad requiere autenticación.

## Flujos centrales existentes

1. Explorar una ruta activa con mapa, POIs, alertas e información de seguridad.
2. Descargar datos de una ruta, recorrerla con GPS y sincronizar cuando haya conexión.
3. Reportar una incidencia con foto; un administrador la revisa antes de su visibilidad ciclista.
4. Valorar una ruta solamente tras un recorrido válido (al menos 90 %).
5. Consultar el asistente de n8n online con contexto mínimo y ubicación opcional/transitoria.

## Límites

La plataforma principal es Android 13+ distribuida como APK. No se priorizan iOS, navegación por voz, recálculo automático, login social, usuarios invitados ni chatbot offline. Los límites completos están en `.codex/project/scope_boundaries.md`.

## Estado

Las fases funcionales 01–11, 13 y 16 están completadas; Capacitor/validación final requieren prueba física en Android 13+. Consulta `.codex/progress/current_status.md` antes de planificar trabajo nuevo.
