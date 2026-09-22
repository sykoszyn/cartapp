"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import type { FormState } from "@/lib/types";

export async function saveCategoryAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const business = await getMyBusiness();
  if (!business) return { error: "Primero creá tu negocio." };

  const id = String(formData.get("id") || "") || null;
  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "El nombre es obligatorio." };

  if (id) {
    const { error } = await supabase
      .from("product_categories")
      .update({ name })
      .eq("id", id);
    if (error) return { error: "No se pudo guardar la categoría." };
  } else {
    const { count } = await supabase
      .from("product_categories")
      .select("*", { count: "exact", head: true })
      .eq("business_id", business.id);

    const { error } = await supabase.from("product_categories").insert({
      business_id: business.id,
      name,
      sort_order: count ?? 0,
    });
    if (error) return { error: "No se pudo crear la categoría." };
  }

  revalidatePath("/panel/categorias");
  revalidatePath("/panel/productos");
  return { success: id ? "Categoría actualizada." : "Categoría creada." };
}

export async function deleteCategoryAction(id: string) {
  const supabase = createClient();
  await supabase.from("product_categories").delete().eq("id", id);
  revalidatePath("/panel/categorias");
  revalidatePath("/panel/productos");
}

export async function moveCategoryAction(id: string, direction: "up" | "down") {
  const supabase = createClient();
  const business = await getMyBusiness();
  if (!business) return;

  const { data: categories } = await supabase
    .from("product_categories")
    .select("id, sort_order")
    .eq("business_id", business.id)
    .order("sort_order", { ascending: true });

  if (!categories) return;

  const index = categories.findIndex((c) => c.id === id);
  const swapWith = direction === "up" ? index - 1 : index + 1;
  if (index === -1 || swapWith < 0 || swapWith >= categories.length) return;

  const a = categories[index];
  const b = categories[swapWith];

  await supabase.from("product_categories").update({ sort_order: b.sort_order }).eq("id", a.id);
  await supabase.from("product_categories").update({ sort_order: a.sort_order }).eq("id", b.id);

  revalidatePath("/panel/categorias");
  revalidatePath("/panel/productos");
}
