# antescorregIA

API REST para corrección automática de tareas de ESO mediante IA (Anthropic Claude).

## Endpoint

`POST /api/corregir`

### Cuerpo de la petición (JSON)

```json
{
  "texto_tarea": "Texto completo de la tarea del alumno...",
  "nombre_alumno": "María García",
  "curso": "3ESO",
  "nombre_tarea": "Comentario de texto tema 3",
  "rubrica": "- Comprensión del texto (3 pts): ...\n- Expresión escrita (3 pts): ..."
}
```

**Valores válidos para `curso`:** `1ESO`, `2ESO`, `3ESO`, `4ESO`

### Respuesta (JSON)

```json
{
  "nota": 7.5,
  "nota_texto": "Notable",
  "comentario": "Análisis detallado según la rúbrica...",
  "propuestas_mejora": [
    "Desarrolla más las ideas principales...",
    "Revisa la ortografía y puntuación...",
    "Incluye ejemplos del texto para argumentar..."
  ],
  "mensaje_motivador": "¡Buen trabajo, María! Se nota el esfuerzo..."
}
```

---

## Despliegue en Vercel

### Requisitos previos

- Cuenta en [Vercel](https://vercel.com) (el plan gratuito es suficiente)
- [Vercel CLI](https://vercel.com/docs/cli) instalado: `npm i -g vercel`
- API Key de Anthropic: [console.anthropic.com](https://console.anthropic.com)

### Pasos

**1. Instalar dependencias**

```bash
cd antescorregIA
npm install
```

**2. Iniciar sesión en Vercel**

```bash
vercel login
```

**3. Desplegar (primera vez)**

```bash
vercel
```

Acepta las opciones por defecto. Vercel detectará automáticamente el proyecto.

**4. Configurar la variable de entorno**

En el panel de Vercel ([vercel.com/dashboard](https://vercel.com/dashboard)):

1. Selecciona tu proyecto `antescorregIA`
2. Ve a **Settings → Environment Variables**
3. Añade:
   - **Name:** `ANTHROPIC_API_KEY`
   - **Value:** tu API key de Anthropic
   - **Environments:** Production, Preview, Development

O desde la CLI:

```bash
vercel env add ANTHROPIC_API_KEY
```

**5. Redesplegar para aplicar la variable**

```bash
vercel --prod
```

Tu endpoint quedará disponible en:
`https://antescorregIA.vercel.app/api/corregir`

### Desarrollo local

```bash
# Crea el archivo .env con tu API key
cp .env.example .env
# Edita .env y pon tu clave real

# Inicia el servidor de desarrollo de Vercel
vercel dev
```

El endpoint local será: `http://localhost:3000/api/corregir`

---

## Conectar desde Power Automate

### Configuración del flujo

En Power Automate, añade la acción **HTTP** (requiere licencia Premium o conector HTTP estándar).

**Configuración de la acción HTTP:**

| Campo | Valor |
|-------|-------|
| Método | `POST` |
| URI | `https://tu-proyecto.vercel.app/api/corregir` |
| Encabezados | `Content-Type: application/json` |
| Cuerpo | Ver abajo |

**Cuerpo de la petición:**

```json
{
  "texto_tarea": "@{triggerBody()?['texto_tarea']}",
  "nombre_alumno": "@{triggerBody()?['nombre_alumno']}",
  "curso": "@{triggerBody()?['curso']}",
  "nombre_tarea": "@{triggerBody()?['nombre_tarea']}",
  "rubrica": "@{triggerBody()?['rubrica']}"
}
```

Adapta las expresiones según de dónde vengan los datos (formulario, Excel, SharePoint, etc.).

### Leer la respuesta en Power Automate

Después de la acción HTTP, usa **Analizar JSON** con este esquema:

```json
{
  "type": "object",
  "properties": {
    "nota": { "type": "number" },
    "nota_texto": { "type": "string" },
    "comentario": { "type": "string" },
    "propuestas_mejora": {
      "type": "array",
      "items": { "type": "string" }
    },
    "mensaje_motivador": { "type": "string" }
  }
}
```

Luego puedes usar los valores directamente: `body('Analizar_JSON')?['nota']`, etc.

### Ejemplo de flujo completo

1. **Trigger:** Al recibir una respuesta HTTP / Al rellenar un formulario de Microsoft Forms
2. **HTTP:** POST a `/api/corregir` con los datos del alumno
3. **Analizar JSON:** Parsear la respuesta
4. **Enviar correo / Guardar en Excel / Rellenar Word:** Usar los campos de la corrección

---

## Notas técnicas

- **Modelo usado:** `claude-sonnet-4-6` (Anthropic)
- **Prompt caching:** el prompt del sistema se cachea automáticamente para reducir costes en peticiones repetidas
- **Timeout:** configurado a 60 segundos en Vercel (suficiente para la mayoría de correcciones)
- **CORS:** habilitado para permitir peticiones desde cualquier origen
