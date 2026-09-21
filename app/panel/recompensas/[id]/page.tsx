import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { RewardForm } from "../reward-form";
import type { Reward } from "@/lib/types";

export default async function EditarRecompensaPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: reward } = await supabase
    .from("rewards")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!reward) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Editar recompensa</h1>
      <div className="mt-8">
        <RewardForm reward={reward as Reward} />
      </div>
    </div>
  );
}
