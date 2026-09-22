"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { uploadMedia } from "@/lib/storage";
import { slugify } from "@/lib/utils";
import type { FormState } from "@/lib/types";

export async function saveBusinessAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const name = String(formData.get("name") || "").trim();
  if (!name) return { error: "El nombre es obligatorio." };

  const { data: existing } = await supabase
    .from("businesses")
    .select("*")
    .eq("owner_id", user.id)
    .maybeSingle();

  const category = String(formData.get("category") || "").trim() || null;
  const description = String(formData.get("description") || "").trim() || null;
  const address = String(formData.get("address") || "").trim() || null;
  const phone = String(formData.get("phone") || "").trim() || null;
  const schedule = String(formData.get("schedule") || "").trim() || null;

  let logo_url = existing?.logo_url ?? null;
  let cover_url = existing?.cover_url ?? null;

  const logoFile = formData.get("logo") as File | null;
  if (logoFile && logoFile.size > 0) {
    logo_url = await uploadMedia(supabase, user.id, "logos", logoFile);
  }
  const coverFile = formData.get("cover") as File | null;
  if (coverFile && coverFile.size > 0) {
    cover_url = await uploadMedia(supabase, user.id, "covers", coverFile);
  }

  if (existing) {
    const { error } = await supabase
      .from("businesses")
      .update({ name, category, description, address, phone, schedule, logo_url, cover_url })
      .eq("id", existing.id);
    if (error) return { error: "No se pudo guardar el negocio." };
  } else {
    const base = slugify(name) || "negocio";
    let slug = base;
    let i = 1;
    // eslint-disable-next-line no-constant-condition
    while (true) {
      const { data: clash } = await supabase
        .from("businesses")
        .select("id")
        .eq("slug", slug)
        .maybeSingle();
      if (!clash) break;
      i += 1;
      slug = `${base}-${i}`;
    }

    const { data: created, error } = await supabase
      .from("businesses")
      .insert({
        owner_id: user.id,
        name,
        slug,
        category,
        description,
        address,
        phone,
        schedule,
        logo_url,
        cover_url,
      })
      .select("id")
      .single();
    if (error) return { error: "No se pudo crear el negocio." };

    // Punto de partida editable: el comercio puede renombrar, borrar o
    // agregar las categorías de su menú que quiera desde /panel/categorias.
    const defaultCategories = [
      "Desayunos y meriendas",
      "Almuerzos",
      "Cenas",
      "Promos mediodía",
      "Promos noche",
    ];
    await supabase.from("product_categories").insert(
      defaultCategories.map((categoryName, index) => ({
        business_id: created.id,
        name: categoryName,
        sort_order: index,
      }))
    );
  }

  revalidatePath("/panel", "layout");
  return { success: "¡Guardado! Ya podés cargar productos, recompensas y descuentos." };
}
