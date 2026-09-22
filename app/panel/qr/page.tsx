import { getMyBusiness } from "@/lib/auth";
import { generateQrSvg } from "@/lib/qrcode";
import { getSiteUrl } from "@/lib/site-url";
import { Card } from "@/components/ui/card";
import { PrintButton } from "./print-button";

export default async function QrPage() {
  const business = await getMyBusiness();
  if (!business) return null;

  const url = `${getSiteUrl()}/negocio/${business.slug}`;
  const svg = await generateQrSvg(url);

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="font-display text-2xl text-ink-800">Código QR</h1>
          <p className="mt-2 max-w-lg text-ink-400">
            Imprimilo o sacale una captura para tenerlo en la mesa, la vidriera o donde
            quieras: al escanearlo, tus clientes llegan directo a tu menú, tus recompensas
            y tus descuentos.
          </p>
        </div>
        <PrintButton />
      </div>

      <div className="mt-8 flex justify-center print:mt-0">
        <Card className="w-full max-w-sm border-dashed p-8 text-center print:border-none print:shadow-none">
          <div className="flex items-center justify-center gap-2">
            {business.logo_url && (
              <div className="h-9 w-9 shrink-0 overflow-hidden rounded-full bg-ink-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={business.logo_url} alt="" className="h-full w-full object-cover" />
              </div>
            )}
            <p className="font-display text-lg text-ink-900">{business.name}</p>
          </div>

          <div
            className="mx-auto mt-6 w-full max-w-[260px] [&>svg]:h-auto [&>svg]:w-full"
            dangerouslySetInnerHTML={{ __html: svg }}
          />

          <div className="ticket-divider mx-6 mt-6" />

          <p className="mt-6 break-all font-mono text-xs text-ink-400">{url}</p>
          <p className="mt-3 text-sm text-ink-600">
            Escaneá para ver el menú, sumar puntos y aprovechar los descuentos.
          </p>
        </Card>
      </div>
    </div>
  );
}
