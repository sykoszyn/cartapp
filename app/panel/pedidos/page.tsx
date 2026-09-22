import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { Card, Badge } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { OrderRowActions } from "./row-actions";
import type { Order, OrderItem } from "@/lib/types";

export default async function PedidosPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();
  const { data: orders } = await supabase
    .from("orders")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false })
    .limit(60);

  const orderList = (orders as Order[]) ?? [];
  const orderIds = orderList.map((o) => o.id);
  const customerIds = Array.from(new Set(orderList.map((o) => o.customer_id)));

  const [{ data: items }, { data: profiles }] = await Promise.all([
    orderIds.length
      ? supabase.from("order_items").select("*").in("order_id", orderIds)
      : Promise.resolve({ data: [] as OrderItem[] }),
    customerIds.length
      ? supabase.from("profiles").select("id, full_name").in("id", customerIds)
      : Promise.resolve({ data: [] as { id: string; full_name: string }[] }),
  ]);

  const itemsByOrder = new Map<string, OrderItem[]>();
  (items ?? []).forEach((item) => {
    const list = itemsByOrder.get(item.order_id) ?? [];
    list.push(item);
    itemsByOrder.set(item.order_id, list);
  });

  const nameByCustomer = new Map((profiles ?? []).map((p) => [p.id, p.full_name]));

  const pending = orderList.filter((o) => o.status === "pending");
  const history = orderList.filter((o) => o.status !== "pending");

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Pedidos</h1>
      <p className="mt-2 max-w-lg text-ink-400">
        Los pedidos pagados con Mercado Pago se confirman solos. Los que se pagan en el local,
        confirmalos acá para que se sumen los puntos.
      </p>

      <div className="mt-8">
        <h2 className="font-display text-lg text-ink-800">Pendientes</h2>
        {pending.length > 0 ? (
          <div className="mt-4 space-y-3">
            {pending.map((order) => (
              <Card key={order.id} className="p-5">
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div>
                    <p className="font-medium text-ink-900">
                      {nameByCustomer.get(order.customer_id) || "Cliente"}
                    </p>
                    <p className="text-xs text-ink-400">{formatDate(order.created_at)}</p>
                    <ul className="mt-2 text-sm text-ink-600">
                      {(itemsByOrder.get(order.id) ?? []).map((item) => (
                        <li key={item.id}>
                          {item.quantity}x {item.name}
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div className="text-right">
                    <p className="font-display text-lg text-ink-900">
                      {formatCurrency(order.subtotal)}
                    </p>
                    <Badge variant={order.mp_preference_id ? "olive" : "default"} className="mt-1">
                      {order.mp_preference_id ? "Mercado Pago" : "Pago en el local"}
                    </Badge>
                  </div>
                </div>
                <div className="mt-4">
                  <OrderRowActions orderId={order.id} />
                </div>
              </Card>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-ink-400">No hay pedidos pendientes.</p>
        )}
      </div>

      {history.length > 0 && (
        <div className="mt-10">
          <h2 className="font-display text-lg text-ink-800">Historial</h2>
          <Card className="mt-4 divide-y divide-ink-200">
            {history.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-2 px-5 py-3.5 text-sm"
              >
                <div>
                  <p className="text-ink-800">{nameByCustomer.get(order.customer_id) || "Cliente"}</p>
                  <p className="text-xs text-ink-400">{formatDate(order.created_at)}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-mono text-ink-600">{formatCurrency(order.subtotal)}</span>
                  <Badge variant={order.status === "paid" ? "olive" : "default"}>
                    {order.status === "paid" ? "Pagado" : "Cancelado"}
                  </Badge>
                </div>
              </div>
            ))}
          </Card>
        </div>
      )}
    </div>
  );
}
