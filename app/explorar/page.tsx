import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Input } from "@/components/ui/field";
import type { Business } from "@/lib/types";

export default async function ExplorarPage({
  searchParams,
}: {
  searchParams: { q?: string; categoria?: string };
}) {
  const supabase = createClient();

  let query = supabase.from("businesses").select("*").eq("active", true);

  if (searchParams.q) {
    query = query.ilike("name", `%${searchParams.q}%`);
  }
  if (searchParams.categoria) {
    query = query.eq("category", searchParams.categoria);
  }

  const { data: businesses } = await query.order("name");

  const { data: categoryRows } = await supabase
    .from("businesses")
    .select("category")
    .eq("active", true)
    .not("category", "is", null);

  const categories = Array.from(
    new Set((categoryRows ?? []).map((c) => c.category).filter(Boolean))
  ) as string[];

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-14">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-rust-500">
            Comercios
          </p>
          <h1 className="mt-2 font-display text-4xl text-ink-800">Explorá y sumá puntos</h1>

          <form className="mt-8 flex flex-wrap gap-3" action="/explorar">
            <Input
              name="q"
              placeholder="Buscar por nombre…"
              defaultValue={searchParams.q}
              className="max-w-xs"
            />
            {categories.length > 0 && (
              <select
                name="categoria"
                defaultValue={searchParams.categoria ?? ""}
                className="rounded border border-ink-800/15 bg-cream-50 px-3.5 py-2.5 text-[0.95rem] text-ink-800"
              >
                <option value="">Todos los rubros</option>
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            )}
            <button className="rounded bg-ink-800 px-5 py-2.5 text-sm font-medium text-cream-50 hover:bg-ink-900">
              Buscar
            </button>
          </form>

          {businesses && businesses.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(businesses as Business[]).map((b) => (
                <Link
                  key={b.id}
                  href={`/negocio/${b.slug}`}
                  className="group overflow-hidden rounded-lg border border-ink-800/10 bg-cream-50 transition hover:border-ink-900 hover:shadow-card"
                >
                  <div className="aspect-video bg-ink-800/5">
                    {b.cover_url && (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={b.cover_url} alt="" className="h-full w-full object-cover" />
                    )}
                  </div>
                  <div className="p-5">
                    <p className="font-medium text-ink-800 group-hover:text-rust-600">
                      {b.name}
                    </p>
                    {b.category && <p className="text-xs text-ink-400">{b.category}</p>}
                    {b.description && (
                      <p className="mt-2 line-clamp-2 text-sm text-ink-400">{b.description}</p>
                    )}
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            <p className="mt-12 text-ink-400">No encontramos comercios con esa búsqueda.</p>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
