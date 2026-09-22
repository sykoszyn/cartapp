import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { getCurrentProfile } from "@/lib/auth";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, Badge } from "@/components/ui/card";
import { cn, formatCurrency, DAY_LABELS } from "@/lib/utils";
import { RedeemButton } from "./redeem-button";
import type { Business, Product, ProductCategory, Reward, Discount } from "@/lib/types";

type Tab = "productos" | "recompensas" | "descuentos";

export default async function BusinessPage({
  params,
  searchParams,
}: {
  params: { slug: string };
  searchParams: { tab?: string };
}) {
  const supabase = createClient();
  const { data: business } = await supabase
    .from("businesses")
    .select("*")
    .eq("slug", params.slug)
    .eq("active", true)
    .maybeSingle();

  if (!business) notFound();
  const biz = business as Business;

  const tab: Tab = (["productos", "recompensas", "descuentos"] as Tab[]).includes(
    searchParams.tab as Tab
  )
    ? (searchParams.tab as Tab)
    : "productos";

  const [
    { data: products },
    { data: categories },
    { data: rewards },
    { data: discounts },
    profile,
  ] = await Promise.all([
    supabase
      .from("products")
      .select("*")
      .eq("business_id", biz.id)
      .eq("active", true)
      .order("sort_order"),
    supabase
      .from("product_categories")
      .select("*")
      .eq("business_id", biz.id)
      .order("sort_order", { ascending: true }),
    supabase
      .from("rewards")
      .select("*")
      .eq("business_id", biz.id)
      .eq("active", true)
      .order("points_cost"),
    supabase
      .from("discounts")
      .select("*")
      .eq("business_id", biz.id)
      .eq("active", true)
      .order("created_at", { ascending: false }),
    getCurrentProfile(),
  ]);

  let myPoints = 0;
  if (profile?.role === "customer") {
    const { data: cp } = await supabase
      .from("customer_points")
      .select("points")
      .eq("customer_id", profile.id)
      .eq("business_id", biz.id)
      .maybeSingle();
    myPoints = cp?.points ?? 0;
  }

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="aspect-[3/1] w-full bg-ink-800/5 sm:aspect-[4/1]">
          {biz.cover_url && (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={biz.cover_url} alt="" className="h-full w-full object-cover" />
          )}
        </div>

        <div className="container-prose">
          <div className="-mt-10 flex items-end gap-4">
            <div className="h-20 w-20 shrink-0 overflow-hidden rounded-full border-4 border-cream-100 bg-ink-800/5">
              {biz.logo_url && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={biz.logo_url} alt="" className="h-full w-full object-cover" />
              )}
            </div>
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-6">
            <div>
              <h1 className="font-display text-3xl text-ink-800">{biz.name}</h1>
              {biz.category && <p className="mt-1 text-sm text-ink-400">{biz.category}</p>}
              {biz.description && (
                <p className="mt-3 max-w-xl text-ink-600">{biz.description}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-x-5 gap-y-1 text-sm text-ink-400">
                {biz.address && <span>📍 {biz.address}</span>}
                {biz.schedule && <span>🕘 {biz.schedule}</span>}
                {biz.phone && <span>📞 {biz.phone}</span>}
              </div>
            </div>

            {profile?.role === "customer" ? (
              <Card className="w-full max-w-[220px] p-5 text-center">
                <p className="text-xs uppercase tracking-wide text-ink-400">
                  Tus {biz.points_label}
                </p>
                <p className="mt-1 font-display text-4xl text-rust-600">{myPoints}</p>
              </Card>
            ) : !profile ? (
              <Card className="w-full max-w-[260px] p-5 text-center">
                <p className="text-sm text-ink-600">Iniciá sesión para sumar puntos acá.</p>
                <Link href="/ingresar" className="link-underline mt-2 inline-block text-sm font-medium text-ink-800">
                  Ingresar
                </Link>
              </Card>
            ) : null}
          </div>

          <div className="mt-10 flex gap-1 border-b border-ink-800/10">
            <TabLink slug={biz.slug} tab="productos" active={tab === "productos"}>
              Productos
            </TabLink>
            <TabLink slug={biz.slug} tab="recompensas" active={tab === "recompensas"}>
              Recompensas
            </TabLink>
            <TabLink slug={biz.slug} tab="descuentos" active={tab === "descuentos"}>
              Descuentos
            </TabLink>
          </div>

          <div className="py-10">
            {tab === "productos" && (
              <ProductsGrid
                products={(products as Product[]) ?? []}
                categories={(categories as ProductCategory[]) ?? []}
              />
            )}
            {tab === "recompensas" && (
              <RewardsGrid
                rewards={(rewards as Reward[]) ?? []}
                slug={biz.slug}
                pointsLabel={biz.points_label}
                myPoints={myPoints}
                isLoggedIn={!!profile}
              />
            )}
            {tab === "descuentos" && <DiscountsList discounts={(discounts as Discount[]) ?? []} />}
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}

function TabLink({
  slug,
  tab,
  active,
  children,
}: {
  slug: string;
  tab: Tab;
  active: boolean;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={`/negocio/${slug}?tab=${tab}`}
      className={cn(
        "-mb-px border-b-2 px-4 py-3 text-sm font-medium",
        active ? "border-rust-500 text-ink-800" : "border-transparent text-ink-400 hover:text-ink-600"
      )}
    >
      {children}
    </Link>
  );
}

function ProductsGrid({
  products,
  categories,
}: {
  products: Product[];
  categories: ProductCategory[];
}) {
  if (products.length === 0) {
    return <p className="text-ink-400">Este comercio todavía no cargó productos.</p>;
  }

  const groups = [
    ...categories.map((c) => ({
      id: c.id,
      name: c.name,
      items: products.filter((p) => p.category_id === c.id),
    })),
    { id: null, name: "Otros", items: products.filter((p) => !p.category_id) },
  ].filter((g) => g.items.length > 0);

  return (
    <div className="space-y-10">
      {groups.map((group) => (
        <div key={group.id ?? "otros"}>
          <h3 className="font-display text-lg text-ink-800">{group.name}</h3>
          <div className="mt-4 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {group.items.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="aspect-video bg-ink-800/5">
                  {p.image_url && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={p.image_url} alt="" className="h-full w-full object-cover" />
                  )}
                </div>
                <div className="p-4">
                  <p className="font-medium text-ink-800">{p.name}</p>
                  <p className="mt-1 font-display text-lg text-rust-600">
                    {formatCurrency(p.price)}
                  </p>
                  {p.description && <p className="mt-1 text-sm text-ink-400">{p.description}</p>}
                </div>
              </Card>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

function RewardsGrid({
  rewards,
  slug,
  pointsLabel,
  myPoints,
  isLoggedIn,
}: {
  rewards: Reward[];
  slug: string;
  pointsLabel: string;
  myPoints: number;
  isLoggedIn: boolean;
}) {
  if (rewards.length === 0) {
    return <p className="text-ink-400">Todavía no hay recompensas cargadas.</p>;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {rewards.map((r) => (
        <Card key={r.id} className="overflow-hidden">
          <div className="aspect-video bg-ink-800/5">
            {r.image_url && (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={r.image_url} alt="" className="h-full w-full object-cover" />
            )}
          </div>
          <div className="p-4">
            <p className="font-medium text-ink-800">{r.name}</p>
            <p className="mt-1 font-display text-lg text-rust-600">
              {r.points_cost} {pointsLabel}
            </p>
            {r.description && <p className="mt-1 text-sm text-ink-400">{r.description}</p>}
            <RedeemButton
              rewardId={r.id}
              slug={slug}
              canAfford={myPoints >= r.points_cost}
              isLoggedIn={isLoggedIn}
            />
          </div>
        </Card>
      ))}
    </div>
  );
}

function DiscountsList({ discounts }: { discounts: Discount[] }) {
  if (discounts.length === 0) {
    return <p className="text-ink-400">Este comercio no cargó descuentos por el momento.</p>;
  }
  return (
    <div className="grid gap-5 sm:grid-cols-2">
      {discounts.map((d) => (
        <Card key={d.id} className="overflow-hidden">
          {d.banner_url && (
            <div className="aspect-[3/1] bg-ink-800/5">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={d.banner_url} alt="" className="h-full w-full object-cover" />
            </div>
          )}
          <div className="p-4">
            <p className="font-medium text-ink-800">{d.title}</p>
            <div className="mt-2 flex flex-wrap gap-1.5">
              {d.days.map((day) => (
                <Badge key={day} variant="rust">
                  {DAY_LABELS[day]}
                </Badge>
              ))}
            </div>
            {d.payment_method && <p className="mt-2 text-sm text-ink-600">💳 {d.payment_method}</p>}
            {d.description && <p className="mt-1 text-sm text-ink-400">{d.description}</p>}
          </div>
        </Card>
      ))}
    </div>
  );
}
