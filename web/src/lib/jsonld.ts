import type { Business } from "./types";

export function localBusinessJsonLd(b: Business) {
  const address = {
    "@type": "PostalAddress" as const,
    streetAddress: b.street || undefined,
    postalCode: b.postalCode || undefined,
    addressLocality: b.city || undefined,
    addressCountry: "AT",
  };
  const hours = b.hours
    .filter((h) => !h.closed && h.opens && h.closes)
    .map((h) => {
      const day = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"][h.weekday - 1];
      return `${day.slice(0, 2)} ${h.opens}-${h.closes}`;
    });
  return {
    "@context": "https://schema.org",
    "@type": "LocalBusiness",
    name: b.name,
    description: b.about || b.tagline,
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000"}/p/${b.slug}`,
    telephone: b.phone || undefined,
    email: b.email || undefined,
    image: b.coverDataUrl || undefined,
    address,
    openingHours: hours.length ? hours : undefined,
  };
}
