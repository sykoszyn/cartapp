"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import { uploadMedia } from "@/lib/storage";
import { DISCOUNT_DAYS, type FormState } from "@/lib/types";

export async function saveDiscountAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/ingresar");

  const business = await getMyBusiness();
  if (!business) return { error: "Primero creá tu negocio." };

  const id = String(formData.get("id") || "") || null;
  const title = String(formData.get("title") || "").trim();
  const description = String(formData.get("description") || "").trim() || null;
  const payment_method = String(formData.get("payment_method") || "").trim() || null;
  const days = DISCOUNT_DAYS.filter((day) => formData.getAll("days").includes(day));

  if (!title) return { error: "El título es obligatorio." };
  if (days.length === 0) return { error: "Elegí al menos un día." };

  let banner_url: string | null = null;
  if (id) {
    const { data: current } = await supabase
      .from("discounts")
      .select("banner_url")
      .eq("id", id)
      .single();
    banner_url = current?.banner_url ?? null;
  }

  const bannerFile = formData.get("banner") as File | null;
  if (bannerFile && bannerFile.size > 0) {
    banner_url = await uploadMedia(supabase, user.id, "descuentos", bannerFile);
  }

  if (id) {
    const { error } = await supabase
      .from("discounts")
      .update({ title, description, payment_method, days, banner_url })
      .eq("id", id);
    if (error) return { error: "No se pudo guardar el descuento." };
  } else {
    const { error } = await supabase.from("discounts").insert({
      business_id: business.id,
      title,
      description,
      payment_method,
      days,
      banner_url,
    });
    if (error) return { error: "No se pudo crear el descuento." };
  }

  revalidatePath("/panel/descuentos");
  redirect("/panel/descuentos");
}

export async function toggleDiscountAction(id: string, active: boolean) {
  const supabase = createClient();
  await supabase.from("discounts").update({ active: !active }).eq("id", id);
  revalidatePath("/panel/descuentos");
}

export async function deleteDiscountAction(id: string) {
  const supabase = createClient();
  await supabase.from("discounts").delete().eq("id", id);
  revalidatePath("/panel/descuentos");
}
