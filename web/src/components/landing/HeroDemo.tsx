"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { TEMPLATES } from "@/lib/templates";
import { branchPhoto } from "@/lib/photos";
import { toSlug, PROFILE_DOMAIN } from "@/lib/slug";
import s from "@/app/landing.module.css";

const todayIdx = () => ((new Date().getDay() + 6) % 7) + 1;

export default function HeroDemo() {
  const [key, setKey] = useState(TEMPLATES[1].key);
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (touched) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const t = setInterval(() => {
      setKey((k) => TEMPLATES[(TEMPLATES.findIndex((x) => x.key === k) + 1) % TEMPLATES.length].key);
    }, 3200);
    return () => clearInterval(t);
  }, [touched]);

  const t = useMemo(() => TEMPLATES.find((x) => x.key === key) ?? TEMPLATES[0], [key]);
  const shownName = name.trim() || t.example.name;
  const slug = toSlug(shownName);
  const day = t.opening_hours.find((h) => h.weekday === todayIdx());
  const status = day && !day.closed ? `Heute geöffnet bis ${day.closes}` : "Heute geschlossen";
  const qs = new URLSearchParams({ t: t.key });
  if (name.trim()) qs.set("n", name.trim());
  const startHref = `/start?${qs.toString()}`;

  return (
    <div className={s.heroGrid}>
      <div className={s.heroCopy}>
        <p className={s.eyebrow}><span className={s.pulse} aria-hidden /> Salons, Praxen und Handwerk in Wien</p>
        <h1 className={s.h1}>
          Ihre Seite bauen.<br /><em>Kostenlos ansehen.</em>
        </h1>
        <p className={s.lead}>
          Preise, Öffnungszeiten, Anrufen und WhatsApp — zuerst nur für Sie.
          Online für Kundinnen gehen Sie, wenn die Seite sitzt.
        </p>

        <form
          className={s.tryBox}
          action="/start"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = startHref;
          }}
        >
          <label htmlFor="hero-name" className={s.tryLabel}>Wie heißt Ihr Betrieb?</label>
          <div className={s.tryRow}>
            <input
              id="hero-name"
              name="n"
              className={s.tryInput}
              value={name}
              maxLength={60}
              placeholder={t.example.name}
              autoComplete="organization"
              onChange={(e) => { setName(e.target.value); setTouched(true); }}
            />
            <Link href={startHref} className={s.tryBtn}>✨ Demo bauen</Link>
          </div>
          <div className={s.chips} role="radiogroup" aria-label="Branche">
            {TEMPLATES.map((x) => (
              <button
                type="button"
                key={x.key}
                role="radio"
                aria-checked={x.key === key}
                className={s.chip}
                onClick={() => { setKey(x.key); setTouched(true); }}
              >
                {x.label}
              </button>
            ))}
          </div>
          <p className={s.fine}>Kein Abo zum Start. Hosting erst, wenn Kundinnen die Seite öffnen sollen.</p>
        </form>
      </div>

      <div className={s.stage} aria-label="Vorschau Ihrer Seite">
        <div className={s.phone} style={{ ["--pa" as string]: t.accent_color }}>
          <div className={s.notch} />
          <div className={s.urlbar}><span aria-hidden>🔒</span> {slug}.{PROFILE_DOMAIN}</div>
          <div className={s.screen}>
            <div className={s.cover}>
              {/* eslint-disable-next-line @next/next/no-img-element -- crossfade per branch */}
              <img key={t.key} src={branchPhoto(t.key, 640, 400) ?? ""} alt="" className={s.coverImg} />
              <span className={s.openPill}><i />{status}</span>
            </div>
            <div className={s.pHead}>
              <div className={s.pBadge}>{(shownName[0] || "V").toUpperCase()}</div>
              <div className={s.pName}>{shownName}</div>
              <div className={s.pTag}>{t.tagline.replace("{district}", `Wien ${t.example.district}`)}</div>
            </div>
            <div className={s.pActions}>
              <span>Anrufen</span><span>WhatsApp</span><span className={s.pAlt}>Route</span>
            </div>
            <div className={s.pList}>
              {t.services.slice(0, 4).map((x) => (
                <div key={x.title} className={s.pRow}>
                  <span>{x.title}{x.duration_min ? <small>{x.duration_min} Min.</small> : null}</span>
                  <b>{x.price_label}</b>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
