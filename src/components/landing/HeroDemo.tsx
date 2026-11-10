"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { getTemplates } from "@/lib/templates";
import { branchPhoto } from "@/lib/photos";
import { toSlug } from "@/lib/slug";
import { format } from "@/lib/i18n/messages";
import { useI18n } from "@/components/i18n/LocaleProvider";
import s from "@/app/landing.module.css";

const todayIdx = () => ((new Date().getDay() + 6) % 7) + 1;

export default function HeroDemo() {
  const { m, domain } = useI18n();
  const templates = useMemo(() => getTemplates("ka"), []);
  const [key, setKey] = useState(templates[1]?.key ?? templates[0].key);
  const [name, setName] = useState("");
  const [touched, setTouched] = useState(false);

  useEffect(() => {
    if (!templates.some((t) => t.key === key)) setKey(templates[0].key);
  }, [templates, key]);

  useEffect(() => {
    if (touched) return;
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (media.matches) return;
    const t = setInterval(() => {
      setKey((k) => templates[(templates.findIndex((x) => x.key === k) + 1) % templates.length].key);
    }, 3200);
    return () => clearInterval(t);
  }, [touched, templates]);

  const t = useMemo(() => templates.find((x) => x.key === key) ?? templates[0], [key, templates]);
  const shownName = name.trim() || t.example.name;
  const slug = toSlug(shownName);
  const day = t.opening_hours.find((h) => h.weekday === todayIdx());
  const status =
    day && !day.closed
      ? format(m.hero.openUntil, { time: day.closes ?? "" })
      : m.hero.closedToday;
  const qs = new URLSearchParams({ t: t.key });
  if (name.trim()) qs.set("n", name.trim());
  const startHref = `/start?${qs.toString()}`;

  return (
    <div className={s.heroGrid}>
      <div className={s.heroCopy}>
        <p className={s.eyebrow}>
          <span className={s.pulse} aria-hidden /> {m.hero.eyebrow}
        </p>
        <h1 className={s.h1}>
          {m.hero.title}
          <br />
          <em>{m.hero.titleEm}</em>
        </h1>
        <p className={s.lead}>{m.hero.lead}</p>

        <form
          className={s.tryBox}
          action="/start"
          onSubmit={(e) => {
            e.preventDefault();
            window.location.href = startHref;
          }}
        >
          <label htmlFor="hero-name" className={s.tryLabel}>
            {m.hero.nameLabel}
          </label>
          <div className={s.tryRow}>
            <input
              id="hero-name"
              name="n"
              className={s.tryInput}
              value={name}
              maxLength={60}
              placeholder={t.example.name}
              autoComplete="organization"
              onChange={(e) => {
                setName(e.target.value);
                setTouched(true);
              }}
            />
            <Link href={startHref} className={s.tryBtn}>
              {m.hero.buildCta}
            </Link>
          </div>
          <div className={s.chips} role="radiogroup" aria-label={m.hero.branchAria}>
            {templates.map((x) => (
              <button
                type="button"
                key={x.key}
                role="radio"
                aria-checked={x.key === key}
                className={s.chip}
                onClick={() => {
                  setKey(x.key);
                  setTouched(true);
                }}
              >
                {x.label}
              </button>
            ))}
          </div>
          <p className={s.fine}>{m.hero.fine}</p>
        </form>
      </div>

      <div className={s.stage} aria-label={m.hero.previewAria}>
        <div className={s.phone} style={{ ["--pa" as string]: t.accent_color }}>
          <div className={s.notch} />
          <div className={s.urlbar}>
            <span aria-hidden>🔒</span> {slug}.{domain}
          </div>
          <div className={s.screen}>
            <div className={s.cover}>
              {/* eslint-disable-next-line @next/next/no-img-element -- crossfade per branch */}
              <img key={t.key} src={branchPhoto(t.key, 640, 400) ?? ""} alt="" className={s.coverImg} />
              <span className={s.openPill}>
                <i />
                {status}
              </span>
            </div>
            <div className={s.pHead}>
              <div className={s.pBadge}>{(shownName[0] || "V").toUpperCase()}</div>
              <div className={s.pName}>{shownName}</div>
              <div className={s.pTag}>
                {t.tagline.replace("{district}", `${t.example.city} ${t.example.district}`)}
              </div>
            </div>
            <div className={s.pActions}>
              <span>{m.hero.call}</span>
              <span>{m.hero.whatsapp}</span>
              <span className={s.pAlt}>{m.hero.route}</span>
            </div>
            <div className={s.pList}>
              {t.services.slice(0, 4).map((x) => (
                <div key={x.title} className={s.pRow}>
                  <span>
                    {x.title}
                    {x.duration_min ? <small>{x.duration_min} {m.hero.minutes}</small> : null}
                  </span>
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
