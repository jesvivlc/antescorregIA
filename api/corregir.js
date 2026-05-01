import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic();

const CURSOS_VALIDOS = ['1ESO', '2ESO', '3ESO', '4ESO'];

// Prompt en caché: estable en todas las peticiones, se cachea automáticamente
const SYSTEM_PROMPT = `Eres un profesor/a corrector/a de tareas de alumnos de ESO en la Comunitat Valenciana. \
Tu misión es evaluar el trabajo del alumno según la rúbrica proporcionada y ofrecer un feedback \
constructivo, detallado y motivador, adaptado a su edad y nivel.

Directrices:
- Sé justo/a y riguroso/a: aplica la rúbrica con criterio
- Adapta el lenguaje al nivel: 1ESO y 2ESO (12-13 años), 3ESO y 4ESO (14-15 años)
- En el comentario, cita partes concretas del texto del alumno
- Las propuestas de mejora deben ser específicas, accionables y ordenadas por importancia
- El mensaje motivador debe ser auténtico, cálido y realista — evita frases vacías

Escala de calificaciones:
- Sobresaliente: 9.0 - 10
- Notable: 7.0 - 8.9
- Bien: 6.0 - 6.9
- Suficiente: 5.0 - 5.9
- Insuficiente: 0 - 4.9`;

const OUTPUT_SCHEMA = {
  type: 'object',
  properties: {
    nota: {
      type: 'number',
      description: 'Nota numérica entre 0 y 10, con un decimal de precisión',
    },
    nota_texto: {
      type: 'string',
      enum: ['Sobresaliente', 'Notable', 'Bien', 'Suficiente', 'Insuficiente'],
    },
    comentario: {
      type: 'string',
      description:
        'Análisis detallado del trabajo según cada criterio de la rúbrica. ' +
        'Menciona aciertos y puntos débiles con ejemplos concretos del texto.',
    },
    propuestas_mejora: {
      type: 'array',
      items: { type: 'string' },
      description: 'Exactamente 3 propuestas de mejora concretas y accionables',
    },
    mensaje_motivador: {
      type: 'string',
      description:
        'Mensaje breve (2-3 frases) dirigido directamente al alumno, ' +
        'cálido y adaptado a adolescentes de ESO.',
    },
  },
  required: ['nota', 'nota_texto', 'comentario', 'propuestas_mejora', 'mensaje_motivador'],
  additionalProperties: false,
};

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido. Usa POST.' });
  }

  const body = req.body ?? {};
  const { texto_tarea, nombre_alumno, curso, nombre_tarea, rubrica } = body;

  const camposFaltantes = ['texto_tarea', 'nombre_alumno', 'curso', 'nombre_tarea', 'rubrica']
    .filter((campo) => !body[campo] || String(body[campo]).trim() === '');

  if (camposFaltantes.length > 0) {
    return res.status(400).json({
      error: `Faltan campos obligatorios: ${camposFaltantes.join(', ')}`,
    });
  }

  if (!CURSOS_VALIDOS.includes(curso)) {
    return res.status(400).json({
      error: `El campo "curso" debe ser uno de: ${CURSOS_VALIDOS.join(', ')}`,
    });
  }

  try {
    const response = await client.messages.create({
      model: 'claude-sonnet-4-6',
      max_tokens: 1024,
      system: [
        {
          type: 'text',
          text: SYSTEM_PROMPT,
          cache_control: { type: 'ephemeral' },
        },
      ],
      output_config: {
        format: {
          type: 'json_schema',
          schema: OUTPUT_SCHEMA,
        },
      },
      messages: [
        {
          role: 'user',
          content:
            `Corrige la tarea de **${nombre_alumno}** (${curso}).\n\n` +
            `**Nombre de la tarea:** ${nombre_tarea}\n\n` +
            `**Rúbrica de corrección:**\n${rubrica}\n\n` +
            `**Texto del alumno:**\n${texto_tarea}`,
        },
      ],
    });

    if (response.stop_reason === 'refusal') {
      return res.status(422).json({
        error: 'El modelo no pudo procesar la corrección. Revisa el contenido enviado.',
      });
    }

    const textBlock = response.content.find((b) => b.type === 'text');
    if (!textBlock) {
      throw new Error('Respuesta inesperada del modelo: sin bloque de texto');
    }

    const resultado = JSON.parse(textBlock.text);
    return res.status(200).json(resultado);
  } catch (error) {
    console.error('[antescorregIA] Error:', error?.message ?? error);

    if (error instanceof Anthropic.AuthenticationError) {
      return res.status(500).json({ error: 'Error de autenticación con la API de Anthropic. Revisa ANTHROPIC_API_KEY.' });
    }
    if (error instanceof Anthropic.RateLimitError) {
      return res.status(429).json({ error: 'Límite de peticiones alcanzado. Inténtalo de nuevo en unos segundos.' });
    }
    if (error instanceof Anthropic.BadRequestError) {
      return res.status(400).json({ error: 'Petición inválida. Revisa los datos enviados.' });
    }

    return res.status(500).json({ error: 'Error interno al procesar la corrección.' });
  }
}
