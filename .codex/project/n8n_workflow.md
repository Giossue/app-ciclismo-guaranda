{
  "nodes": [
    {
      "parameters": {
        "model": {
          "__rl": true,
          "value": "gpt-5.4",
          "mode": "list",
          "cachedResultName": "gpt-5.4"
        },
        "builtInTools": {},
        "options": {}
      },
      "type": "@n8n/n8n-nodes-langchain.lmChatOpenAi",
      "typeVersion": 1.3,
      "position": [
        2624,
        784
      ],
      "id": "17804771-61d6-48af-bb24-f78debcabb1e",
      "name": "ia",
      "credentials": {
        "openAiApi": {
          "id": "NwPBMhNp1pBtu5oM",
          "name": "OpenAI account"
        }
      }
    },
    {
      "parameters": {
        "toolDescription": "Consulta clima actual y pronóstico con Open-Meteo. Úsala para lluvia, temperatura, viento, clima de hoy, clima del fin de semana o si conviene salir en bicicleta. Si no hay ubicación del usuario, usa Guaranda como referencia.",
        "url": "={{ ($('Normalizar entrada').first().json.constants.OPEN_METEO_BASE_URL ?? 'https://api.open-meteo.com/v1/forecast') + '?latitude=' + ($('Normalizar entrada').first().json.location?.latitude ?? -1.5926) + '&longitude=' + ($('Normalizar entrada').first().json.location?.longitude ?? -79.0009) + '&current=temperature_2m,relative_humidity_2m,precipitation,weather_code,wind_speed_10m,wind_gusts_10m&hourly=temperature_2m,precipitation_probability,precipitation,weather_code,wind_speed_10m&daily=weather_code,temperature_2m_max,temperature_2m_min,precipitation_probability_max,wind_speed_10m_max&timezone=America%2FGuayaquil&forecast_days=3' }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Accept",
              "value": "application/json"
            }
          ]
        },
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequestTool",
      "typeVersion": 4.4,
      "position": [
        3056,
        960
      ],
      "id": "0ef6a096-0eeb-41f5-b14d-1866335ecc1b",
      "name": "clima"
    },
    {
      "parameters": {
        "toolDescription": "Calcula avance, distancia restante, distancia al inicio y distancia al final de una ruta. Úsala solo si hay ruta seleccionada y ubicación del usuario. Si falta ruta o ubicación, no la uses; pide activar ubicación o seleccionar una ruta.",
        "method": "POST",
        "url": "={{ $('Normalizar entrada').first().json.constants.API_BASE_URL + '/api/agent/navigation/progress' }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "={{ 'Bearer ' + $('Normalizar entrada').first().json.constants.AGENT_TOOL_TOKEN }}"
            },
            {
              "name": "Accept",
              "value": "application/json"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ route_id: $('Normalizar entrada').first().json.route_id, route_slug: $('Normalizar entrada').first().json.route?.slug, latitude: $('Normalizar entrada').first().json.location?.latitude, longitude: $('Normalizar entrada').first().json.location?.longitude }) }}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequestTool",
      "typeVersion": 4.4,
      "position": [
        2752,
        960
      ],
      "id": "6a689f18-95fe-4683-b077-6452b4469483",
      "name": "progreso_ruta"
    },
    {
      "parameters": {
        "toolDescription": "Tool única para todo lo relacionado con rutas y puntos de interés de Guaranda Go. Úsala para listar, recomendar, buscar por texto, filtrar por dificultad/categoría, ver detalle de la ruta seleccionada, revisar alertas/reportes activos y buscar puntos de interés (tiendas, comida, miradores, talleres, salud, hospedaje). Devuelve datos completos: métricas, recomendaciones, observaciones, valoraciones/opiniones aprobadas, POIs con sus propias observaciones y alertas.",
        "method": "POST",
        "url": "={{ $('Normalizar entrada').first().json.constants.API_BASE_URL + '/api/agent/routes' }}",
        "sendHeaders": true,
        "headerParameters": {
          "parameters": [
            {
              "name": "Authorization",
              "value": "={{ 'Bearer ' + $('Normalizar entrada').first().json.constants.AGENT_TOOL_TOKEN }}"
            },
            {
              "name": "Accept",
              "value": "application/json"
            },
            {
              "name": "Content-Type",
              "value": "application/json"
            }
          ]
        },
        "sendBody": true,
        "specifyBody": "json",
        "jsonBody": "={{ JSON.stringify({ intent: $fromAI('intent', 'Intención: list, recommend, search, detail, alerts o pois. Usa recommend para recomendaciones generales; detail si el usuario pregunta por la ruta seleccionada; alerts si pregunta por peligros/reportes; pois si busca lugares útiles (tiendas, comida, miradores, talleres, salud, hospedaje) con o sin ruta seleccionada.', 'string') || 'list', route_id: $('Normalizar entrada').first().json.route_id, route_slug: $('Normalizar entrada').first().json.route?.slug, location: { latitude: $('Normalizar entrada').first().json.location?.latitude, longitude: $('Normalizar entrada').first().json.location?.longitude }, max_results: $fromAI('max_results', 'Número máximo de resultados a devolver. Usa 5 si el usuario no pide otra cantidad.', 'number') || 5, difficulty: $fromAI('difficulty', 'Dificultad de ruta solicitada: fácil, media o difícil. Déjalo null si no aplica.', 'string'), category: $fromAI('category', 'Categoría o tipo de ruta solicitado. Déjalo null si no aplica.', 'string'), poi_category: $fromAI('poi_category', 'Categoría de punto de interés: tienda, comida, mirador, taller, salud u hospedaje. Solo aplica cuando intent es pois. Déjalo null si no aplica.', 'string'), query: $fromAI('query', 'Texto corto para buscar por nombre de ruta, lugar o necesidad concreta. No uses el mensaje completo del usuario. Déjalo null para recomendaciones generales.', 'string') }) }}",
        "options": {}
      },
      "type": "n8n-nodes-base.httpRequestTool",
      "typeVersion": 4.4,
      "position": [
        2912,
        784
      ],
      "id": "5f834e9d-d0d6-45ba-8d90-019dad0f8892",
      "name": "rutas"
    },
    {
      "parameters": {
        "sessionIdType": "customKey",
        "sessionKey": "={{ $('Normalizar entrada').first().json.session_id }}",
        "tableName": "conversaciones_ia",
        "contextWindowLength": 10
      },
      "type": "@n8n/n8n-nodes-langchain.memoryPostgresChat",
      "typeVersion": 1.4,
      "position": [
        2768,
        784
      ],
      "id": "d8e3a6c7-c904-415c-9f09-2e2db15f7626",
      "name": "memory",
      "credentials": {
        "postgres": {
          "id": "UDvt3YRrMEFDfvKE",
          "name": "Postgres account 3"
        }
      }
    },
    {
      "parameters": {
        "respondWith": "json",
        "responseBody": "={{ JSON.stringify({ reply: $json.reply, voice_text: $json.voice_text, cards: $json.cards, suggested_actions: $json.suggested_actions }) }}",
        "options": {}
      },
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1.5,
      "position": [
        3376,
        560
      ],
      "id": "c52b5a48-d8a9-4e6c-b83a-3d9e8f83d341",
      "name": "ia-respuesta"
    },
    {
      "parameters": {
        "jsCode": "let output = $json.output ?? $json.text ?? $json.response ?? $json.reply ?? $json;\n\nif (Array.isArray(output)) {\n  output = output[0] ?? {};\n}\n\nfunction extractFromLeakedToolCall(text) {\n  const marker = /to=functions\\.[a-zA-Z0-9_.]+/g;\n  const matches = [...text.matchAll(marker)];\n\n  if (matches.length === 0) {\n    return text;\n  }\n\n  const last = matches[matches.length - 1];\n  let tail = text.slice(last.index + last[0].length);\n  const lastBrace = tail.lastIndexOf('}');\n\n  if (lastBrace !== -1) {\n    tail = tail.slice(lastBrace + 1);\n  }\n\n  return tail;\n}\n\nlet reply = '';\n\nif (typeof output === 'string') {\n  let clean = extractFromLeakedToolCall(output).trim();\n  clean = clean.replace(/^```json\\s*/i, '').replace(/^```\\s*/i, '').replace(/```$/i, '').trim();\n\n  const jsonStart = clean.indexOf('{');\n  const jsonEnd = clean.lastIndexOf('}');\n\n  if (jsonStart !== -1 && jsonEnd !== -1 && jsonEnd > jsonStart) {\n    try {\n      const parsed = JSON.parse(clean.slice(jsonStart, jsonEnd + 1));\n      reply = parsed.reply ?? parsed.answer ?? parsed.message ?? parsed.respuesta ?? clean.slice(0, jsonStart).trim();\n    } catch (e) {\n      reply = clean;\n    }\n  } else {\n    reply = clean;\n  }\n\n  if (!reply) {\n    reply = 'No pude generar una respuesta clara. Intenta reformular tu pregunta.';\n  }\n} else if (output && typeof output === 'object') {\n  reply = output.reply ?? output.answer ?? output.message ?? output.respuesta ?? 'No pude generar una respuesta.';\n} else {\n  reply = 'No pude generar una respuesta.';\n}\n\nreturn [\n  {\n    json: {\n      reply,\n      voice_text: reply,\n      cards: [],\n      suggested_actions: []\n    }\n  }\n];\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        3152,
        560
      ],
      "id": "bee24fa4-ffff-4787-bf97-e31753cc1365",
      "name": "Normalizar respuesta"
    },
    {
      "parameters": {
        "promptType": "define",
        "text": "={{ `Mensaje del usuario:\n${$json.message}\n\nRuta seleccionada ID:\n${$json.route_id ?? 'Sin ruta'}\n\nRuta seleccionada:\n${$json.route ? JSON.stringify($json.route) : 'Sin ruta'}\n\nUbicación del usuario:\n${$json.location ? JSON.stringify($json.location) : 'No compartida'}` }}",
        "options": {
          "systemMessage": "=Eres el asistente cicloturístico de Guaranda Go, una app para ciclistas en Bolívar, Ecuador.\n\nResponde siempre en español, breve, claro y útil.\n\nPuedes ayudar con rutas disponibles, rutas cercanas, detalle de rutas, dificultad, distancia, duración, desnivel, recomendaciones, observaciones de seguridad, opiniones de otros ciclistas, puntos de interés, tiendas, comida, miradores, talleres, salud, hospedaje, reportes activos, progreso de ruta, preparación, qué llevar, clima, lluvia, temperatura, viento y si conviene salir a rodar.\n\nHerramientas disponibles:\n\n1. rutas\nTool única para todo lo relacionado con rutas y puntos de interés. Úsala para listar, buscar, recomendar, rutas cercanas, por dificultad/categoría, detalle de una ruta seleccionada, alertas/reportes activos, y también para buscar puntos de interés (tiendas, comida, miradores, talleres, salud, hospedaje) con o sin ruta seleccionada. Esta herramienta devuelve datos completos: métricas, recomendaciones, observaciones de seguridad, opiniones/valoraciones aprobadas de otros ciclistas, POIs con sus propias observaciones, y alertas.\n\nReglas para rutas:\n- Para recomendación general como \"qué ruta me recomiendas\", usa intent recommend, sin query.\n- Usa query solo si el usuario menciona un nombre de ruta, lugar o necesidad concreta.\n- Usa difficulty solo si pide fácil, media o difícil.\n- Usa category solo si pide una categoría o tipo de ruta.\n- Si hay route_id o route.slug y pregunta por \"esta ruta\", detalle o alertas, usa intent detail o alerts.\n- Si pregunta por lugares útiles (tiendas, agua, comida, descanso, miradores, talleres, salud u hospedaje), usa intent pois, con poi_category si aplica.\n- Si no hay ubicación, puedes recomendar rutas generales, pero no digas que son las más cercanas.\n- Si hay ubicación, úsala para cercanía.\n- Usa las observaciones de la ruta y de los POIs para advertir precauciones importantes.\n- Usa las opiniones/valoraciones aprobadas para dar contexto real de otros ciclistas, sin inventar comentarios.\n\n2. progreso_ruta\nÚsala solo cuando el usuario pregunte cuánto falta, cuánto queda, distancia al inicio/final o avance. Requiere ruta seleccionada y ubicación. Si falta ubicación o ruta, pide activarla/seleccionarla.\n\n3. clima\nÚsala para clima, lluvia, temperatura, viento, pronóstico, clima de hoy/fin de semana o si conviene salir en bicicleta. Si no hay ubicación exacta, usa Guaranda como referencia y dilo de forma natural.\n\nReglas:\n- No inventes rutas, POIs, distancias, tiempos, reportes, desniveles, opiniones ni clima.\n- Si necesitas datos reales, usa herramientas.\n- Si una herramienta no devuelve datos, dilo simple y ofrece alternativa.\n- No menciones Laravel, n8n, webhook, API, base de datos, tools, parser, moderación ni administración.\n- No digas \"comentarios aprobados\" ni \"revisión administrativa\".\n- No generes cards.\n- No escribas JSON ni bloques ```json.\n- Responde SOLO texto natural para el usuario.\n- Máximo 2 a 5 párrafos cortos.\n- Usa viñetas solo si ayudan.\n- Puedes usar emojis con moderación: 🚴, 📍, 🌤️, ⚠️.\n- No saludes de nuevo si el usuario ya hizo una pregunta concreta.\n"
        }
      },
      "type": "@n8n/n8n-nodes-langchain.agent",
      "typeVersion": 3.1,
      "position": [
        2784,
        560
      ],
      "id": "91db128a-b38d-4f5d-b170-4ffaddbc69bc",
      "name": "agente"
    },
    {
      "parameters": {
        "jsCode": "const input = $json;\nconst webhook = $('Webhook').first().json;\nconst body = webhook.body ?? webhook;\nconst emptyRoute = {\n  id: null,\n  name: null,\n  slug: null,\n  difficulty: null,\n  category: null,\n  description: null,\n  start: null,\n  end: null,\n  metric: {\n    distance_km: null,\n    estimated_time_minutes: null,\n    positive_elevation_m: null,\n    negative_elevation_m: null,\n    transport_mode: null\n  },\n  recommendations: null,\n  observations: null,\n  pois: null,\n  active_incidents: null\n};\nconst route = body.route ?? body.ruta ?? emptyRoute;\nconst location = body.location ?? body.ubicacion ?? {\n  latitude: null,\n  longitude: null,\n  accuracy_m: null,\n  recorded_at: null\n};\nconst sessionId = body.session_id ?? 'guaranda-go-anon';\n\nreturn [\n  {\n    json: {\n      session_id: sessionId,\n      message: body.message ?? body.mensaje ?? '',\n      route_id: body.route_id ?? route?.id ?? null,\n      route,\n      location,\n      constants: input.constants ?? {}\n    }\n  }\n];\n"
      },
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        2528,
        560
      ],
      "id": "90fce89d-93bd-42c6-8fe0-eea075edd5d4",
      "name": "Normalizar entrada"
    },
    {
      "parameters": {},
      "type": "n8n-nodes-globals.globalConstants",
      "typeVersion": 1,
      "position": [
        2288,
        560
      ],
      "id": "53c44e43-ce69-4f98-9059-8c0f2d7dc7bf",
      "name": "Global Constants",
      "credentials": {
        "globalConstantsApi": {
          "id": "r1NC7VXeVbDzMuP1",
          "name": "Global Constants account"
        }
      }
    },
    {
      "parameters": {
        "httpMethod": "POST",
        "path": "8870c87f-2f26-4ed9-b8c1-8fcbab7fafdb",
        "responseMode": "responseNode",
        "options": {}
      },
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 2.1,
      "position": [
        2064,
        560
      ],
      "id": "2944a835-e5e8-458a-a649-9f525be19698",
      "name": "Webhook",
      "webhookId": "8870c87f-2f26-4ed9-b8c1-8fcbab7fafdb"
    }
  ],
  "connections": {
    "ia": {
      "ai_languageModel": [
        [
          {
            "node": "agente",
            "type": "ai_languageModel",
            "index": 0
          }
        ]
      ]
    },
    "clima": {
      "ai_tool": [
        [
          {
            "node": "agente",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "progreso_ruta": {
      "ai_tool": [
        [
          {
            "node": "agente",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    },
    "memory": {
      "ai_memory": [
        [
          {
            "node": "agente",
            "type": "ai_memory",
            "index": 0
          }
        ]
      ]
    },
    "Normalizar respuesta": {
      "main": [
        [
          {
            "node": "ia-respuesta",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "agente": {
      "main": [
        [
          {
            "node": "Normalizar respuesta",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Normalizar entrada": {
      "main": [
        [
          {
            "node": "agente",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Global Constants": {
      "main": [
        [
          {
            "node": "Normalizar entrada",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook": {
      "main": [
        [
          {
            "node": "Global Constants",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "rutas": {
      "ai_tool": [
        [
          {
            "node": "agente",
            "type": "ai_tool",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "templateCredsSetupCompleted": true,
    "instanceId": "f02c9a6487886c5c2ff3d747f534b5bf05c6a4fa454f87bfd61589c3f7803863"
  }
}
