import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { buttonVariants } from "@/lib/button-styles";
import type { Business } from "@/lib/types";

export default async function HomePage() {
  const supabase = createClient();
  const { data: businesses } = await supabase
    .from("businesses")
    .select("*")
    .eq("active", true)
    .order("created_at", { ascending: false })
    .limit(6);

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />

      <main className="flex-1">
        {/* Hero */}
        <section className="container-prose grid gap-10 pb-20 pt-16 sm:pt-24 lg:grid-cols-[1.3fr,1fr] lg:gap-16">
          <div>
            <p className="text-sm font-medium uppercase tracking-[0.14em] text-rust-500">
              Fidelización de barrio
            </p>
            <h1 className="mt-5 font-display text-[2.75rem] leading-[1.08] text-ink-800 text-balance sm:text-6xl">
              Cada compra suma. <span className="italic text-rust-500">Cada visita</span>{" "}
              vale más.
            </h1>
            <p className="mt-6 max-w-md text-lg leading-relaxed text-ink-400">
              Fideliza conecta a comercios y clientes: puntos por compra, recompensas
              para canjear y los descuentos del día, todo en un mismo lugar — sin
              apps complicadas ni tarjetas de cartón.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-4">
              <Link href="/registro?rol=cliente" className={buttonVariants({ size: "lg" })}>
                Quiero sumar puntos
              </Link>
              <Link
                href="/registro?rol=comercio"
                className={buttonVariants({ variant: "outline", size: "lg" })}
              >
                Tengo un comercio
              </Link>
            </div>
          </div>

          <div className="relative hidden lg:block">
            <div className="absolute inset-0 -rotate-2 rounded-xl bg-olive-100" />
            <div className="relative m-6 rounded-xl border border-ink-800/10 bg-cream-50 p-6 shadow-card">
              <p className="font-display text-sm italic text-ink-400">Café Belgrano</p>
              <div className="mt-4 flex items-end justify-between">
                <div>
                  <p className="text-xs uppercase tracking-wide text-ink-400">Tus puntos</p>
                  <p className="mt-1 font-display text-4xl text-ink-800">340</p>
                </div>
                <span className="rounded-full bg-rust-50 px-3 py-1 text-xs font-medium text-rust-600">
                  +18 hoy
                </span>
              </div>
              <div className="mt-6 border-t border-dashed border-ink-800/15 pt-4">
                <p className="text-xs uppercase tracking-wide text-ink-400">Canje disponible</p>
                <p className="mt-1 text-sm text-ink-600">Café + medialuna — 250 pts</p>
              </div>
              <div className="mt-4 rounded border border-olive-300/50 bg-olive-100 px-3 py-2 text-xs text-olive-600">
                20% con Banco Ciudad los martes
              </div>
            </div>
          </div>
        </section>

        {/* Cómo funciona */}
        <section className="border-y border-ink-800/10 bg-ink-800/[0.02] py-20">
          <div className="container-prose">
            <h2 className="font-display text-3xl text-ink-800">Cómo funciona</h2>
            <div className="mt-12 grid gap-10 sm:grid-cols-3">
              <Step
                number="01"
                title="El comercio se suma"
                description="Carga su negocio, sus productos con foto y precio, y define su propio programa de puntos: cuántos puntos por compra y qué se puede canjear."
              />
              <Step
                number="02"
                title="El cliente se registra"
                description="Crea su cuenta gratis, obtiene un código de socio y empieza a sumar puntos en cada comercio que visita."
              />
              <Step
                number="03"
                title="Todos ganan"
                description="El cliente canjea recompensas y aprovecha descuentos por día o medio de pago. El comercio fideliza sin planillas ni tarjetas de papel."
              />
            </div>
          </div>
        </section>

        {/* Comercios */}
        <section className="container-prose py-20">
          <div className="flex items-end justify-between">
            <h2 className="font-display text-3xl text-ink-800">Comercios sumados</h2>
            <Link href="/explorar" className="link-underline hidden text-sm text-ink-600 sm:inline">
              Ver todos
            </Link>
          </div>

          {businesses && businesses.length > 0 ? (
            <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {(businesses as Business[]).map((b) => (
                <Link
                  key={b.id}
                  href={`/negocio/${b.slug}`}
                  className="group rounded-lg border border-ink-800/10 bg-cream-50 p-5 transition hover:border-rust-500/40 hover:shadow-card"
                >
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 shrink-0 overflow-hidden rounded-full bg-ink-800/5">
                      {b.logo_url && (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img src={b.logo_url} alt="" className="h-full w-full object-cover" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium text-ink-800 group-hover:text-rust-600">
                        {b.name}
                      </p>
                      {b.category && <p className="text-xs text-ink-400">{b.category}</p>}
                    </div>
                  </div>
                  {b.description && (
                    <p className="mt-3 line-clamp-2 text-sm text-ink-400">{b.description}</p>
                  )}
                </Link>
              ))}
            </div>
          ) : (
            <div className="mt-10 rounded-lg border border-dashed border-ink-800/20 p-10 text-center">
              <p className="text-ink-400">Todavía no hay comercios cargados.</p>
              <Link
                href="/registro?rol=comercio"
                className={buttonVariants({ className: "mt-4" })}
              >
                Sé el primero
              </Link>
            </div>
          )}
        </section>

        {/* CTA final */}
        <section className="bg-ink-800 py-20 text-cream-50">
          <div className="container-prose flex flex-col items-start justify-between gap-8 sm:flex-row sm:items-center">
            <div>
              <h2 className="font-display text-3xl">¿Listo para empezar?</h2>
              <p className="mt-2 max-w-md text-ink-100/70">
                Es gratis para clientes y comercios. Configurás tu programa de puntos en minutos.
              </p>
            </div>
            <Link href="/registro" className={buttonVariants({ size: "lg" })}>
              Crear mi cuenta
            </Link>
          </div>
        </section>
      </main>

      <SiteFooter />
    </div>
  );
}

function Step({
  number,
  title,
  description,
}: {
  number: string;
  title: string;
  description: string;
}) {
  return (
    <div>
      <span className="font-display text-sm italic text-rust-500">{number}</span>
      <h3 className="mt-3 font-display text-xl text-ink-800">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-ink-400">{description}</p>
    </div>
  );
}
