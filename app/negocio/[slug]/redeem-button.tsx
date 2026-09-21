"use client";

import { useState, useTransition } from "react";
import { redeemRewardAction } from "./actions";
import { Button } from "@/components/ui/button";

export function RedeemButton({
  rewardId,
  slug,
  canAfford,
  isLoggedIn,
}: {
  rewardId: string;
  slug: string;
  canAfford: boolean;
  isLoggedIn: boolean;
}) {
  const [isPending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);

  if (!isLoggedIn) {
    return <p className="mt-3 text-xs text-ink-400">Iniciá sesión como cliente para canjear.</p>;
  }

  return (
    <div className="mt-3">
      <Button
        size="sm"
        variant={canAfford ? "primary" : "outline"}
        disabled={!canAfford || isPending}
        onClick={() => {
          setMessage(null);
          startTransition(async () => {
            const result = await redeemRewardAction(rewardId, slug);
            setMessage(result.error ? result.error : "¡Canjeado con éxito!");
          });
        }}
      >
        {isPending ? "Canjeando…" : canAfford ? "Canjear" : "Puntos insuficientes"}
      </Button>
      {message && <p className="mt-2 text-xs text-ink-600">{message}</p>}
    </div>
  );
}
