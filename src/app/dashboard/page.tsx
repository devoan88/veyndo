"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Ring from "@/components/studio/Ring";
import { AuthNav } from "@/components/AuthNav";
import { clearBusiness, loadBusiness, loadStats } from "@/lib/store";
import { PLANS } from "@/lib/plans";
import { CONTACT } from "@/lib/contact";
import { profileScore } from "@/lib/completeness";
import { openState, hoursCopy } from "@/lib/hours";
import { loadPhotoPlan, visitHref } from "@/lib/trial";
import type { Business } from "@/lib/types";
import { useI18n } from "@/components/i18n/LocaleProvider";
import s from "@/components/studio/studio.module.css";

export default function Dashboard() {
  const { locale, m } = useI18n();
  const router = useRouter();
  const [b, setB] = useState<Business | null>(null);
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [photoPlan, setPhotoPlan] = useState<ReturnType<typeof loadPhotoPlan>>(null);

  useEffect(() => {
    loadBusiness().then((loaded) => {
      if (!loaded) router.replace("/start");
      else setB(loaded);
    });
    setPhotoPlan(loadPhotoPlan());
  }, [router]);

  useEffect(() => {
    if (!b) return;
    if (PLANS[b.tier].stats) loadStats(b.id).then(setStats);
  }, [b]);

  if (!b) return null;

  const plan = PLANS[b.tier];
  const { pct, steps } = profileScore(b, locale);
  const live = openState(b.hours, new Date(), hoursCopy(locale));
  const visit = visitHref(b, photoPlan);

  return (
    <div className={s.dash}>
      <header className={s.dashTop}>
        <Link href="/" className={s.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/veyndo-sage.svg" alt="" width={26} height={26} /> {m.common.brandMark}
        </Link>
        <div className={s.topActions}>
          <span className={s.account}><AuthNav /></span>
          <span className={s.planBadge}>{plan.label}</span>
          <Link href="/editor" className={s.btnPrimary}>{m.dashboard.editPreview}</Link>
        </div>
      </header>

      <main className={s.dashMain}>
        <section className={s.hello}>
          <div>
            <p className={s.helloKicker}>{( () => { const h = new Date().getHours(); return h < 11 ? m.dashboard.greetingMorning : h < 18 ? m.dashboard.greetingDay : m.dashboard.greetingEvening; })() } 👋</p>
            <h1>{b.name}</h1>
            <p className={s.helloSub}>{m.dashboard.previewOnly} · {live.label}. {m.dashboard.customersCantSee}</p>
          </div>
          <div className={s.helloActions}>
            <Link href="/editor" className={s.btnLight}>{m.dashboard.viewPreview}</Link>
            <a className={s.btnGhostLight} href={visit} target="_blank" rel="noopener noreferrer">{m.dashboard.bookVisit}</a>
          </div>
        </section>

        <section id="termin" className={s.planSec}>
          <div className={s.secHead}><h2>{m.dashboard.nextStep}</h2></div>
          <div className={s.card}>
            <p style={{ marginTop: 0 }}>
              {m.dashboard.nextStepText}
            </p>
            <div className={s.posterActions} style={{ justifyContent: "flex-start" }}>
              <a className={s.btnPrimary} href={visit} target="_blank" rel="noopener noreferrer">{m.dashboard.bookWhatsapp}</a>
              <a className={s.btnGhost} href={CONTACT.phoneHref}>{m.dashboard.call} {CONTACT.phone}</a>
            </div>
          </div>
        </section>

        <section>
          <div className={s.secHead}><h2>{m.dashboard.last30}</h2></div>
          <div className={`${s.kpis} ${s.locked}`}>
            {m.dashboard.kpis.map(([k, label, icon]) => (
              <div key={k} className={s.kpi}>
                <span className={s.kpiIcon} aria-hidden>{icon}</span>
                <b>{plan.stats ? (stats?.[k] ?? 0) : "–"}</b>
                <small>{label}</small>
              </div>
            ))}
            <div className={s.lockOver}>
              <b>{m.dashboard.statsLockedTitle}</b>
              <span>{m.dashboard.statsLockedText}</span>
            </div>
          </div>
        </section>

        <div className={s.dashGrid}>
          <section className={s.card}>
            <div className={s.strength}>
              <Ring pct={pct} size={84} label={`Profil zu ${pct} Prozent fertig`} />
              <div>
                <h2>{m.dashboard.whatsIn}</h2>
                <p>{m.dashboard.whatsInText}</p>
              </div>
            </div>
            <ul className={s.todo}>
              {steps.map((x) => (
                <li key={x.key} className={x.done ? s.todoDone : ""}>
                  <span aria-hidden>{x.done ? "✓" : "○"}</span>
                  {x.done ? x.label : <Link href={`/editor?tab=${x.tab}`}>{x.label} →</Link>}
                </li>
              ))}
            </ul>
          </section>
        </div>

        <p className={s.danger}>
          <button type="button" className={s.linkBtn} onClick={async () => {
            if (confirm("{m.dashboard.deleteConfirm}")) {
              await clearBusiness();
              router.push("/start");
            }
          }}>{m.dashboard.delete}</button>
        </p>
      </main>
    </div>
  );
}
