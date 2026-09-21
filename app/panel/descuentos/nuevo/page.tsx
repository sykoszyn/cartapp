import { DiscountForm } from "../discount-form";

export default function NuevoDescuentoPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Nuevo descuento</h1>
      <div className="mt-8">
        <DiscountForm />
      </div>
    </div>
  );
}
