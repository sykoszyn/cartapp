"use client";

import { useEffect, useRef } from "react";
import { useFormState } from "react-dom";
import { saveCategoryAction } from "./actions";
import { Input } from "@/components/ui/field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";

export function NewCategoryForm() {
  const [state, formAction] = useFormState(saveCategoryAction, {});
  const formRef = useRef<HTMLFormElement>(null);

  useEffect(() => {
    if (state?.success) formRef.current?.reset();
  }, [state]);

  return (
    <form ref={formRef} action={formAction} className="flex flex-wrap items-start gap-3">
      <div className="min-w-[220px] flex-1">
        <Input
          name="name"
          required
          placeholder="Ej: Postres, Bebidas sin alcohol, Menú infantil…"
        />
        <FormMessage error={state?.error} success={state?.success} />
      </div>
      <SubmitButton pendingLabel="Agregando…">Agregar categoría</SubmitButton>
    </form>
  );
}
