# Fase 17 — Agente nativo Laravel/OpenAI

Estado: En progreso — Etapas 1 a 3 activas en producción; falta desplegar la
actualización visual final de la Etapa 2 y completar la observabilidad de la
Etapa 5.

## Decisión y objetivo

Guaranda Go retira n8n del flujo de su asistente. Laravel será el único
orquestador: conserva la autorización, consulta datos actuales, llama a OpenAI
desde el servidor y persiste el historial visible. PostgreSQL seguirá siendo la
fuente de verdad; el índice vectorial será una proyección reconstruible, nunca
un registro maestro.

AI Elements ya está instalado como código fuente de interfaz. Se usará para la
conversación, Markdown, sugerencias, fuentes y tarjetas, pero no impone Next.js,
Vercel AI Gateway ni un proveedor de modelos.

## Reglas de producto

- El asistente diferencia contexto de viaje, no crea un rol permanente nuevo:
  residente/ciclista local, visitante de un día y turista con al menos una noche.
- Debe poder responder y presentar tarjetas verificadas para cuatro momentos:
  cómo llegar, dónde comer, qué hacer y dónde dormir.
- Solo recomienda rutas activas, POIs activos y alertas visibles en el instante
  de responder. Una coincidencia vectorial no autoriza mostrar datos obsoletos.
- Las tarjetas e imágenes salen de registros internos hidratados por Laravel;
  el modelo nunca genera URLs ni permisos.
- Las imágenes editoriales de rutas y POIs pueden recibir descripción IA
  propuesta. El administrador la revisa/edita. No se envían automáticamente
  fotos de incidencias de ciclistas por privacidad.

## Etapa 0 — Estabilización e infraestructura

- Mantener `database-centraldb` en su imagen actual hasta inventariar sus bases
  y programar mantenimiento; no habilitar pgvector directamente hoy.
- Conservar el respaldo físico creado antes de cualquier reparación.
- Decidir una de dos rutas: reparar el PostgreSQL central durante mantenimiento
  planificado, o crear una instancia vectorial aislada para la proyección IA.
- Configurar un worker Laravel antes de poner trabajos IA en cola. Redis ya está
  disponible para caché; no cambiar la cola a Redis sin ese worker.

**Criterio de salida:** extensión `vector` disponible en la base elegida,
respaldo verificable, health check y rollback documentados.

**Avance 2026-08-28:** la imagen central fue reemplazada de forma controlada
por una imagen PostgreSQL 18 compatible con PostGIS 3.6.4 y pgvector 0.8.6,
conservando los volúmenes existentes. `PostGIS_Full_Version()` y
`ai:vector-preflight` confirmaron ambos runtimes. La extensión `vector` quedó
instalada explícitamente en `guaranda_go_db`; la migración de aplicación se
aplicó por el deploy y la primera sincronización generó 14 embeddings.

### Preflight sin mutaciones

Antes de proponer una migración vectorial se ejecuta dentro del contenedor de
Laravel conectado a la base candidata:

```bash
php artisan ai:vector-preflight
```

El comando solo consulta catálogos de PostgreSQL y pruebas de carga de runtime:
no ejecuta `CREATE EXTENSION`, migraciones, `INSERT`, `UPDATE` ni `DELETE`.
Debe mostrar `Runtime pgvector = ok`. Si PostGIS está instalado también debe
mostrar `Runtime PostGIS = ok`; cualquier `error` obliga a detenerse y reparar
la imagen/instancia elegida antes de tocar schema. Para una conexión Laravel no
predeterminada se usa `--connection=nombre`.

Para revisar el contenido candidato sin tocar la base, se usa:

```bash
php artisan ai:knowledge:preview --limit=20
```

El comando solo muestra fragmentos públicos que se indexarían; no llama a
OpenAI ni inserta documentos/embeddings.

## Etapa 1 — Contrato nativo y chat confiable

- Crear `OpenAiAssistant` como frontera OpenAI con HTTP de Laravel; la clave
  solo vive en entorno y el administrador elige, de una lista cerrada, el
  modelo GPT-5.6 y esfuerzo de razonamiento.
- Reemplazar en `ChatController` el webhook n8n por una Action/Service.
- Mantener `conversaciones_ia` y `mensajes_ia`; guardar proveedor/modelo,
  contexto de viaje y referencias de recursos como metadatos seguros.
- Estructurar la salida: texto, acciones sugeridas y referencias internas de
  rutas/POIs/alertas. Validar el esquema antes de persistir o renderizar.
- El primer retrieval será determinista contra datos vivos de Laravel, de modo
  que el chat puede funcionar antes del índice vectorial.
- El contexto vivo incluye horarios y fichas públicas de comida, hospedaje,
  tiendas, talleres y salud para los cuatro momentos turísticos, sin depender
  de embeddings.

**Aceptación:** usuario activo recibe respuesta o error seguro; no hay llamada
a n8n, no se exponen secretos y las referencias inactivas se excluyen.

**Avance 2026-08-28:** implementado localmente con Responses API, JSON Schema,
datos vivos, contexto de viaje, rehidratación de referencias y persistencia
transaccional. El administrador puede elegir Luna, Terra o Sol y su esfuerzo;
falta configurar solo el secreto `OPENAI_API_KEY` en Dokploy y desplegar.

### Configuración de despliegue inicial

En Dokploy se agregan como secretos de la aplicación, nunca en el repositorio:

```dotenv
OPENAI_API_KEY=clave-servidor
GUARANDA_GO_OPENAI_MODEL=gpt-5.6-luna
GUARANDA_GO_OPENAI_REASONING_EFFORT=medium
# Visión editorial económica para fotos nuevas de rutas/POIs.
GUARANDA_GO_OPENAI_VISION_MODEL=gpt-5.6-luna
GUARANDA_GO_OPENAI_VISION_REASONING_EFFORT=none
```

El valor inicial del chat y de visión es `gpt-5.6-luna`. En Administración se
puede cambiar el chat entre `gpt-5.6-luna`, `gpt-5.6-terra` y `gpt-5.6-sol`, y
elegir su esfuerzo permitido. La clave no sale del entorno y nunca se muestra
en esa pantalla. Luna usa visión con detalle bajo y esfuerzo `none` para las
descripciones editoriales; no procesa fotos de incidencias. No configurar aún
un modelo de embeddings ni crear una migración vectorial: esa variable entra en
la Etapa 3 únicamente después de un preflight correcto. Tras el deploy se
comprueba `/up`, el estado sin secretos en `/settings`, una consulta de chat y,
si se activó visión, el worker de cola. La clave no se pega en terminal, logs,
frontend ni APK.

## Etapa 2 — UI de conversación

- Adaptar la pantalla existente a AI Elements ya versionado: `Conversation`,
  `Message`, `PromptInput`, `Suggestion`, `Sources` y tarjetas propias de
  ruta/POI. No importar el ejemplo completo ni un selector de modelos al usuario.
- Conservar navegación, historial, ubicación transitoria, offline y TTS local.
- Añadir el selector contextual “voy por el día / me quedaré una noche” solo
  cuando aporte a la recomendación; nunca exigirlo para usar el chat.

**Aceptación:** interfaz móvil accesible, respuestas Markdown seguras, tarjetas
internas navegables y sin dependencia visual de n8n.

**Avance 2026-08-28:** `Conversation`, `Message`, `MessageResponse`,
`PromptInput`, sugerencias, fuentes desplegables y tarjetas verificadas están
integrados. La superficie principal ya no usa el layout heredado: conserva el
scroll al último mensaje, muestra una bienvenida con preguntas iniciales y deja
la ruta, el tipo de visita y la ubicación en “Personalizar”. Una ruta abre su
detalle mediante Wayfinder; un POI se presenta como ficha hasta implementar
detalle público. Las tarjetas pueden incluir la foto editorial pública
rehidratada y su descripción almacenada como texto alternativo; el modelo no
aporta imágenes ni URLs.

**Ajuste 2026-08-28:** las sugerencias de seguimiento son efímeras y se envían
al tocarlas; no se conservan como chips dentro de mensajes históricos. El
prompt exige que sean pertinentes al intercambio y puede responder con una
lista vacía.

## Etapa 3 — Base de conocimiento vectorial

- `KnowledgeDocumentBuilder` ya construye en memoria documentos deterministas
  de rutas activas, POIs activos y alertas visibles. Incluye texto editorial de
  imágenes de rutas/POIs y fichas públicas de comida, hospedaje, tiendas,
  talleres y salud, con checksum y metadatos mínimos; excluye usuario,
  coordenadas de incidencias, borradores, POIs inactivos y alertas no visibles.
  Aún no escribe ni genera embeddings.
- Crear por migración la tabla de fragmentos de conocimiento (fuente, sección,
  contenido, checksum, metadata JSONB, idioma, modelo y embedding).
- Usar `text-embedding-3-large`; con 3072 dimensiones, usar `halfvec(3072)` e
  índice HNSW de coseno cuando pgvector esté disponible.
- Encolar sincronización idempotente tras cambios confirmados de ruta, POI,
  incidencia visible, categoría y contenido editorial. El job comprueba checksum
  y no duplica embeddings.
- En cada respuesta: buscar candidatos semánticos, hidratar de nuevo modelos
  vivos y filtrar autorización/estado antes de construir contexto.

**Avance 2026-08-28:** la migración pendiente crea
`documentos_conocimiento_ia` con claves deterministas, metadatos, checksum,
`halfvec(3072)` e HNSW de coseno solo en PostgreSQL. La suite SQLite conserva
una columna compatible de prueba. `ai:knowledge:sync` encola la proyección y
`--now` la procesa de forma explícita; solo embebe cambios o modelos distintos,
elimina fragmentos ya no públicos y no almacena datos personales. El chat usa
el índice solo para candidatos y vuelve a hidratar rutas, POIs y alertas vivas
antes de enviarlas a OpenAI. Rutas, POIs, alertas revisadas, catálogos e
imágenes editoriales solicitan una resincronización tras confirmar cambios.

**Aceptación:** una reindexación completa y reindexación por cambio son
reintentables; no hay respuestas que dependan exclusivamente de documentos
desactualizados.

**Avance remoto 2026-08-28:** `ai:knowledge:sync` se encoló correctamente y
la comprobación posterior confirmó `documentos=14` y `con_embedding=14`.

## Etapa 4 — Descripciones de imágenes

- Crear tabla polimórfica de descripciones IA, con checksum del archivo, estado,
  texto alternativo, descripción, etiquetas, modelo y fecha de generación.
- Job de visión OpenAI para portadas/galerías administradas; limitar archivo,
  reintentos y costo. La descripción se invalida al cambiar la imagen.
- Administrador puede aprobar, modificar o regenerar; texto aprobado alimenta
  la proyección vectorial.

**Aceptación:** ninguna imagen privada de incidencia se procesa por defecto;
las descripciones aprobadas aparecen como alt text y contexto del agente.

**Avance 2026-08-28:** se implementó el job de un solo intento para fotos
nuevas subidas por administración en rutas y POIs. Respeta descripciones
manuales, limita formato/tamaño y usa Responses con `store: false`; no procesa
imágenes de incidencias. El worker `database` queda supervisado dentro del
contenedor. El valor de visión por defecto es Luna; únicamente hace falta
`OPENAI_API_KEY` para que nuevas imágenes editoriales se encolen y describan.

## Etapa 5 — Calidad, transición y retiro de n8n

- Añadir pruebas Pest de autorización, errores OpenAI, contrato estructurado,
  datos inactivos, jobs idempotentes y privacidad de imágenes.
- Medir latencia, coste, cobertura de retrieval y fallos; cachear solo datos
  públicos/reutilizables, nunca contexto personal de otro usuario.
- Eliminar configuración, settings y workflow de n8n solo cuando el flujo nativo
  esté desplegado y probado. No eliminar el servicio n8n compartido del VPS.
- Actualizar documentación, `.env.example` y runbook de despliegue.

## No hacer

- No guardar API keys, embeddings o imágenes en el frontend/APK.
- No tratar el vector store como fuente de verdad ni indexar secretos/PII.
- No habilitar colas Redis sin worker, ni modificar la BD central sin ventana de
  mantenimiento y verificación de impacto.
