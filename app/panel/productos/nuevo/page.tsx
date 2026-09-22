import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { ProductForm } from "../product-form";
import type { ProductCategory } from "@/lib/types";

export default async function NuevoProductoPage() {
  const business = await getMyBusiness();
  const supabase = createClient();
  const { data: categories } = business
    ? await supabase
        .from("product_categories")
        .select("*")
        .eq("business_id", business.id)
        .order("sort_order", { ascending: true })
    : { data: [] };

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Nuevo producto</h1>
      <div className="mt-8">
        <ProductForm categories={(categories as ProductCategory[]) ?? []} />
      </div>
    </div>
  );
}
