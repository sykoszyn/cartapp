// Visor de escaneo con un punto de acento: la marca de qrcartapp.
// Es puro SVG (sin clases de Tailwind) para poder reutilizarse tal cual
// dentro de las rutas de favicon/apple-icon, que renderizan con Satori.
export function LogoMark({
  size = 18,
  stroke = "#FAFAFA",
  accent = "#EDA608",
  strokeWidth = 2.6,
}: {
  size?: number;
  stroke?: string;
  accent?: string;
  strokeWidth?: number;
}) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
      <path
        d="M4 8V4H8"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M16 4H20V8"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M20 16V20H16"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M8 20H4V16"
        stroke={stroke}
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <rect x="10" y="10" width="4" height="4" rx="1" fill={accent} />
    </svg>
  );
}
