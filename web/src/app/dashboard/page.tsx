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
import { openState } from "@/lib/hours";
import { loadPhotoPlan, visitHref } from "@/lib/trial";
import type { Business } from "@/lib/types";
import s from "@/components/studio/studio.module.css";

const KPIS: [string, string, string][] = [
  ["view", "Aufrufe", "◉"],
  ["call", "Anrufe", "☏"],
  ["whatsapp", "WhatsApp", "✆"],
  ["route", "Routen", "➚"],
  ["qr", "QR-Scans", "▦"],
];

function greeting() {
  const h = new Date().getHours();
  return h < 11 ? "Guten Morgen" : h < 18 ? "Hallo" : "Guten Abend";
}

export default function Dashboard() {
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
  const { pct, steps } = profileScore(b);
  const live = openState(b.hours);
  const visit = visitHref(b, photoPlan);

  return (
    <div className={s.dash}>
      <header className={s.dashTop}>
        <Link href="/" className={s.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/veyndo-sage.svg" alt="" width={26} height={26} /> Veyndo
        </Link>
        <div className={s.topActions}>
          <span className={s.account}><AuthNav /></span>
          <span className={s.planBadge}>{plan.label}</span>
          <Link href="/editor" className={s.btnPrimary}>Vorschau bearbeiten</Link>
        </div>
      </header>

      <main className={s.dashMain}>
        <section className={s.hello}>
          <div>
            <p className={s.helloKicker}>{greeting()} 👋</p>
            <h1>{b.name}</h1>
            <p className={s.helloSub}>Vorschau nur bei Veyndo · {live.label}. Kundinnen sehen diese Seite nicht.</p>
          </div>
          <div className={s.helloActions}>
            <Link href="/editor" className={s.btnLight}>Vorschau ansehen</Link>
            <a className={s.btnGhostLight} href={visit} target="_blank" rel="noopener noreferrer">Termin buchen</a>
          </div>
        </section>

        <section id="termin" className={s.planSec}>
          <div className={s.secHead}><h2>Nächster Schritt</h2></div>
          <div className={s.card}>
            <p style={{ marginTop: 0 }}>
              Die Vorschau bleibt hier. Kein Link für Google, kein QR fürs Schaufenster, keine Seite für Kundinnen —
              das richten wir ein, wenn wir uns gesehen haben.
            </p>
            <div className={s.posterActions} style={{ justifyContent: "flex-start" }}>
              <a className={s.btnPrimary} href={visit} target="_blank" rel="noopener noreferrer">Termin per WhatsApp buchen</a>
              <a className={s.btnGhost} href={CONTACT.phoneHref}>Anrufen: {CONTACT.phone}</a>
            </div>
          </div>
        </section>

        <section>
          <div className={s.secHead}><h2>Letzte 30 Tage</h2></div>
          <div className={`${s.kpis} ${s.locked}`}>
            {KPIS.map(([k, label, icon]) => (
              <div key={k} className={s.kpi}>
                <span className={s.kpiIcon} aria-hidden>{icon}</span>
                <b>{plan.stats ? (stats?.[k] ?? 0) : "–"}</b>
                <small>{label}</small>
              </div>
            ))}
            <div className={s.lockOver}>
              <b>Statistik kommt mit der echten Seite</b>
              <span>Aufrufe und Anrufe sehen Sie, sobald Kundinnen online dürfen.</span>
            </div>
          </div>
        </section>

        <div className={s.dashGrid}>
          <section className={s.card}>
            <div className={s.strength}>
              <Ring pct={pct} size={84} label={`Profil zu ${pct} Prozent fertig`} />
              <div>
                <h2>Was schon drin ist</h2>
                <p>Fehlt etwas, ergänzen Sie es in der Vorschau — oder wir machen es beim Termin.</p>
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
            if (confirm("Vorschau wirklich löschen und neu beginnen?")) {
              await clearBusiness();
              router.push("/start");
            }
          }}>Vorschau löschen und neu beginnen</button>
        </p>
      </main>
    </div>
  );
}
