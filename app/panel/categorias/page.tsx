import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { CategoryRow } from "./category-row";
import { NewCategoryForm } from "./new-category-form";
import type { ProductCategory } from "@/lib/types";

export default async function CategoriasPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const supabase = createClient();
  const [{ data: categories }, { data: products }] = await Promise.all([
    supabase
      .from("product_categories")
      .select("*")
      .eq("business_id", business.id)
      .order("sort_order", { ascending: true }),
    supabase.from("products").select("category_id").eq("business_id", business.id),
  ]);

  const countByCategory = new Map<string, number>();
  (products ?? []).forEach((p) => {
    if (!p.category_id) return;
    countByCategory.set(p.category_id, (countByCategory.get(p.category_id) ?? 0) + 1);
  });

  const list = (categories as ProductCategory[]) ?? [];

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Categorías del menú</h1>
      <p className="mt-2 max-w-lg text-ink-400">
        Organizá tus productos como quieras: desayunos y meriendas, almuerzos, cenas, promos de
        mediodía o de la noche — las categorías son tuyas, agregá o sacá las que necesites.
      </p>

      <div className="mt-8 max-w-2xl rounded-lg border border-dashed border-ink-200 p-5">
        <NewCategoryForm />
      </div>

      {list.length > 0 ? (
        <div className="mt-6 max-w-2xl space-y-3">
          {list.map((category, index) => (
            <CategoryRow
              key={category.id}
              category={category}
              isFirst={index === 0}
              isLast={index === list.length - 1}
              productCount={countByCategory.get(category.id) ?? 0}
            />
          ))}
        </div>
      ) : (
        <p className="mt-8 text-sm text-ink-400">Todavía no creaste ninguna categoría.</p>
      )}
    </div>
  );
}
