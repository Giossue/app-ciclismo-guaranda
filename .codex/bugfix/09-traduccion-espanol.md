# 09. Traducción del sistema a español

## Objetivo

Eliminar textos visibles en inglés del flujo de autenticación, ajustes de cuenta, seguridad, claves de acceso, 2FA y mensajes flash del backend.

## Cambios

- Login, recuperación, confirmación, restablecimiento y verificación de correo traducidos al español.
- Componentes de claves de acceso, autenticación en dos pasos y códigos de recuperación traducidos.
- Ajustes de perfil/seguridad/apariencia y menú de usuario traducidos.
- Mensajes flash de controladores Laravel traducidos.
- Locale por defecto de Laravel cambiado a `es` con fallback `es` y faker `es_EC`.
- Archivos `lang/es` agregados para mensajes básicos de auth, passwords y validación.

## Notas

- Se mantienen sin traducir nombres técnicos o marcas: n8n, TOTP, POI, GPS, HTTPS, APP_KEY, GeoJSON, PostGIS, Leaflet, OSM/Nominatim.
- Si producción define `APP_LOCALE=en`, debe cambiarse a `APP_LOCALE=es` para que validaciones y fechas relativas salgan en español.
