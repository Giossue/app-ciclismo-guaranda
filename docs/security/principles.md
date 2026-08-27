# Principios de seguridad

- Los secretos, tokens de herramientas, webhooks y credenciales permanecen servidor-a-servidor y fuera de git, APK, bundle y logs.
- Cada frontera valida datos: HTTP, archivos, URL/integración, database y cola/offline.
- Fortify controla las primitivas de identidad; no crear hash, sesión o reset propios.
- Policies/Middleware autorizan cada recurso en servidor; una condición de UI nunca basta.
- Minimizar datos: ubicación y contexto compartido con IA son opcionales y transitorios cuando el flujo lo permite.
- Producción usa HTTPS, privilegio mínimo de BD y errores sanitizados para el usuario.
- No introducir una dependencia sin comprobar propósito, mantenimiento, licencia, compatibilidad y riesgo.
