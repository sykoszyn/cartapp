"use client";

import { useFormState } from "react-dom";
import { saveProductAction } from "./actions";
import { Label, Input, Textarea } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import type { Product } from "@/lib/types";

export function ProductForm({ product }: { product?: Product }) {
  const [state, formAction] = useFormState(saveProductAction, {});

  return (
    <form action={formAction} className="max-w-xl space-y-5">
      <input type="hidden" name="id" value={product?.id ?? ""} />
      <FormMessage error={state?.error} />

      <div>
        <Label htmlFor="name">Nombre</Label>
        <Input id="name" name="name" required defaultValue={product?.name} />
      </div>

      <div>
        <Label htmlFor="description">Descripción</Label>
        <Textarea
          id="description"
          name="description"
          rows={3}
          placeholder="Ingredientes, tamaño, lo que quieras contar."
          defaultValue={product?.description ?? ""}
        />
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div>
          <Label htmlFor="price">Precio</Label>
          <Input
            id="price"
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            defaultValue={product?.price}
          />
        </div>
        <div>
          <Label htmlFor="category">Categoría</Label>
          <Input
            id="category"
            name="category"
            placeholder="Bebidas, postres…"
            defaultValue={product?.category ?? ""}
          />
        </div>
      </div>

      <ImageField name="image" label="Foto del producto" currentUrl={product?.image_url} />

      <SubmitButton pendingLabel="Guardando…">
        {product ? "Guardar cambios" : "Agregar producto"}
      </SubmitButton>
    </form>
  );
}
