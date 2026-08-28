# Dominio: usuarios y autenticación

## Roles

- Ciclista.
- Administrador.

No existen usuarios invitados.

## Reglas

- Todo requiere inicio de sesión.
- Registro con correo y contraseña.
- No login social.
- Email verification está habilitado por starter kit.
- 2FA, passkeys y password confirmation están habilitados por starter kit.
- Edad mínima: 10 años.
- Género y fecha de nacimiento obligatorios.
- El administrador puede gestionar usuarios, inhabilitar y resetear contraseñas.
- Las cuentas se deshabilitan; evitar eliminación física si hay trazabilidad.

## Datos relevantes

- Nombre, apellido, email.
- Género.
- Fecha de nacimiento.
- Estado activo/inactivo.
- Consentimientos.

## Autorización

- Usar roles y policies.
- Proteger acciones administrativas.
- Evitar IDOR: un ciclista solo accede a sus propios favoritos, recorridos, descargas y conversaciones.

## Entrada y navegación del ciclista

- Tras autenticarse, el ciclista entra en `/user/dashboard`, una superficie ligera de acciones rápidas.
- El explorador de mapa (`/user/maps`) mantiene su navegación propia y ofrece una salida explícita al dashboard.
- Las listas de rutas y favoritas se abren desde el explorador y vuelven a él mediante una acción de cierre; no muestran la navegación móvil global.
