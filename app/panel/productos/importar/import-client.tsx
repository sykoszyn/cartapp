"use client";

import { useEffect, useState, useTransition } from "react";
import Link from "next/link";
import { useFormState } from "react-dom";
import { parseMenuAction, confirmImportAction } from "./actions";
import { Label, Input, Textarea } from "@/components/ui/field";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { FormMessage } from "@/components/ui/form-message";
import { Card } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";

interface ReviewProduct {
  name: string;
  description: string | null;
  price: number;
  selected: boolean;
}

interface ReviewCategory {
  name: string;
  products: ReviewProduct[];
}

export function ImportMenuClient() {
  const [state, formAction] = useFormState(parseMenuAction, {});
  const [review, setReview] = useState<ReviewCategory[] | null>(null);
  const [isPending, startTransition] = useTransition();
  const [result, setResult] = useState<{ error?: string; imported?: number } | null>(null);

  useEffect(() => {
    if (state?.menu) {
      setReview(
        state.menu.categories.map((c) => ({
          name: c.name,
          products: c.products.map((p) => ({ ...p, selected: true })),
        }))
      );
    }
  }, [state]);

  if (result?.imported !== undefined) {
    return (
      <Card className="max-w-lg p-6 text-center">
        <p className="font-display text-2xl text-ink-900">¡Listo!</p>
        <p className="mt-2 text-ink-600">
          Importamos {result.imported} producto{result.imported === 1 ? "" : "s"}.
        </p>
        <div className="mt-5 flex justify-center gap-4 text-sm">
          <Link href="/panel/productos" className="link-underline font-medium text-ink-900">
            Ver productos
          </Link>
          <button
            className="link-underline text-ink-600"
            onClick={() => {
              setResult(null);
              setReview(null);
            }}
          >
            Importar otro menú
          </button>
        </div>
      </Card>
    );
  }

  if (review) {
    const selectedCount = review.reduce(
      (sum, c) => sum + c.products.filter((p) => p.selected).length,
      0
    );

    const toggleProduct = (ci: number, pi: number) => {
      setReview((prev) => {
        if (!prev) return prev;
        const next = prev.map((c) => ({ ...c, products: [...c.products] }));
        next[ci].products[pi] = { ...next[ci].products[pi], selected: !next[ci].products[pi].selected };
        return next;
      });
    };

    const toggleCategory = (ci: number, value: boolean) => {
      setReview((prev) => {
        if (!prev) return prev;
        const next = prev.map((c) => ({ ...c, products: [...c.products] }));
        next[ci].products = next[ci].products.map((p) => ({ ...p, selected: value }));
        return next;
      });
    };

    return (
      <div>
        <p className="text-ink-600">
          Revisá lo que encontramos. Desmarcá lo que no quieras importar — después podés
          editar nombre, precio y foto de cada producto desde Productos.
        </p>

        {result?.error && (
          <p className="mt-4 rounded border border-danger-500/30 bg-danger-50 px-4 py-3 text-sm text-danger-600">
            {result.error}
          </p>
        )}

        <div className="mt-6 max-w-xl space-y-6">
          {review.map((category, ci) => (
            <div key={category.name}>
              <div className="flex items-center justify-between">
                <h3 className="font-display text-lg text-ink-900">{category.name}</h3>
                <label className="flex items-center gap-2 text-xs text-ink-400">
                  <input
                    type="checkbox"
                    checked={category.products.every((p) => p.selected)}
                    onChange={(e) => toggleCategory(ci, e.target.checked)}
                  />
                  Seleccionar todos
                </label>
              </div>
              <Card className="mt-2 divide-y divide-ink-200">
                {category.products.map((product, pi) => (
                  <label
                    key={`${product.name}-${pi}`}
                    className="flex items-start gap-3 px-4 py-3 text-sm"
                  >
                    <input
                      type="checkbox"
                      className="mt-1"
                      checked={product.selected}
                      onChange={() => toggleProduct(ci, pi)}
                    />
                    <span className="flex-1">
                      <span className="block font-medium text-ink-900">{product.name}</span>
                      {product.description && (
                        <span className="block text-xs text-ink-400">{product.description}</span>
                      )}
                    </span>
                    <span className="font-mono text-ink-600">{formatCurrency(product.price)}</span>
                  </label>
                ))}
              </Card>
            </div>
          ))}
        </div>

        <div className="mt-6 flex items-center gap-4">
          <Button
            disabled={selectedCount === 0 || isPending}
            onClick={() => {
              startTransition(async () => {
                const payload = review
                  .map((c) => ({
                    name: c.name,
                    products: c.products.filter((p) => p.selected),
                  }))
                  .filter((c) => c.products.length > 0);
                const res = await confirmImportAction(payload);
                setResult(res);
              });
            }}
          >
            {isPending ? "Importando…" : `Importar ${selectedCount} producto${selectedCount === 1 ? "" : "s"}`}
          </Button>
          <button className="text-sm text-ink-400" onClick={() => setReview(null)}>
            Cancelar
          </button>
        </div>
      </div>
    );
  }

  return (
    <form action={formAction} className="max-w-lg space-y-5">
      <FormMessage error={state?.error} />

      <div>
        <Label htmlFor="url">Link de tu menú actual</Label>
        <Input id="url" name="url" type="url" placeholder="https://…" />
      </div>

      <div className="flex items-center gap-3 text-xs text-ink-400">
        <span className="h-px flex-1 bg-ink-200" />
        o pegá el texto directamente
        <span className="h-px flex-1 bg-ink-200" />
      </div>

      <div>
        <Label htmlFor="text">Texto del menú</Label>
        <Textarea
          id="text"
          name="text"
          rows={8}
          placeholder="Pegá acá el texto de tu menú si el link no funciona (o directamente, sin link)."
        />
      </div>

      <SubmitButton pendingLabel="Leyendo menú…">Analizar menú</SubmitButton>
    </form>
  );
}
