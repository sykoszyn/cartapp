-- En un proyecto Supabase estándar, el esquema `public` viene con permisos
-- por defecto para los roles `anon` y `authenticated` (la seguridad real la
-- da RLS, no estos grants). En este proyecto esos permisos base no quedaron
-- aplicados, lo que causaba errores "permission denied for table ..."
-- incluso con las policies de RLS correctas. Esta migración los agrega
-- explícitamente, para las tablas actuales y para las que se creen a futuro.

grant usage on schema public to anon, authenticated;

grant select, insert, update, delete on all tables in schema public to authenticated;
grant select on all tables in schema public to anon;

grant execute on all functions in schema public to anon, authenticated;

alter default privileges in schema public
  grant select, insert, update, delete on tables to authenticated;
alter default privileges in schema public
  grant select on tables to anon;
alter default privileges in schema public
  grant execute on functions to anon, authenticated;
