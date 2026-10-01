"use client";

import { useEffect, useState } from "react";
import type { Business } from "@/lib/types";
import { PLANS } from "@/lib/plans";
import { PROFILE_DOMAIN, profileUrl } from "@/lib/slug";
import { dayText, openState, WEEKDAYS, type OpenState } from "@/lib/hours";
import Gallery from "./Gallery";
import s from "./profile.module.css";

export { WEEKDAYS };

const digits = (v: string) => v.replace(/[^\d+]/g, "");

function whatsappLink(n: string) {
  const d = n.replace(/\D/g, "").replace(/^00/, "").replace(/^0/, "43");
  return `https://wa.me/${d}`;
}

type Track = (kind: "call" | "whatsapp" | "route") => void;

export default function ProfileView({ b, today, onTrack }: { b: Business; today?: number; onTrack?: Track }) {
  const plan = PLANS[b.tier];
  const theme = b.theme ?? "klassisch";
  const services = b.services.filter((x) => x.title.trim()).slice(0, plan.maxServices);
  const address = [b.street, [b.postalCode, b.city].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  const mapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
    [b.name, address].filter(Boolean).join(", "),
  )}`;
  const ig = b.instagram.replace(/^@/, "").trim();
  const showWa = plan.whatsapp && !!b.whatsapp;
  const gallery = (b.photos ?? []).slice(0, plan.gallery);

  // Time-dependent UI only after mount, so server and client render the same HTML.
  const [state, setState] = useState<OpenState | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const tick = () => setState(openState(b.hours));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [b.hours]);

  const todayHours = b.hours.find((h) => h.weekday === today);

  async function share() {
    const url = profileUrl(b.slug);
    try {
      if (navigator.share) await navigator.share({ title: b.name, text: b.tagline, url });
      else { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 2000); }
    } catch {}
  }

  const actions = (
    <>
      <a className={s.primary} href={b.phone ? `tel:${digits(b.phone)}` : undefined} aria-disabled={!b.phone}
        onClick={() => b.phone && onTrack?.("call")}>
        <span aria-hidden>☏</span> Anrufen
      </a>
      {showWa && (
        <a className={s.wa} href={whatsappLink(b.whatsapp)} target="_blank" rel="noopener noreferrer" onClick={() => onTrack?.("whatsapp")}>
          <span aria-hidden>✆</span> WhatsApp
        </a>
      )}
      <a className={s.ghost} href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => onTrack?.("route")}>
        <span aria-hidden>➚</span> Route
      </a>
    </>
  );

  return (
    <article className={`${s.root} ${s[theme]}`} style={{ ["--pa" as string]: b.accentColor }}>
      <div className={s.layout}>
        {/* LEFT / TOP: identity */}
        <header className={s.side}>
          <div className={s.hero}>
            {b.coverDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL or storage URL
              <img className={s.heroImg} src={b.coverDataUrl} alt={`Foto von ${b.name}`} />
            ) : (
              <div className={s.heroFallback} aria-hidden>{(b.name.trim()[0] || "V").toUpperCase()}</div>
            )}
            <div className={s.heroShade} />
            <div className={s.heroText}>
              {state && (
                <span className={`${s.status} ${state.appt ? s.appt : state.open ? (state.soon ? s.soon : s.open) : s.closed}`}>
                  <i /> {state.label}
                </span>
              )}
              <h1 className={s.name}>{b.name || "Ihr Betrieb"}</h1>
              {b.tagline && <p className={s.tagline}>{b.tagline}</p>}
            </div>
          </div>

          <div className={s.facts}>
            {address && <span>📍 {[b.postalCode, b.city].filter(Boolean).join(" ") || address}</span>}
            {todayHours && <span>🕑 Heute {dayText(todayHours, "–")}</span>}
            {ig && <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">◎ @{ig}</a>}
          </div>

          <div className={s.actions}>{actions}</div>
        </header>

        {/* RIGHT / BELOW: content */}
        <div className={s.main}>
          {services.length > 0 && (
            <section className={s.block}>
              <div className={s.blockHead}>
                <h2>{plan.showPrices ? "Leistungen & Preise" : "Leistungen"}</h2>
                <span className={s.count}>{services.length}</span>
              </div>
              <ul className={s.services}>
                {services.map((x) => (
                  <li key={x.id} className={s.svc}>
                    <div>
                      <b>{x.title}</b>
                      {x.durationMin ? <small>{x.durationMin} Min.</small> : null}
                    </div>
                    {plan.showPrices && x.priceLabel && <span className={s.price}>{x.priceLabel}</span>}
                  </li>
                ))}
              </ul>
              {b.phone && (
                <a className={s.inlineCta} href={`tel:${digits(b.phone)}`} onClick={() => onTrack?.("call")}>
                  Termin vereinbaren · jetzt anrufen
                </a>
              )}
            </section>
          )}

          {gallery.length > 0 && (
            <section className={s.block}>
              <div className={s.blockHead}>
                <h2>Einblicke</h2>
                <span className={s.count}>{gallery.length}</span>
              </div>
              <Gallery photos={gallery} name={b.name} />
            </section>
          )}

          {b.about && (
            <section className={s.block}>
              <h2>Über uns</h2>
              <p className={s.about}>{b.about}</p>
            </section>
          )}

          <section className={s.block}>
            <div className={s.blockHead}>
              <h2>Öffnungszeiten</h2>
              {state && !state.appt && <span className={`${s.dot} ${state.open ? s.open : s.closed}`}>{state.open ? "Jetzt offen" : "Jetzt zu"}</span>}
            </div>
            <ul className={s.hours}>
              {b.hours.map((h) => (
                <li key={h.weekday} className={h.weekday === today ? s.today : undefined}>
                  <span>{WEEKDAYS[h.weekday - 1]}{h.weekday === today && <em> · heute</em>}</span>
                  <span>{dayText(h)}</span>
                </li>
              ))}
            </ul>
          </section>

          {(address || b.phone || b.email) && (
            <section className={s.block}>
              <h2>So finden Sie uns</h2>
              <div className={s.visit}>
                <div>
                  {address && <p className={s.addr}>{address}</p>}
                  {b.phone && <p><a href={`tel:${digits(b.phone)}`}>{b.phone}</a></p>}
                  {b.email && <p><a href={`mailto:${b.email}`}>{b.email}</a></p>}
                </div>
                <a className={s.ghost} href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => onTrack?.("route")}>
                  Route planen
                </a>
              </div>
            </section>
          )}

          <div className={s.shareRow}>
            <button type="button" className={s.share} onClick={share}>{copied ? "Link kopiert ✓" : "Seite teilen"}</button>
          </div>

          <footer className={s.legal}>
            <p><strong>Impressum</strong></p>
            {b.legalName.trim() ? (
              <>
                <p>{b.legalName}{b.legalForm ? `, ${b.legalForm}` : ""}</p>
                {address && <p>{address}</p>}
                {b.uidNumber && <p>UID: {b.uidNumber}</p>}
                {b.email && <p>E-Mail: {b.email}</p>}
              </>
            ) : (
              <p>Impressum wird noch ergänzt.</p>
            )}
            <a className={s.made} href={`https://${PROFILE_DOMAIN}`}>Erstellt mit Veyndo</a>
          </footer>
        </div>
      </div>

      {/* Sticky action bar on narrow screens */}
      <nav className={s.bar} aria-label="Kontakt">{actions}</nav>
    </article>
  );
}
