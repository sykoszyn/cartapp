import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { buttonVariants } from "@/lib/button-styles";
import { Card, Badge } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { ToggleButton, DeleteButton } from "./row-actions";
import type { Product } from "@/lib/types";

export default async function ProductosPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();
  const { data: products } = await supabase
    .from("products")
    .select("*")
    .eq("business_id", business.id)
    .order("created_at", { ascending: false });

  return (
    <div>
      <div className="flex items-center justify-between">
        <h1 className="font-display text-2xl text-ink-800">Productos</h1>
        <Link href="/panel/productos/nuevo" className={buttonVariants({ size: "sm" })}>
          Agregar producto
        </Link>
      </div>

      {products && products.length > 0 ? (
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {(products as Product[]).map((p) => (
            <Card key={p.id} className="overflow-hidden">
              <div className="aspect-video bg-ink-800/5">
                {p.image_url && (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                )}
              </div>
              <div className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <p className="font-medium text-ink-800">{p.name}</p>
                  <Badge variant={p.active ? "olive" : "default"}>
                    {p.active ? "Activo" : "Oculto"}
                  </Badge>
                </div>
                <p className="mt-1 font-display text-lg text-rust-600">
                  {formatCurrency(p.price)}
                </p>
                {p.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-ink-400">{p.description}</p>
                )}
                <div className="mt-4 flex items-center gap-3 text-sm">
                  <Link href={`/panel/productos/${p.id}`} className="link-underline text-ink-600">
                    Editar
                  </Link>
                  <ToggleButton id={p.id} active={p.active} />
                  <DeleteButton id={p.id} />
                </div>
              </div>
            </Card>
          ))}
        </div>
      ) : (
        <div className="mt-10 rounded-lg border border-dashed border-ink-800/20 p-10 text-center">
          <p className="text-ink-400">Todavía no cargaste productos.</p>
          <Link href="/panel/productos/nuevo" className={buttonVariants({ className: "mt-4" })}>
            Agregar el primero
          </Link>
        </div>
      )}
    </div>
  );
}
