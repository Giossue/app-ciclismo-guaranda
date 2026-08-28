# Observabilidad

## Señales mínimas

- Salud de la aplicación y respuesta HTTP.
- Latencia y errores por endpoint.
- Estado/fallos de jobs y sincronización offline.
- Errores y timeout de OpenAI, elevación, mapas/rutas y almacenamiento.
- Fallos de autenticación/autorización y eventos administrativos auditables.
- Resultado de builds Android y de pruebas físicas pendientes.

## Reglas de logging

- No registrar secretos, contraseñas, tokens, payloads completos, fotos ni trazas GPS completas.
- Usar IDs estables de usuario/recurso/solicitud cuando sea necesario para diagnóstico, respetando mínimos datos.
- Mensajes de usuario: claros y sin stack traces. Diagnóstico técnico: solo logs protegidos.
- Las llamadas a OpenAI registran únicamente modelo, latencia y conteos de tokens;
  nunca el texto de la conversación, imágenes, ubicaciones, encabezados ni claves.
