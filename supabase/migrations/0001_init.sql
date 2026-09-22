-- ============================================================================
-- Fideliza — esquema inicial
-- Ejecutar en el SQL Editor de Supabase (o via `supabase db push`).
-- ============================================================================

create extension if not exists "uuid-ossp";

-- ----------------------------------------------------------------------------
-- Tipos
-- ----------------------------------------------------------------------------
create type user_role as enum ('business', 'customer');
create type discount_day as enum ('lunes','martes','miercoles','jueves','viernes','sabado','domingo');
create type transaction_type as enum ('earn', 'redeem', 'adjustment');

-- ----------------------------------------------------------------------------
-- profiles — extiende auth.users
-- ----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  role user_role not null,
  full_name text not null default '',
  phone text,
  avatar_url text,
  member_code text unique,
  created_at timestamptz not null default now()
);

create index profiles_member_code_idx on public.profiles (member_code);

-- ----------------------------------------------------------------------------
-- businesses
-- ----------------------------------------------------------------------------
create table public.businesses (
  id uuid primary key default uuid_generate_v4(),
  owner_id uuid not null references public.profiles(id) on delete cascade,
  name text not null,
  slug text not null unique,
  category text,
  description text,
  logo_url text,
  cover_url text,
  address text,
  phone text,
  schedule text,
  -- programa de puntos, 100% configurable por el comercio:
  -- el cliente gana `points_per_amount` puntos por cada `amount_per_point`
  -- unidades de moneda gastadas.
  points_per_amount numeric not null default 1,
  amount_per_point numeric not null default 10,
  points_label text not null default 'puntos',
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index businesses_owner_idx on public.businesses (owner_id);
create index businesses_slug_idx on public.businesses (slug);

-- ----------------------------------------------------------------------------
-- products
-- ----------------------------------------------------------------------------
create table public.products (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  price numeric not null default 0,
  image_url text,
  category text,
  active boolean not null default true,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index products_business_idx on public.products (business_id);

-- ----------------------------------------------------------------------------
-- rewards — catálogo de canje del programa de puntos
-- ----------------------------------------------------------------------------
create table public.rewards (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  description text,
  points_cost int not null default 0,
  image_url text,
  stock int,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index rewards_business_idx on public.rewards (business_id);

-- ----------------------------------------------------------------------------
-- discounts — "qué día hay descuentos, con qué tarjeta/app/banco"
-- ----------------------------------------------------------------------------
create table public.discounts (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  title text not null,
  description text,
  days discount_day[] not null default '{}',
  payment_method text,
  banner_url text,
  active boolean not null default true,
  created_at timestamptz not null default now()
);

create index discounts_business_idx on public.discounts (business_id);

-- ----------------------------------------------------------------------------
-- customer_points — saldo por cliente y comercio
-- ----------------------------------------------------------------------------
create table public.customer_points (
  customer_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  points int not null default 0,
  updated_at timestamptz not null default now(),
  primary key (customer_id, business_id)
);

-- ----------------------------------------------------------------------------
-- points_transactions — historial (ledger)
-- ----------------------------------------------------------------------------
create table public.points_transactions (
  id uuid primary key default uuid_generate_v4(),
  customer_id uuid not null references public.profiles(id) on delete cascade,
  business_id uuid not null references public.businesses(id) on delete cascade,
  type transaction_type not null,
  points int not null,
  amount numeric,
  reward_id uuid references public.rewards(id) on delete set null,
  note text,
  created_by uuid references public.profiles(id),
  created_at timestamptz not null default now()
);

create index points_transactions_customer_idx on public.points_transactions (customer_id, business_id);
create index points_transactions_business_idx on public.points_transactions (business_id);

-- ============================================================================
-- Trigger: crear perfil automáticamente al registrarse
-- ============================================================================
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role user_role;
  v_code text;
begin
  v_role := coalesce((new.raw_user_meta_data->>'role')::user_role, 'customer');

  if v_role = 'customer' then
    v_code := upper(substr(replace(uuid_generate_v4()::text, '-', ''), 1, 7));
  end if;

  insert into public.profiles (id, role, full_name, member_code)
  values (
    new.id,
    v_role,
    coalesce(new.raw_user_meta_data->>'full_name', ''),
    v_code
  );
  return new;
end;
$$ language plpgsql security definer set search_path = public;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ============================================================================
-- RPC: agregar puntos a un cliente por código de socio (usado por el comercio)
-- ============================================================================
create or replace function public.add_points_by_member_code(
  p_business_id uuid,
  p_member_code text,
  p_amount numeric,
  p_note text default null
)
returns table(points_added int, new_balance int, customer_name text)
as $$
declare
  v_customer_id uuid;
  v_customer_name text;
  v_business public.businesses%rowtype;
  v_points int;
  v_new_balance int;
begin
  select * into v_business
  from public.businesses
  where id = p_business_id and owner_id = auth.uid();

  if not found then
    raise exception 'No autorizado para este comercio';
  end if;

  select id, full_name into v_customer_id, v_customer_name
  from public.profiles
  where member_code = upper(trim(p_member_code)) and role = 'customer';

  if not found then
    raise exception 'No se encontró un cliente con ese código';
  end if;

  if p_amount is null or p_amount <= 0 then
    raise exception 'El monto debe ser mayor a cero';
  end if;

  v_points := floor(p_amount / nullif(v_business.amount_per_point, 0) * v_business.points_per_amount);

  if v_points <= 0 then
    raise exception 'Ese monto no genera puntos con la configuración actual';
  end if;

  insert into public.points_transactions (customer_id, business_id, type, points, amount, note, created_by)
  values (v_customer_id, p_business_id, 'earn', v_points, p_amount, p_note, auth.uid());

  insert into public.customer_points (customer_id, business_id, points)
  values (v_customer_id, p_business_id, v_points)
  on conflict (customer_id, business_id)
  do update set points = public.customer_points.points + excluded.points, updated_at = now();

  select points into v_new_balance
  from public.customer_points
  where customer_id = v_customer_id and business_id = p_business_id;

  return query select v_points, v_new_balance, v_customer_name;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================================
-- RPC: canjear una recompensa (usado por el cliente)
-- ============================================================================
create or replace function public.redeem_reward(p_reward_id uuid)
returns table(new_balance int)
as $$
declare
  v_reward public.rewards%rowtype;
  v_balance int;
begin
  if auth.uid() is null then
    raise exception 'Debés iniciar sesión';
  end if;

  select * into v_reward from public.rewards where id = p_reward_id and active = true;
  if not found then
    raise exception 'Recompensa no disponible';
  end if;

  select points into v_balance
  from public.customer_points
  where customer_id = auth.uid() and business_id = v_reward.business_id;

  v_balance := coalesce(v_balance, 0);

  if v_balance < v_reward.points_cost then
    raise exception 'No tenés puntos suficientes para este canje';
  end if;

  if v_reward.stock is not null then
    if v_reward.stock <= 0 then
      raise exception 'Esta recompensa está agotada';
    end if;
    update public.rewards set stock = stock - 1 where id = v_reward.id;
  end if;

  insert into public.points_transactions (customer_id, business_id, type, points, reward_id, created_by)
  values (auth.uid(), v_reward.business_id, 'redeem', -v_reward.points_cost, v_reward.id, auth.uid());

  update public.customer_points
  set points = points - v_reward.points_cost, updated_at = now()
  where customer_id = auth.uid() and business_id = v_reward.business_id;

  select points into v_balance
  from public.customer_points
  where customer_id = auth.uid() and business_id = v_reward.business_id;

  return query select v_balance;
end;
$$ language plpgsql security definer set search_path = public;

-- ============================================================================
-- Row Level Security
-- ============================================================================
alter table public.profiles enable row level security;
alter table public.businesses enable row level security;
alter table public.products enable row level security;
alter table public.rewards enable row level security;
alter table public.discounts enable row level security;
alter table public.customer_points enable row level security;
alter table public.points_transactions enable row level security;

-- profiles
create policy "profiles_select_own" on public.profiles
  for select using (id = auth.uid());

create policy "profiles_update_own" on public.profiles
  for update using (id = auth.uid());

-- permite que un usuario cree su propia fila si el trigger no llegó a
-- crearla (ver migración 0002 para instalaciones que ya corrieron esto)
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());

-- un comercio puede ver el nombre de los clientes que ya sumaron puntos con él
-- (para mostrar el historial de movimientos con nombre y no sólo el id).
create policy "profiles_select_by_business_owner" on public.profiles
  for select using (
    exists (
      select 1
      from public.customer_points cp
      join public.businesses b on b.id = cp.business_id
      where cp.customer_id = profiles.id and b.owner_id = auth.uid()
    )
  );

-- businesses: lectura pública de negocios activos, dueño ve/edita el suyo
create policy "businesses_select_public" on public.businesses
  for select using (active = true or owner_id = auth.uid());

create policy "businesses_insert_owner" on public.businesses
  for insert with check (owner_id = auth.uid());

create policy "businesses_update_owner" on public.businesses
  for update using (owner_id = auth.uid());

create policy "businesses_delete_owner" on public.businesses
  for delete using (owner_id = auth.uid());

-- products
create policy "products_select_public" on public.products
  for select using (
    active = true
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "products_insert_owner" on public.products
  for insert with check (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "products_update_owner" on public.products
  for update using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "products_delete_owner" on public.products
  for delete using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- rewards
create policy "rewards_select_public" on public.rewards
  for select using (
    active = true
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "rewards_insert_owner" on public.rewards
  for insert with check (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "rewards_update_owner" on public.rewards
  for update using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "rewards_delete_owner" on public.rewards
  for delete using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- discounts
create policy "discounts_select_public" on public.discounts
  for select using (
    active = true
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "discounts_insert_owner" on public.discounts
  for insert with check (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "discounts_update_owner" on public.discounts
  for update using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "discounts_delete_owner" on public.discounts
  for delete using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- customer_points: el cliente ve lo suyo, el comercio ve lo de su negocio
create policy "customer_points_select" on public.customer_points
  for select using (
    customer_id = auth.uid()
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- points_transactions: idem. Los inserts/updates sólo ocurren vía RPC (security definer).
create policy "points_transactions_select" on public.points_transactions
  for select using (
    customer_id = auth.uid()
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- ============================================================================
-- Storage: bucket público "media" para logos, portadas, productos, recompensas
-- y banners de descuentos. Cada usuario sólo puede escribir dentro de su
-- propia carpeta ({auth.uid()}/...), la lectura es pública.
-- ============================================================================
insert into storage.buckets (id, name, public)
values ('media', 'media', true)
on conflict (id) do nothing;

create policy "media_select_public" on storage.objects
  for select using (bucket_id = 'media');

create policy "media_insert_own_folder" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "media_update_own_folder" on storage.objects
  for update to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);

create policy "media_delete_own_folder" on storage.objects
  for delete to authenticated
  using (bucket_id = 'media' and (storage.foldername(name))[1] = auth.uid()::text);
