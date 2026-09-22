import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { exchangeMpOAuthCode } from "@/lib/mercadopago";
import { getSiteUrl } from "@/lib/site-url";

export async function GET(request: NextRequest) {
  const siteUrl = getSiteUrl();
  const pagosUrl = `${siteUrl}/panel/pagos`;

  const code = request.nextUrl.searchParams.get("code");
  const businessId = request.nextUrl.searchParams.get("state");
  const mpError = request.nextUrl.searchParams.get("error");

  if (mpError) {
    return NextResponse.redirect(`${pagosUrl}?mp_error=denied`);
  }
  if (!code || !businessId) {
    return NextResponse.redirect(`${pagosUrl}?mp_error=missing_code`);
  }

  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.redirect(`${siteUrl}/ingresar`);
  }

  // Verificamos que el usuario logueado sea efectivamente el dueño del
  // negocio que inició la conexión (el "state" que armamos nosotros mismos).
  const { data: business } = await supabase
    .from("businesses")
    .select("id")
    .eq("id", businessId)
    .eq("owner_id", user.id)
    .maybeSingle();

  if (!business) {
    return NextResponse.redirect(`${pagosUrl}?mp_error=unauthorized`);
  }

  try {
    const tokens = await exchangeMpOAuthCode({
      code,
      redirectUri: `${siteUrl}/api/mercadopago/oauth/callback`,
    });

    const { error } = await supabase.from("business_payment_settings").upsert({
      business_id: businessId,
      mp_access_token: tokens.access_token,
      mp_refresh_token: tokens.refresh_token,
      mp_user_id: String(tokens.user_id),
      mp_public_key: tokens.public_key,
      mp_token_expires_at: new Date(Date.now() + tokens.expires_in * 1000).toISOString(),
      updated_at: new Date().toISOString(),
    });

    if (error) throw error;

    return NextResponse.redirect(`${pagosUrl}?mp_connected=1`);
  } catch (e) {
    console.error("mercadopago oauth callback: error conectando", e);
    return NextResponse.redirect(`${pagosUrl}?mp_error=exchange_failed`);
  }
}
