import { ProductForm } from "../product-form";

export default function NuevoProductoPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Nuevo producto</h1>
      <div className="mt-8">
        <ProductForm />
      </div>
    </div>
  );
}
