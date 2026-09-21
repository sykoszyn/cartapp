"use client";

import { useFormState } from "react-dom";
import { saveRewardAction } from "./actions";
import { Label, Input, Textarea, FieldHint } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import type { Reward } from "@/lib/types";

export function RewardForm({ reward }: { reward?: Reward }) {
  const [state, formAction] = useFormState(saveRewardAction, {});

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <input type="hidden" name="id" value={reward?.id ?? ""} />
      <FormMessage error={state?.error} />

      <div>
        <Label htmlFor="name">Nombre de la recompensa</Label>
        <Input
          id="name"
          name="name"
          required
          placeholder="Café gratis, 2x1 en medialunas…"
          defaultValue={reward?.name}
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea id="description" name="description" rows={3} defaultValue={reward?.description ?? ""} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="points_cost">Costo en puntos</Label>
          <Input
            id="points_cost"
            name="points_cost"
            type="number"
            min="1"
            required
            defaultValue={reward?.points_cost}
          />
        </div>
        <div>
          <Label htmlFor="stock">Stock disponible</Label>
          <Input id="stock" name="stock" type="number" min="0" defaultValue={reward?.stock ?? ""} />
          <FieldHint>Dejalo vacío para stock ilimitado.</FieldHint>
        </div>
      </div>

      <ImageField name="image" label="Foto de la recompensa" currentUrl={reward?.image_url} />

      <SubmitButton pendingLabel="Guardando…">
        {reward ? "Guardar cambios" : "Agregar recompensa"}
      </SubmitButton>
    </form>
  );
}
