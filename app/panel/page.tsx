import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { Card } from "@/components/ui/card";
import { buttonVariants } from "@/lib/button-styles";
import { formatDate } from "@/lib/utils";

export default async function PanelOverviewPage() {
  const business = await getMyBusiness();

  if (!business) {
    return (
      <div>
        <h1 className="font-display text-2xl text-ink-800">Bienvenido a tu panel</h1>
        <p className="mt-2 max-w-md text-ink-400">
          Antes de cargar productos, recompensas o descuentos, necesitás crear el perfil de tu
          negocio.
        </p>
        <Link href="/panel/negocio" className={buttonVariants({ className: "mt-6" })}>
          Crear mi negocio
        </Link>
      </div>
    );
  }

  const supabase = createClient();
  const [{ count: productsCount }, { count: rewardsCount }, { count: discountsCount }, { data: recentTx }] =
    await Promise.all([
      supabase
        .from("products")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id),
      supabase
        .from("rewards")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id),
      supabase
        .from("discounts")
        .select("*", { count: "exact", head: true })
        .eq("business_id", business.id),
      supabase
        .from("points_transactions")
        .select("*")
        .eq("business_id", business.id)
        .order("created_at", { ascending: false })
        .limit(6),
    ]);

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-800">Hola, {business.name}</h1>
        <Link href={`/negocio/${business.slug}`} className="link-underline text-sm text-ink-600">
          Ver mi página pública →
        </Link>
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <StatCard label="Productos" value={productsCount ?? 0} href="/panel/productos" />
        <StatCard label="Recompensas" value={rewardsCount ?? 0} href="/panel/recompensas" />
        <StatCard label="Descuentos activos" value={discountsCount ?? 0} href="/panel/descuentos" />
      </div>

      <div className="mt-10">
        <h2 className="font-display text-xl text-ink-800">Movimientos recientes de puntos</h2>
        {recentTx && recentTx.length > 0 ? (
          <Card className="mt-4 divide-y divide-ink-800/10">
            {recentTx.map((tx) => (
              <div key={tx.id} className="flex items-center justify-between px-5 py-3.5 text-sm">
                <div>
                  <p className="text-ink-800">
                    {tx.type === "earn" ? "Puntos otorgados" : tx.type === "redeem" ? "Canje" : "Ajuste"}
                  </p>
                  <p className="text-xs text-ink-400">{formatDate(tx.created_at)}</p>
                </div>
                <span className={tx.points >= 0 ? "text-olive-600" : "text-rust-600"}>
                  {tx.points >= 0 ? "+" : ""}
                  {tx.points} pts
                </span>
              </div>
            ))}
          </Card>
        ) : (
          <p className="mt-4 text-sm text-ink-400">Todavía no registraste movimientos.</p>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, href }: { label: string; value: number; href: string }) {
  return (
    <Link href={href}>
      <Card className="p-5 transition hover:border-ink-900">
        <p className="text-sm text-ink-400">{label}</p>
        <p className="mt-2 font-display text-3xl text-ink-800">{value}</p>
      </Card>
    </Link>
  );
}
