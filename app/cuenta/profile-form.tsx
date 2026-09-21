"use client";

import { useFormState } from "react-dom";
import { updateProfileAction } from "./actions";
import { Label, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import type { Profile } from "@/lib/types";

export function ProfileForm({ profile }: { profile: Profile }) {
  const [state, formAction] = useFormState(updateProfileAction, {});

  return (
    <form action={formAction} className="space-y-5">
      <FormMessage error={state?.error} success={state?.success} />

      <div>
        <Label htmlFor="full_name">Nombre y apellido</Label>
        <Input id="full_name" name="full_name" required defaultValue={profile.full_name} />
      </div>

      <div>
        <Label htmlFor="phone">Teléfono</Label>
        <Input id="phone" name="phone" defaultValue={profile.phone ?? ""} />
      </div>

      <SubmitButton pendingLabel="Guardando…">Guardar cambios</SubmitButton>
    </form>
  );
}
