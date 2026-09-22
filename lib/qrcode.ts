import QRCode from "qrcode";

// Genera el QR como SVG (vector, se ve nítido tanto en pantalla como
// impreso en cualquier tamaño) para un valor dado (típicamente la URL
// pública del negocio).
export async function generateQrSvg(value: string): Promise<string> {
  return QRCode.toString(value, {
    type: "svg",
    margin: 1,
    color: {
      dark: "#161618",
      light: "#00000000",
    },
  });
}
