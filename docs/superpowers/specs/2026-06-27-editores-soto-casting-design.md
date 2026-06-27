# Casting de Editores SOTO.IA — Diseño (MVP2)

**Fecha:** 2026-06-27
**Proyecto:** `editores-soto`
**Propósito:** Captar editores de clips verticales para los vídeos largos de SOTO.IA mediante un formulario público con prueba de vídeo, y revisarlos desde un panel admin privado.

## Objetivo

Una landing pública donde editores de vídeo:
1. Lean el reto (editar clips verticales de 30–60s del vídeo `https://youtu.be/2pUKG8vIQLM`).
2. Rellenen un formulario con sus datos, precios y experiencia.
3. Suban un clip de prueba de 40–60s.

Y un panel admin privado donde Ivan:
1. Vea todas las candidaturas.
2. Reproduzca cada vídeo de prueba.
3. Marque candidatos como `shortlisted` / `rejected`.

La IA de preselección queda fuera de este MVP (se aborda en una iteración posterior).

## Stack

- **Front + API:** Next.js 14 (App Router, TypeScript) desplegado en Vercel team `sotoia`, subdominio `editores-soto.vercel.app`.
- **Base de datos:** Supabase Postgres, proyecto `pzpnmlifqqodqpdifcga`.
- **Storage:** bucket privado `test-videos` en Supabase Storage (máx 200 MB por archivo).
- **Auth admin:** Supabase Magic Link sobre el email de Ivan.
- **Estilo:** `liquid-gradient` como fondo (parámetros del usuario), tarjetas glass refractivo encima (efecto tipo iOS 26 / `liquid-glass-react`).
- **Repo:** GitHub bajo cuenta `sotoia`, push automático a Vercel.

## Arquitectura

```
[Candidato]──► /            (landing pública + form)
                │
                ├──► POST   /api/applications        (insert DB)
                └──► PUT    /api/test-videos/upload  (firma URL → Storage)

[Ivan]────────► /admin (login magic link)
                │
                ├──► GET    /api/admin/applications
                ├──► GET    /api/admin/applications/:id/video   (signed URL)
                └──► PATCH  /api/admin/applications/:id/status
```

Tres unidades con un propósito claro cada una:

1. **Landing + form público** — UI y validación cliente. No habla con DB directamente; pasa por `/api/applications`.
2. **API capa servidor** — única que usa `SUPABASE_SERVICE_ROLE_KEY`. Inserta filas, firma URLs de upload, cambia status. Validación con Zod.
3. **Panel admin** — UI server-rendered protegida por middleware que comprueba sesión Supabase + email allowlist.

## Esquema de datos

### Tabla `applications`

| Campo | Tipo | Notas |
|---|---|---|
| `id` | `uuid` PK | `gen_random_uuid()` |
| `created_at` | `timestamptz` | default `now()` |
| `full_name` | `text` not null | |
| `age` | `int` not null | check 16–80 |
| `country` | `text` not null | ISO-2 o nombre libre (form usa `react-select` con lista) |
| `email` | `text` not null | índice único para evitar duplicados |
| `whatsapp` | `text` | opcional, formato E.164 sugerido (ej. `+34600123123`), validación suave en cliente |
| `price_per_clip` | `numeric(10,2)` not null | coste por clip 30–60s |
| `currency` | `text` not null | `EUR` / `USD` (default `EUR`) |
| `software` | `text[]` not null | subset de `{davinci, aftereffects, premiere, capcut}` |
| `experience_years` | `int` not null | |
| `experience_text` | `text` | descripción libre opcional |
| `work_links` | `jsonb` | array de `{label, url}` (mín 0, máx 5) |
| `portfolio_url` | `text` | opcional |
| `test_video_path` | `text` not null | ruta dentro del bucket |
| `test_video_size_mb` | `numeric` | calculado en upload |
| `status` | `text` not null | enum `pending / shortlisted / rejected`, default `pending` |
| `admin_notes` | `text` | rellenado desde el panel |

**RLS:**
- `INSERT`: público (anon role) — solo si el payload pasa validación servidor.
- `SELECT / UPDATE`: solo `service_role` (consume API admin tras chequear sesión Supabase + allowlist).

### Bucket `test-videos`

- Privado.
- Política: `INSERT` desde anon con URL firmada de un solo uso, generada por `/api/test-videos/upload`.
- Política: `SELECT` solo `service_role` (el panel admin pide URL firmada de lectura, válida 1h).
- Límite duro de tamaño en cliente y en política de Storage: 200 MB.

## Flujo del candidato

1. **Hero.** Fondo `liquid-gradient` con parámetros del usuario. Título grande, subtítulo explicativo y un embed (lite-youtube) del vídeo de referencia.
2. **Formulario.** Una sola página partida en secciones glass:
   - Sobre ti: nombre, edad, país, email, WhatsApp (opcional).
   - Trabajo: precio por clip + divisa, software (checkboxes), años de experiencia, descripción libre.
   - Portfolio: campo `portfolio_url` + lista dinámica de hasta 5 enlaces de trabajos previos.
   - Prueba: explicación + dropzone con vídeo de 40–60s, máx 200 MB. Cliente verifica duración con `<video>.duration` antes de subir.
3. **Envío.**
   - Cliente pide URL firmada a `/api/test-videos/upload` con `filename` y `size`.
   - Sube directo al bucket por `PUT`.
   - Llama `/api/applications` con todo el payload + `test_video_path`.
   - Si todo OK, redirige a `/thanks` con animación.

## Flujo del admin

1. `/admin` redirige a `/admin/login` si no hay sesión.
2. Login con magic link (Supabase auth.signInWithOtp). Middleware comprueba además que `session.user.email` esté en `ADMIN_EMAILS` (variable de entorno).
3. `/admin` lista candidaturas: tabla con nombre, país, precio, software, fecha, status. Filtros por status. Click → `/admin/[id]`.
4. `/admin/[id]` muestra ficha completa + reproductor con URL firmada del vídeo. Botones: Shortlist / Reject. Campo de notas.

## Manejo de errores

- **Validación servidor con Zod** en cada endpoint. Mensajes claros al cliente.
- **Email duplicado:** respuesta 409 + mensaje "Ya enviaste una candidatura con este email. Si quieres cambiar algo, escríbeme a [email]."
- **Upload fallido:** reintento automático una vez; si falla, mensaje y opción de reintentar.
- **Duración fuera de rango:** bloqueo en cliente antes de subir, mensaje claro "El vídeo debe durar entre 40 y 60 segundos".
- **Tamaño > 200 MB:** bloqueo en cliente.

## Estructura del repo

```
editores-soto/
├── app/
│   ├── page.tsx                 # Landing + form
│   ├── thanks/page.tsx
│   ├── admin/
│   │   ├── layout.tsx           # protección de sesión
│   │   ├── login/page.tsx
│   │   ├── page.tsx             # lista candidatos
│   │   └── [id]/page.tsx        # ficha individual
│   └── api/
│       ├── applications/route.ts            # POST público
│       ├── test-videos/upload/route.ts      # POST público (firma URL)
│       └── admin/
│           ├── applications/route.ts        # GET (lista)
│           └── applications/[id]/
│               ├── route.ts                 # PATCH (status)
│               └── video/route.ts           # GET (signed read URL)
├── components/
│   ├── LiquidGradient.tsx       # fondo WebGL
│   ├── GlassCard.tsx            # tarjeta refractiva
│   ├── form/                    # secciones del form
│   └── admin/
├── lib/
│   ├── supabase/
│   │   ├── server.ts            # cliente service_role (solo server)
│   │   └── client.ts            # cliente anon (browser)
│   ├── schema.ts                # Zod schemas compartidos
│   └── countries.ts
├── supabase/
│   └── migrations/
│       └── 0001_init.sql        # tabla + bucket + RLS
└── .env.local.example
```

## Variables de entorno

```
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=        # solo server
ADMIN_EMAILS=pyneal.systems@gmail.com
```

## Pruebas

- **Tipado fuerte** con TypeScript + Zod en runtime.
- **Validación manual:**
  1. Enviar candidatura completa desde el form → ver fila en Supabase.
  2. Intentar enviar 2 candidaturas con mismo email → ver error 409.
  3. Subir vídeo > 200 MB → bloqueo cliente.
  4. Subir vídeo de 20s → bloqueo cliente por duración.
  5. Entrar a `/admin` sin sesión → redirige a login.
  6. Entrar con email no permitido → 403.
  7. Cambiar status desde la ficha → ver cambio en lista.
- **No se escriben tests automatizados en este MVP** (decisión del usuario, optimizar tiempo de desarrollo).

## Fuera de alcance (MVP3 o posterior)

- IA de preselección con Claude API (score 0–10 + notas).
- Notificaciones por email al candidato cuando cambia su status.
- Dashboard con métricas (candidaturas por día, % shortlisted, mapa por país).
- Exportar candidatos a CSV.
- Multi-idioma.

## Decisiones tomadas y por qué

| Decisión | Por qué |
|---|---|
| Vercel + Supabase tier gratuito | Cero coste inicial; ambos servicios soportan tráfico esperado para casting; el usuario ya domina el stack. |
| Subdominio `*.vercel.app` para arrancar | Quitar fricción de DNS; siempre se puede apuntar dominio bonito después. |
| Subida directa a Supabase Storage (no link externo) | Mejor UX para el candidato, control total del archivo. |
| Magic link, no contraseña | Un solo admin (Ivan), sin gestión de cuentas. |
| `email` único en `applications` | Evita spam de un mismo candidato; si quiere editar, contacta por email. |
| RLS estricto en `applications` | El form pasa siempre por API server con validación; no exponer DB al cliente directamente. |
| Fondo WebGL `liquid-gradient` + cards glass | Estilo pedido explícitamente por el usuario, con parámetros y paleta concretos. |
