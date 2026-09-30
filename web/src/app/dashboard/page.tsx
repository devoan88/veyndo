"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { TopBar } from "@/components/Chrome";
import { clearBusiness, loadBusiness, saveBusiness } from "@/lib/store";
import { getTemplate } from "@/lib/templates";
import { PLANS, euro } from "@/lib/plans";
import { profileUrl, slugProblem } from "@/lib/slug";
import type { Business, PlanTier } from "@/lib/types";

export default function Dashboard() {
  const router = useRouter();
  const [b, setB] = useState<Business | null>(null);
  const [qr, setQr] = useState<string>("");

  useEffect(() => {
    const loaded = loadBusiness();
    if (!loaded) router.replace("/start");
    else setB(loaded);
  }, [router]);

  useEffect(() => {
    if (!b) return;
    QRCode.toDataURL(profileUrl(b.slug), { margin: 1, width: 480, color: { dark: "#2c362b", light: "#fffdf9" } })
      .then(setQr)
      .catch(() => setQr(""));
  }, [b]);

  if (!b) return null;

  const update = (patch: Partial<Business>) => {
    const next = { ...b, ...patch };
    saveBusiness(next);
    setB(next);
  };

  const url = profileUrl(b.slug);
  const checks: [string, boolean][] = [
    ["Titelfoto hochladen", !!b.coverDataUrl],
    ["Telefonnummer eintragen", !!b.phone.trim()],
    ["Adresse eintragen", !!b.street.trim()],
    ["Impressum ausfüllen", !!b.legalName.trim()],
    ...getTemplate(b.templateKey).checklist
      .filter((c) => /Google|QR/.test(c))
      .map((c): [string, boolean] => [c, false]),
  ];
  const done = checks.filter(([, ok]) => ok).length;
  const canPublish = !slugProblem(b.slug) && !!b.phone.trim() && !!b.legalName.trim();
  const tiers: PlanTier[] = ["basis", "profil", "pro"];

  return (
    <>
      <TopBar>
        <Link href="/editor" className="btn small">Bearbeiten</Link>
      </TopBar>
      <main className="wrap" style={{ padding: "32px 0 80px" }}>
        <p className="kicker">Mein Profil</p>
        <h1 style={{ fontSize: "2.2rem" }}>{b.name}</h1>

        <div className="grid c2" style={{ marginTop: 20 }}>
          <div className="card">
            <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "center" }}>
              <h3 style={{ margin: 0 }}>Status</h3>
              <span className={`tag${b.isPublished ? "" : " grey"}`}>{b.isPublished ? "Online" : "Entwurf"}</span>
            </div>
            <p className="urlline" style={{ margin: "14px 0" }}>
              <strong>{url.replace("https://", "")}</strong>
            </p>
            <div className="cta-row" style={{ marginTop: 0 }}>
              <Link href={`/p/${b.slug}`} className="btn ghost small">Ansehen</Link>
              {b.isPublished ? (
                <button className="btn ghost small" onClick={() => update({ isPublished: false })}>Offline nehmen</button>
              ) : (
                <button className="btn small" disabled={!canPublish} onClick={() => update({ isPublished: true })}>Veröffentlichen</button>
              )}
            </div>
            {!b.isPublished && !canPublish && (
              <p className="small muted" style={{ margin: "10px 0 0" }}>
                Zum Veröffentlichen fehlen noch: {[
                  slugProblem(b.slug) && "gültige Adresse",
                  !b.phone.trim() && "Telefonnummer",
                  !b.legalName.trim() && "Impressum",
                ].filter(Boolean).join(", ")}.
              </p>
            )}
          </div>

          <div className="card">
            <h3>Checkliste <span className="small muted">({done} von {checks.length})</span></h3>
            <ul className="checklist">
              {checks.map(([label, ok]) => (
                <li key={label}><span className={ok ? "ok" : "todo"}>{ok ? "✓" : "○"}</span>{label}</li>
              ))}
            </ul>
          </div>

          <div className="card">
            <h3>QR-Code</h3>
            <p className="small muted">Für Schaufenster, Kassa und Visitenkarten. Führt direkt zu Ihrer Seite.</p>
            {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
            {qr && <img className="qr" src={qr} alt={`QR-Code für ${url}`} width={180} height={180} />}
            {qr && (
              <a className="btn ghost small" style={{ marginTop: 12 }} href={qr} download={`veyndo-qr-${b.slug}.png`}>QR-Code herunterladen</a>
            )}
          </div>

          <div className="card">
            <h3>Besuche</h3>
            {PLANS[b.tier].stats ? (
              <>
                <p className="stat" style={{ margin: 0 }}>0</p>
                <p className="small muted" style={{ margin: 0 }}>Aufrufe, Anrufe und Routen werden gezählt, sobald die Seite online ist. Ohne Cookies.</p>
              </>
            ) : (
              <p className="small muted" style={{ margin: 0 }}>Die Statistik gibt es ab Plan Profil.</p>
            )}
          </div>
        </div>

        <section id="plan" style={{ paddingBottom: 0 }}>
          <h2>Plan</h2>
          <div className="notice">Testmodus: Die Bezahlung mit Stripe wird gerade eingerichtet. Sie können die Pläne schon ausprobieren.</div>
          <div className="grid c3">
            {tiers.map((t) => {
              const p = PLANS[t];
              const current = b.tier === t;
              return (
                <div key={t} className={`card plan${current ? " featured" : ""}`}>
                  <h3>{p.label}</h3>
                  <div className="price">{euro(p.priceMonthly)}<span className="small muted"> / Monat</span></div>
                  <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                  <button className={`btn block${current ? "" : " ghost"}`} disabled={current} onClick={() => update({ tier: t })}>
                    {current ? "Aktueller Plan" : "Wählen"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <p style={{ marginTop: 40 }}>
          <button className="linkbtn small" onClick={() => {
            if (confirm("Profil in diesem Browser löschen und neu beginnen?")) { clearBusiness(); router.push("/start"); }
          }}>Neu beginnen</button>
        </p>
      </main>
    </>
  );
}
