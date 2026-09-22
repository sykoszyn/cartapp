"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";
import { notifyRewardRedeemed } from "@/lib/notifications";

export async function redeemRewardAction(rewardId: string, slug: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Iniciá sesión para canjear recompensas." };

  const { data: reward } = await supabase
    .from("rewards")
    .select("name, points_cost, business_id")
    .eq("id", rewardId)
    .single();

  const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: rewardId });

  if (error) return { error: error.message };

  if (reward) {
    notifyRewardRedeemed({
      customerId: user.id,
      businessId: reward.business_id,
      rewardName: reward.name,
      pointsCost: reward.points_cost,
    }).catch((e) => console.error("redeemRewardAction: no se pudo avisar por email", e));
  }

  revalidatePath(`/negocio/${slug}`);
  revalidatePath("/cuenta");
  return { success: true, newBalance: data?.[0]?.new_balance };
}
