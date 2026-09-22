import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { requireProfile } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { formatCurrency, formatDate } from "@/lib/utils";
import { RefreshButton } from "./refresh-button";
import type { Business, Order, OrderItem } from "@/lib/types";

export default async function OrderStatusPage({
  params,
}: {
  params: { slug: string; orderId: string };
}) {
  const profile = await requireProfile();
  const supabase = createClient();

  const { data: order } = await supabase
    .from("orders")
    .select("*")
    .eq("id", params.orderId)
    .maybeSingle();

  if (!order) notFound();
  const ord = order as Order;

  const [{ data: business }, { data: items }, { data: customerPoints }] = await Promise.all([
    supabase.from("businesses").select("*").eq("id", ord.business_id).single(),
    supabase.from("order_items").select("*").eq("order_id", ord.id),
    supabase
      .from("customer_points")
      .select("points")
      .eq("customer_id", ord.customer_id)
      .eq("business_id", ord.business_id)
      .maybeSingle(),
  ]);

  const biz = business as Business;
  const orderItems = (items as OrderItem[]) ?? [];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-14">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-rust-600">
            {biz.name}
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-800">
            {ord.status === "paid"
              ? "¡Pedido confirmado!"
              : ord.status === "cancelled"
                ? "Pedido cancelado"
                : ord.mp_preference_id
                  ? "Confirmando tu pago…"
                  : "Pedido registrado"}
          </h1>

          <div className="mt-8 max-w-lg space-y-6">
            <Card className="divide-y divide-ink-200">
              {orderItems.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-4 text-sm">
                  <span className="text-ink-800">
                    {item.quantity}x {item.name}
                  </span>
                  <span className="font-mono text-ink-600">
                    {formatCurrency(item.unit_price * item.quantity)}
                  </span>
                </div>
              ))}
              <div className="flex items-center justify-between p-4">
                <span className="font-medium text-ink-900">Total</span>
                <span className="font-display text-lg text-ink-900">
                  {formatCurrency(ord.subtotal)}
                </span>
              </div>
            </Card>

            {ord.status === "paid" && (
              <Card className="p-6 text-center">
                <p className="text-sm text-ink-600">
                  Sumaste puntos en {biz.name}. Tu saldo ahora es:
                </p>
                <p className="mt-2 font-display text-4xl text-rust-600">
                  {customerPoints?.points ?? 0}{" "}
                  <span className="text-lg text-ink-400">{biz.points_label}</span>
                </p>
              </Card>
            )}

            {ord.status === "pending" && ord.mp_preference_id && (
              <Card className="flex items-center justify-between gap-4 p-5">
                <p className="text-sm text-ink-600">
                  Estamos esperando la confirmación de Mercado Pago. Puede tardar unos segundos.
                </p>
                <RefreshButton />
              </Card>
            )}

            {ord.status === "pending" && !ord.mp_preference_id && (
              <Card className="border-dashed p-6 text-center">
                <p className="text-sm text-ink-600">
                  Mostrale esto al mostrador para pagar y sumar tus puntos.
                </p>
                <div className="ticket-divider mx-4 mt-5" />
                <p className="mt-5 text-xs uppercase tracking-wide text-ink-400">
                  Tu código de socio
                </p>
                <p className="mt-1 font-mono text-2xl tracking-[0.2em] text-ink-900">
                  {profile.member_code}
                </p>
              </Card>
            )}

            <p className="text-center text-xs text-ink-400">{formatDate(ord.created_at)}</p>

            <div className="text-center">
              <Link
                href={`/negocio/${biz.slug}`}
                className="link-underline text-sm font-medium text-ink-900"
              >
                Volver al menú
              </Link>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
