"use client";

import Link from "next/link";
import { useFormState } from "react-dom";
import { saveProductAction } from "./actions";
import { Label, Input, Textarea, Select, FieldHint } from "@/components/ui/field";
import { ImageField } from "@/components/ui/image-field";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import type { Product, ProductCategory } from "@/lib/types";

export function ProductForm({
  product,
  categories,
}: {
  product?: Product;
  categories: ProductCategory[];
}) {
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
          <Label htmlFor="category_id">Categoría</Label>
          <Select id="category_id" name="category_id" defaultValue={product?.category_id ?? ""}>
            <option value="">Sin categoría</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </Select>
          {categories.length === 0 && (
            <FieldHint>
              Todavía no tenés categorías.{" "}
              <Link href="/panel/categorias" className="link-underline font-medium">
                Creá una
              </Link>{" "}
              (ej: desayunos, almuerzos, promos de la noche…).
            </FieldHint>
          )}
        </div>
      </div>

      <ImageField name="image" label="Foto del producto" currentUrl={product?.image_url} />

      <SubmitButton pendingLabel="Guardando…">
        {product ? "Guardar cambios" : "Agregar producto"}
      </SubmitButton>
    </form>
  );
}
