import { isMenuImportConfigured } from "@/lib/menu-import";
import { ImportMenuClient } from "./import-client";

export default function ImportarMenuPage() {
  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Importar menú</h1>
      <p className="mt-2 max-w-lg text-ink-400">
        Si ya tenés tu carta en otra plataforma (otra app de pedidos, tu propia web, un link de
        red social), pegá el link y lo leemos automáticamente para crearte los productos y las
        categorías. Después revisás y confirmás qué importar.
      </p>

      <div className="mt-8">
        {isMenuImportConfigured() ? (
          <ImportMenuClient />
        ) : (
          <p className="max-w-lg rounded border border-dashed border-ink-200 p-6 text-sm text-ink-400">
            Esta función todavía no está activada en este sitio. Mientras tanto, cargá tus
            productos desde <span className="text-ink-600">Productos → Agregar producto</span>.
          </p>
        )}
      </div>
    </div>
  );
}
