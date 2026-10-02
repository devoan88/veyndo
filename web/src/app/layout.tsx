import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Veyndo – Ihre Seite, persönlich für Sie gebaut", template: "%s · Veyndo" },
  description:
    "Websites mit Preisen, Öffnungszeiten, Galerie, Anruf- und WhatsApp-Button. Persönlich eingerichtet für Studios, Praxen und Handwerk in Wien. Festpreise ab € 1.490.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#f2eee4" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-AT">
      <body>{children}</body>
    </html>
  );
}
