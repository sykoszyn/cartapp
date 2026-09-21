"use client";

import { useFormState } from "react-dom";
import { saveBusinessAction } from "./actions";
import { Label, Input, Textarea } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import type { Business } from "@/lib/types";

export function BusinessForm({ business }: { business: Business | null }) {
  const [state, formAction] = useFormState(saveBusinessAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state?.error} success={state?.success} />

      <div>
        <Label htmlFor="name">Nombre del negocio</Label>
        <Input id="name" name="name" required defaultValue={business?.name} />
      </div>

      <div>
        <Label htmlFor="category">Rubro</Label>
        <Input
          id="category"
          name="category"
          placeholder="Cafetería, restaurante, take away…"
          defaultValue={business?.category ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          rows={4}
          placeholder="Contales a tus clientes de qué se trata tu lugar."
          defaultValue={business?.description ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <ImageField name="logo" label="Logo" currentUrl={business?.logo_url} />
        <ImageField
          name="cover"
          label="Foto de portada"
          currentUrl={business?.cover_url}
          aspect="aspect-video"
        />
      </div>

      <div>
        <Label htmlFor="address">Dirección</Label>
        <Input id="address" name="address" defaultValue={business?.address ?? ""} />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="phone">Teléfono / WhatsApp</Label>
          <Input id="phone" name="phone" defaultValue={business?.phone ?? ""} />
        </div>
        <div>
          <Label htmlFor="schedule">Horarios</Label>
          <Input
            id="schedule"
            name="schedule"
            placeholder="Lun a sáb 9 a 20 h"
            defaultValue={business?.schedule ?? ""}
          />
        </div>
      </div>

      <SubmitButton pendingLabel="Guardando…">
        {business ? "Guardar cambios" : "Crear mi negocio"}
      </SubmitButton>
    </form>
  );
}
