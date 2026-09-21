import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { DiscountForm } from "../discount-form";
import type { Discount } from "@/lib/types";

export default async function EditarDescuentoPage({ params }: { params: { id: string } }) {
  const supabase = createClient();
  const { data: discount } = await supabase
    .from("discounts")
    .select("*")
    .eq("id", params.id)
    .single();

  if (!discount) notFound();

  return (
    <div>
      <h1 className="font-display text-2xl text-ink-800">Editar descuento</h1>
      <div className="mt-8">
        <DiscountForm discount={discount as Discount} />
      </div>
    </div>
  );
}
