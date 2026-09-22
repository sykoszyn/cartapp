// Wrapper mínimo sobre la API REST de Mercado Pago (Checkout Pro).
// No usamos el SDK oficial para mantener el bundle liviano; son dos
// llamadas HTTP bien simples.

import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "@/lib/database.types";

const MP_API = "https://api.mercadopago.com";

export interface CreatePreferenceItem {
  title: string;
  quantity: number;
  unit_price: number;
}

export interface CreatePreferenceResult {
  id: string;
  init_point: string;
}

export async function createPaymentPreference({
  accessToken,
  items,
  externalReference,
  backUrls,
  notificationUrl,
}: {
  accessToken: string;
  items: CreatePreferenceItem[];
  externalReference: string;
  backUrls: { success: string; failure: string; pending: string };
  notificationUrl: string;
}): Promise<CreatePreferenceResult> {
  const res = await fetch(`${MP_API}/checkout/preferences`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      items: items.map((item) => ({ ...item, currency_id: "ARS" })),
      external_reference: externalReference,
      back_urls: backUrls,
      auto_return: "approved",
      notification_url: notificationUrl,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mercado Pago rechazó la preferencia (${res.status}): ${detail}`);
  }

  const data = await res.json();
  return { id: data.id, init_point: data.init_point };
}

export interface MercadoPagoPayment {
  id: number;
  status: string;
  external_reference: string | null;
  transaction_amount: number;
}

export async function getPayment(
  accessToken: string,
  paymentId: string
): Promise<MercadoPagoPayment> {
  const res = await fetch(`${MP_API}/v1/payments/${paymentId}`, {
    headers: { Authorization: `Bearer ${accessToken}` },
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`No se pudo consultar el pago en Mercado Pago (${res.status}): ${detail}`);
  }

  return res.json();
}

// ============================================================================
// OAuth ("Conectar con Mercado Pago"): cada comercio autoriza a qrcartapp
// (la "aplicación" registrada a nivel plataforma) a operar en su nombre,
// sin tener que copiar ningún token a mano.
// https://www.mercadopago.com.ar/developers/es/docs/security/oauth
// ============================================================================

export function isMpOAuthConfigured() {
  return !!(process.env.MERCADOPAGO_CLIENT_ID && process.env.MERCADOPAGO_CLIENT_SECRET);
}

export function buildMpAuthorizeUrl({
  state,
  redirectUri,
}: {
  state: string;
  redirectUri: string;
}) {
  const params = new URLSearchParams({
    client_id: process.env.MERCADOPAGO_CLIENT_ID!,
    response_type: "code",
    platform_id: "mp",
    state,
    redirect_uri: redirectUri,
  });
  return `https://auth.mercadopago.com/authorization?${params.toString()}`;
}

export interface MpOAuthTokens {
  access_token: string;
  refresh_token: string;
  user_id: number;
  public_key: string;
  expires_in: number;
}

export async function exchangeMpOAuthCode({
  code,
  redirectUri,
}: {
  code: string;
  redirectUri: string;
}): Promise<MpOAuthTokens> {
  const res = await fetch(`${MP_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.MERCADOPAGO_CLIENT_ID,
      client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
      grant_type: "authorization_code",
      code,
      redirect_uri: redirectUri,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`Mercado Pago rechazó la conexión (${res.status}): ${detail}`);
  }

  return res.json();
}

export async function refreshMpOAuthToken(refreshToken: string): Promise<MpOAuthTokens> {
  const res = await fetch(`${MP_API}/oauth/token`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      client_id: process.env.MERCADOPAGO_CLIENT_ID,
      client_secret: process.env.MERCADOPAGO_CLIENT_SECRET,
      grant_type: "refresh_token",
      refresh_token: refreshToken,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(`No se pudo renovar la conexión con Mercado Pago (${res.status}): ${detail}`);
  }

  return res.json();
}

// Devuelve un access token utilizable para el comercio, renovándolo si está
// por vencer (sólo pasa con tokens conectados vía OAuth; los pegados a mano
// no tienen refresh_token y se devuelven tal cual). Sirve tanto desde una
// Server Action autenticada como desde el webhook con la service_role key.
export async function getValidMpAccessToken(
  supabase: SupabaseClient<Database>,
  businessId: string
): Promise<string | null> {
  const { data: settings } = await supabase
    .from("business_payment_settings")
    .select("mp_access_token, mp_refresh_token, mp_token_expires_at")
    .eq("business_id", businessId)
    .maybeSingle();

  if (!settings?.mp_access_token) return null;

  const expiresAt = settings.mp_token_expires_at
    ? new Date(settings.mp_token_expires_at).getTime()
    : null;
  const expiringSoon = expiresAt !== null && expiresAt - Date.now() < 5 * 60 * 1000;

  if (!expiringSoon || !settings.mp_refresh_token) {
    return settings.mp_access_token;
  }

  try {
    const tokens = await refreshMpOAuthToken(settings.mp_refresh_token);

    await supabase
      .from("business_payment_settings")
      .update({
        mp_access_token: tokens.access_token,
        mp_refresh_token: tokens.refresh_token,
        mp_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
        updated_at: new Date().toISOString(),
      })
      .eq("business_id", businessId);

    return tokens.access_token;
  } catch (e) {
    console.error("getValidMpAccessToken: no se pudo renovar el token, uso el vencido", e);
    return settings.mp_access_token;
  }
}
