import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { formatDate } from "@/lib/utils";
import { PointsConfigForm } from "./points-config-form";
import { AddPointsForm } from "./add-points-form";

export default async function PuntosPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();
  const { data: transactions } = await supabase
    .from("points_transactions")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(20);

  const customerIds = Array.from(new Set((transactions ?? []).map((t) => t.customer_id)));
  const { data: profiles } = customerIds.length
    ? await supabase.from("profiles").select("id, full_name").in("id", customerIds)
    : { data: [] as { id: string; full_name: string }[] };

  const nameById = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Programa de puntos</h1>
      <p className="mt-2 max-w-lg text-ink-400">
        Definí cuántos {business.points_label} gana un cliente por compra y sumalos a mano en
        cada venta con su código de socio.
      </p>

      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="font-display text-lg text-ink-800">Configuración</h2>
          <div className="mt-5">
            <PointsConfigForm business={business} />
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="font-display text-lg text-ink-800">Cargar puntos a un cliente</h2>
          <div className="mt-5">
            <AddPointsForm />
          </div>
        </Card>
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-ink-800">Historial</h2>
        {transactions && transactions.length > 0 ? (
          <Card className="mt-4 divide-y divide-ink-800/10">
            {transactions.map((tx) => (
              <div
                key={tx.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm"
              >
                <div>
                  <p className="text-ink-800">{nameById.get(tx.customer_id) || "Cliente"}</p>
                  <p className="text-xs text-ink-400">
                    {formatDate(tx.created_at)}
                    {tx.note ? ` · ${tx.note}` : ""}
                  </p>
                </div>
                <span className={tx.points >= 0 ? "font-medium text-olive-600" : "font-medium text-rust-600"}>
                  {tx.points >= 0 ? "+" : ""}
                  {tx.points} {business.points_label}
                </span>
              </div>
            ))}
          </Card>
        ) : (
          <p className="mt-4 text-sm text-ink-400">Todavía no hay movimientos.</p>
        )}
      </div>
    </div>
  );
}
