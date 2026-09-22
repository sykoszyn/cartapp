"use client";

import { useState, useTransition } from "react";
import { useFormState } from "react-dom";
import { saveCategoryAction, deleteCategoryAction, moveCategoryAction } from "./actions";
import { Input } from "@/components/ui/field";
import { Card } from "@/components/ui/card";
import { SubmitButton } from "@/components/ui/submit-button";
import type { ProductCategory } from "@/lib/types";

export function CategoryRow({
  category,
  isFirst,
  isLast,
  productCount,
}: {
  category: ProductCategory;
  isFirst: boolean;
  isLast: boolean;
  productCount: number;
}) {
  const [state, formAction] = useFormState(saveCategoryAction, {});
  const [isPending, startTransition] = useTransition();
  const [confirmingDelete, setConfirmingDelete] = useState(false);

  return (
    <Card className="flex flex-wrap items-center gap-3 p-4">
      <div className="flex flex-col gap-0.5">
        <button
          type="button"
          disabled={isFirst || isPending}
          onClick={() => startTransition(() => moveCategoryAction(category.id, "up"))}
          className="text-ink-400 hover:text-ink-900 disabled:opacity-20"
          aria-label="Subir"
        >
          ▲
        </button>
        <button
          type="button"
          disabled={isLast || isPending}
          onClick={() => startTransition(() => moveCategoryAction(category.id, "down"))}
          className="text-ink-400 hover:text-ink-900 disabled:opacity-20"
          aria-label="Bajar"
        >
          ▼
        </button>
      </div>

      <form action={formAction} className="flex flex-1 items-center gap-3">
        <input type="hidden" name="id" value={category.id} />
        <Input name="name" defaultValue={category.name} required className="max-w-xs" />
        <SubmitButton variant="outline" size="sm" pendingLabel="Guardando…">
          Guardar
        </SubmitButton>
        {state?.error && <span className="text-xs text-danger-600">{state.error}</span>}
      </form>

      <span className="text-xs text-ink-400">
        {productCount} producto{productCount === 1 ? "" : "s"}
      </span>

      {confirmingDelete ? (
        <div className="flex items-center gap-2 text-xs">
          <span className="text-ink-600">¿Eliminar?</span>
          <button
            className="font-medium text-danger-600"
            onClick={() => startTransition(() => deleteCategoryAction(category.id))}
          >
            Sí
          </button>
          <button className="text-ink-400" onClick={() => setConfirmingDelete(false)}>
            No
          </button>
        </div>
      ) : (
        <button
          className="link-underline text-sm text-danger-600"
          onClick={() => setConfirmingDelete(true)}
        >
          Eliminar
        </button>
      )}
    </Card>
  );
}
