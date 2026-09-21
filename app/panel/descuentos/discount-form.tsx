"use client";

import { useFormState } from "react-dom";
import { saveDiscountAction } from "./actions";
import { Label, Input, Textarea } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { DISCOUNT_DAYS, type Discount } from "@/lib/types";
import { DAY_LABELS, cn } from "@/lib/utils";

export function DiscountForm({ discount }: { discount?: Discount }) {
  const [state, formAction] = useFormState(saveDiscountAction, {});

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <input type="hidden" name="id" value={discount?.id ?? ""} />
      <FormMessage error={state?.error} />

      <div>
        <Label htmlFor="title">Título</Label>
        <Input
          id="title"
          name="title"
          required
          placeholder="20% con Banco Ciudad"
          defaultValue={discount?.title}
        />
      </div>

      <div>
        <Label>Días</Label>
        <div className="flex flex-wrap gap-2">
          {DISCOUNT_DAYS.map((day) => (
            <label
              key={day}
              className={cn(
                "cursor-pointer rounded-full border px-3.5 py-1.5 text-sm transition",
                discount?.days.includes(day)
                  ? "border-rust-500 bg-rust-50 text-rust-600"
                  : "border-ink-800/15 text-ink-600 hover:border-ink-800/30"
              )}
            >
              <input
                type="checkbox"
                name="days"
                value={day}
                defaultChecked={discount?.days.includes(day)}
                className="sr-only"
              />
              {DAY_LABELS[day]}
            </label>
          ))}
        </div>
      </div>

      <div>
        <Label htmlFor="payment_method">Tarjeta, banco o app</Label>
        <Input
          id="payment_method"
          name="payment_method"
          placeholder="Mercado Pago, Visa Banco Galicia, Cuenta DNI…"
          defaultValue={discount?.payment_method ?? ""}
        />
      </div>

      <div>
        <Label htmlFor="description">Detalle</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Tope de reintegro, condiciones, etc."
          defaultValue={discount?.description ?? ""}
        />
      </div>

      <ImageField
        name="banner"
        label="Banner (por ej. el del banco)"
        currentUrl={discount?.banner_url}
        aspect="aspect-[3/1]"
        hint="Ideal 1200x400px."
      />

      <SubmitButton pendingLabel="Guardando…">
        {discount ? "Guardar cambios" : "Agregar descuento"}
      </SubmitButton>
    </form>
  );
}
