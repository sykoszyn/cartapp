import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { buttonVariants } from "@/lib/button-styles";
import { Card, Badge } from "@/components/ui/card";
import { DAY_LABELS } from "@/lib/utils";
import { ToggleButton, DeleteButton } from "./row-actions";
import type { Discount } from "@/lib/types";

export default async function DescuentosPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();
  const { data: discounts } = await supabase
    .from("discounts")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-2xl text-ink-800">Descuentos</h1>
          <p className="mt-1 text-sm text-ink-400">
            Contale a tus clientes qué día conviene venir y con qué medio de pago.
          </p>
        </div>
        <Link href="/panel/descuentos/nuevo" className={buttonVariants({ size: "sm" })}>
          Agregar descuento
        </Link>
      </div>

      {discounts && discounts.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          {(discounts as Discount[]).map((d) => (
            <Card key={d.id} className="overflow-hidden">
              {d.banner_url && (
                <div className="aspect-[3/1] bg-ink-800/5">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src={d.banner_url} alt="" className="h-full w-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink-800">{d.title}</p>
                  <Badge variant={d.active ? "olive" : "default"}>
                    {d.active ? "Activo" : "Oculto"}
                  </Badge>
                </div>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {d.days.map((day) => (
                    <Badge key={day} variant="rust">
                      {DAY_LABELS[day]}
                    </Badge>
                  ))}
                </div>
                {d.payment_method && (
                  <p className="mt-2 text-sm text-ink-600">💳 {d.payment_method}</p>
                )}
                {d.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-400">{d.description}</p>
                )}
                <div className="mt-4 flex items-center gap-3 text-sm">
                  <Link href={`/panel/descuentos/${d.id}`} className="link-underline text-ink-600">
                    Editar
                  </Link>
                  <ToggleButton id={d.id} active={d.active} />
                  <DeleteButton id={d.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-ink-800/20 p-10 text-center">
          <p className="text-ink-400">Todavía no cargaste descuentos.</p>
          <Link href="/panel/descuentos/nuevo" className={buttonVariants({ className: "mt-4" })}>
            Agregar el primero
          </Link>
        </div>
      )}
    </div>
  );
}
