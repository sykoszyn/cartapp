"use client";

import { useTransition } from "react";
import { toggleRewardAction, deleteRewardAction } from "./actions";

export function ToggleButton({ id, active }: { id: string; active: boolean }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      className="link-underline text-ink-600 disabled:opacity-50"
      disabled={isPending}
      onClick={() => startTransition(() => toggleRewardAction(id, active))}
    >
      {active ? "Ocultar" : "Mostrar"}
    </button>
  );
}

export function DeleteButton({ id }: { id: string }) {
  const [isPending, startTransition] = useTransition();
  return (
    <button
      className="link-underline text-rust-600 disabled:opacity-50"
      disabled={isPending}
      onClick={() => {
        if (confirm("¿Eliminar esta recompensa?")) {
          startTransition(() => deleteRewardAction(id));
        }
      }}
    >
      Eliminar
    </button>
  );
}
