# Contexto de producto — Guaranda Go

Guaranda Go es una app híbrida Android para cicloturismo en la Provincia de Bolívar, Ecuador. Está enfocada inicialmente en ciclistas locales y puede expandirse luego a más provincias.

## Objetivo

Permitir que ciclistas registrados consulten rutas oficiales, descarguen mapas/rutas para uso offline, registren recorridos GPS, reporten incidencias, consulten POIs, guarden favoritos, valoren rutas completadas y usen un asistente Laravel/OpenAI para recomendaciones.

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
- Asistente online Laravel/OpenAI.

## Asistente cicloturístico

- Laravel recupera rutas activas, POIs activos y alertas visibles directamente desde la BD y los entrega como contexto acotado a OpenAI.
- La etapa actual aún no usa embeddings/vector store; pgvector queda planificado después de reparar la infraestructura PostgreSQL/PostGIS.
- La ubicación es opcional, se transmite solo durante la consulta y no se persiste en conversaciones ni mensajes.
- Un visitante suele estar de paso durante el día; un turista suele pernoctar. El asistente pregunta esa preferencia cuando cambia la recomendación.
