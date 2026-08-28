# Seguridad, privacidad y datos sensibles

Guaranda Go maneja datos personales, ubicación GPS, historial de recorridos, incidencias y conversaciones con un agente externo de n8n.

## Reglas obligatorias

- Usar HTTPS en producción.
- Guardar contraseñas solo con hash seguro.
- Nunca exponer API keys, webhooks, tokens ni secretos en el APK o frontend.
- Proteger APIs con autenticación y autorización por rol.
- Validar todos los inputs del usuario.
- Validar archivos subidos: tipo, tamaño, extensión y contenido.
- Tamaño máximo de imagen de incidencia: 5 MB.
- Usar rate limiting en endpoints sensibles.
- Aplicar eliminación lógica cuando se necesite trazabilidad.

## Datos sensibles

Datos que requieren cuidado especial:

- Nombre, apellido, email.
- Fecha de nacimiento y género.
- Ubicación GPS y puntos de recorrido.
- Incidencias reportadas.
- Fotografías de incidencias.
- Conversaciones con IA/n8n.

## Ubicación GPS

- Solicitar consentimiento explícito para registrar ubicación.
- Explicar para qué se usa la ubicación.
- El usuario debe saber cuándo el recorrido está activo.
- Si hay seguimiento con pantalla bloqueada, Android debe mostrar notificación persistente.

## IA externa / n8n

- El agente vive fuera del sistema, en n8n.
- El sistema solo consume el webhook y muestra/procesa el JSON de `Respond to Webhook`.
- No enviar datos innecesarios al webhook.
- No guardar claves IA en frontend ni APK.

## Institución responsable

La aprobación de términos, privacidad y uso de datos corresponde a la Universidad Estatal de Bolívar.
