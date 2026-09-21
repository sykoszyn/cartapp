"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { uploadMedia } from "@/lib/storage";
import type { FormState } from "@/lib/types";

export async function saveRewardAction(_prev: FormState, formData: FormData): Promise<FormState> {
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
  const pointsCost = Number(formData.get("points_cost") || 0);
  const stockRaw = String(formData.get("stock") || "").trim();
  const stock = stockRaw === "" ? null : Number(stockRaw);

  if (!name) return { error: "El nombre es obligatorio." };
  if (!Number.isFinite(pointsCost) || pointsCost <= 0) {
    return { error: "Definí un costo en puntos mayor a cero." };
  }

  let image_url: string | null = null;
  if (id) {
    const { data: current } = await supabase
      .from("rewards")
      .select("image_url")
      .eq("id", id)
      .single();
    image_url = current?.image_url ?? null;
  }

  const imageFile = formData.get("image") as File | null;
  if (imageFile && imageFile.size > 0) {
    image_url = await uploadMedia(supabase, user.id, "recompensas", imageFile);
  }

  if (id) {
    const { error } = await supabase
      .from("rewards")
      .update({ name, description, points_cost: pointsCost, stock, image_url })
      .eq("id", id);
    if (error) return { error: "No se pudo guardar la recompensa." };
  } else {
    const { error } = await supabase.from("rewards").insert({
      business_id: business.id,
      name,
      description,
      points_cost: pointsCost,
      stock,
      image_url,
    });
    if (error) return { error: "No se pudo crear la recompensa." };
  }

  revalidatePath("/panel/recompensas");
  redirect("/panel/recompensas");
}

export async function toggleRewardAction(id: string, active: boolean) {
  const supabase = createClient();
  await supabase.from("rewards").update({ active: !active }).eq("id", id);
  revalidatePath("/panel/recompensas");
}

export async function deleteRewardAction(id: string) {
  const supabase = createClient();
  await supabase.from("rewards").delete().eq("id", id);
  revalidatePath("/panel/recompensas");
}
