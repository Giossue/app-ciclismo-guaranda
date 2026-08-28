# Autenticación y autorización

Fortify es dueño de login, registro, contraseñas, verificación de correo, 2FA, passkeys y confirmación de contraseña. No reimplementar primitivas de identidad.

- El registro público asigna siempre rol `ciclista`.
- Administración y cambios de rol requieren middleware/policy de administrador.
- Un usuario inactivo no puede iniciar sesión y una sesión existente se invalida por middleware.
- Toda mutación y consulta de registros privados se autoriza en el servidor.
- En móvil, el shell Capacitor carga la aplicación HTTPS; no guarda secretos de autenticación ni token de herramientas.

Para cambios de auth, cargar `.agents/skills/fortify-development/SKILL.md`, `.codex/domain/users_auth.md` y `config/fortify.php`.
