"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { addPointsAction } from "./actions";
import { Label, Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function AddPointsForm() {
  const [state, formAction] = useFormState(addPointsAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="space-y-5">
      <FormMessage error={state?.error} success={state?.success} />

      <div>
        <Label htmlFor="member_code">Código de socio del cliente</Label>
        <Input
          id="member_code"
          name="member_code"
          required
          placeholder="Ej: 7F3A9C2"
          className="uppercase"
        />
      </div>

      <div>
        <Label htmlFor="amount">Monto de la compra</Label>
        <Input id="amount" name="amount" type="number" min="0.01" step="0.01" required />
      </div>

      <div>
        <Label htmlFor="note">Nota (opcional)</Label>
        <Input id="note" name="note" placeholder="Ticket #1234" />
      </div>

      <SubmitButton pendingLabel="Cargando…">Cargar puntos</SubmitButton>
    </form>
  );
}
