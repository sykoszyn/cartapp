-- ============================================================================
-- Categorías de menú configurables por comercio (ej: "Desayunos y
-- meriendas", "Almuerzos", "Cenas", "Promos mediodía", "Promos noche"...).
-- Cada comercio define las suyas; reemplaza el campo de texto libre
-- `products.category` por una relación a esta tabla.
-- ============================================================================

create table public.product_categories (
  id uuid primary key default uuid_generate_v4(),
  business_id uuid not null references public.businesses(id) on delete cascade,
  name text not null,
  sort_order int not null default 0,
  created_at timestamptz not null default now()
);

create index product_categories_business_idx on public.product_categories (business_id);

alter table public.product_categories enable row level security;

create policy "product_categories_select_public" on public.product_categories
  for select using (
    business_id in (select id from public.businesses where active = true)
    or business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "product_categories_insert_owner" on public.product_categories
  for insert with check (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "product_categories_update_owner" on public.product_categories
  for update using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

create policy "product_categories_delete_owner" on public.product_categories
  for delete using (
    business_id in (select id from public.businesses where owner_id = auth.uid())
  );

-- Migra las categorías de texto libre existentes a filas reales, preservando
-- los productos ya cargados.
insert into public.product_categories (business_id, name)
select distinct business_id, category
from public.products
where category is not null and trim(category) <> ''
on conflict do nothing;

alter table public.products
  add column category_id uuid references public.product_categories(id) on delete set null;

update public.products p
set category_id = pc.id
from public.product_categories pc
where pc.business_id = p.business_id
  and pc.name = p.category;

alter table public.products drop column category;
