"use client";

import { useEffect, useState } from "react";
import type { Business } from "@/lib/types";
import { PLANS } from "@/lib/plans";
import { profileDomain, profileUrl } from "@/lib/slug";
import { dayText, openState, hoursCopy, type OpenState } from "@/lib/hours";
import { format } from "@/lib/i18n/messages";
import { useI18n } from "@/components/i18n/LocaleProvider";
import Gallery from "./Gallery";
import s from "./profile.module.css";

const digits = (v: string) => v.replace(/[^\d+]/g, "");

function whatsappLink(n: string, locale: string) {
  const d = n.replace(/\D/g, "").replace(/^00/, "");
  // Keep AT default for Austrian numbers; GE country code for Georgian surface.
  const normalized =
    locale === "ka"
      ? d.replace(/^0/, "995")
      : d.replace(/^0/, "43");
  return `https://wa.me/${normalized}`;
}

type Track = (kind: "call" | "whatsapp" | "route") => void;

export default function ProfileView({ b, today, onTrack }: { b: Business; today?: number; onTrack?: Track }) {
  const { locale, m } = useI18n();
  const copy = hoursCopy(locale);
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
  const domain = profileDomain(locale);

  const [state, setState] = useState<OpenState | null>(null);
  const [copied, setCopied] = useState(false);
  useEffect(() => {
    const tick = () => setState(openState(b.hours, new Date(), copy));
    tick();
    const t = setInterval(tick, 60_000);
    return () => clearInterval(t);
  }, [b.hours, copy]);

  const todayHours = b.hours.find((h) => h.weekday === today);

  async function share() {
    const url = profileUrl(b.slug, locale);
    try {
      if (navigator.share) await navigator.share({ title: b.name, text: b.tagline, url });
      else {
        await navigator.clipboard.writeText(url);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    } catch {}
  }

  const actions = (
    <>
      <a
        className={s.primary}
        href={b.phone ? `tel:${digits(b.phone)}` : undefined}
        aria-disabled={!b.phone}
        onClick={() => b.phone && onTrack?.("call")}
      >
        <span aria-hidden>☏</span> {m.profile.call}
      </a>
      {showWa && (
        <a
          className={s.wa}
          href={whatsappLink(b.whatsapp, locale)}
          target="_blank"
          rel="noopener noreferrer"
          onClick={() => onTrack?.("whatsapp")}
        >
          <span aria-hidden>✆</span> {m.profile.whatsapp}
        </a>
      )}
      <a className={s.ghost} href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => onTrack?.("route")}>
        <span aria-hidden>➚</span> {m.profile.route}
      </a>
    </>
  );

  return (
    <article className={`${s.root} ${s[theme]}`} style={{ ["--pa" as string]: b.accentColor }}>
      <div className={s.layout}>
        <header className={s.side}>
          <div className={s.hero}>
            {b.coverDataUrl ? (
              // eslint-disable-next-line @next/next/no-img-element -- data URL or storage URL
              <img className={s.heroImg} src={b.coverDataUrl} alt={format(m.profile.photoOf, { name: b.name })} />
            ) : (
              <div className={s.heroFallback} aria-hidden>
                {(b.name.trim()[0] || "V").toUpperCase()}
              </div>
            )}
            <div className={s.heroShade} />
            <div className={s.heroText}>
              {state && (
                <span className={`${s.status} ${state.appt ? s.appt : state.open ? (state.soon ? s.soon : s.open) : s.closed}`}>
                  <i /> {state.label}
                </span>
              )}
              <h1 className={s.name}>{b.name || m.profile.yourBusiness}</h1>
              {b.tagline && <p className={s.tagline}>{b.tagline}</p>}
            </div>
          </div>

          <div className={s.facts}>
            {address && <span>📍 {[b.postalCode, b.city].filter(Boolean).join(" ") || address}</span>}
            {todayHours && (
              <span>
                🕑 {m.profile.today} {dayText(todayHours, "–", copy)}
              </span>
            )}
            {ig && (
              <a href={`https://instagram.com/${ig}`} target="_blank" rel="noopener noreferrer">
                ◎ @{ig}
              </a>
            )}
          </div>

          <div className={s.actions}>{actions}</div>
        </header>

        <div className={s.main}>
          {services.length > 0 && (
            <section className={s.block}>
              <div className={s.blockHead}>
                <h2>{plan.showPrices ? m.profile.servicesPrices : m.profile.services}</h2>
                <span className={s.count}>{services.length}</span>
              </div>
              <ul className={s.services}>
                {services.map((x) => (
                  <li key={x.id} className={s.svc}>
                    <div>
                      <b>{x.title}</b>
                      {x.durationMin ? (
                        <small>
                          {x.durationMin} {m.profile.minutes}
                        </small>
                      ) : null}
                    </div>
                    {plan.showPrices && x.priceLabel && <span className={s.price}>{x.priceLabel}</span>}
                  </li>
                ))}
              </ul>
              {b.phone && (
                <a className={s.inlineCta} href={`tel:${digits(b.phone)}`} onClick={() => onTrack?.("call")}>
                  {m.profile.bookCall}
                </a>
              )}
            </section>
          )}

          {gallery.length > 0 && (
            <section className={s.block}>
              <div className={s.blockHead}>
                <h2>{m.profile.gallery}</h2>
                <span className={s.count}>{gallery.length}</span>
              </div>
              <Gallery photos={gallery} name={b.name} />
            </section>
          )}

          {b.about && (
            <section className={s.block}>
              <h2>{m.profile.about}</h2>
              <p className={s.about}>{b.about}</p>
            </section>
          )}

          <section className={s.block}>
            <div className={s.blockHead}>
              <h2>{m.profile.hours}</h2>
              {state && !state.appt && (
                <span className={`${s.dot} ${state.open ? s.open : s.closed}`}>
                  {state.open ? m.profile.openNow : m.profile.closedNow}
                </span>
              )}
            </div>
            <ul className={s.hours}>
              {b.hours.map((h) => (
                <li key={h.weekday} className={h.weekday === today ? s.today : undefined}>
                  <span>
                    {copy.weekdays[h.weekday - 1]}
                    {h.weekday === today && <em>{m.profile.todayMark}</em>}
                  </span>
                  <span>{dayText(h, " – ", copy)}</span>
                </li>
              ))}
            </ul>
          </section>

          {(address || b.phone || b.email) && (
            <section className={s.block}>
              <h2>{m.profile.findUs}</h2>
              <div className={s.visit}>
                <div>
                  {address && <p className={s.addr}>{address}</p>}
                  {b.phone && (
                    <p>
                      <a href={`tel:${digits(b.phone)}`}>{b.phone}</a>
                    </p>
                  )}
                  {b.email && (
                    <p>
                      <a href={`mailto:${b.email}`}>{b.email}</a>
                    </p>
                  )}
                </div>
                <a className={s.ghost} href={mapsUrl} target="_blank" rel="noopener noreferrer" onClick={() => onTrack?.("route")}>
                  {m.profile.planRoute}
                </a>
              </div>
            </section>
          )}

          <div className={s.shareRow}>
            <button type="button" className={s.share} onClick={share}>
              {copied ? m.profile.linkCopied : m.profile.share}
            </button>
          </div>

          <footer className={s.legal}>
            <p>
              <strong>{m.profile.imprint}</strong>
            </p>
            {b.legalName.trim() ? (
              <>
                <p>
                  {b.legalName}
                  {b.legalForm ? `, ${b.legalForm}` : ""}
                </p>
                {address && <p>{address}</p>}
                {b.uidNumber && <p>UID: {b.uidNumber}</p>}
                {b.email && <p>E-Mail: {b.email}</p>}
              </>
            ) : (
              <p>{m.profile.imprintPending}</p>
            )}
            <a className={s.made} href={`https://${domain}`}>
              {m.profile.madeWith}
            </a>
          </footer>
        </div>
      </div>

      <nav className={s.bar} aria-label="Kontakt">
        {actions}
      </nav>
    </article>
  );
}
