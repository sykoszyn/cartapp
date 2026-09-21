"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getMyBusiness } from "@/lib/auth";
import type { FormState } from "@/lib/types";

export async function updatePointsConfigAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await getMyBusiness();
  if (!business) redirect("/panel/negocio");

  const points_per_amount = Number(formData.get("points_per_amount") || 0);
  const amount_per_point = Number(formData.get("amount_per_point") || 0);
  const points_label = String(formData.get("points_label") || "puntos").trim() || "puntos";

  if (!Number.isFinite(points_per_amount) || points_per_amount <= 0) {
    return { error: "La cantidad de puntos debe ser mayor a cero." };
  }
  if (!Number.isFinite(amount_per_point) || amount_per_point <= 0) {
    return { error: "El monto de referencia debe ser mayor a cero." };
  }

  const supabase = createClient();
  const { error } = await supabase
    .from("businesses")
    .update({ points_per_amount, amount_per_point, points_label })
    .eq("id", business.id);

  if (error) return { error: "No se pudo guardar la configuración." };

  revalidatePath("/panel/puntos");
  return { success: "Programa de puntos actualizado." };
}

export async function addPointsAction(_prev: FormState, formData: FormData): Promise<FormState> {
  const business = await getMyBusiness();
  if (!business) redirect("/panel/negocio");

  const memberCode = String(formData.get("member_code") || "").trim();
  const amount = Number(formData.get("amount") || 0);
  const note = String(formData.get("note") || "").trim() || null;

  if (!memberCode) return { error: "Ingresá el código de socio del cliente." };
  if (!Number.isFinite(amount) || amount <= 0) return { error: "Ingresá un monto válido." };

  const supabase = createClient();
  const { data, error } = await supabase.rpc("add_points_by_member_code", {
    p_business_id: business.id,
    p_member_code: memberCode,
    p_amount: amount,
    p_note: note,
  });

  if (error) return { error: error.message };

  const result = data?.[0];
  revalidatePath("/panel/puntos");
  revalidatePath("/panel");
  return {
    success: result
      ? `¡Listo! Se sumaron ${result.points_added} puntos a ${result.customer_name || "el cliente"}. Nuevo saldo: ${result.new_balance}.`
      : "Puntos otorgados.",
  };
}
