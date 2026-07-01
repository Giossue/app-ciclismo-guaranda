# Orden sugerido de implementación

Aunque el alcance funcional sea amplio, conviene construir por hitos verificables.

## 1. Base Laravel/React

- Revisar starter kit.
- Configurar PostgreSQL/PostGIS.
- Confirmar auth, roles y seeders.
- Definir catálogos iniciales.

## 2. Usuarios y administración

- Roles ciclista/admin.
- Gestión de usuarios.
- Inhabilitación.
- Auditoría básica.

## 3. Rutas

- Modelos/migraciones de rutas.
- Categorías, dificultad, estados.
- Geometría GeoJSON/PostGIS.
- Imágenes.
- Listado y detalle.

## 4. Mapas y POIs

- Mapa con Leaflet.
- Visualización de ruta.
- POIs por ruta/cercanía.
- Horarios e imágenes.
- Sugerencias/reportes de POIs.

## 5. Offline

- SQLite local.
- Descarga de ruta/datos.
- Gestión de versiones.
- Cola local de sincronización.
- Validación de almacenamiento.

## 6. GPS y recorridos

- Iniciar/pausar/reanudar/finalizar.
- Puntos cada 60 segundos.
- Métricas.
- Recorrido válido 90%.
- Pantalla bloqueada si plugin nativo lo permite.

## 7. Incidencias

- Crear online/offline.
- Adjuntar foto.
- Revisión admin.
- Mostrar solo validadas.
- Notificaciones.

## 8. Favoritos, valoraciones y comentarios

- Favoritos.
- Valoraciones solo con recorrido válido.
- Moderación.
- Respuesta admin.

## 9. n8n chatbot

- Proxy/backend o consumo seguro del webhook.
- Mostrar JSON `Respond to Webhook`.
- Manejo de errores/timeouts.
- Historial con eliminación lógica.

## 10. Capacitor Android

- Instalar/configurar Capacitor.
- Plugins nativos.
- Build APK.
- Pruebas en dispositivo real.

## 11. Estadísticas/exportaciones

- Rutas consultadas/descargadas.
- Mejor calificadas.
- Incidencias por estado.
- Usuarios activos.
- Recorridos completados.
