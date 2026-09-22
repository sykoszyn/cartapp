import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { MpForm } from "./mp-form";

export default async function PagosPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();
  const { data: settings } = await supabase
    .from("business_payment_settings")
    .select("mp_access_token")
    .eq("business_id", business.id)
    .maybeSingle();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Pagos</h1>
      <p className="mt-2 max-w-lg text-ink-400">
        Conectá tu cuenta de Mercado Pago para que tus clientes puedan pagar el pedido desde la
        página con QR o tarjeta, y sumen los puntos automáticamente. Si todavía no la conectás,
        los pedidos igual se registran y los confirmás vos a mano cuando cobrás en el local.
      </p>

      <Card className="mt-8 max-w-lg p-6">
        <MpForm connected={!!settings?.mp_access_token} />
      </Card>
    </div>
  );
}
