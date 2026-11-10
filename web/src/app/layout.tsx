import type { Metadata, Viewport } from "next";
import "./globals.css";
import { LocaleProvider } from "@/components/i18n/LocaleProvider";
import { DEFAULT_LOCALE, getMessages, htmlLang, ogLocale, profileDomainFor, siteUrlFor } from "@/lib/i18n";

const locale = DEFAULT_LOCALE;
const m = getMessages(locale);
const site = siteUrlFor(locale);
const domain = profileDomainFor(locale);

export const metadata: Metadata = {
  metadataBase: new URL(site),
  title: { default: m.meta.titleDefault, template: m.meta.titleTemplate },
  description: m.meta.description,
  icons: { icon: "/favicon.svg" },
  openGraph: {
    type: "website",
    locale: ogLocale(locale),
    url: site,
    siteName: "Veyndo",
    title: m.meta.titleDefault,
    description: m.meta.description,
  },
  alternates: {
    canonical: site,
    languages: {
      ka: "https://veyndo.ge",
      "x-default": "https://veyndo.ge",
    },
  },
  other: {
    "veyndo:domain": domain,
  },
};

export const viewport: Viewport = { themeColor: "#f2eee4" };

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang={htmlLang(locale)}>
      <body>
        <LocaleProvider locale={locale}>{children}</LocaleProvider>
      </body>
    </html>
  );
}
