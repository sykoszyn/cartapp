-- add_points_by_member_code ahora también devuelve el customer_id (lo
-- necesitamos para poder avisarle al cliente por email que sumó puntos).
-- Postgres no permite cambiar el tipo de retorno de una función existente
-- con CREATE OR REPLACE, así que hay que borrarla y volver a crearla.
drop function if exists public.add_points_by_member_code(uuid, text, numeric, text);

create function public.add_points_by_member_code(
  p_business_id uuid,
  p_member_code text,
  p_amount numeric,
  p_note text default null
)
returns table(points_added int, new_balance int, customer_name text, customer_id uuid)
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

  return query select v_points, v_new_balance, v_customer_name, v_customer_id;
end;
$$ language plpgsql security definer set search_path = public;
