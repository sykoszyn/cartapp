-- Permite que un usuario autenticado cree su propia fila en `profiles`
-- (id = auth.uid()) si por algún motivo no la creó el trigger
-- `on_auth_user_created` (por ejemplo, una cuenta creada antes de aplicar
-- la migración 0001, o el trigger no llegó a correr). Sin esta policy,
-- cualquier insert directo a `profiles` queda bloqueado por RLS aunque el
-- usuario esté autenticado.
create policy "profiles_insert_self" on public.profiles
  for insert with check (id = auth.uid());
