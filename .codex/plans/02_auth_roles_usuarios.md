# Fase 02 — Autenticación, roles y usuarios

Estado: `Completado`

## Objetivo

Adaptar el starter de autenticación a las reglas de Guaranda Go: login obligatorio, roles ciclista/admin, perfil completo y deshabilitación de usuarios.

## Tareas

- Ajustar registro para requerir:
  - nombre,
  - apellido,
  - género,
  - fecha de nacimiento,
  - edad mínima de 10 años.
- Asignar rol ciclista por defecto al registrarse.
- Implementar middleware/policies para administrador.
- Adaptar perfil de usuario con campos nuevos.
- Asegurar que eliminación de cuenta sea deshabilitación/soft delete.
- Validar login obligatorio para todas las pantallas protegidas.

## Criterios de finalización

- Registro crea usuarios válidos con rol ciclista.
- Admin puede gestionar usuarios.
- Usuario deshabilitado no puede operar normalmente.
- Tests de auth y perfil pasan.
- Nuevos tests de roles/autorización pasan.

## Resultado

- Registro Fortify actualizado para exigir `name`, `last_name`, `gender_id`, `birth_date`, email y contraseña.
- Edad mínima de 10 años validada en registro y perfil.
- Registro asigna rol `ciclista` por defecto.
- Login Fortify personalizado para impedir acceso a usuarios inactivos o eliminados lógicamente.
- Middleware `EnsureUserIsActive` cierra sesión de usuarios deshabilitados que aún tengan sesión activa.
- Middleware `EnsureUserIsAdmin` protege rutas administrativas.
- `UserPolicy` controla gestión administrativa de usuarios y evita que un admin se deshabilite a sí mismo desde el panel.
- Perfil de usuario permite editar apellido, género y fecha de nacimiento.
- Eliminación de cuenta ahora marca `active=false` y aplica soft delete.
- Panel administrativo inicial de usuarios creado en `/admin/users` para listar, editar perfil/rol, deshabilitar/reactivar y enviar enlace de restablecimiento de contraseña.
- Se regeneró Wayfinder para nuevas rutas/controladores.
- No se ejecutaron migraciones, seeds ni cambios contra BD remota en esta fase.

## Validación ejecutada

```bash
composer --working-dir=ciclismo-guaranda exec -- php artisan test --compact --filter='RegistrationTest|AuthenticationTest|ProfileUpdateTest|AdminUserManagementTest'
ciclismo-guaranda/vendor/bin/pint --format agent
composer --working-dir=ciclismo-guaranda test
npm --prefix ciclismo-guaranda run types:check
npm --prefix ciclismo-guaranda run lint:check
npm --prefix ciclismo-guaranda run format:check
npm --prefix ciclismo-guaranda run build
```

Resultados:

- `composer test`: 52 tests, 293 assertions, aprobado.
- `npm run types:check`: aprobado.
- `npm run lint:check`: aprobado.
- `npm run format:check`: aprobado.
- `npm run build`: aprobado.
