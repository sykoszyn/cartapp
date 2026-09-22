# qrcartapp

Plataforma de fidelización para restaurantes, cafeterías y locales de take away.
Los comercios cargan su negocio y sus productos, configuran su propio programa
de puntos y publican sus descuentos (día, tarjeta/banco/app, banner). Los
clientes se registran, suman puntos con un código de socio, canjean
recompensas y ven los descuentos vigentes.

Stack: **Next.js 14 (App Router) + TypeScript + Tailwind CSS + Supabase
(Auth, Postgres, Storage)**, pensado para desplegarse en **Vercel**.

## 1. Crear el proyecto en Supabase

1. Creá un proyecto en [supabase.com](https://supabase.com).
2. Andá a **SQL Editor** y ejecutá, en orden, **todos** los archivos de
   [`supabase/migrations/`](./supabase/migrations/) (0001 a 0007, en orden —
   cada uno depende del anterior). En conjunto crean:
   - Las tablas (`profiles`, `businesses`, `products`, `product_categories`,
     `rewards`, `discounts`, `customer_points`, `points_transactions`,
     `orders`, `order_items`, `business_payment_settings`).
   - El trigger que crea el `profile` automáticamente al registrarse
     (con `role` y un `member_code` único para clientes).
   - Las funciones `add_points_by_member_code`, `redeem_reward` y
     `award_points_for_order` (RPC que usa la app para sumar/canjear puntos
     de forma segura, ya sea por carga manual o por un pedido pagado).
   - Todas las políticas de **Row Level Security** y los permisos base del
     esquema `public`.
   - El bucket público de Storage `media` (logos, portadas, fotos de
     productos/recompensas y banners de descuentos), con políticas para que
     cada usuario sólo pueda escribir dentro de su propia carpeta.
3. En **Authentication → Settings**, si querés que las cuentas nuevas puedan
   ingresar sin confirmar el email (más simple para probar), desactivá
   "Confirm email". Si la dejás activa, el usuario recibe un mail de
   confirmación y la app se lo indica.
4. En **Authentication → URL Configuration** configurá:
   - **Site URL**: la URL de tu deploy, ej. `https://qrcartapp.vercel.app`
   - **Redirect URLs**: agregá `https://qrcartapp.vercel.app/**` y, para
     poder probar en tu máquina, también `http://localhost:3000/**`.

   Esto es lo que hace que el link del mail de confirmación (y cualquier
   redirect de auth) apunte a tu sitio y no a un dominio por defecto.
5. Copiá la **URL del proyecto**, la **anon/publishable key** y la
   **service_role/secret key** desde **Project Settings → API**.

## 2. Variables de entorno

Copiá `.env.example` a `.env.local` y completá:

```
NEXT_PUBLIC_SUPABASE_URL=https://tu-proyecto.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=tu-anon-key
NEXT_PUBLIC_SITE_URL=https://qrcartapp.vercel.app
SUPABASE_SERVICE_ROLE_KEY=tu-service-role-o-secret-key

# Opcional: sin esto la app funciona igual, sólo no se envían emails
RESEND_API_KEY=
EMAIL_FROM="qrcartapp <notificaciones@tudominio.com>"
```

- `NEXT_PUBLIC_SITE_URL` es la URL pública del sitio; se usa para armar el
  link de confirmación de email y las URLs de vuelta de Mercado Pago. En
  local podés dejarla en `http://localhost:3000`.
- `SUPABASE_SERVICE_ROLE_KEY` **nunca** lleva el prefijo `NEXT_PUBLIC_` (no
  debe llegar nunca al navegador). La usa exclusivamente el webhook de
  Mercado Pago (`app/api/webhooks/mercadopago/route.ts`) para confirmar un
  pago y sumar los puntos sin depender de una sesión de usuario.
- `RESEND_API_KEY` habilita los emails (sumaste puntos, canjeaste una
  recompensa, tenés un pedido nuevo). Sacás una key gratis en
  [resend.com](https://resend.com). Si la dejás vacía, la app funciona
  igual: sólo deja un log en vez de mandar el email.

## 3. Correr en local

```bash
npm install
npm run dev
```

Abrí [http://localhost:3000](http://localhost:3000).

## 4. Deploy en Vercel

1. Importá el repo en [vercel.com/new](https://vercel.com/new).
2. Framework preset: **Next.js** (se detecta solo).
3. Cargá las mismas variables de entorno de arriba en
   **Settings → Environment Variables**. `NEXT_PUBLIC_SITE_URL` tiene que
   ser la URL final del deploy (ej. `https://qrcartapp.vercel.app`), la
   misma que configuraste como Site URL en Supabase.
4. Deploy. No hace falta configuración adicional: no usa runtimes especiales
   ni build steps extra.

## 5. Pedidos y pagos con Mercado Pago

Cada comercio conecta **su propia** cuenta de Mercado Pago desde
`/panel/pagos`. El dinero entra directo a la cuenta del comercio: qrcartapp
nunca lo recibe ni lo retiene.

Con eso conectado, el cliente arma su pedido desde el menú, va a pagar con
el Checkout de Mercado Pago (que ofrece QR y tarjeta) y al aprobarse el pago,
un webhook (`/api/webhooks/mercadopago`) confirma el estado real contra la
API de Mercado Pago y suma los puntos solo. No hace falta configurar nada a
mano en el dashboard de Mercado Pago: la URL de notificación se manda
automáticamente en cada pedido.

Si un comercio todavía no conectó Mercado Pago, el pedido se registra igual
como "pago en el local": el cliente ve su código de socio para mostrar en
el mostrador, y el comercio lo confirma manualmente desde `/panel/pedidos`
(eso también suma los puntos).

### Conectar con un click (OAuth) — opcional pero recomendado

Por defecto, cada comercio conecta pegando su Access Token a mano (lo sacan
de su cuenta de Mercado Pago → Tu negocio → Configuración → Credenciales).
Funciona perfecto, pero si preferís que sea un solo click ("Conectar con
Mercado Pago" → inicia sesión → acepta → vuelve solo, sin copiar nada), hay
que crear **una aplicación de Mercado Pago para toda la plataforma** (se
hace una sola vez, no por comercio):

1. Entrá a tu cuenta de Mercado Pago → panel de desarrolladores → **Tus
   integraciones** → **Crear aplicación**. Elegí que vas a operar como
   marketplace/plataforma (necesitás poder configurar una **Redirect URI**).
2. Como Redirect URI cargá `https://tu-dominio/api/mercadopago/oauth/callback`
   (con tu dominio real, ej. `https://qrcartapp.vercel.app/...`).
3. Copiá el **Client ID** y el **Client Secret** de esa aplicación y
   cargalos en Vercel como `MERCADOPAGO_CLIENT_ID` y
   `MERCADOPAGO_CLIENT_SECRET`.

En cuanto esas dos variables estén cargadas, `/panel/pagos` muestra el botón
"Conectar con Mercado Pago" automáticamente (el formulario para pegar el
token a mano sigue ahí también, como alternativa). Los tokens que da este
flujo vencen cada tanto; la app los renueva sola con el refresh token, sin
que el comercio tenga que hacer nada.

## 6. Importar menú de otra plataforma (opcional)

Un comercio que ya tiene su carta en otro lado (otra app de pedidos, su
propia web, una red social) puede pegar el link en `/panel/productos/importar`
en vez de cargar todo a mano. La app baja el contenido de esa página, y usa
la API de Claude para leerlo y estructurarlo en categorías y productos con
precio — funciona sea cual sea la plataforma de origen, porque no depende de
un scraper hecho a medida por sitio, sino de que un modelo lea el texto. El
comercio revisa lo que se encontró (con checkboxes para descartar lo que no
sirva) antes de que se cree nada.

Requiere una `ANTHROPIC_API_KEY` (se saca en
[console.anthropic.com](https://console.anthropic.com)). Sin esa variable,
la sección lo indica y no rompe nada más.

Una limitación real: si el link es de una página que arma el menú
enteramente con JavaScript (varias apps de pedidos hacen esto), bajar el
HTML crudo puede no traer el contenido. Para esos casos, el mismo formulario
tiene un campo para pegar el texto del menú directamente — copiado de la
otra página, de un PDF, de donde sea — y funciona igual de bien.

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
- **Pedidos**: el cliente arma un carrito (`orders` + `order_items`) desde
  el menú. Al pagarse (por Mercado Pago o confirmación manual del comercio),
  `award_points_for_order` suma los puntos automáticamente — es la misma
  idea que `add_points_by_member_code`, pero disparada por un pedido en vez
  de por un monto tipeado a mano.
- Todo el acceso a datos pasa por **RLS**: un comercio sólo puede
  editar lo suyo, un cliente sólo ve su propio saldo/código, y las
  operaciones sensibles (sumar/canjear puntos) sólo ocurren a través de las
  funciones `security definer`, nunca con updates directos desde el cliente.
  La única excepción es el webhook de Mercado Pago, que corre server-side
  con la `service_role` key porque no hay una sesión de usuario detrás.

## Estructura del proyecto

```
app/
  page.tsx                 → landing
  (auth)/ingresar, registro → login / registro con selección de rol
  explorar/                → búsqueda pública de comercios
  negocio/[slug]/          → ficha pública: productos, recompensas, descuentos
    carrito/               → revisión del pedido + checkout
    pedido/[orderId]/      → estado del pedido (pagado / a confirmar)
  cuenta/                  → perfil del cliente, código de socio, saldos
  api/webhooks/mercadopago/ → confirma pagos y suma puntos
  panel/                   → dashboard del comercio
    analytics/             → ingresos, productos más pedidos, puntos pendientes
    negocio/               → datos del negocio (logo, portada, dirección...)
    productos/              → CRUD de productos con foto y precio
      importar/             → importar menú desde un link (o texto pegado)
    categorias/             → categorías de menú propias de cada comercio
    pedidos/                → pedidos entrantes, confirmar pago manual
    recompensas/            → catálogo de canje
    descuentos/             → días + medio de pago + banner
    puntos/                 → configuración del programa + carga manual de puntos
    pagos/                  → conectar Mercado Pago
    qr/                     → código QR imprimible del negocio
lib/
  supabase/               → clientes (browser, server, middleware, admin/service_role)
  mercadopago.ts, email.ts, notifications.ts
  auth.ts, storage.ts, types.ts, database.types.ts
components/cart/          → carrito (context + localStorage por negocio)
supabase/migrations/      → esquema SQL completo
```

## Notas de seguridad

- El proyecto está fijado a `next@14.2.35`, el último patch disponible de la
  rama 14. `npm audit` sigue reportando avisos de Next.js que Vercel sólo
  resolvió a partir de la rama 16 (requiere migrar a APIs asíncronas de
  `cookies()`/`params`/`searchParams` y React 19). Para producción con
  tráfico real, planeá esa migración a Next 15/16 más adelante.
