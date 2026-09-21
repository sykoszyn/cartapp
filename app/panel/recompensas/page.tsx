import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { buttonVariants } from "@/lib/button-styles";
import { Card, Badge } from "@/components/ui/card";
import { ToggleButton, DeleteButton } from "./row-actions";
import type { Reward } from "@/lib/types";

export default async function RecompensasPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();
  const { data: rewards } = await supabase
    .from("rewards")
    .select("*")
    .eq("business_id", business.id)
    .order("points_cost", { ascending: true });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-800">Recompensas</h1>
          <p className="mt-1 text-sm text-ink-400">
            El catálogo que tus clientes pueden canjear con sus{" "}
            <Link href="/panel/puntos" className="link-underline">
              {business.points_label}
            </Link>
            .
          </p>
        </div>
        <Link href="/panel/recompensas/nuevo" className={buttonVariants({ size: "sm" })}>
          Agregar recompensa
        </Link>
      </div>

      {rewards && rewards.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(rewards as Reward[]).map((r) => (
            <Card key={r.id} className="overflow-hidden">
              <div className="aspect-video bg-ink-800/5">
                {r.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={r.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink-800">{r.name}</p>
                  <Badge variant={r.active ? "olive" : "default"}>
                    {r.active ? "Activa" : "Oculta"}
                  </Badge>
                </div>
                <p className="mt-1 font-display text-lg text-rust-600">
                  {r.points_cost} {business.points_label}
                </p>
                {r.stock !== null && (
                  <p className="mt-1 text-xs text-ink-400">Stock: {r.stock}</p>
                )}
                {r.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-400">{r.description}</p>
                )}
                <div className="mt-4 flex items-center gap-3 text-sm">
                  <Link href={`/panel/recompensas/${r.id}`} className="link-underline text-ink-600">
                    Editar
                  </Link>
                  <ToggleButton id={r.id} active={r.active} />
                  <DeleteButton id={r.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-ink-800/20 p-10 text-center">
          <p className="text-ink-400">Todavía no cargaste recompensas.</p>
          <Link href="/panel/recompensas/nuevo" className={buttonVariants({ className: "mt-4" })}>
            Agregar la primera
          </Link>
        </div>
      )}
    </div>
  );
}
