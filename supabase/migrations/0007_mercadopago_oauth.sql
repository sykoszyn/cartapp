-- Soporte para conectar Mercado Pago vía OAuth ("Conectar con Mercado
-- Pago") en vez de pegar el Access Token a mano. mp_access_token se sigue
-- usando igual (ahora lo llena el flujo de OAuth), y se agregan el refresh
-- token y el vencimiento para poder renovarlo solos cuando haga falta.
alter table public.business_payment_settings
  add column mp_refresh_token text,
  add column mp_user_id text,
  add column mp_public_key text,
  add column mp_token_expires_at timestamptz;
