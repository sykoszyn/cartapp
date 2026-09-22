"use client";

import { useTransition } from "react";
import { markOrderPaidAction, cancelOrderAction } from "./actions";
import { Button } from "@/components/ui/button";

export function OrderRowActions({ orderId }: { orderId: string }) {
  const [isPending, startTransition] = useTransition();

  return (
    <div className="flex items-center gap-3">
      <Button
        size="sm"
        disabled={isPending}
        onClick={() => startTransition(() => markOrderPaidAction(orderId))}
      >
        Marcar pagado
      </Button>
      <button
        className="text-xs text-danger-600 disabled:opacity-50"
        disabled={isPending}
        onClick={() => {
          if (confirm("¿Cancelar este pedido?")) {
            startTransition(() => cancelOrderAction(orderId));
          }
        }}
      >
        Cancelar
      </button>
    </div>
  );
}
