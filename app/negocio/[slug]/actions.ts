"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/lib/supabase/server";

export async function redeemRewardAction(rewardId: string, slug: string) {
  const supabase = createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) return { error: "Iniciá sesión para canjear recompensas." };

  const { data, error } = await supabase.rpc("redeem_reward", { p_reward_id: rewardId });

  if (error) return { error: error.message };

  revalidatePath(`/negocio/${slug}`);
  revalidatePath("/cuenta");
  return { success: true, newBalance: data?.[0]?.new_balance };
}
