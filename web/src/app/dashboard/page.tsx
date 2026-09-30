"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import { TopBar } from "@/components/Chrome";
import { clearBusiness, loadBusiness, loadStats, saveBusiness } from "@/lib/store";
import { getTemplate } from "@/lib/templates";
import { PLANS, euro } from "@/lib/plans";
import { slugProblem } from "@/lib/slug";
import type { Business } from "@/lib/types";

const LOOKUPS: Record<string, string> = {
  profil_m: "profil_monthly",
  profil_y: "profil_yearly",
  pro_m: "pro_monthly",
  pro_y: "pro_yearly",
};

export default function Dashboard() {
  const router = useRouter();
  const [b, setB] = useState<Business | null>(null);
  const [qr, setQr] = useState("");
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState("");

  useEffect(() => {
    loadBusiness().then((loaded) => {
      if (!loaded) router.replace("/start");
      else setB(loaded);
    });
  }, [router]);

  useEffect(() => {
    if (!b) return;
    const url = `${window.location.origin}/p/${b.slug}?src=qr`;
    QRCode.toDataURL(url, { margin: 1, width: 480, color: { dark: "#2c362b", light: "#fffdf9" } })
      .then(setQr)
      .catch(() => setQr(""));
    if (PLANS[b.tier].stats) loadStats(b.id).then(setStats);
  }, [b]);

  if (!b) return null;

  const update = async (patch: Partial<Business>) => {
    const next = await saveBusiness({ ...b, ...patch });
    setB(next);
  };

  const url = `${typeof window !== "undefined" ? window.location.origin : ""}/p/${b.slug}`;
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

  async function checkout(lookupKey: string) {
    setBusy(lookupKey);
    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ lookupKey }),
      });
      const data = await res.json();
      if (data.url) window.location.href = data.url;
      else alert(data.error || "Checkout nicht bereit.");
    } finally {
      setBusy("");
    }
  }

  async function portal() {
    const res = await fetch("/api/portal", { method: "POST" });
    const data = await res.json();
    if (data.url) window.location.href = data.url;
    else alert(data.error || "Portal nicht bereit.");
  }

  const visits = stats ? stats.view + stats.qr : 0;

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
              <strong>{url.replace(/^https?:\/\//, "")}</strong>
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
            <p className="small muted">Für Schaufenster, Kassa und Visitenkarten. Zählt als QR-Besuch.</p>
            {qr && (
              // eslint-disable-next-line @next/next/no-img-element -- data URL
              <img className="qr" src={qr} alt={`QR-Code für ${url}`} width={180} height={180} />
            )}
            {qr && (
              <a className="btn ghost small" style={{ marginTop: 12 }} href={qr} download={`veyndo-qr-${b.slug}.png`}>QR-Code herunterladen</a>
            )}
          </div>

          <div className="card">
            <h3>Letzte 30 Tage</h3>
            {PLANS[b.tier].stats ? (
              <>
                <p className="stat" style={{ margin: 0 }}>{visits}</p>
                <p className="small muted" style={{ margin: 0 }}>
                  Aufrufe {stats?.view ?? 0} · QR {stats?.qr ?? 0} · Anrufe {stats?.call ?? 0} · WhatsApp {stats?.whatsapp ?? 0} · Route {stats?.route ?? 0}
                </p>
              </>
            ) : (
              <p className="small muted" style={{ margin: 0 }}>Die Statistik gibt es ab Plan Profil.</p>
            )}
          </div>
        </div>

        <section id="plan" style={{ paddingBottom: 0 }}>
          <h2>Plan</h2>
          <p className="small muted">Aktuell: {PLANS[b.tier].label}. Zahlung über Stripe (Testmodus).</p>
          <div className="grid c3">
            {(["basis", "profil", "pro"] as const).map((t) => {
              const p = PLANS[t];
              const current = b.tier === t;
              return (
                <div key={t} className={`card plan${current ? " featured" : ""}`}>
                  <h3>{p.label}</h3>
                  <div className="price">{euro(p.priceMonthly)}<span className="small muted"> / Monat</span></div>
                  {p.priceYearly > 0 && <div className="small muted">oder {euro(p.priceYearly)} / Jahr</div>}
                  <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                  {t === "basis" ? (
                    <button className={`btn block${current ? "" : " ghost"}`} disabled={current} onClick={portal}>
                      {current ? "Aktueller Plan" : "Im Portal kündigen"}
                    </button>
                  ) : (
                    <div className="cta-row" style={{ flexDirection: "column", alignItems: "stretch" }}>
                      <button className="btn block" disabled={current && b.tier === t} onClick={() => checkout(LOOKUPS[`${t}_m`])}>
                        {busy === LOOKUPS[`${t}_m`] ? "…" : current ? "Monatlich (aktiv)" : "Monatlich starten"}
                      </button>
                      <button className="btn ghost block" onClick={() => checkout(LOOKUPS[`${t}_y`])}>
                        {busy === LOOKUPS[`${t}_y`] ? "…" : "Jährlich starten"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          <p style={{ marginTop: 16 }}>
            <button className="linkbtn" type="button" onClick={portal}>Rechnungen und Zahlung</button>
          </p>
        </section>

        <p style={{ marginTop: 40 }}>
          <button className="linkbtn small" onClick={async () => {
            if (confirm("Profil löschen und neu beginnen?")) {
              await clearBusiness();
              router.push("/start");
            }
          }}>Neu beginnen</button>
        </p>
      </main>
    </>
  );
}
