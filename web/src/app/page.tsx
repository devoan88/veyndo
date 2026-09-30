import Link from "next/link";
import { TopBar, Footer } from "@/components/Chrome";
import { TEMPLATES, GROUPS } from "@/lib/templates";
import { PLANS, euro } from "@/lib/plans";
import type { PlanTier } from "@/lib/types";

export default function Home() {
  const tiers: PlanTier[] = ["basis", "profil", "pro"];
  return (
    <>
      <TopBar />
      <main>
        <section className="hero">
          <div className="wrap">
            <p className="kicker">Für Studios, Praxen und Handwerk in Österreich</p>
            <h1>Ihr Betrieb online. <em>In 10 Minuten.</em></h1>
            <p className="lead">
              Eine Seite mit Leistungen, Preisen und Öffnungszeiten. Kunden rufen mit einem Klick an,
              schreiben auf WhatsApp oder finden den Weg zu Ihnen.
            </p>
            <div className="cta-row">
              <Link href="/start" className="btn">Kostenlos starten</Link>
              <Link href="/p/beispiel-nagelstudio" className="btn ghost">Beispiel ansehen</Link>
            </div>
            <p className="small muted" style={{ marginTop: 14 }}>Keine Kreditkarte nötig. Kein Technikwissen nötig.</p>
          </div>
        </section>

        <section id="so-gehts">
          <div className="wrap">
            <p className="kicker">So geht&apos;s</p>
            <h2>Drei Schritte</h2>
            <div className="grid c3 steps">
              <div className="card"><h3>Branche wählen</h3><p className="muted" style={{ margin: 0 }}>Wir füllen Leistungen, typische Preise und Öffnungszeiten vor.</p></div>
              <div className="card"><h3>Anpassen</h3><p className="muted" style={{ margin: 0 }}>Namen, Foto und Preise ändern. Die Vorschau zeigt sofort, wie es aussieht.</p></div>
              <div className="card"><h3>Teilen</h3><p className="muted" style={{ margin: 0 }}>Link bei Google und Instagram eintragen, QR-Code im Geschäft aufstellen.</p></div>
            </div>
          </div>
        </section>

        <section>
          <div className="wrap">
            <p className="kicker">Branchen</p>
            <h2>Vorlagen für Ihren Beruf</h2>
            <div className="grid c3">
              {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
                <div className="card" key={g}>
                  <h3>{GROUPS[g]}</h3>
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {TEMPLATES.filter((t) => t.group === g).map((t) => (
                      <li key={t.key}><Link href={`/p/beispiel-${t.key}`}>{t.label}</Link></li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section id="preise">
          <div className="wrap">
            <p className="kicker">Preise</p>
            <h2>Klein anfangen, jederzeit wechseln</h2>
            <div className="grid c3">
              {tiers.map((t) => {
                const p = PLANS[t];
                return (
                  <div className={`card plan${t === "profil" ? " featured" : ""}`} key={t}>
                    {t === "profil" && <span className="tag">Beliebt</span>}
                    <h3 style={{ marginTop: t === "profil" ? 10 : 0 }}>{p.label}</h3>
                    <div className="price">{euro(p.priceMonthly)}<span className="small muted"> / Monat</span></div>
                    {p.priceYearly > 0 && <div className="small muted">oder {euro(p.priceYearly)} pro Jahr</div>}
                    <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                    <Link href="/start" className={`btn block${t === "profil" ? "" : " ghost"}`}>
                      {t === "basis" ? "Kostenlos starten" : "14 Tage testen"}
                    </Link>
                  </div>
                );
              })}
            </div>
            <p className="small muted" style={{ marginTop: 14 }}>Alle Preise in Euro. Monatlich kündbar.</p>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
