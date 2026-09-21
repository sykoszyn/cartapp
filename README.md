# Fideliza

Plataforma de fidelización para restaurantes, cafeterías y locales de take away.
Los comercios cargan su negocio y sus productos, configuran su propio programa
de puntos y publican sus descuentos (día, tarjeta/banco/app, banner). Los
clientes se registran, suman puntos con un código de socio, canjean
recompensas y ven los descuentos vigentes.

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase
(Auth, Postgres, Storage)**, pensado para desplegarse en **Vercel**.

## 1. Crear el proyecto en Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor** y ejecutá el contenido completo de
   [`supabase/migrations/0001_init.sql`](./supabase/migrations/0001_init.sql).
   Esto crea:
   - Las tablas (`profiles`, `businesses`, `products`, `rewards`,
     `discounts`, `customer_points`, `points_transactions`).
   - El trigger que crea el `profile` automáticamente al registrarse
     (con `role` y un `member_code` único para clientes).
   - Las funciones `add_points_by_member_code` y `redeem_reward`
     (RPC que usa la app para sumar y canjear puntos de forma segura).
   - Todas las políticas de **Row Level Security**.
   - El bucket público de Storage `media` (logos, portadas, fotos de
     productos/recompensas y banners de descuentos), con políticas para que
     cada usuario sólo pueda escribir dentro de su propia carpeta.
3. En **Authentication → Settings**, si querés que las cuentas nuevas puedan
   ingresar sin confirmar el email (más simple para probar), desactivá
   "Confirm email". Si la dejás activa, el usuario recibe un mail de
   confirmación y la app se lo indica.
4. Copiá la **URL del proyecto** y la **anon key** desde
   **Project Settings → API**.

## 2. Variables de entorno

Copiá `.env.example` a `.env.local` y completá:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
```

## 3. Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 4. Deploy en Vercel

1. Importá el repo en [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (se detecta solo).
3. Cargá las mismas variables de entorno (`NEXT_PUBLIC_SUPABASE_URL`,
   `NEXT_PUBLIC_SUPABASE_ANON_KEY`) en **Settings → Environment Variables**.
4. Deploy. No hace falta configuración adicional: no usa runtimes especiales
   ni build steps extra.

## Cómo funciona el modelo de datos

- **Comercio**: crea su negocio (`businesses`), carga productos
  (`products`), define su programa de puntos directamente en la tabla
  `businesses` (`points_per_amount` puntos cada `amount_per_point` de
  moneda gastada, con una etiqueta configurable como "puntos", "sellos",
  "estrellas") y arma su catálogo de canje (`rewards`) y sus descuentos
  (`discounts`, con días de la semana, medio de pago/banco/app y banner).
- **Cliente**: al registrarse recibe un `member_code` único. Lo muestra en
  el comercio, que carga el monto de la compra desde su panel — la función
  `add_points_by_member_code` calcula los puntos según la configuración de
  ese negocio y actualiza el saldo (`customer_points`) y el historial
  (`points_transactions`).
- **Canje**: el cliente canjea una recompensa desde la ficha pública del
  comercio; la función `redeem_reward` valida el saldo, descuenta stock si
  corresponde y registra el movimiento.
- Todo el acceso a datos pasa por **RLS**: un comercio sólo puede
  editar lo suyo, un cliente sólo ve su propio saldo/código, y las
  operaciones sensibles (sumar/canjear puntos) sólo ocurren a través de las
  funciones `security definer`, nunca con updates directos desde el cliente.

## Estructura del proyecto

```
app/
  page.tsx                 → landing
  (auth)/ingresar, registro → login / registro con selección de rol
  explorar/                → búsqueda pública de comercios
  negocio/[slug]/          → ficha pública: productos, recompensas, descuentos
  cuenta/                  → perfil del cliente, código de socio, saldos
  panel/                   → dashboard del comercio
    negocio/               → datos del negocio (logo, portada, dirección...)
    productos/              → CRUD de productos con foto y precio
    recompensas/            → catálogo de canje
    descuentos/             → días + medio de pago + banner
    puntos/                 → configuración del programa + carga manual de puntos
lib/
  supabase/               → clientes (browser, server, middleware)
  auth.ts, storage.ts, types.ts, database.types.ts
supabase/migrations/      → esquema SQL completo
```

## Notas de seguridad

- El proyecto está fijado a `next@14.2.35`, el último patch disponible de la
  rama 14. `npm audit` sigue reportando avisos de Next.js que Vercel sólo
  resolvió a partir de la rama 16 (requiere migrar a APIs asíncronas de
  `cookies()`/`params`/`searchParams` y React 19). Para producción con
  tráfico real, planeá esa migración a Next 15/16 más adelante.
