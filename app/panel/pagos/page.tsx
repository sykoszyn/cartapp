import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { isMpOAuthConfigured, buildMpAuthorizeUrl } from "@/lib/mercadopago";
import { getSiteUrl } from "@/lib/site-url";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-styles";
import { MpForm } from "./mp-form";

const MP_ERROR_MESSAGES: Record<string, string> = {
  denied: "Cancelaste la conexión con Mercado Pago.",
  missing_code: "No se pudo completar la conexión. Intentá de nuevo.",
  unauthorized: "Esa conexión no corresponde a tu cuenta.",
  exchange_failed: "Mercado Pago no confirmó la conexión. Intentá de nuevo.",
};

export default async function PagosPage({
  searchParams,
}: {
  searchParams: { mp_connected?: string; mp_error?: string };
}) {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();
  const { data: settings } = await supabase
    .from("business_payment_settings")
    .select("mp_access_token, mp_user_id")
    .eq("business_id", business.id)
    .maybeSingle();

  const connected = !!settings?.mp_access_token;
  const oauthReady = isMpOAuthConfigured();
  const authorizeUrl = oauthReady
    ? buildMpAuthorizeUrl({
        state: business.id,
        redirectUri: `${getSiteUrl()}/api/mercadopago/oauth/callback`,
      })
    : null;

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Pagos</h1>
      <p className="mt-2 max-w-lg text-ink-400">
        Conectá tu cuenta de Mercado Pago para que tus clientes puedan pagar el pedido desde la
        página con QR o tarjeta, y sumen los puntos automáticamente. Si todavía no la conectás,
        los pedidos igual se registran y los confirmás vos a mano cuando cobrás en el local.
      </p>

      {searchParams.mp_connected && (
        <p className="mt-6 max-w-lg rounded border border-olive-500/30 bg-olive-100 px-4 py-3 text-sm text-olive-600">
          ¡Listo! Conectaste tu cuenta de Mercado Pago.
        </p>
      )}
      {searchParams.mp_error && (
        <p className="mt-6 max-w-lg rounded border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-600">
          {MP_ERROR_MESSAGES[searchParams.mp_error] || "No se pudo conectar Mercado Pago."}
        </p>
      )}

      {oauthReady && (
        <Card className="mt-8 max-w-lg p-6">
          {connected ? (
            <div className="flex items-center justify-between">
              <div>
                <p className="font-medium text-ink-900">Mercado Pago conectado</p>
                {settings?.mp_user_id && (
                  <p className="mt-1 text-xs text-ink-400">Cuenta #{settings.mp_user_id}</p>
                )}
              </div>
              <a href={authorizeUrl!} className={buttonVariants({ variant: "outline", size: "sm" })}>
                Reconectar
              </a>
            </div>
          ) : (
            <div>
              <p className="text-sm text-ink-600">
                Te va a pedir que inicies sesión en Mercado Pago y aceptes la conexión. Cuando
                termines, volvés acá solo.
              </p>
              <a href={authorizeUrl!} className={buttonVariants({ className: "mt-4" })}>
                Conectar con Mercado Pago
              </a>
            </div>
          )}
        </Card>
      )}

      <Card className="mt-6 max-w-lg p-6">
        {oauthReady && (
          <p className="mb-5 text-xs uppercase tracking-wide text-ink-400">
            O pegá tu Access Token manualmente
          </p>
        )}
        <MpForm connected={connected} />
      </Card>
    </div>
  );
}
