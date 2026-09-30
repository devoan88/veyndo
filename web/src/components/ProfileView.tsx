import type { Business } from "@/lib/types";
import { PLANS } from "@/lib/plans";
import { PROFILE_DOMAIN } from "@/lib/slug";

export const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];

const digits = (s: string) => s.replace(/[^\d+]/g, "");

function whatsappLink(n: string) {
  const d = n.replace(/\D/g, "").replace(/^00/, "").replace(/^0/, "43");
  return `https://wa.me/${d}`;
}

export default function ProfileView({
  b,
  today,
  onTrack,
}: {
  b: Business;
  today?: number;
  onTrack?: (kind: "call" | "whatsapp" | "route") => void;
}) {
  const plan = PLANS[b.tier];
  const services = b.services.filter((s) => s.title.trim()).slice(0, plan.maxServices);
  const address = [b.street, [b.postalCode, b.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [b.name, address].filter(Boolean).join(", "),
  )}`;
  const hasLegal = b.legalName.trim() !== "";

  return (
    <article className="profile" style={{ ["--pa" as string]: b.accentColor }}>
      <div
        className="cover"
        style={b.coverDataUrl ? { backgroundImage: `url(${b.coverDataUrl})` } : undefined}
        role={b.coverDataUrl ? "img" : undefined}
        aria-label={b.coverDataUrl ? `Foto von ${b.name}` : undefined}
      />
      <div className="head">
        <div className="badge" aria-hidden>{(b.name.trim()[0] || "V").toUpperCase()}</div>
        <h1>{b.name || "Ihr Betrieb"}</h1>
        {b.tagline && <p className="tagline">{b.tagline}</p>}
      </div>

      <div className="actions">
        <a href={b.phone ? `tel:${digits(b.phone)}` : undefined} aria-disabled={!b.phone} onClick={() => b.phone && onTrack?.("call")}>Anrufen</a>
        {plan.whatsapp && b.whatsapp && (
          <a href={whatsappLink(b.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={() => onTrack?.("whatsapp")}>WhatsApp</a>
        )}
        <a className="alt" href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => onTrack?.("route")}>Route</a>
      </div>

      {services.length > 0 && (
        <section className="block">
          <h2>{plan.showPrices ? "Leistungen & Preise" : "Leistungen"}</h2>
          {services.map((s) => (
            <div className="svc" key={s.id}>
              <span>
                {s.title}
                {s.durationMin ? <small>{s.durationMin} Min.</small> : null}
              </span>
              {plan.showPrices && s.priceLabel && <span className="p">{s.priceLabel}</span>}
            </div>
          ))}
        </section>
      )}

      <section className="block">
        <h2>Öffnungszeiten</h2>
        <table className="hours">
          <tbody>
            {b.hours.map((h) => (
              <tr key={h.weekday} className={h.weekday === today ? "today" : undefined}>
                <td>{WEEKDAYS[h.weekday - 1]}</td>
                <td>{h.closed ? "geschlossen" : `${h.opens ?? ""} – ${h.closes ?? ""}`}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      {b.about && (
        <section className="block">
          <h2>Über uns</h2>
          <p style={{ margin: 0 }}>{b.about}</p>
        </section>
      )}

      {(address || b.email || b.instagram) && (
        <section className="block">
          <h2>Kontakt</h2>
          {address && <p style={{ margin: "0 0 4px" }}>{address}</p>}
          {b.phone && <p style={{ margin: "0 0 4px" }}>{b.phone}</p>}
          {b.email && <p style={{ margin: "0 0 4px" }}><a href={`mailto:${b.email}`}>{b.email}</a></p>}
          {b.instagram && (
            <p style={{ margin: 0 }}>
              <a href={`https://instagram.com/${b.instagram.replace(/^@/, "")}`} target="_blank" rel="noopener noreferrer">
                Instagram @{b.instagram.replace(/^@/, "")}
              </a>
            </p>
          )}
        </section>
      )}

      <footer className="legal">
        <p><strong>Impressum</strong></p>
        {hasLegal ? (
          <>
            <p>{b.legalName}{b.legalForm ? `, ${b.legalForm}` : ""}</p>
            {address && <p>{address}</p>}
            {b.uidNumber && <p>UID: {b.uidNumber}</p>}
            {b.email && <p>E-Mail: {b.email}</p>}
          </>
        ) : (
          <p>Impressum wird noch ergänzt.</p>
        )}
        <a className="made" href={`https://${PROFILE_DOMAIN}`}>Erstellt mit Veyndo</a>
      </footer>
    </article>
  );
}
