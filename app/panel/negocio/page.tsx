import { getMyBusiness } from "@/lib/auth";
import { BusinessForm } from "./business-form";

export default async function NegocioPage() {
  const business = await getMyBusiness();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Mi negocio</h1>
      <p className="mt-2 max-w-lg text-ink-400">
        Esta información se muestra en tu página pública: {business ? `/negocio/${business.slug}` : "la URL se genera al guardar"}.
      </p>

      <div className="mt-8 max-w-xl">
        <BusinessForm business={business} />
      </div>
    </div>
  );
}
