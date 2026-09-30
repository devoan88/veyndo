import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Veyndo – Ihr Betrieb online in 10 Minuten", template: "%s · Veyndo" },
  description:
    "Profilseite mit Preisen, Öffnungszeiten, Anruf- und WhatsApp-Button. Für Studios, Praxen und Handwerk in Österreich. Kostenlos starten.",
  icons: { icon: "/favicon.svg" },
};

export const viewport: Viewport = { themeColor: "#ece8e0" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="de-AT">
      <body>{children}</body>
    </html>
  );
}
