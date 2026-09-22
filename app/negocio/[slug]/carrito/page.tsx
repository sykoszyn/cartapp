import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartProvider } from "@/components/cart/cart-context";
import { CartPageClient } from "./cart-page-client";
import type { Business } from "@/lib/types";

export default async function CarritoPage({ params }: { params: { slug: string } }) {
  const supabase = createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", params.slug)
    .eq("active", true)
    .maybeSingle();

  if (!business) notFound();
  const biz = business as Business;

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-14">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-rust-600">
            {biz.name}
          </p>
          <h1 className="mt-2 font-display text-3xl text-ink-800">Tu pedido</h1>

          <div className="mt-8 max-w-lg">
            <CartProvider businessId={biz.id}>
              <CartPageClient business={biz} />
            </CartProvider>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
