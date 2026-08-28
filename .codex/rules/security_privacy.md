# Seguridad, privacidad y datos sensibles

Guaranda Go maneja datos personales, ubicación GPS, historial de recorridos, incidencias y conversaciones con un asistente que Laravel consulta en OpenAI.

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
- Conversaciones con IA.

## Ubicación GPS

- Solicitar consentimiento explícito para registrar ubicación.
- Explicar para qué se usa la ubicación.
- El usuario debe saber cuándo el recorrido está activo.
- Si hay seguimiento con pantalla bloqueada, Android debe mostrar notificación persistente.

## IA externa / OpenAI

- Laravel consulta OpenAI desde servidor con `store: false` y un contrato JSON estricto.
- No enviar nombre, email, rol, tokens, secretos, URL privadas ni ubicación persistente.
- La ubicación solo se usa durante la respuesta solicitada; nunca se guarda en el historial.
- No guardar claves IA en frontend ni APK.

## Institución responsable

La aprobación de términos, privacidad y uso de datos corresponde a la Universidad Estatal de Bolívar.
