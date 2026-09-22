import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

export default async function AnalyticsPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();

  const [
    { data: paidOrders },
    { count: pendingOrdersCount },
    { data: customerPoints },
    { data: redemptions },
  ] = await Promise.all([
    supabase.from("orders").select("id, subtotal").eq("business_id", business.id).eq("status", "paid"),
    supabase
      .from("orders")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id)
      .eq("status", "pending"),
    supabase.from("customer_points").select("customer_id, points").eq("business_id", business.id),
    supabase
      .from("points_transactions")
      .select("points")
      .eq("business_id", business.id)
      .eq("type", "redeem"),
  ]);

  const revenue = (paidOrders ?? []).reduce((sum, o) => sum + Number(o.subtotal), 0);
  const paidOrdersCount = paidOrders?.length ?? 0;
  const uniqueCustomers = customerPoints?.length ?? 0;
  const pointsLiability = (customerPoints ?? []).reduce((sum, c) => sum + c.points, 0);
  const redemptionsCount = redemptions?.length ?? 0;

  let topProducts: { name: string; quantity: number }[] = [];
  const orderIds = (paidOrders ?? []).map((o) => o.id);
  if (orderIds.length > 0) {
    const { data: items } = await supabase
      .from("order_items")
      .select("name, quantity")
      .in("order_id", orderIds);

    const byName = new Map<string, number>();
    (items ?? []).forEach((item) => {
      byName.set(item.name, (byName.get(item.name) ?? 0) + item.quantity);
    });
    topProducts = Array.from(byName.entries())
      .map(([name, quantity]) => ({ name, quantity }))
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);
  }

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Estadísticas</h1>
      <p className="mt-2 max-w-lg text-ink-400">
        Un resumen de cómo viene tu negocio con qrcartapp.
      </p>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Ingresos por pedidos pagados" value={formatCurrency(revenue)} />
        <Stat label="Pedidos pagados" value={String(paidOrdersCount)} />
        <Stat label="Pedidos pendientes" value={String(pendingOrdersCount ?? 0)} />
        <Stat label="Clientes con puntos" value={String(uniqueCustomers)} />
        <Stat label="Canjes de recompensas" value={String(redemptionsCount)} />
        <Stat
          label={`${business.points_label} pendientes de canjear`}
          value={String(pointsLiability)}
          hint="Es lo que tus clientes todavía no gastaron: representa el valor en recompensas que les debés."
        />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-lg text-ink-800">Productos más pedidos</h2>
        {topProducts.length > 0 ? (
          <Card className="mt-4 divide-y divide-ink-200">
            {topProducts.map((p) => (
              <div key={p.name} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <span className="text-ink-800">{p.name}</span>
                <span className="font-mono text-ink-600">{p.quantity}</span>
              </div>
            ))}
          </Card>
        ) : (
          <p className="mt-4 text-sm text-ink-400">
            Todavía no hay pedidos pagados para mostrar un ranking.
          </p>
        )}
      </div>
    </div>
  );
}

function Stat({ label, value, hint }: { label: string; value: string; hint?: string }) {
  return (
    <Card className="p-5">
      <p className="text-sm text-ink-400">{label}</p>
      <p className="mt-2 font-display text-2xl text-ink-800">{value}</p>
      {hint && <p className="mt-2 text-xs text-ink-400">{hint}</p>}
    </Card>
  );
}
