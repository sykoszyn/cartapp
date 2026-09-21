"use client";

import { useFormState } from "react-dom";
import { updatePointsConfigAction } from "./actions";
import { Label, Input, FieldHint } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import type { Business } from "@/lib/types";

export function PointsConfigForm({ business }: { business: Business }) {
  const [state, formAction] = useFormState(updatePointsConfigAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state?.error} success={state?.success} />

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="points_per_amount">Puntos que otorgás</Label>
          <Input
            id="points_per_amount"
            name="points_per_amount"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={business.points_per_amount}
          />
        </div>
        <div>
          <Label htmlFor="amount_per_point">Por cada este monto gastado</Label>
          <Input
            id="amount_per_point"
            name="amount_per_point"
            type="number"
            min="1"
            step="1"
            required
            defaultValue={business.amount_per_point}
          />
        </div>
      </div>
      <FieldHint>
        Ej: 1 punto cada $100 → cargá 1 y 100. Un cliente que gasta $450 sumaría 4 puntos.
      </FieldHint>

      <div>
        <Label htmlFor="points_label">Cómo llamás a tus puntos</Label>
        <Input
          id="points_label"
          name="points_label"
          placeholder="puntos, sellos, estrellas…"
          defaultValue={business.points_label}
        />
      </div>

      <SubmitButton pendingLabel="Guardando…">Guardar programa de puntos</SubmitButton>
    </form>
  );
}
