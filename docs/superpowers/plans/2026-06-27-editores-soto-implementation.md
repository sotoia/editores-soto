# Editores SOTO Casting — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Build a public casting form for SOTO.IA video editors with private admin panel, hosted on Vercel + Supabase.

**Architecture:** Next.js 14 App Router. Public landing/form posts to API routes which use Supabase service role. Video uploads go straight to Supabase Storage via signed URLs. Admin panel protected by Supabase Auth magic link + email allowlist.

**Tech Stack:** Next.js 14 (App Router, TypeScript), TailwindCSS, Supabase (Postgres + Storage + Auth), Zod, liquid-glass-react, custom liquid-gradient WebGL background.

**Note on tests:** Per spec decision, this MVP uses **manual validation** (no automated tests). Each task ends with explicit manual verification steps.

---

## File Structure

```
editores-soto/
├── app/
│   ├── layout.tsx
│   ├── page.tsx                                # Landing + form
│   ├── thanks/page.tsx
│   ├── globals.css
│   ├── admin/
│   │   ├── layout.tsx                          # Auth gate
│   │   ├── login/page.tsx
│   │   ├── page.tsx                            # Applications list
│   │   └── [id]/page.tsx                       # Application detail
│   └── api/
│       ├── applications/route.ts               # POST public
│       ├── test-videos/upload/route.ts         # POST public (signed URL)
│       └── admin/
│           ├── applications/route.ts           # GET list
│           └── applications/[id]/
│               ├── route.ts                    # PATCH status
│               └── video/route.ts              # GET signed read URL
├── components/
│   ├── LiquidGradient.tsx                      # WebGL background
│   ├── GlassCard.tsx                           # Glass refractive card
│   ├── form/
│   │   ├── ApplicationForm.tsx
│   │   ├── PersonalSection.tsx
│   │   ├── WorkSection.tsx
│   │   ├── PortfolioSection.tsx
│   │   └── VideoUploadSection.tsx
│   └── admin/
│       ├── ApplicationsTable.tsx
│       └── ApplicationDetail.tsx
├── lib/
│   ├── supabase/
│   │   ├── server.ts
│   │   ├── client.ts
│   │   └── middleware.ts
│   ├── schema.ts                               # Zod schemas
│   └── countries.ts
├── middleware.ts                               # Admin auth gate
├── supabase/
│   └── migrations/
│       └── 0001_init.sql
├── .env.local.example
├── .env.local                                  # gitignored
├── package.json
├── tsconfig.json
├── tailwind.config.ts
├── postcss.config.js
└── next.config.js
```

---

## Task 1: Scaffold Next.js project

**Files:**
- Create: `package.json`, `tsconfig.json`, `next.config.js`, `tailwind.config.ts`, `postcss.config.js`, `.gitignore`, `app/layout.tsx`, `app/globals.css`, `app/page.tsx` (placeholder)

- [ ] **Step 1: Initialize Next.js in a temp dir, then move into place**

This avoids `create-next-app` clobbering or refusing because of the existing `.git/` and `docs/`.

```bash
mkdir -p /tmp/editores-soto-scaffold
cd /tmp/editores-soto-scaffold
npx create-next-app@14 . --typescript --tailwind --app --no-src-dir --import-alias "@/*" --eslint --use-npm
```

Then copy everything except `.git` into the real project (preserves our existing `docs/` and `.git/`):

```bash
rsync -a --exclude='.git' --exclude='.gitignore' /tmp/editores-soto-scaffold/ /Users/elev3n/VIBECODING/editores-soto/
# Merge gitignore: keep ours + append scaffold entries we don't have
cat /tmp/editores-soto-scaffold/.gitignore >> /Users/elev3n/VIBECODING/editores-soto/.gitignore
# Dedupe lines while preserving order
awk '!seen[$0]++' /Users/elev3n/VIBECODING/editores-soto/.gitignore > /tmp/_gi && mv /tmp/_gi /Users/elev3n/VIBECODING/editores-soto/.gitignore
cd /Users/elev3n/VIBECODING/editores-soto
rm -rf /tmp/editores-soto-scaffold
```

Expected: project files (`package.json`, `app/`, `tsconfig.json`, etc.) now sit alongside the preserved `docs/` and `.git/`.

- [ ] **Step 2: Verify dev server boots**

```bash
npm run dev
```

Open `http://localhost:3000` → default Next.js landing page renders. Stop server with Ctrl+C.

- [ ] **Step 3: Install runtime deps**

```bash
npm install @supabase/supabase-js @supabase/ssr zod liquid-glass-react
npm install -D @types/node
```

- [ ] **Step 4: Replace `app/page.tsx` with placeholder**

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center text-white bg-black">
      <h1 className="text-2xl">editores-soto · scaffold OK</h1>
    </main>
  );
}
```

- [ ] **Step 5: Update `app/layout.tsx` metadata**

```tsx
import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casting de editores · SOTO.IA",
  description: "Únete al equipo de editores de clips verticales de SOTO.IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">{children}</body>
    </html>
  );
}
```

- [ ] **Step 6: Manual verify**

```bash
npm run dev
```

Visit `http://localhost:3000` → see "editores-soto · scaffold OK" on black background.

- [ ] **Step 7: Commit**

```bash
git add .
git commit -m "chore: scaffold next.js 14 + tailwind + supabase deps"
```

---

## Task 2: Environment variables

**Files:**
- Create: `.env.local.example`, `.env.local`
- Modify: `.gitignore` (ensure `.env.local` is excluded; create-next-app already adds it)

- [ ] **Step 1: Create `.env.local.example`**

```
NEXT_PUBLIC_SUPABASE_URL=https://YOUR_PROJECT.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
ADMIN_EMAILS=pyneal.systems@gmail.com
```

- [ ] **Step 2: Create `.env.local` with real credentials**

```
NEXT_PUBLIC_SUPABASE_URL=https://pzpnmlifqqodqpdifcga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<from-supabase-dashboard>
SUPABASE_SERVICE_ROLE_KEY=<from-supabase-dashboard>
ADMIN_EMAILS=pyneal.systems@gmail.com
```

- [ ] **Step 3: Confirm `.gitignore` excludes `.env.local`**

`grep -n "\.env" .gitignore` → should list `.env*.local`. If not, append `.env.local`.

- [ ] **Step 4: Commit**

```bash
git add .env.local.example .gitignore
git commit -m "chore: env example and gitignore"
```

`.env.local` MUST stay untracked. Verify with `git status` (it should not appear).

---

## Task 3: Supabase migration (schema + bucket + RLS)

**Files:**
- Create: `supabase/migrations/0001_init.sql`

- [ ] **Step 1: Write migration**

```sql
-- supabase/migrations/0001_init.sql

create extension if not exists "pgcrypto";

create table public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  full_name text not null,
  age int not null check (age between 16 and 80),
  country text not null,
  email text not null,
  whatsapp text,
  price_per_clip numeric(10,2) not null check (price_per_clip >= 0),
  currency text not null default 'EUR' check (currency in ('EUR','USD')),
  software text[] not null check (cardinality(software) > 0),
  experience_years int not null check (experience_years >= 0),
  experience_text text,
  work_links jsonb not null default '[]'::jsonb,
  portfolio_url text,
  test_video_path text not null,
  test_video_size_mb numeric,
  status text not null default 'pending' check (status in ('pending','shortlisted','rejected')),
  admin_notes text
);

create unique index applications_email_unique on public.applications (lower(email));

alter table public.applications enable row level security;

-- Public anon role can insert (validated server-side)
create policy "anon can insert applications"
  on public.applications for insert
  to anon
  with check (true);

-- Only service_role can read/update (admin API uses service role)
-- No select/update/delete policy for anon -> blocked by RLS.

-- Storage bucket
insert into storage.buckets (id, name, public, file_size_limit)
  values ('test-videos', 'test-videos', false, 209715200)  -- 200 MB
  on conflict (id) do nothing;

-- Storage policies: anon can insert via signed upload URL only.
-- (Signed URLs bypass RLS; we restrict reads to service_role.)
create policy "anon can upload via signed URL"
  on storage.objects for insert
  to anon
  with check (bucket_id = 'test-videos');

-- No select policy for anon -> reads only via service_role signed download URLs.
```

- [ ] **Step 2: Apply migration via Supabase SQL editor**

Open `https://supabase.com/dashboard/project/pzpnmlifqqodqpdifcga/sql/new` in the user's browser. Paste contents of `supabase/migrations/0001_init.sql`. Click "Run".

Expected: "Success. No rows returned."

- [ ] **Step 3: Verify table and bucket exist**

In Supabase dashboard:
- Table editor → `public.applications` exists with all columns above.
- Storage → bucket `test-videos` exists, private, 200 MB limit.

- [ ] **Step 4: Commit**

```bash
git add supabase/
git commit -m "feat: supabase migration with applications table + storage bucket + RLS"
```

---

## Task 4: Zod schemas + countries list

**Files:**
- Create: `lib/schema.ts`, `lib/countries.ts`

- [ ] **Step 1: Create `lib/schema.ts`**

```ts
import { z } from "zod";

export const SOFTWARE_OPTIONS = ["davinci", "aftereffects", "premiere", "capcut"] as const;
export type Software = typeof SOFTWARE_OPTIONS[number];

export const WorkLinkSchema = z.object({
  label: z.string().min(1).max(80),
  url: z.string().url(),
});

export const ApplicationInputSchema = z.object({
  full_name: z.string().min(2).max(120),
  age: z.number().int().min(16).max(80),
  country: z.string().min(2).max(80),
  email: z.string().email().max(200),
  whatsapp: z.string().max(40).optional().nullable(),
  price_per_clip: z.number().nonnegative(),
  currency: z.enum(["EUR", "USD"]),
  software: z.array(z.enum(SOFTWARE_OPTIONS)).min(1),
  experience_years: z.number().int().min(0).max(80),
  experience_text: z.string().max(2000).optional().nullable(),
  work_links: z.array(WorkLinkSchema).max(5).default([]),
  portfolio_url: z.string().url().max(300).optional().nullable(),
  test_video_path: z.string().min(1),
  test_video_size_mb: z.number().nonnegative().optional().nullable(),
});

export type ApplicationInput = z.infer<typeof ApplicationInputSchema>;

export const UploadIntentSchema = z.object({
  filename: z.string().min(1).max(200),
  size_bytes: z.number().int().positive().max(200 * 1024 * 1024),
  content_type: z.string().regex(/^video\//),
});

export type UploadIntent = z.infer<typeof UploadIntentSchema>;

export const StatusUpdateSchema = z.object({
  status: z.enum(["pending", "shortlisted", "rejected"]),
  admin_notes: z.string().max(2000).optional().nullable(),
});
```

- [ ] **Step 2: Create `lib/countries.ts`**

```ts
export const COUNTRIES = [
  "España", "México", "Argentina", "Colombia", "Chile", "Perú", "Venezuela",
  "Ecuador", "Uruguay", "Paraguay", "Bolivia", "Cuba", "República Dominicana",
  "Guatemala", "Honduras", "El Salvador", "Nicaragua", "Costa Rica", "Panamá",
  "Estados Unidos", "Reino Unido", "Francia", "Alemania", "Italia", "Portugal",
  "Países Bajos", "Bélgica", "Brasil", "Canadá", "Australia", "Japón", "Otro",
] as const;
```

- [ ] **Step 3: Commit**

```bash
git add lib/
git commit -m "feat: zod schemas and countries list"
```

---

## Task 5: Supabase client wrappers

**Files:**
- Create: `lib/supabase/server.ts`, `lib/supabase/client.ts`

- [ ] **Step 1: Create `lib/supabase/server.ts`** (service role, server only)

```ts
import { createClient } from "@supabase/supabase-js";

export function supabaseAdmin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Missing Supabase env vars (server)");
  return createClient(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
```

- [ ] **Step 2: Create `lib/supabase/client.ts`** (anon, browser)

```ts
"use client";
import { createBrowserClient } from "@supabase/ssr";

export function supabaseBrowser() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add lib/supabase/
git commit -m "feat: supabase client wrappers (admin + browser)"
```

---

## Task 6: LiquidGradient background component

**Files:**
- Create: `components/LiquidGradient.tsx`

Note: this component is a WebGL canvas that fills the viewport behind everything. Parameters and palette are the user's specified values.

- [ ] **Step 1: Create `components/LiquidGradient.tsx`**

```tsx
"use client";
import { useEffect, useRef } from "react";

const PARAMS = {
  speed: 0.24,
  scale: 0.82,
  turbAmp: 1.50,
  turbFreq: 0.88,
  turbIter: 5,
  waveFreq: 1.73,
  jellify: 1.0,
  distBias: 0.21,
  grainAmount: 0.10,
  contrast: 1.31,
  saturation: 1.50,
  exposure: 0.71,
  seed: 50.55,
};

// Palette (normalized 0..1): #000, #2B2B2B, #454545, #212121
const PALETTE = [
  [0/255,   0/255,   0/255],
  [43/255,  43/255,  43/255],
  [69/255,  69/255,  69/255],
  [33/255,  33/255,  33/255],
];

const VERT = `
attribute vec2 a_pos;
varying vec2 v_uv;
void main(){
  v_uv = a_pos * 0.5 + 0.5;
  gl_Position = vec4(a_pos, 0.0, 1.0);
}
`;

const FRAG = `
precision highp float;
varying vec2 v_uv;
uniform vec2 u_res;
uniform float u_time;
uniform float u_speed;
uniform float u_scale;
uniform float u_turbAmp;
uniform float u_turbFreq;
uniform float u_waveFreq;
uniform float u_jellify;
uniform float u_distBias;
uniform float u_grainAmount;
uniform float u_contrast;
uniform float u_saturation;
uniform float u_exposure;
uniform float u_seed;
uniform vec3 u_c0;
uniform vec3 u_c1;
uniform vec3 u_c2;
uniform vec3 u_c3;

// Simplex-ish noise (cheap)
vec2 hash(vec2 p){
  p = vec2(dot(p,vec2(127.1,311.7)), dot(p,vec2(269.5,183.3)));
  return -1.0 + 2.0*fract(sin(p)*43758.5453123);
}
float noise(in vec2 p){
  const float K1 = 0.366025404;
  const float K2 = 0.211324865;
  vec2 i = floor(p + (p.x+p.y)*K1);
  vec2 a = p - i + (i.x+i.y)*K2;
  vec2 o = (a.x>a.y) ? vec2(1.0,0.0) : vec2(0.0,1.0);
  vec2 b = a - o + K2;
  vec2 c = a - 1.0 + 2.0*K2;
  vec3 h = max(0.5 - vec3(dot(a,a),dot(b,b),dot(c,c)), 0.0);
  vec3 n = h*h*h*h * vec3(dot(a,hash(i)), dot(b,hash(i+o)), dot(c,hash(i+1.0)));
  return dot(n, vec3(70.0));
}

float fbm(vec2 p, int iter){
  float v = 0.0;
  float a = 0.5;
  for(int i=0;i<8;i++){
    if(i>=iter) break;
    v += a * noise(p);
    p *= 2.0;
    a *= 0.5;
  }
  return v;
}

vec3 mixPalette(float t){
  t = clamp(t, 0.0, 1.0);
  vec3 a = mix(u_c0, u_c1, smoothstep(0.0, 0.33, t));
  vec3 b = mix(a, u_c2, smoothstep(0.33, 0.66, t));
  return mix(b, u_c3, smoothstep(0.66, 1.0, t));
}

vec3 grade(vec3 c){
  // exposure
  c *= u_exposure * 1.5;
  // contrast
  c = (c - 0.5) * u_contrast + 0.5;
  // saturation
  float g = dot(c, vec3(0.299,0.587,0.114));
  c = mix(vec3(g), c, u_saturation);
  return clamp(c, 0.0, 1.0);
}

void main(){
  vec2 uv = (v_uv - 0.5);
  uv.x *= u_res.x / u_res.y;
  vec2 p = uv / u_scale + vec2(u_seed*0.137, u_seed*0.091);

  float t = u_time * u_speed;
  vec2 flow = vec2(
    fbm(p*u_turbFreq + vec2(t, 0.0), 5),
    fbm(p*u_turbFreq + vec2(0.0, t), 5)
  ) * u_turbAmp;

  vec2 jelly = vec2(
    sin(p.y*u_waveFreq + t*1.7),
    cos(p.x*u_waveFreq + t*1.3)
  ) * 0.15 * u_jellify;

  vec2 q = p + flow + jelly;
  float field = fbm(q, 5) * 0.5 + 0.5;
  field += u_distBias * (uv.y);
  field = clamp(field, 0.0, 1.0);

  vec3 col = mixPalette(field);
  col = grade(col);

  // grain
  float n = fract(sin(dot(v_uv*u_res, vec2(12.9898,78.233)) + u_time)*43758.5453);
  col += (n - 0.5) * u_grainAmount;

  gl_FragColor = vec4(col, 1.0);
}
`;

function compile(gl: WebGLRenderingContext, type: number, src: string) {
  const s = gl.createShader(type)!;
  gl.shaderSource(s, src);
  gl.compileShader(s);
  if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) {
    throw new Error(gl.getShaderInfoLog(s) || "shader compile error");
  }
  return s;
}

export default function LiquidGradient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current!;
    const gl = canvas.getContext("webgl", { antialias: false, premultipliedAlpha: false });
    if (!gl) return;

    const vs = compile(gl, gl.VERTEX_SHADER, VERT);
    const fs = compile(gl, gl.FRAGMENT_SHADER, FRAG);
    const prog = gl.createProgram()!;
    gl.attachShader(prog, vs);
    gl.attachShader(prog, fs);
    gl.linkProgram(prog);

    const buf = gl.createBuffer();
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1,-1, 1,-1, -1,1, 1,1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog, "a_pos");
    gl.enableVertexAttribArray(loc);
    gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    gl.useProgram(prog);

    const u = (n: string) => gl.getUniformLocation(prog, n);
    const uRes = u("u_res");
    const uTime = u("u_time");

    gl.uniform1f(u("u_speed"), PARAMS.speed);
    gl.uniform1f(u("u_scale"), PARAMS.scale);
    gl.uniform1f(u("u_turbAmp"), PARAMS.turbAmp);
    gl.uniform1f(u("u_turbFreq"), PARAMS.turbFreq);
    gl.uniform1f(u("u_waveFreq"), PARAMS.waveFreq);
    gl.uniform1f(u("u_jellify"), PARAMS.jellify);
    gl.uniform1f(u("u_distBias"), PARAMS.distBias);
    gl.uniform1f(u("u_grainAmount"), PARAMS.grainAmount);
    gl.uniform1f(u("u_contrast"), PARAMS.contrast);
    gl.uniform1f(u("u_saturation"), PARAMS.saturation);
    gl.uniform1f(u("u_exposure"), PARAMS.exposure);
    gl.uniform1f(u("u_seed"), PARAMS.seed);
    gl.uniform3fv(u("u_c0"), new Float32Array(PALETTE[0]));
    gl.uniform3fv(u("u_c1"), new Float32Array(PALETTE[1]));
    gl.uniform3fv(u("u_c2"), new Float32Array(PALETTE[2]));
    gl.uniform3fv(u("u_c3"), new Float32Array(PALETTE[3]));

    const resize = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.floor(window.innerWidth * dpr);
      canvas.height = Math.floor(window.innerHeight * dpr);
      canvas.style.width = window.innerWidth + "px";
      canvas.style.height = window.innerHeight + "px";
      gl.viewport(0, 0, canvas.width, canvas.height);
      gl.uniform2f(uRes, canvas.width, canvas.height);
    };
    resize();
    window.addEventListener("resize", resize);

    let raf = 0;
    const start = performance.now();
    const loop = (now: number) => {
      gl.uniform1f(uTime, (now - start) / 1000);
      gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);

    return () => {
      cancelAnimationFrame(raf);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 -z-10 w-screen h-screen"
      aria-hidden
    />
  );
}
```

- [ ] **Step 2: Wire into `app/layout.tsx`**

Replace the `<body>` content:

```tsx
import type { Metadata } from "next";
import LiquidGradient from "@/components/LiquidGradient";
import "./globals.css";

export const metadata: Metadata = {
  title: "Casting de editores · SOTO.IA",
  description: "Únete al equipo de editores de clips verticales de SOTO.IA",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es">
      <body className="bg-black text-white antialiased">
        <LiquidGradient />
        {children}
      </body>
    </html>
  );
}
```

- [ ] **Step 3: Manual verify**

```bash
npm run dev
```

Visit `http://localhost:3000` → animated dark gradient visible behind the placeholder text. Confirm:
- Smooth animation (not stuttering).
- Dark monochrome palette (no color casts).
- Subtle film grain.

If WebGL fails (rare), the canvas stays black — page still loads.

- [ ] **Step 4: Commit**

```bash
git add components/LiquidGradient.tsx app/layout.tsx
git commit -m "feat: WebGL liquid-gradient background with user params"
```

---

## Task 7: GlassCard component

**Files:**
- Create: `components/GlassCard.tsx`

- [ ] **Step 1: Create `components/GlassCard.tsx`**

Wraps `liquid-glass-react` for the refractive effect and adds default padding/border styling.

```tsx
"use client";
import LiquidGlass from "liquid-glass-react";
import { ReactNode } from "react";

type Props = {
  children: ReactNode;
  className?: string;
};

export default function GlassCard({ children, className = "" }: Props) {
  return (
    <LiquidGlass
      displacementScale={64}
      blurAmount={0.1}
      saturation={130}
      aberrationIntensity={2}
      elasticity={0.35}
      cornerRadius={24}
      padding="32px"
      mode="standard"
      className={`text-white ${className}`}
    >
      {children}
    </LiquidGlass>
  );
}
```

- [ ] **Step 2: Smoke test in `app/page.tsx`**

Replace contents:

```tsx
import GlassCard from "@/components/GlassCard";

export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full">
        <h1 className="text-3xl font-semibold mb-2">Casting de editores</h1>
        <p className="text-white/70">SOTO.IA · prueba glass</p>
      </GlassCard>
    </main>
  );
}
```

- [ ] **Step 3: Manual verify**

`npm run dev` → visit `http://localhost:3000`. A refractive glass card sits in the middle of the animated gradient. Card distorts the gradient behind it. No console errors.

- [ ] **Step 4: Commit**

```bash
git add components/GlassCard.tsx app/page.tsx
git commit -m "feat: GlassCard wrapper around liquid-glass-react"
```

---

## Task 8: API — POST /api/applications

**Files:**
- Create: `app/api/applications/route.ts`

- [ ] **Step 1: Create route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { ApplicationInputSchema } from "@/lib/schema";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = ApplicationInputSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .insert(parsed.data)
    .select("id")
    .single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json(
        {
          error:
            "Ya enviaste una candidatura con este email. Si quieres cambiar algo, escríbeme a pyneal.systems@gmail.com.",
        },
        { status: 409 }
      );
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ id: data.id }, { status: 201 });
}
```

- [ ] **Step 2: Manual verify with curl**

```bash
npm run dev
# in another terminal:
curl -X POST http://localhost:3000/api/applications \
  -H "Content-Type: application/json" \
  -d '{
    "full_name":"Test User",
    "age":28,
    "country":"España",
    "email":"test@example.com",
    "price_per_clip":40,
    "currency":"EUR",
    "software":["davinci"],
    "experience_years":3,
    "work_links":[],
    "test_video_path":"placeholder/test.mp4"
  }'
```

Expected: `{"id":"<uuid>"}` (201). Repeat the same call → expect 409 with the duplicate email message.

Check Supabase Table Editor → see the row.

- [ ] **Step 3: Cleanup the test row**

In Supabase SQL editor: `delete from applications where email='test@example.com';`

- [ ] **Step 4: Commit**

```bash
git add app/api/applications/route.ts
git commit -m "feat: POST /api/applications with zod validation and duplicate email handling"
```

---

## Task 9: API — POST /api/test-videos/upload (signed upload URL)

**Files:**
- Create: `app/api/test-videos/upload/route.ts`

- [ ] **Step 1: Create route**

```ts
import { NextRequest, NextResponse } from "next/server";
import { UploadIntentSchema } from "@/lib/schema";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function POST(req: NextRequest) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const parsed = UploadIntentSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { filename, content_type } = parsed.data;
  const ext = filename.split(".").pop()?.toLowerCase() || "mp4";
  const path = `${crypto.randomUUID()}.${ext}`;

  const db = supabaseAdmin();
  const { data, error } = await db.storage
    .from("test-videos")
    .createSignedUploadUrl(path);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({
    path,
    token: data.token,
    signed_url: data.signedUrl,
    content_type,
  });
}
```

- [ ] **Step 2: Manual verify**

```bash
curl -X POST http://localhost:3000/api/test-videos/upload \
  -H "Content-Type: application/json" \
  -d '{"filename":"demo.mp4","size_bytes":1000000,"content_type":"video/mp4"}'
```

Expected: JSON with `path`, `token`, `signed_url`.

- [ ] **Step 3: Commit**

```bash
git add app/api/test-videos/upload/route.ts
git commit -m "feat: POST /api/test-videos/upload returns signed upload URL"
```

---

## Task 10: Public form — sections and validation

**Files:**
- Create: `components/form/ApplicationForm.tsx`, `components/form/PersonalSection.tsx`, `components/form/WorkSection.tsx`, `components/form/PortfolioSection.tsx`, `components/form/VideoUploadSection.tsx`
- Modify: `app/page.tsx`

- [ ] **Step 1: Create `components/form/PersonalSection.tsx`**

```tsx
"use client";
import { COUNTRIES } from "@/lib/countries";

type Props = {
  values: {
    full_name: string;
    age: string;
    country: string;
    email: string;
    whatsapp: string;
  };
  onChange: (patch: Partial<Props["values"]>) => void;
};

export default function PersonalSection({ values, onChange }: Props) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Nombre completo</span>
        <input
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.full_name}
          onChange={(e) => onChange({ full_name: e.target.value })}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Edad</span>
        <input
          type="number"
          min={16}
          max={80}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.age}
          onChange={(e) => onChange({ age: e.target.value })}
          required
        />
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">País de residencia</span>
        <select
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.country}
          onChange={(e) => onChange({ country: e.target.value })}
          required
        >
          <option value="">Selecciona…</option>
          {COUNTRIES.map((c) => (
            <option key={c} value={c} className="bg-black">{c}</option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Email</span>
        <input
          type="email"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.email}
          onChange={(e) => onChange({ email: e.target.value })}
          required
        />
      </label>
      <label className="flex flex-col gap-1 md:col-span-2">
        <span className="text-sm text-white/70">WhatsApp (opcional, con prefijo)</span>
        <input
          type="tel"
          placeholder="+34600123123"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.whatsapp}
          onChange={(e) => onChange({ whatsapp: e.target.value })}
        />
      </label>
    </div>
  );
}
```

- [ ] **Step 2: Create `components/form/WorkSection.tsx`**

```tsx
"use client";
import { SOFTWARE_OPTIONS, type Software } from "@/lib/schema";

const SW_LABELS: Record<Software, string> = {
  davinci: "DaVinci Resolve",
  aftereffects: "After Effects",
  premiere: "Premiere Pro",
  capcut: "CapCut",
};

type Props = {
  values: {
    price_per_clip: string;
    currency: "EUR" | "USD";
    software: Software[];
    experience_years: string;
    experience_text: string;
  };
  onChange: (patch: Partial<Props["values"]>) => void;
};

export default function WorkSection({ values, onChange }: Props) {
  const toggle = (s: Software) => {
    const set = new Set(values.software);
    set.has(s) ? set.delete(s) : set.add(s);
    onChange({ software: Array.from(set) });
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <label className="flex flex-col gap-1 md:col-span-2">
          <span className="text-sm text-white/70">
            Coste por clip vertical (30–60s)
          </span>
          <input
            type="number"
            min={0}
            step="0.01"
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
            value={values.price_per_clip}
            onChange={(e) => onChange({ price_per_clip: e.target.value })}
            required
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className="text-sm text-white/70">Divisa</span>
          <select
            className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
            value={values.currency}
            onChange={(e) => onChange({ currency: e.target.value as "EUR" | "USD" })}
          >
            <option value="EUR" className="bg-black">EUR €</option>
            <option value="USD" className="bg-black">USD $</option>
          </select>
        </label>
      </div>

      <div>
        <span className="text-sm text-white/70">Programas que usas</span>
        <div className="grid grid-cols-2 gap-2 mt-2">
          {SOFTWARE_OPTIONS.map((s) => (
            <button
              key={s}
              type="button"
              onClick={() => toggle(s)}
              className={`px-3 py-2 rounded-lg border text-left transition ${
                values.software.includes(s)
                  ? "bg-white text-black border-white"
                  : "bg-white/5 border-white/10 hover:border-white/30"
              }`}
            >
              {SW_LABELS[s]}
            </button>
          ))}
        </div>
      </div>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Años de experiencia</span>
        <input
          type="number"
          min={0}
          max={80}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.experience_years}
          onChange={(e) => onChange({ experience_years: e.target.value })}
          required
        />
      </label>

      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Cuéntame brevemente tu experiencia (opcional)</span>
        <textarea
          rows={4}
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.experience_text}
          onChange={(e) => onChange({ experience_text: e.target.value })}
        />
      </label>
    </div>
  );
}
```

- [ ] **Step 3: Create `components/form/PortfolioSection.tsx`**

```tsx
"use client";

type WorkLink = { label: string; url: string };

type Props = {
  values: {
    portfolio_url: string;
    work_links: WorkLink[];
  };
  onChange: (patch: Partial<Props["values"]>) => void;
};

export default function PortfolioSection({ values, onChange }: Props) {
  const setLink = (i: number, patch: Partial<WorkLink>) => {
    const next = values.work_links.map((l, idx) => (idx === i ? { ...l, ...patch } : l));
    onChange({ work_links: next });
  };
  const addLink = () => {
    if (values.work_links.length >= 5) return;
    onChange({ work_links: [...values.work_links, { label: "", url: "" }] });
  };
  const removeLink = (i: number) => {
    onChange({ work_links: values.work_links.filter((_, idx) => idx !== i) });
  };

  return (
    <div className="flex flex-col gap-4">
      <label className="flex flex-col gap-1">
        <span className="text-sm text-white/70">Enlace a portfolio (opcional)</span>
        <input
          type="url"
          placeholder="https://"
          className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          value={values.portfolio_url}
          onChange={(e) => onChange({ portfolio_url: e.target.value })}
        />
      </label>

      <div>
        <span className="text-sm text-white/70">Ejemplos de trabajos (hasta 5 enlaces)</span>
        <div className="flex flex-col gap-2 mt-2">
          {values.work_links.map((l, i) => (
            <div key={i} className="grid grid-cols-12 gap-2">
              <input
                placeholder="Título"
                className="col-span-4 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
                value={l.label}
                onChange={(e) => setLink(i, { label: e.target.value })}
              />
              <input
                type="url"
                placeholder="https://"
                className="col-span-7 bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
                value={l.url}
                onChange={(e) => setLink(i, { url: e.target.value })}
              />
              <button
                type="button"
                onClick={() => removeLink(i)}
                className="col-span-1 bg-white/10 hover:bg-white/20 rounded-lg"
                aria-label="Eliminar enlace"
              >×</button>
            </div>
          ))}
          {values.work_links.length < 5 && (
            <button
              type="button"
              onClick={addLink}
              className="self-start px-3 py-2 rounded-lg bg-white/10 hover:bg-white/20 text-sm"
            >+ añadir enlace</button>
          )}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create `components/form/VideoUploadSection.tsx`**

```tsx
"use client";
import { useRef, useState } from "react";

type Props = {
  onUploaded: (path: string, sizeMb: number) => void;
};

export default function VideoUploadSection({ onUploaded }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [progress, setProgress] = useState<"idle" | "checking" | "uploading" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [filename, setFilename] = useState<string | null>(null);

  const onFile = async (file: File) => {
    setError(null);
    setFilename(file.name);
    setProgress("checking");

    if (file.size > 200 * 1024 * 1024) {
      setError("El vídeo supera los 200 MB. Comprímelo y vuelve a intentarlo.");
      setProgress("error");
      return;
    }
    if (!file.type.startsWith("video/")) {
      setError("El archivo debe ser un vídeo.");
      setProgress("error");
      return;
    }

    const duration = await readDuration(file).catch(() => null);
    if (duration === null) {
      setError("No pude leer la duración del vídeo. Prueba con MP4 / MOV.");
      setProgress("error");
      return;
    }
    if (duration < 40 || duration > 60) {
      setError(`El vídeo debe durar entre 40 y 60 segundos (el tuyo dura ${Math.round(duration)}s).`);
      setProgress("error");
      return;
    }

    setProgress("uploading");
    const intent = await fetch("/api/test-videos/upload", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        filename: file.name,
        size_bytes: file.size,
        content_type: file.type,
      }),
    });
    if (!intent.ok) {
      setError("No pude preparar la subida.");
      setProgress("error");
      return;
    }
    const { path, signed_url } = await intent.json();

    const put = await fetch(signed_url, {
      method: "PUT",
      headers: { "Content-Type": file.type },
      body: file,
    });
    if (!put.ok) {
      setError("La subida falló. Reintenta.");
      setProgress("error");
      return;
    }

    setProgress("done");
    onUploaded(path, +(file.size / (1024 * 1024)).toFixed(2));
  };

  return (
    <div className="flex flex-col gap-3">
      <div className="text-sm text-white/70">
        Sube un clip vertical de 40–60 segundos hecho a partir del vídeo de referencia.
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="video/*"
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) onFile(f);
        }}
      />
      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        className="px-4 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-50"
        disabled={progress === "checking" || progress === "uploading"}
      >
        {progress === "idle" && "Seleccionar vídeo"}
        {progress === "checking" && "Comprobando…"}
        {progress === "uploading" && "Subiendo…"}
        {progress === "done" && `Subido ✓ (${filename})`}
        {progress === "error" && "Reintentar"}
      </button>
      {error && <div className="text-red-400 text-sm">{error}</div>}
    </div>
  );
}

function readDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const v = document.createElement("video");
    v.preload = "metadata";
    v.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve(v.duration);
    };
    v.onerror = () => reject(new Error("metadata error"));
    v.src = url;
  });
}
```

- [ ] **Step 5: Create `components/form/ApplicationForm.tsx`**

```tsx
"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";
import PersonalSection from "./PersonalSection";
import WorkSection from "./WorkSection";
import PortfolioSection from "./PortfolioSection";
import VideoUploadSection from "./VideoUploadSection";
import type { Software } from "@/lib/schema";

type FormState = {
  full_name: string;
  age: string;
  country: string;
  email: string;
  whatsapp: string;
  price_per_clip: string;
  currency: "EUR" | "USD";
  software: Software[];
  experience_years: string;
  experience_text: string;
  portfolio_url: string;
  work_links: { label: string; url: string }[];
  test_video_path: string | null;
  test_video_size_mb: number | null;
};

const INITIAL: FormState = {
  full_name: "",
  age: "",
  country: "",
  email: "",
  whatsapp: "",
  price_per_clip: "",
  currency: "EUR",
  software: [],
  experience_years: "",
  experience_text: "",
  portfolio_url: "",
  work_links: [],
  test_video_path: null,
  test_video_size_mb: null,
};

export default function ApplicationForm() {
  const router = useRouter();
  const [s, setS] = useState<FormState>(INITIAL);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const patch = (p: Partial<FormState>) => setS((prev) => ({ ...prev, ...p }));

  const canSubmit =
    s.full_name && s.age && s.country && s.email &&
    s.price_per_clip && s.software.length > 0 && s.experience_years &&
    s.test_video_path;

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setError(null);

    const payload = {
      full_name: s.full_name.trim(),
      age: Number(s.age),
      country: s.country,
      email: s.email.trim().toLowerCase(),
      whatsapp: s.whatsapp.trim() || null,
      price_per_clip: Number(s.price_per_clip),
      currency: s.currency,
      software: s.software,
      experience_years: Number(s.experience_years),
      experience_text: s.experience_text.trim() || null,
      work_links: s.work_links.filter((l) => l.label && l.url),
      portfolio_url: s.portfolio_url.trim() || null,
      test_video_path: s.test_video_path,
      test_video_size_mb: s.test_video_size_mb,
    };

    const res = await fetch("/api/applications", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    if (res.ok) {
      router.push("/thanks");
      return;
    }
    const body = await res.json().catch(() => ({}));
    setError(body.error || "Algo falló. Reintenta.");
    setSubmitting(false);
  };

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-6 w-full max-w-2xl">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Sobre ti</h2>
        <PersonalSection values={s} onChange={patch} />
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Trabajo</h2>
        <WorkSection values={s} onChange={patch} />
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Portfolio</h2>
        <PortfolioSection values={s} onChange={patch} />
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Vídeo de prueba</h2>
        <VideoUploadSection
          onUploaded={(path, sizeMb) =>
            patch({ test_video_path: path, test_video_size_mb: sizeMb })
          }
        />
      </GlassCard>

      {error && (
        <div className="text-red-400 text-sm bg-red-950/30 border border-red-900/50 rounded-lg p-3">
          {error}
        </div>
      )}

      <button
        type="submit"
        disabled={!canSubmit || submitting}
        className="px-6 py-3 rounded-lg bg-white text-black font-medium hover:bg-white/90 disabled:opacity-40 disabled:cursor-not-allowed"
      >
        {submitting ? "Enviando…" : "Enviar candidatura"}
      </button>
    </form>
  );
}
```

- [ ] **Step 6: Update `app/page.tsx`** (landing + embed + form)

```tsx
import ApplicationForm from "@/components/form/ApplicationForm";

export default function Home() {
  return (
    <main className="min-h-screen flex flex-col items-center px-6 py-16 gap-12">
      <section className="max-w-2xl text-center flex flex-col gap-4">
        <h1 className="text-4xl md:text-6xl font-semibold tracking-tight">
          Busco editor de clips verticales para SOTO.IA
        </h1>
        <p className="text-white/70 text-lg">
          Vídeos de IA, programación con IA, vibe coding. Tono juvenil, semiviral,
          con zooms, subtítulos animados y motion graphics. Mira el reto:
        </p>
        <div className="aspect-video w-full overflow-hidden rounded-2xl border border-white/10">
          <iframe
            src="https://www.youtube-nocookie.com/embed/2pUKG8vIQLM"
            title="Vídeo de referencia SOTO.IA"
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
        <p className="text-white/70 text-sm">
          Edita un clip vertical de <strong>40–60 segundos</strong> desde ese vídeo y súbelo abajo.
        </p>
      </section>
      <ApplicationForm />
    </main>
  );
}
```

- [ ] **Step 7: Manual verify**

```bash
npm run dev
```

Visit `http://localhost:3000`. Confirm:
- Hero with the YouTube embed renders.
- 4 glass cards stacked (sobre ti, trabajo, portfolio, vídeo).
- Software toggles change appearance when clicked.
- Trying to submit with empty fields → button disabled.
- Selecting a 5s vídeo → error "debe durar entre 40 y 60 segundos".
- Selecting a 50s vídeo < 200 MB → "Subiendo…" → "Subido ✓".
- Submitting full valid form (with placeholder vídeo from step 9 testing) → redirect to /thanks (next task creates it; for now expect 404 after success).

- [ ] **Step 8: Commit**

```bash
git add components/form/ app/page.tsx
git commit -m "feat: public application form with sections and video upload"
```

---

## Task 11: Thanks page

**Files:**
- Create: `app/thanks/page.tsx`

- [ ] **Step 1: Create page**

```tsx
import GlassCard from "@/components/GlassCard";
import Link from "next/link";

export default function Thanks() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full text-center">
        <h1 className="text-3xl font-semibold mb-2">¡Candidatura recibida!</h1>
        <p className="text-white/70 mb-6">
          La revisaré en los próximos días. Si me encajas, te escribo al email o WhatsApp que pusiste.
        </p>
        <Link
          href="/"
          className="inline-block px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90"
        >
          Volver
        </Link>
      </GlassCard>
    </main>
  );
}
```

- [ ] **Step 2: Manual verify**

Visit `http://localhost:3000/thanks` → see thanks card.

- [ ] **Step 3: Commit**

```bash
git add app/thanks/
git commit -m "feat: thanks page after successful application"
```

---

## Task 12: Admin auth — login + middleware

**Files:**
- Create: `lib/supabase/middleware.ts`, `middleware.ts`, `app/admin/login/page.tsx`, `app/admin/layout.tsx`

- [ ] **Step 1: Enable Supabase magic link**

In Supabase dashboard → Authentication → Providers → Email → ensure "Enable Email provider" is on and "Confirm email" is off (magic link is enough).

- [ ] **Step 2: Add site URL to Supabase**

Authentication → URL Configuration → Site URL: `http://localhost:3000` (we'll add the Vercel URL during deploy).

- [ ] **Step 3: Create `lib/supabase/middleware.ts`**

```ts
import { createServerClient, type CookieOptions } from "@supabase/ssr";
import { NextRequest, NextResponse } from "next/server";

export function createSupabaseMiddlewareClient(req: NextRequest, res: NextResponse) {
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value;
        },
        set(name: string, value: string, options: CookieOptions) {
          res.cookies.set({ name, value, ...options });
        },
        remove(name: string, options: CookieOptions) {
          res.cookies.set({ name, value: "", ...options });
        },
      },
    }
  );
}
```

- [ ] **Step 4: Create root `middleware.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  if (!url.pathname.startsWith("/admin")) return NextResponse.next();
  if (url.pathname === "/admin/login" || url.pathname.startsWith("/admin/auth")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();

  if (!email || !ADMIN_EMAILS.includes(email)) {
    const redirect = url.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*"],
};
```

- [ ] **Step 5: Create `app/admin/login/page.tsx`**

```tsx
"use client";
import { useState } from "react";
import GlassCard from "@/components/GlassCard";
import { supabaseBrowser } from "@/lib/supabase/client";

export default function AdminLogin() {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSending(true);
    setError(null);
    const sb = supabaseBrowser();
    const { error } = await sb.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${window.location.origin}/admin` },
    });
    setSending(false);
    if (error) setError(error.message);
    else setSent(true);
  };

  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <GlassCard className="max-w-md w-full">
        <h1 className="text-2xl font-semibold mb-4">Admin · login</h1>
        {sent ? (
          <p className="text-white/80">Te he enviado un enlace mágico a {email}. Ábrelo desde este navegador.</p>
        ) : (
          <form onSubmit={onSubmit} className="flex flex-col gap-3">
            <input
              type="email"
              required
              placeholder="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
            />
            <button
              type="submit"
              disabled={sending}
              className="px-4 py-2 rounded-lg bg-white text-black hover:bg-white/90 disabled:opacity-50"
            >
              {sending ? "Enviando…" : "Enviarme magic link"}
            </button>
            {error && <div className="text-red-400 text-sm">{error}</div>}
          </form>
        )}
      </GlassCard>
    </main>
  );
}
```

- [ ] **Step 6: Create `app/admin/layout.tsx`** (placeholder; middleware does the auth gate)

```tsx
export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <div className="min-h-screen px-6 py-12">{children}</div>;
}
```

- [ ] **Step 7: Manual verify**

```bash
npm run dev
```

- Visit `http://localhost:3000/admin` (logged out) → redirects to `/admin/login`.
- Enter `pyneal.systems@gmail.com` → "Te he enviado un enlace mágico".
- Open the email from Supabase, click the link → lands on `/admin` (next task fills the page).
- Logout test: clear cookies → `/admin` again redirects to login.
- Try login with another email → after clicking the magic link, middleware redirects back to `/admin/login` (not in allowlist).

- [ ] **Step 8: Commit**

```bash
git add lib/supabase/middleware.ts middleware.ts app/admin/login/ app/admin/layout.tsx
git commit -m "feat: admin auth via supabase magic link + email allowlist middleware"
```

---

## Task 13: Admin — list applications + API

**Files:**
- Create: `app/api/admin/applications/route.ts`, `components/admin/ApplicationsTable.tsx`
- Modify: `app/admin/page.tsx`

- [ ] **Step 1: Create `app/api/admin/applications/route.ts`**

```ts
import { NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .select(
      "id, created_at, full_name, country, email, whatsapp, price_per_clip, currency, software, experience_years, status"
    )
    .order("created_at", { ascending: false });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ applications: data });
}
```

Note: middleware already enforces auth on `/admin/*`. We rely on the same matcher to gate `/api/admin/*`. Update matcher:

- [ ] **Step 2: Extend middleware matcher**

Edit `middleware.ts`, replace the `config` export:

```ts
export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

And inside the middleware function, also let `/api/admin` through the same auth check (it already does — the path check only excludes `/admin/login`, which we keep).

Update the early-return guard:

```ts
  if (!url.pathname.startsWith("/admin") && !url.pathname.startsWith("/api/admin")) {
    return NextResponse.next();
  }
  if (url.pathname === "/admin/login" || url.pathname.startsWith("/admin/auth")) {
    return NextResponse.next();
  }
```

For API failures, return 401 JSON instead of redirect:

```ts
  if (!email || !ADMIN_EMAILS.includes(email)) {
    if (url.pathname.startsWith("/api/admin")) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redirect = url.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }
```

Full updated `middleware.ts`:

```ts
import { NextRequest, NextResponse } from "next/server";
import { createSupabaseMiddlewareClient } from "@/lib/supabase/middleware";

const ADMIN_EMAILS = (process.env.ADMIN_EMAILS || "")
  .split(",")
  .map((s) => s.trim().toLowerCase())
  .filter(Boolean);

export async function middleware(req: NextRequest) {
  const url = req.nextUrl;
  const isAdminPage = url.pathname.startsWith("/admin");
  const isAdminApi = url.pathname.startsWith("/api/admin");
  if (!isAdminPage && !isAdminApi) return NextResponse.next();
  if (url.pathname === "/admin/login" || url.pathname.startsWith("/admin/auth")) {
    return NextResponse.next();
  }

  const res = NextResponse.next();
  const supabase = createSupabaseMiddlewareClient(req, res);
  const { data } = await supabase.auth.getUser();
  const email = data.user?.email?.toLowerCase();

  if (!email || !ADMIN_EMAILS.includes(email)) {
    if (isAdminApi) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const redirect = url.clone();
    redirect.pathname = "/admin/login";
    return NextResponse.redirect(redirect);
  }
  return res;
}

export const config = {
  matcher: ["/admin/:path*", "/api/admin/:path*"],
};
```

- [ ] **Step 3: Create `components/admin/ApplicationsTable.tsx`**

```tsx
"use client";
import Link from "next/link";

type Row = {
  id: string;
  created_at: string;
  full_name: string;
  country: string;
  email: string;
  whatsapp: string | null;
  price_per_clip: number;
  currency: "EUR" | "USD";
  software: string[];
  experience_years: number;
  status: "pending" | "shortlisted" | "rejected";
};

const STATUS_LABEL: Record<Row["status"], string> = {
  pending: "Pendiente",
  shortlisted: "Preseleccionado",
  rejected: "Descartado",
};

const STATUS_COLOR: Record<Row["status"], string> = {
  pending: "bg-white/10 text-white",
  shortlisted: "bg-green-500/20 text-green-300",
  rejected: "bg-red-500/20 text-red-300",
};

export default function ApplicationsTable({ rows }: { rows: Row[] }) {
  if (rows.length === 0) {
    return <div className="text-white/60">Aún no hay candidaturas.</div>;
  }
  return (
    <div className="overflow-x-auto rounded-2xl border border-white/10">
      <table className="w-full text-sm">
        <thead className="bg-white/5 text-white/70">
          <tr>
            <th className="text-left px-4 py-3">Fecha</th>
            <th className="text-left px-4 py-3">Nombre</th>
            <th className="text-left px-4 py-3">País</th>
            <th className="text-left px-4 py-3">Precio</th>
            <th className="text-left px-4 py-3">Software</th>
            <th className="text-left px-4 py-3">Exp.</th>
            <th className="text-left px-4 py-3">Estado</th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id} className="border-t border-white/5 hover:bg-white/5">
              <td className="px-4 py-3 text-white/70">
                {new Date(r.created_at).toLocaleDateString("es-ES")}
              </td>
              <td className="px-4 py-3">{r.full_name}</td>
              <td className="px-4 py-3">{r.country}</td>
              <td className="px-4 py-3">{r.price_per_clip} {r.currency}</td>
              <td className="px-4 py-3 text-white/70">{r.software.join(", ")}</td>
              <td className="px-4 py-3">{r.experience_years}a</td>
              <td className="px-4 py-3">
                <span className={`px-2 py-1 rounded-full text-xs ${STATUS_COLOR[r.status]}`}>
                  {STATUS_LABEL[r.status]}
                </span>
              </td>
              <td className="px-4 py-3">
                <Link
                  href={`/admin/${r.id}`}
                  className="px-3 py-1.5 rounded-lg bg-white text-black hover:bg-white/90"
                >
                  Ver
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/admin/page.tsx`**

```tsx
import GlassCard from "@/components/GlassCard";
import ApplicationsTable from "@/components/admin/ApplicationsTable";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminHome() {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .select(
      "id, created_at, full_name, country, email, whatsapp, price_per_clip, currency, software, experience_years, status"
    )
    .order("created_at", { ascending: false });

  if (error) {
    return (
      <main className="max-w-5xl mx-auto">
        <GlassCard><p className="text-red-400">Error: {error.message}</p></GlassCard>
      </main>
    );
  }

  return (
    <main className="max-w-6xl mx-auto flex flex-col gap-6">
      <h1 className="text-3xl font-semibold">Candidaturas</h1>
      <GlassCard>
        <ApplicationsTable rows={data || []} />
      </GlassCard>
    </main>
  );
}
```

- [ ] **Step 5: Manual verify**

- Submit one real application from the public form (use your own email + a 40–60s video).
- Visit `/admin` logged in → see the row.
- Visit `/admin` logged out → redirect to login.

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/ middleware.ts components/admin/ApplicationsTable.tsx app/admin/page.tsx
git commit -m "feat: admin list view + GET /api/admin/applications + middleware api guard"
```

---

## Task 14: Admin — application detail + status update + video signed read

**Files:**
- Create: `app/api/admin/applications/[id]/route.ts`, `app/api/admin/applications/[id]/video/route.ts`, `components/admin/ApplicationDetail.tsx`, `app/admin/[id]/page.tsx`

- [ ] **Step 1: Create `app/api/admin/applications/[id]/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";
import { StatusUpdateSchema } from "@/lib/schema";

export async function PATCH(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = StatusUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", issues: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const db = supabaseAdmin();
  const { error } = await db
    .from("applications")
    .update(parsed.data)
    .eq("id", params.id);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Create `app/api/admin/applications/[id]/video/route.ts`**

```ts
import { NextRequest, NextResponse } from "next/server";
import { supabaseAdmin } from "@/lib/supabase/server";

export async function GET(
  _req: NextRequest,
  { params }: { params: { id: string } }
) {
  const db = supabaseAdmin();
  const { data: app, error: appErr } = await db
    .from("applications")
    .select("test_video_path")
    .eq("id", params.id)
    .single();
  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });

  const { data, error } = await db.storage
    .from("test-videos")
    .createSignedUrl(app.test_video_path, 3600);

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ url: data.signedUrl });
}
```

- [ ] **Step 3: Create `components/admin/ApplicationDetail.tsx`**

```tsx
"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/GlassCard";

type App = {
  id: string;
  created_at: string;
  full_name: string;
  age: number;
  country: string;
  email: string;
  whatsapp: string | null;
  price_per_clip: number;
  currency: "EUR" | "USD";
  software: string[];
  experience_years: number;
  experience_text: string | null;
  work_links: { label: string; url: string }[];
  portfolio_url: string | null;
  test_video_path: string;
  test_video_size_mb: number | null;
  status: "pending" | "shortlisted" | "rejected";
  admin_notes: string | null;
};

export default function ApplicationDetail({ app }: { app: App }) {
  const router = useRouter();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [notes, setNotes] = useState(app.admin_notes || "");
  const [status, setStatus] = useState(app.status);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetch(`/api/admin/applications/${app.id}/video`)
      .then((r) => r.json())
      .then((d) => { if (!cancelled) setVideoUrl(d.url); });
    return () => { cancelled = true; };
  }, [app.id]);

  const save = async (newStatus: App["status"]) => {
    setSaving(true);
    const res = await fetch(`/api/admin/applications/${app.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status: newStatus, admin_notes: notes }),
    });
    setSaving(false);
    if (res.ok) {
      setStatus(newStatus);
      router.refresh();
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">{app.full_name}</h2>
        <dl className="grid grid-cols-3 gap-y-2 text-sm">
          <dt className="text-white/60">Email</dt><dd className="col-span-2">{app.email}</dd>
          {app.whatsapp && (<><dt className="text-white/60">WhatsApp</dt><dd className="col-span-2">{app.whatsapp}</dd></>)}
          <dt className="text-white/60">Edad</dt><dd className="col-span-2">{app.age}</dd>
          <dt className="text-white/60">País</dt><dd className="col-span-2">{app.country}</dd>
          <dt className="text-white/60">Precio</dt><dd className="col-span-2">{app.price_per_clip} {app.currency} / clip</dd>
          <dt className="text-white/60">Software</dt><dd className="col-span-2">{app.software.join(", ")}</dd>
          <dt className="text-white/60">Experiencia</dt><dd className="col-span-2">{app.experience_years} años</dd>
          {app.experience_text && (<><dt className="text-white/60">Sobre</dt><dd className="col-span-2 whitespace-pre-wrap">{app.experience_text}</dd></>)}
          {app.portfolio_url && (
            <><dt className="text-white/60">Portfolio</dt>
              <dd className="col-span-2"><a className="underline" href={app.portfolio_url} target="_blank" rel="noreferrer">{app.portfolio_url}</a></dd></>
          )}
          {app.work_links.length > 0 && (
            <><dt className="text-white/60">Trabajos</dt>
              <dd className="col-span-2 flex flex-col gap-1">
                {app.work_links.map((l, i) => (
                  <a key={i} className="underline" href={l.url} target="_blank" rel="noreferrer">{l.label}</a>
                ))}
              </dd></>
          )}
        </dl>
      </GlassCard>

      <GlassCard>
        <h2 className="text-xl font-semibold mb-4">Vídeo de prueba</h2>
        {videoUrl ? (
          <video src={videoUrl} controls className="w-full rounded-lg" />
        ) : (
          <div className="text-white/60">Cargando reproductor…</div>
        )}
        <div className="mt-4">
          <label className="block text-sm text-white/70 mb-1">Notas internas</label>
          <textarea
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            className="w-full bg-white/5 border border-white/10 rounded-lg px-3 py-2 outline-none focus:border-white/40"
          />
        </div>
        <div className="flex gap-2 mt-4">
          <button
            onClick={() => save("shortlisted")}
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${status === "shortlisted" ? "bg-green-500 text-black" : "bg-white/10 hover:bg-white/20"}`}
          >Preseleccionar</button>
          <button
            onClick={() => save("rejected")}
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${status === "rejected" ? "bg-red-500 text-black" : "bg-white/10 hover:bg-white/20"}`}
          >Descartar</button>
          <button
            onClick={() => save("pending")}
            disabled={saving}
            className={`px-4 py-2 rounded-lg ${status === "pending" ? "bg-white text-black" : "bg-white/10 hover:bg-white/20"}`}
          >Pendiente</button>
        </div>
      </GlassCard>
    </div>
  );
}
```

- [ ] **Step 4: Create `app/admin/[id]/page.tsx`**

```tsx
import { notFound } from "next/navigation";
import Link from "next/link";
import ApplicationDetail from "@/components/admin/ApplicationDetail";
import { supabaseAdmin } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

export default async function AdminDetail({ params }: { params: { id: string } }) {
  const db = supabaseAdmin();
  const { data, error } = await db
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .single();
  if (error || !data) notFound();

  return (
    <main className="max-w-6xl mx-auto flex flex-col gap-6">
      <Link href="/admin" className="text-white/60 hover:text-white text-sm">← Volver</Link>
      <ApplicationDetail app={data} />
    </main>
  );
}
```

- [ ] **Step 5: Manual verify**

- Visit `/admin` logged in, click "Ver" on a candidate.
- See full data + video player (loads after fetch).
- Click "Preseleccionar" → button turns green, go back to `/admin` → row shows "Preseleccionado".
- Edit notes, click "Pendiente" → notes persist, status changes.
- Logged out, hit `/api/admin/applications/<id>/video` directly → 401.

- [ ] **Step 6: Commit**

```bash
git add app/api/admin/applications/ components/admin/ApplicationDetail.tsx app/admin/\[id\]/
git commit -m "feat: admin detail page with video preview and status updates"
```

---

## Task 15: Deploy to Vercel

**Files:** (none added; only platform config)

- [ ] **Step 1: Push to GitHub**

User creates a new empty repo on GitHub under `sotoia` (e.g. `editores-soto`). Then:

```bash
git remote add origin git@github.com:sotoia/editores-soto.git
git branch -M main
git push -u origin main
```

- [ ] **Step 2: Import in Vercel**

Visit `https://vercel.com/new` under team `sotoia` → "Import Git Repository" → pick `sotoia/editores-soto` → use defaults (Next.js auto-detected).

- [ ] **Step 3: Add env vars in Vercel**

In project Settings → Environment Variables, add (for all environments: Production, Preview, Development):

```
NEXT_PUBLIC_SUPABASE_URL=https://pzpnmlifqqodqpdifcga.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<same as .env.local>
SUPABASE_SERVICE_ROLE_KEY=<same as .env.local>
ADMIN_EMAILS=pyneal.systems@gmail.com
```

Trigger redeploy.

- [ ] **Step 4: Add Vercel URL to Supabase Auth**

Once Vercel assigns the URL (e.g. `editores-soto.vercel.app`), in Supabase:
- Authentication → URL Configuration → Site URL: `https://editores-soto.vercel.app`
- Authentication → URL Configuration → Redirect URLs: add `https://editores-soto.vercel.app/admin`

- [ ] **Step 5: End-to-end manual verify in production**

1. Open `https://editores-soto.vercel.app` → form loads with gradient + glass.
2. Submit a real candidature with a 40–60s test video.
3. Visit `/admin` → log in → see candidature → open detail → play video → mark shortlist.
4. Try same email again → 409.

- [ ] **Step 6: Final commit (any deploy tweaks) and tag**

```bash
git commit --allow-empty -m "deploy: MVP2 live on vercel"
git tag v0.1.0
git push --tags
```

---

## Post-launch (NOT in this plan)

- Rotate Supabase keys (the ones pasted in chat) and update Vercel + `.env.local`.
- MVP3: Claude API preselection endpoint reading form data → `ai_score` + `ai_notes`.
- Optional: notify candidate on status change, CSV export, custom domain.
