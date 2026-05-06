# antescorregIA — Contexto del proyecto

## Qué es
App web para corrección automática de tareas de alumnos de 1º y 3º ESO con IA (Claude API).
Proyecto de uso personal, un solo profesor.

## Estructura
antescorregIA/
├── antescorregIA-app/
│   └── index.html        ← frontend completo (NO mover)
├── api/
│   └── corregir.js       ← backend Vercel (endpoint de corrección)
├── vercel.json
└── CLAUDE.md

## Stack
- Frontend: HTML/JS vanilla, una sola página
- Librerías: JSZip, SheetJS, Supabase JS v2 (todas vía CDN)
- Backend: Vercel serverless (api/corregir.js)
- Base de datos: Supabase (sin RLS)
- Deploy: Vercel → https://antescorregia.vercel.app

## Supabase — tablas
- `grupos` (id, nombre, nivel, anio_academico, created_at)
- `alumnos` (id, grupo_id, nombre, apellidos, email, activo, created_at)
- `tareas` (id, grupo_id, titulo, descripcion, evaluacion, fecha_entrega, peso_nota, created_at)
- `notas` (id, alumno_id, tarea_id, nota, faltas, comentario_ia, mejoras_ia, mensaje_motivador, comentario_profesor, origen, corregido_at, created_at)
- Vistas: `v_media_alumno_evaluacion`, `v_resumen_grupo`
- UNIQUE en notas: (alumno_id, tarea_id)
- Campo origen: 'manual' | 'markmate'

## Reglas importantes
- El index.html está en antescorregIA-app/ — NO moverlo nunca
- No tocar el vercel.json sin avisar
- No subir node_modules ni .env a git
- Las credenciales de Supabase van hardcodeadas en el JS del index.html (proyecto personal, sin backend propio)
- Siempre hacer git add + commit + push al terminar

## Próximos pasos pendientes
- Paso 3: que las correcciones de MarkMate alimenten automáticamente la tabla notas con origen='markmate'
