"use client";

import { useCart } from "./cart-context";
import { Button } from "@/components/ui/button";

export function AddToCartButton({
  productId,
  name,
  price,
  imageUrl,
}: {
  productId: string;
  name: string;
  price: number;
  imageUrl: string | null;
}) {
  const { quantityOf, addItem, setQuantity } = useCart();
  const qty = quantityOf(productId);

  if (qty === 0) {
    return (
      <Button
        size="sm"
        variant="outline"
        className="mt-3"
        onClick={() => addItem({ productId, name, price, imageUrl })}
      >
        Agregar al pedido
      </Button>
    );
  }

  return (
    <div className="mt-3 inline-flex items-center gap-3 rounded border border-ink-200">
      <button
        className="px-3 py-1.5 text-ink-600 hover:text-ink-900"
        onClick={() => setQuantity(productId, qty - 1)}
        aria-label="Restar"
      >
        −
      </button>
      <span className="font-mono text-sm text-ink-900">{qty}</span>
      <button
        className="px-3 py-1.5 text-ink-600 hover:text-ink-900"
        onClick={() => setQuantity(productId, qty + 1)}
        aria-label="Sumar"
      >
        +
      </button>
    </div>
  );
}
