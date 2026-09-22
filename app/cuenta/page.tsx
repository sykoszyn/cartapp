import Link from "next/link";
import { redirect } from "next/navigation";
import { requireProfile } from "@/lib/auth";
import { createClient } from "@/lib/supabase/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card } from "@/components/ui/card";
import { CopyCode } from "./copy-code";
import { ProfileForm } from "./profile-form";

export default async function CuentaPage() {
  const profile = await requireProfile();
  if (profile.role === "business") redirect("/panel");

  const supabase = createClient();
  const { data: points } = await supabase
    .from("customer_points")
    .select("points, updated_at, business:businesses(id, name, slug, logo_url, points_label)")
    .eq("customer_id", profile.id)
    .order("updated_at", { ascending: false });

  return (
    <div className="flex min-h-screen flex-col">
      <SiteHeader />
      <main className="flex-1">
        <div className="container-prose py-14">
          <p className="text-sm font-medium uppercase tracking-[0.14em] text-rust-600">
            Mi cuenta
          </p>
          <h1 className="mt-2 font-display text-4xl font-semibold tracking-tight text-ink-900">
            Hola, {profile.full_name}
          </h1>

          <div className="mt-10 grid gap-8 lg:grid-cols-[280px,1fr]">
            <div className="space-y-6">
              <Card className="border-dashed p-6 text-center">
                <p className="text-xs uppercase tracking-wide text-ink-400">Tu código de socio</p>
                <p className="mt-2 font-mono text-3xl tracking-[0.2em] text-ink-900">
                  {profile.member_code}
                </p>
                <div className="ticket-divider mx-4 mt-4" />
                <p className="mt-4 text-xs text-ink-400">
                  Mostralo en el mostrador para sumar puntos en cada compra.
                </p>
                <CopyCode code={profile.member_code ?? ""} />
              </Card>

              <Card className="p-6">
                <h2 className="font-display text-lg font-semibold tracking-tight text-ink-900">
                  Mi perfil
                </h2>
                <div className="mt-4">
                  <ProfileForm profile={profile} />
                </div>
              </Card>
            </div>

            <div>
              <h2 className="font-display text-xl font-semibold tracking-tight text-ink-900">
                Tus puntos por comercio
              </h2>
              {points && points.length > 0 ? (
                <div className="mt-5 grid gap-4 sm:grid-cols-2">
                  {points.map((p: any) => (
                    <Link
                      key={p.business.id}
                      href={`/negocio/${p.business.slug}`}
                      className="group flex items-center justify-between rounded-lg border border-ink-200 bg-cream-50 p-5 transition hover:border-ink-900"
                    >
                      <div className="flex items-center gap-3">
                        <div className="h-11 w-11 shrink-0 overflow-hidden rounded-full bg-ink-100">
                          {p.business.logo_url && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={p.business.logo_url}
                              alt=""
                              className="h-full w-full object-cover"
                            />
                          )}
                        </div>
                        <p className="font-medium text-ink-900">{p.business.name}</p>
                      </div>
                      <span className="font-mono text-xl text-ink-900">
                        {p.points} <span className="text-sm text-ink-400">{p.business.points_label}</span>
                      </span>
                    </Link>
                  ))}
                </div>
              ) : (
                <div className="mt-5 rounded-lg border border-dashed border-ink-200 p-10 text-center">
                  <p className="text-ink-400">Todavía no sumaste puntos en ningún comercio.</p>
                  <Link href="/explorar" className="link-underline mt-3 inline-block font-medium text-ink-900">
                    Explorar comercios →
                  </Link>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
