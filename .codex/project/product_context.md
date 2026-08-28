# Contexto de producto — Guaranda Go

Guaranda Go es una app híbrida Android para cicloturismo en la Provincia de Bolívar, Ecuador. Está enfocada inicialmente en ciclistas locales y puede expandirse luego a más provincias.

## Objetivo

Permitir que ciclistas registrados consulten rutas oficiales, descarguen mapas/rutas para uso offline, registren recorridos GPS, reporten incidencias, consulten POIs, guarden favoritos, valoren rutas completadas y usen un agente externo de n8n para recomendaciones.

## Plataforma

- Principal: Android 13+.
- Distribución inicial: APK.
- No se prioriza iOS.
- No es app nativa Kotlin; es híbrida con Capacitor.

## Usuarios

- Ciclista.
- Administrador.
- No hay usuarios invitados.

## Primer escenario operativo

- Provincia de Bolívar.
- Aproximadamente 10 usuarios iniciales.
- 1 ruta inicial.
- Alrededor de 5 POIs iniciales.
- Aproximadamente 3 usuarios usando GPS simultáneamente.

## Funciones centrales

- Login obligatorio.
- Rutas oficiales administradas.
- Mapa interactivo.
- Mapa offline de Ecuador y datos descargables.
- Seguimiento GPS cada 60 segundos.
- Recorrido válido al completar aproximadamente 90% de la ruta.
- Incidencias con revisión administrativa antes de hacerse públicas.
- Chatbot externo por webhook n8n.

## Agente cicloturístico n8n

- El asistente vive en n8n y consulta datos reales mediante tools HTTP protegidas de Laravel.
- No usa embeddings ni vector store para rutas/POIs/reportes.
- Laravel envía al webhook contexto mínimo: usuario, ruta seleccionada, mensaje y ubicación transitoria si el ciclista la activó.
- Sin ubicación, el asistente funciona en modo limitado: puede recomendar rutas generales, clima referencial de Guaranda, detalle de ruta, POIs y alertas; no debe afirmar cercanía.
- Con ubicación, el asistente puede recomendar por cercanía, calcular progreso/distancias y usar clima de la posición del usuario.
