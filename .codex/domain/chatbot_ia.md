# Dominio: Asistente cicloturístico

## Estado actual

El asistente es una frontera Laravel/OpenAI. No usa n8n ni endpoints de tools.
`Cyclist\ChatController` valida la consulta, construye el contexto público vivo,
llama a `OpenAiAssistant` y guarda el intercambio solo después de recibir una
respuesta válida.

```mermaid
flowchart LR
    A[Ciclista] --> B[Chat Inertia]
    B --> C[StoreChatMessageRequest]
    C --> D[LiveTourismContext]
    D --> E[OpenAI Responses]
    E --> F[Contrato JSON validado]
    F --> G[conversaciones_ia y mensajes_ia]
```

## Contexto y límites

- Solo incluye rutas con estado `Activa`, POIs con `active=true` e incidencias
  visibles `En revisión`.
- La ruta elegida lleva su detalle, recomendaciones, observaciones, POIs y
  alertas; además se incluyen resultados públicos acotados relevantes para la
  consulta.
- La ubicación opcional se usa durante la llamada y no se guarda en
  `conversaciones_ia` ni `mensajes_ia`.
- La conversación se limita a los últimos ocho mensajes, con texto truncado.
- El modelo no puede crear enlaces, tarjetas, IDs ni datos: responde `reply` y
  hasta tres `suggested_actions`. Laravel y la UI son dueños de cualquier
  navegación futura.
- El asistente diferencia una visita de día de una estadía turística cuando la
  respuesta depende de ello: visitante = paso por el día; turista = pernocta.
  Nunca se persiste como rol del usuario.

## Cuatro momentos para orientar

1. Cómo llegar y preparar el desplazamiento.
2. Dónde comer.
3. Qué hacer y visitar.
4. Dónde dormir.

Si el contexto no contiene un dato, el asistente debe decirlo y evitar
inventarlo. Alertas y seguridad tienen prioridad sobre una recomendación.

## Persistencia

`conversaciones_ia` conserva el propietario, título, contexto público sin
ubicación, inicio, última actividad y soft delete. `mensajes_ia` conserva el
rol, texto, proveedor `openai`, metadatos mínimos (`model`, sugerencias y
tarjetas de recursos ya verificadas por Laravel) y fecha. La creación/
actualización de conversación y ambos mensajes es atómica. OpenAI solo puede
proponer `{kind, id}` de una ruta o POI recibido en el contexto; Laravel vuelve
a consultar su estado actual antes de persistirlo o renderizarlo.

## Configuración

Laravel solo lee configuración mediante `config('guaranda.assistant.openai.*')`:

```dotenv
OPENAI_API_KEY=
GUARANDA_GO_OPENAI_MODEL=gpt-5.6-luna
GUARANDA_GO_OPENAI_REASONING_EFFORT=medium
GUARANDA_GO_OPENAI_TIMEOUT_SECONDS=20
GUARANDA_GO_OPENAI_CONNECT_TIMEOUT_SECONDS=3
GUARANDA_GO_OPENAI_MAX_OUTPUT_TOKENS=700
GUARANDA_GO_OPENAI_VISION_MODEL=gpt-5.6-luna
GUARANDA_GO_OPENAI_VISION_REASONING_EFFORT=none
GUARANDA_GO_OPENAI_VISION_MAX_IMAGE_BYTES=5242880
```

La clave se define como secreto en Dokploy. Si falta, el chat no envía
solicitudes y muestra un error seguro. El administrador puede elegir solo los
modelos `gpt-5.6-luna`, `gpt-5.6-terra` y `gpt-5.6-sol`, además de un esfuerzo
de razonamiento permitido; esa preferencia queda en
`configuracion_asistente_ia`, no contiene claves y se valida en servidor. Se
usa `store: false`; no se envían secretos, nombres, emails, roles ni cabeceras
al proveedor.

El valor inicial para visión es `gpt-5.6-luna`, con detalle bajo y esfuerzo
`none`, para minimizar coste en descripciones editoriales. El embedding usa
`text-embedding-3-large` con 3072 dimensiones, configurado exclusivamente en
el servidor cuando pgvector haya superado el preflight.

Para descripciones de imágenes editoriales administradas se usa
`GUARANDA_GO_OPENAI_VISION_MODEL`; sin `OPENAI_API_KEY` no se encola nada. El
job acepta solamente JPEG, PNG o WebP de hasta 5 MB desde el disco público
gestionado, usa `store: false`, detalle de visión bajo y un único intento.
Conserva una descripción humana ya presente y nunca procesa archivos de
incidencias de ciclistas.

## Evolución vectorial e imágenes

La Fase 17 usa `text-embedding-3-large` para una proyección reconstruible en
pgvector. `documentos_conocimiento_ia` guarda solo fragmentos públicos,
checksum, metadatos mínimos y embedding; no sustituye rutas, POIs ni alertas.
La sincronización se encola después de cambios confirmados y compara checksum
para evitar regeneraciones innecesarias. Plan: `17_agente_laravel_openai.md`.

`KnowledgeDocumentBuilder` es la preparación de contenido: recorre rutas
activas, POIs activos y alertas visibles y genera fragmentos deterministas con
checksum, idioma, sección y metadatos mínimos. Solo incorpora la descripción
editorial de imágenes, nunca sus archivos, IDs de usuarios ni coordenadas de
incidencias. Incluye las fichas públicas de comida, hospedaje, tiendas,
talleres y salud para cubrir los cuatro momentos del visitante. Cuando pgvector
esté listo, un job podrá persistir estos mismos fragmentos como proyección
idempotente.

Antes de que exista retrieval vectorial, `LiveTourismContext` ya entrega al
chat datos vivos de POIs activos: horarios y fichas públicas de comida,
hospedaje, tiendas, talleres y salud. Así los cuatro momentos turísticos no
dependen de una copia vectorial ni de información obsoleta.

El preflight no destructivo `php artisan ai:vector-preflight` consulta la base
actual y falla de forma segura si `vector` no está disponible o no carga en
runtime. No se autoriza una migración de embeddings hasta que el preflight sea
correcto en la base elegida.

`php artisan ai:knowledge:preview --limit=20` muestra por consola los
fragmentos públicos candidatos. Es una inspección de solo lectura: no consulta
OpenAI, no inserta filas y no requiere pgvector. La operación posterior es
`php artisan ai:knowledge:sync`: por defecto usa la cola; `--now` se reserva
para una ejecución administrativa explícita. La recuperación semántica entrega
solo IDs candidatos; Laravel reconsulta y filtra los recursos actuales antes de
construir el contexto del chat.
