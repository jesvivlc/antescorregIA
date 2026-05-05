# Configuración de Supabase para antescorregIA - Cuaderno Docente

## 📋 Paso 1: Obtener credenciales de Supabase

1. Ve a [console.supabase.com](https://console.supabase.com)
2. Selecciona tu proyecto
3. En el menú lateral, ve a **Settings → API**
4. Copia:
   - **Project URL** → copiar como `SUPABASE_URL`
   - **anon public** → copiar como `SUPABASE_ANON_KEY`

## 🔧 Paso 2: Configurar credenciales en `index.html`

Abre `antescorregIA-app/index.html` y busca esta sección (aproximadamente línea 500):

```javascript
/* ────────────────────────────────────────────
   SUPABASE - VARIABLES DE ENTORNO
──────────────────────────────────────────── */
const SUPABASE_URL = 'YOUR_SUPABASE_URL';
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY';
```

Reemplaza con tus credenciales reales:

```javascript
const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...';
```

## 📊 Esquema Supabase requerido

El cuaderno espera estas tablas (sin Row Level Security):

### `grupos`
```sql
CREATE TABLE grupos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  nombre TEXT NOT NULL,
  nivel TEXT,
  anio_academico TEXT,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `alumnos`
```sql
CREATE TABLE alumnos (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  nombre TEXT NOT NULL,
  apellidos TEXT,
  email TEXT,
  activo BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `tareas`
```sql
CREATE TABLE tareas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  grupo_id BIGINT NOT NULL REFERENCES grupos(id) ON DELETE CASCADE,
  titulo TEXT NOT NULL,
  descripcion TEXT,
  evaluacion TEXT,
  fecha_entrega DATE,
  peso_nota NUMERIC DEFAULT 1,
  created_at TIMESTAMP DEFAULT NOW()
);
```

### `notas`
```sql
CREATE TABLE notas (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  alumno_id BIGINT NOT NULL REFERENCES alumnos(id) ON DELETE CASCADE,
  tarea_id BIGINT NOT NULL REFERENCES tareas(id) ON DELETE CASCADE,
  nota NUMERIC(3, 1),
  faltas INTEGER DEFAULT 0,
  comentario_ia TEXT,
  mejoras_ia TEXT[],
  mensaje_motivador TEXT,
  comentario_profesor TEXT,
  origen TEXT DEFAULT 'manual',
  corregido_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT NOW(),
  UNIQUE(alumno_id, tarea_id)
);
```

### Vistas requeridas

#### `v_resumen_grupo`
```sql
CREATE VIEW v_resumen_grupo AS
SELECT 
  g.id,
  g.nombre,
  g.nivel,
  g.anio_academico,
  COUNT(a.id) as cantidad_alumnos
FROM grupos g
LEFT JOIN alumnos a ON a.grupo_id = g.id
GROUP BY g.id, g.nombre, g.nivel, g.anio_academico;
```

#### `v_media_alumno_evaluacion`
```sql
CREATE VIEW v_media_alumno_evaluacion AS
SELECT 
  n.alumno_id,
  t.evaluacion,
  ROUND(
    SUM(COALESCE(n.nota, 0) * t.peso_nota) / 
    SUM(CASE WHEN n.nota IS NOT NULL THEN t.peso_nota ELSE 0 END), 2
  ) as media
FROM notas n
JOIN tareas t ON t.id = n.tarea_id
GROUP BY n.alumno_id, t.evaluacion;
```

## 🔒 Permisos de acceso (Supabase RLS)

**Para desarrollo**: Desactiva RLS (fila `enable_rls` en `OFF`)

**Para producción**: Configura políticas RLS que permitan:
- Lectura de `grupos`, `alumnos`, `tareas` solo a usuarios autenticados
- Lectura/escritura de `notas` solo a profesores de ese grupo

## ✅ Verificación

1. Abre `antescorregIA-app/index.html` en navegador
2. Haz clic en la pestaña **"📚 Cuaderno docente"**
3. El selector de grupos debe cargar automáticamente
4. Selecciona un grupo → deberías ver alumnos y tareas
5. Intenta editar una nota → debería guardarse en Supabase

## 🐛 Solución de problemas

### "Supabase no conectado"
- Verifica que `SUPABASE_URL` y `SUPABASE_ANON_KEY` sean correctas
- Abre la consola del navegador (F12 → Console) para ver errores

### "Error cargando grupos"
- Verifica que la vista `v_resumen_grupo` existe en tu proyecto Supabase
- Comprueba que las tablas `grupos` y `alumnos` tienen datos

### Notas no se guardan
- Verifica que `SUPABASE_ANON_KEY` tenga permisos de escritura en la tabla `notas`
- Usa Supabase Studio para verificar que los datos se insertan correctamente

## 📝 Origen de notas

Cuando el profesor edita notas, se guardan con:
- `origen = 'manual'` → notas editadas por el profesor
- `origen = 'markmate'` → notas insertadas automáticamente (Paso 3, no implementado aún)

## 🚀 Próximos pasos

1. **Paso 3**: Integración de agente automático (markmate) que inserta notas desde la corrección
2. **Paso 4**: Exportación de cuaderno a Excel/PDF
3. **Paso 5**: Dashboard de métricas y reportes
