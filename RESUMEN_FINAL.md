# 🎉 antescorregIA — Paso 2: Cuaderno Docente ✅ COMPLETADO

## 📊 Arquitectura del Cuaderno

```
┌─────────────────────────────────────────────────────────────────┐
│                                                                 │
│  index.html (SPA vanilla + Supabase-JS)                        │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │                                                          │  │
│  │  TABS: [📝 Corrección] [📚 Cuaderno] ◄── NEW           │  │
│  │                                                          │  │
│  │  ┌──────────────────────────────────────────────────┐  │  │
│  │  │  SECCIÓN CUADERNO DOCENTE                       │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  Selector Grupo: [▼ Selecciona grupo]          │  │  │
│  │  ├──────────────────────────────────────────────────┤  │  │
│  │  │  Alumno  │ Tarea1 │ Tarea2 │ Tarea3 │ Media    │  │  │
│  │  │────────────────────────────────────────────────│  │  │
│  │  │ Juan     │ [9.5]  │ [8.0]  │ [----] │ 8.75    │  │  │
│  │  │ María    │ [10]   │ [9.5]  │ [8.0]  │ 9.17    │  │  │
│  │  │ Pedro    │ [----] │ [7.0]  │ [----] │ 7.00    │  │  │
│  │  └──────────────────────────────────────────────────┘  │  │
│  │     ▲ Celdas editables inline con validación         │  │
│  │     ▲ UPSERT automático a Supabase                   │  │
│  │     ▲ Media recalculada en tiempo real               │  │
│  │                                                          │  │
│  └──────────────────────────────────────────────────────────┘  │
│                           │                                     │
│                           ▼                                     │
│                ┌─────────────────────────────┐                 │
│                │ supabase-js (HTTP REST)     │                 │
│                │ Credenciales: URL + Anon Key│                 │
│                └─────────────────────────────┘                 │
│                                │                                │
└────────────────────────────────┼────────────────────────────────┘
                                 │
                    ┌────────────┴────────────┐
                    ▼                         ▼
        ┌─────────────────────┐  ┌─────────────────────┐
        │   SUPABASE DB       │  │  SUPABASE STUDIO    │
        │                     │  │  (Admin UI)         │
        │ Tablas:             │  │                     │
        │ • grupos (v)        │  │  Visualizar/editar  │
        │ • alumnos           │  │  datos directamente │
        │ • tareas            │  │                     │
        │ • notas (UPSERT)    │  │                     │
        │                     │  │                     │
        │ Vistas:             │  │                     │
        │ • v_resumen_grupo   │  │                     │
        │ • v_media_alumno_   │  │                     │
        │   evaluacion        │  │                     │
        └─────────────────────┘  └─────────────────────┘
```

---

## 📁 Archivos modificados / creados

### ✏️ Modificados

1. **`antescorregIA-app/index.html`** (principal)
   - ✅ Agregado CDN: `@supabase/supabase-js@2`
   - ✅ Agregados 2 botones de tabs (Corrección | Cuaderno)
   - ✅ Agregada sección HTML con tabla interactiva
   - ✅ Agregados estilos CSS para tabs y tabla
   - ✅ Agregadas ~400 líneas de JavaScript:
     - `switchTab()` - navegación entre pestañas
     - `initSupabase()` - conexión a BD
     - `cargarGrupos()` - carga grupos desde vista
     - `onGrupoSelected()` - carga datos del grupo
     - `renderCuaderno()` - renderiza tabla
     - `saveNota()` - UPSERT de notas
     - `saveFaltas()` - UPSERT de faltas

2. **`.env.example`** (actualizado)
   - ✅ Agregadas variables Supabase

### 📄 Creados

1. **`SUPABASE_CONFIG.md`** 
   - 📖 Guía paso a paso para configurar Supabase
   - 🗂️ SQL para crear tablas y vistas
   - 🔐 Instrucciones de permisos RLS
   - 🐛 Solución de problemas

2. **`IMPLEMENTACION_COMPLETADA.md`**
   - 📊 Resumen técnico completo
   - 🔄 Diagrama de flujo de datos
   - ✅ Lista de funciones Nivel 1
   - 🧪 Pruebas recomendadas

---

## 🚀 Inicio rápido

### 1️⃣ Configurar Supabase
```
1. Abre https://console.supabase.com
2. Copia Project URL y anon key
3. Edita antescorregIA-app/index.html línea ~500:
   const SUPABASE_URL = 'https://tu-proyecto.supabase.co';
   const SUPABASE_ANON_KEY = 'eyJ...';
```

### 2️⃣ Crear esquema Supabase
```
→ Ver SUPABASE_CONFIG.md para SQL completo
  - Copiar los CREATE TABLE scripts
  - Pegarlos en Supabase SQL Editor
  - Ejecutar
```

### 3️⃣ Probar en navegador
```
1. Abre antescorregIA-app/index.html
2. Haz clic en "📚 Cuaderno docente"
3. Selecciona un grupo
4. Edita una nota → debe guardarse automáticamente
```

---

## 🎯 Funciones Nivel 1 — Estado

| # | Función | Implementado | Validación | Persistencia |
|---|---------|------------|-----------|--------------|
| 1 | **Grupos** | ✅ | N/A | `SELECT * FROM v_resumen_grupo` |
| 2 | **Alumnos** | ✅ | activo=true | `SELECT * FROM alumnos WHERE grupo_id` |
| 3 | **Notas** | ✅ | 0-10 | `UPSERT INTO notas` |
| 3 | **Faltas** | ✅ | >=0 | `UPSERT INTO notas` |
| 4 | **Media** | ✅ | Ponderada | Calculada en cliente |

---

## 🔄 Flujo típico de uso

```
1. Profesor abre index.html en navegador
                    ▼
2. Hace clic en pestaña "📚 Cuaderno docente"
                    ▼
3. Sistema carga grupos desde Supabase
   [▼ Selecciona un grupo...]
                    ▼
4. Profesor selecciona: "3ESO A (Nivel 3 - 2025/26)"
                    ▼
5. Sistema carga:
   • 25 alumnos del grupo
   • 5 tareas de evaluación
   • Todas las notas previas
                    ▼
6. Tabla se renderiza:
   ┌─────────────┬────────┬────────┬───────┐
   │ Alumno      │ Tarea1 │ Tarea2 │ Media │
   ├─────────────┼────────┼────────┼───────┤
   │ Juan García │ [9.5]  │ [8.0]  │ 8.75  │
   │ María López │ [10]   │ [ ] (vacío)
   │ ...         │ ...    │ ...    │ ...   │
   └─────────────┴────────┴────────┴───────┘
          ▲ Editables
          ▲ Blurr → guardar
                    ▼
7. Profesor edita: "3" nota para María en Tarea2
                    ▼
8. Campo cambia color a amarillo (unsaved)
   Input blur → salida del campo
                    ▼
9. Sistema llama: saveNota(maria_id, tarea2_id, 3)
                    ▼
10. UPSERT a notas:
    INSERT INTO notas (...) VALUES (maria_id, tarea2_id, 3, ...)
    ON CONFLICT DO UPDATE
                    ▼
11. Campo cambia a verde (saved) durante 2 segundos
                    ▼
12. Media se recalcula: (10 + 3) / 2 = 6.5
                    ▼
13. Tabla se re-renderiza con nueva media
                    ▼
14. ✅ Done — Nota persistida en Supabase
```

---

## 🔐 Variables de entorno

**NECESARIO CONFIGURAR ANTES DE USAR:**

```javascript
// antescorregIA-app/index.html (línea ~500)
const SUPABASE_URL = 'YOUR_SUPABASE_URL';        // ⚠️ CAMBIAR A TU URL
const SUPABASE_ANON_KEY = 'YOUR_SUPABASE_ANON_KEY'; // ⚠️ CAMBIAR A TU KEY
```

Obtener desde: https://console.supabase.com → Settings → API

---

## 🧪 Validación de datos

| Campo | Regla | Error |
|-------|-------|-------|
| **Nota** | 0 ≤ nota ≤ 10 | "La nota debe estar entre 0 y 10" |
| **Faltas** | faltas ≥ 0 | "Las faltas deben ser un número >= 0" |
| **Grupo** | Requerido | "Selecciona un grupo para ver el cuaderno" |

---

## 🎨 Estilos y UX

✨ **Visual feedback**:
- Campo en edición: borde primario, sombra
- Guardando: fondo amarillo (#FEF3C7)
- Guardado: fondo verde (#ECFDF5) + 2s fade out
- Media: texto en primario, bold

📱 **Responsive**: 
- Desktop (≥1024px): tabla completa
- Tablet (768-1023px): fuente reducida, padding comprimido
- Móvil (<768px): scroll horizontal en tabla

---

## 🌳 Stack tecnológico

- **Frontend**: HTML vanilla + vanilla JS (sin frameworks)
- **Base de datos**: Supabase PostgreSQL
- **Comunicación**: HTTP REST (supabase-js)
- **Librerías**: JSZip, SheetJS, supabase-js
- **Estilo**: CSS vanilla (variables CSS, flexbox, grid)
- **Auth**: Anon key (permiso público, sin RLS de momento)

---

## 📋 Checklist para siguiente paso (Paso 3)

- [ ] Usuario verifica tabla con datos reales
- [ ] Editar nota → verifica que se guarda en Supabase
- [ ] Calcular media → verifica que es correcta
- [ ] Probar en móvil → verifica responsividad
- [ ] Iniciar Paso 3: Integración automática de notas (markmate)

---

## 📞 Soporte

Cualquier duda o issue:
1. Revisar `SUPABASE_CONFIG.md` → sección "Solución de problemas"
2. Abrir consola del navegador (F12) para ver errores de conexión
3. Verificar en Supabase Studio que los datos existen

---

**Creado**: 5 de mayo de 2026  
**Status**: ✅ LISTO PARA USAR  
**Próxima fase**: Paso 3 - Integración agente automático (markmate)
