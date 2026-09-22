"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import type { FormState } from "@/lib/types";

export async function saveMpTokenAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await getMyBusiness();
  if (!business) return { error: "Primero creá tu negocio." };

  const token = String(formData.get("mp_access_token") || "").trim();
  if (!token) return { error: "Pegá tu Access Token de Mercado Pago." };

  const supabase = createClient();
  const { error } = await supabase
    .from("business_payment_settings")
    .upsert({ business_id: business.id, mp_access_token: token, updated_at: new Date().toISOString() });

  if (error) return { error: "No se pudo guardar. Revisá el token e intentá de nuevo." };

  revalidatePath("/panel/pagos");
  return { success: "Mercado Pago conectado. Ya podés recibir pagos online." };
}

export async function disconnectMpAction() {
  const business = await getMyBusiness();
  if (!business) return;

  const supabase = createClient();
  await supabase.from("business_payment_settings").delete().eq("business_id", business.id);
  revalidatePath("/panel/pagos");
}
