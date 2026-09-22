-- ============================================================================
-- Pedidos online: el cliente arma el pedido desde la carta y paga con
-- Mercado Pago (QR o tarjeta, lo resuelve el checkout de Mercado Pago), o el
-- comercio lo confirma manualmente (efectivo en el local). En ambos casos,
-- al quedar pagado se suman los puntos automáticamente.
-- ============================================================================

create type order_status as enum ('pending', 'paid', 'cancelled');

create table public.orders (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  customer_id uuid not null references public.profiles(id) on delete cascade,
  status order_status not null default 'pending',
  subtotal numeric not null default 0,
  note text,
  mp_preference_id text,
  mp_payment_id text,
  created_at timestamptz not null default now(),
  paid_at timestamptz
);

create index orders_business_idx on public.orders (business_id, created_at desc);
create index orders_customer_idx on public.orders (customer_id, created_at desc);

create table public.order_items (
  id uuid primary key default uuid_generate_v4(),
  order_id uuid not null references public.orders(id) on delete cascade,
  product_id uuid references public.products(id) on delete set null,
  name text not null,
  unit_price numeric not null,
  quantity int not null default 1
);

create index order_items_order_idx on public.order_items (order_id);

-- Credenciales de Mercado Pago propias de cada comercio (nunca compartidas:
-- cada negocio cobra a su propia cuenta). Sólo el dueño puede leerlas o
-- escribirlas; no hay policy pública para esta tabla.
create table public.business_payment_settings (
  business_id uuid primary key references public.businesses(id) on delete cascade,
  mp_access_token text,
  updated_at timestamptz not null default now()
);

alter table public.businesses add column plan text not null default 'free';

-- ============================================================================
-- RLS
-- ============================================================================
alter table public.orders enable row level security;
alter table public.order_items enable row level security;
alter table public.business_payment_settings enable row level security;

create policy "orders_select" on public.orders
  for select using (
    customer_id = auth.uid()
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "orders_insert_customer" on public.orders
  for insert with check (customer_id = auth.uid());

create policy "orders_update_own" on public.orders
  for update using (
    customer_id = auth.uid()
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "order_items_select" on public.order_items
  for select using (
    order_id in (
      select id from public.orders
      where customer_id = auth.uid()
        or business_id in (select id from public.businesses where owner_id = auth.uid())
    )
  );

create policy "order_items_insert_customer" on public.order_items
  for insert with check (
    order_id in (select id from public.orders where customer_id = auth.uid())
  );

-- un comercio también puede ver el nombre de un cliente que le hizo un
-- pedido, aunque todavía no tenga puntos acumulados con él (primera compra)
create policy "profiles_select_by_order" on public.profiles
  for select using (
    exists (
      select 1
      from public.orders o
      join public.businesses b on b.id = o.business_id
      where o.customer_id = profiles.id and b.owner_id = auth.uid()
    )
  );

create policy "payment_settings_owner_all" on public.business_payment_settings
  for all using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  )
  with check (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

grant select, insert, update, delete on public.orders to authenticated;
grant select, insert, update, delete on public.order_items to authenticated;
grant select, insert, update, delete on public.business_payment_settings to authenticated;

-- ============================================================================
-- RPC: confirma un pedido como pagado y otorga los puntos correspondientes.
-- La puede llamar el dueño del comercio (confirmación manual, ej. pago en
-- efectivo) o el webhook de Mercado Pago usando la service_role key (sin
-- sesión de usuario). Es idempotente: si el pedido ya estaba pagado, no
-- hace nada.
-- ============================================================================
create or replace function public.award_points_for_order(p_order_id uuid)
returns table(points_added int, new_balance int)
as $$
declare
  v_order public.orders%rowtype;
  v_business public.businesses%rowtype;
  v_points int;
  v_new_balance int;
begin
  select * into v_order from public.orders where id = p_order_id;
  if not found then
    raise exception 'Pedido no encontrado';
  end if;

  select * into v_business from public.businesses where id = v_order.business_id;

  if auth.role() = 'service_role' then
    -- llamada de confianza servidor-a-servidor (webhook de pagos)
    null;
  elsif auth.role() = 'authenticated' and auth.uid() = v_business.owner_id then
    -- confirmación manual del dueño del comercio
    null;
  else
    raise exception 'No autorizado';
  end if;

  if v_order.status = 'paid' then
    -- ya procesado antes (ej. reintento del webhook): no duplicar puntos
    select points into v_new_balance
    from public.customer_points
    where customer_id = v_order.customer_id and business_id = v_order.business_id;
    return query select 0, coalesce(v_new_balance, 0);
    return;
  end if;

  v_points := floor(
    v_order.subtotal / nullif(v_business.amount_per_point, 0) * v_business.points_per_amount
  );
  v_points := greatest(v_points, 0);

  update public.orders set status = 'paid', paid_at = now() where id = p_order_id;

  if v_points > 0 then
    insert into public.points_transactions (customer_id, business_id, type, points, amount, note)
    values (v_order.customer_id, v_order.business_id, 'earn', v_points, v_order.subtotal, 'Pedido online');

    insert into public.customer_points (customer_id, business_id, points)
    values (v_order.customer_id, v_order.business_id, v_points)
    on conflict (customer_id, business_id)
    do update set points = public.customer_points.points + excluded.points, updated_at = now();
  end if;

  select points into v_new_balance
  from public.customer_points
  where customer_id = v_order.customer_id and business_id = v_order.business_id;

  return query select v_points, coalesce(v_new_balance, 0);
end;
$$ language plpgsql security definer set search_path = public;
