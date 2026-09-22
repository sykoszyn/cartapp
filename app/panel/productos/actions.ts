"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { uploadMedia } from "@/lib/storage";
import type { FormState } from "@/lib/types";

export async function saveProductAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const business = await getMyBusiness();
  if (!business) return { error: "Primero creá tu negocio." };

  const id = String(formData.get("id") || "") || null;
  const name = String(formData.get("name") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const priceRaw = String(formData.get("price") || "0").replace(",", ".");
  const price = Number(priceRaw);
  const category_id = String(formData.get("category_id") || "").trim() || null;

  if (!name) return { error: "El nombre es obligatorio." };
  if (Number.isNaN(price) || price < 0) return { error: "El precio no es válido." };

  let image_url: string | null = null;
  if (id) {
    const { data: current } = await supabase
      .from("products")
      .select("image_url")
      .eq("id", id)
      .single();
    image_url = current?.image_url ?? null;
  }

  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    image_url = await uploadMedia(supabase, user.id, "productos", imageFile);
  }

  if (id) {
    const { error } = await supabase
      .from("products")
      .update({ name, description, price, category_id, image_url })
      .eq("id", id);
    if (error) return { error: "No se pudo guardar el producto." };
  } else {
    const { error } = await supabase.from("products").insert({
      business_id: business.id,
      name,
      description,
      price,
      category_id,
      image_url,
    });
    if (error) return { error: "No se pudo crear el producto." };
  }

  revalidatePath("/panel/productos");
  redirect("/panel/productos");
}

export async function toggleProductAction(id: string, active: boolean) {
  const supabase = createClient();
  await supabase.from("products").update({ active: !active }).eq("id", id);
  revalidatePath("/panel/productos");
}

export async function deleteProductAction(id: string) {
  const supabase = createClient();
  await supabase.from("products").delete().eq("id", id);
  revalidatePath("/panel/productos");
}
