"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyPointsEarned } from "@/lib/notifications";

export async function markOrderPaidAction(orderId: string) {
  const supabase = createClient();
  const { data: order } = await supabase
    .from("orders")
    .select("business_id, customer_id")
    .eq("id", orderId)
    .single();

  if (!order) return;

  const { data: result, error } = await supabase.rpc("award_points_for_order", {
    p_order_id: orderId,
  });

  if (error) {
    console.error("markOrderPaidAction: error otorgando puntos", error);
    return;
  }

  const awarded = result?.[0];
  if (awarded && awarded.points_added > 0) {
    notifyPointsEarned({
      customerId: order.customer_id,
      businessId: order.business_id,
      points: awarded.points_added,
      reason: "Confirmado en el local.",
    }).catch((e) => console.error("markOrderPaidAction: no se pudo avisar por email", e));
  }

  revalidatePath("/panel/pedidos");
}

export async function cancelOrderAction(orderId: string) {
  const supabase = createClient();
  await supabase.from("orders").update({ status: "cancelled" }).eq("id", orderId);
  revalidatePath("/panel/pedidos");
}
