import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { ProductForm } from "../product-form";
import type { Product } from "@/lib/types";

export default async function EditarProductoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: product } = await supabase
    .from("products")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!product) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Editar producto</h1>
      <div className="mt-8">
        <ProductForm product={product as Product} />
      </div>
    </div>
  );
}
