"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import QRCode from "qrcode";
import Ring from "@/components/studio/Ring";
import { AuthNav } from "@/components/AuthNav";
import { clearBusiness, loadBusiness, loadStats, saveBusiness } from "@/lib/store";
import { PLANS, euro } from "@/lib/plans";
import { slugProblem } from "@/lib/slug";
import { profileScore } from "@/lib/completeness";
import { openState } from "@/lib/hours";
import type { Business } from "@/lib/types";
import s from "@/components/studio/studio.module.css";

const LOOKUPS: Record<string, string> = {
  profil_m: "profil_monthly",
  profil_y: "profil_yearly",
  pro_m: "pro_monthly",
  pro_y: "pro_yearly",
};

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

/** Printable A5-style poster for the shop window: name, call to action, QR. */
async function posterPng(b: Business, url: string) {
  const W = 1240, H = 1754; // A5 at 150 dpi
  const c = document.createElement("canvas");
  c.width = W; c.height = H;
  const x = c.getContext("2d")!;
  x.fillStyle = "#fffdf9"; x.fillRect(0, 0, W, H);
  x.fillStyle = b.accentColor; x.fillRect(0, 0, W, 36);
  x.fillStyle = "#2c362b"; x.textAlign = "center";
  x.font = "600 46px Figtree, sans-serif";
  x.fillText("Preise · Öffnungszeiten · Termine", W / 2, 200);
  x.font = "500 110px Newsreader, Georgia, serif";
  const name = b.name.length > 22 ? b.name.slice(0, 21) + "…" : b.name;
  x.fillText(name, W / 2, 360);
  const qr = await QRCode.toDataURL(url, { margin: 1, width: 760, color: { dark: "#2c362b", light: "#fffdf9" } });
  const img = new Image();
  await new Promise((r) => { img.onload = r; img.src = qr; });
  x.drawImage(img, (W - 760) / 2, 470, 760, 760);
  x.font = "700 64px Figtree, sans-serif";
  x.fillText("Jetzt scannen", W / 2, 1340);
  x.font = "400 40px Figtree, sans-serif";
  x.fillStyle = "#5f675c";
  x.fillText("Handy-Kamera auf den Code halten", W / 2, 1410);
  x.font = "500 38px Figtree, sans-serif";
  x.fillText(url.replace(/^https?:\/\//, "").replace(/\?.*$/, ""), W / 2, 1620);
  return c.toDataURL("image/png");
}

export default function Dashboard() {
  const router = useRouter();
  const [b, setB] = useState<Business | null>(null);
  const [qr, setQr] = useState("");
  const [stats, setStats] = useState<Record<string, number> | null>(null);
  const [busy, setBusy] = useState("");
  const [copied, setCopied] = useState(false);
  const [yearly, setYearly] = useState(false);

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

  const plan = PLANS[b.tier];
  const update = async (patch: Partial<Business>) => {
    const next = await saveBusiness({ ...b, ...patch });
    setB(next);
  };

  const origin = typeof window !== "undefined" ? window.location.origin : "";
  const url = `${origin}/p/${b.slug}`;
  const { pct, steps } = profileScore(b);
  const missing = [
    slugProblem(b.slug) && "gültige Adresse",
    !b.phone.trim() && "Telefonnummer",
    !b.legalName.trim() && "Impressum",
  ].filter(Boolean) as string[];
  const canPublish = missing.length === 0;
  const live = openState(b.hours);

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

  async function copy() {
    try { await navigator.clipboard.writeText(url); setCopied(true); setTimeout(() => setCopied(false), 1800); } catch {}
  }

  async function downloadPoster() {
    const png = await posterPng(b!, `${url}?src=qr`);
    const a = document.createElement("a");
    a.href = png; a.download = `veyndo-plakat-${b!.slug}.png`; a.click();
  }

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
          <Link href="/editor" className={s.btnPrimary}>Seite bearbeiten</Link>
        </div>
      </header>

      <main className={s.dashMain}>
        {/* HERO */}
        <section className={s.hello}>
          <div>
            <p className={s.helloKicker}>{greeting()} 👋</p>
            <h1>{b.name}</h1>
            <div className={s.urlRow}>
              <span className={`${s.statusDot} ${b.isPublished ? s.on : ""}`} />
              <a href={`/p/${b.slug}`} target="_blank" rel="noreferrer">{url.replace(/^https?:\/\//, "")}</a>
              <button type="button" className={s.copy} onClick={copy}>{copied ? "Kopiert ✓" : "Link kopieren"}</button>
            </div>
            <p className={s.helloSub}>{b.isPublished ? `Online · ${live.label}` : "Entwurf · noch nicht sichtbar für Kundinnen"}</p>
          </div>
          <div className={s.helloActions}>
            {b.isPublished ? (
              <>
                <Link href={`/p/${b.slug}`} target="_blank" className={s.btnLight}>Seite ansehen ↗</Link>
                <button type="button" className={s.btnGhostLight} onClick={() => update({ isPublished: false })}>Offline nehmen</button>
              </>
            ) : (
              <>
                <button type="button" className={s.btnLight} disabled={!canPublish} onClick={() => update({ isPublished: true })}>Jetzt veröffentlichen</button>
                {!canPublish && <small>Es fehlen noch: {missing.join(", ")}</small>}
              </>
            )}
          </div>
        </section>

        {/* KPIs */}
        <section>
          <div className={s.secHead}><h2>Letzte 30 Tage</h2>{plan.stats && <small>ohne Cookies gezählt</small>}</div>
          <div className={`${s.kpis} ${plan.stats ? "" : s.locked}`}>
            {KPIS.map(([k, label, icon]) => (
              <div key={k} className={s.kpi}>
                <span className={s.kpiIcon} aria-hidden>{icon}</span>
                <b>{plan.stats ? (stats?.[k] ?? 0) : "–"}</b>
                <small>{label}</small>
              </div>
            ))}
            {!plan.stats && (
              <div className={s.lockOver}>
                <b>Sehen Sie, wer anruft</b>
                <span>Aufrufe, Anrufe, Routen und QR-Scans gibt es ab Plan Profil.</span>
                <a href="#plan">Profil 14 Tage gratis testen →</a>
              </div>
            )}
          </div>
        </section>

        <div className={s.dashGrid}>
          {/* STRENGTH */}
          <section className={s.card}>
            <div className={s.strength}>
              <Ring pct={pct} size={84} label={`Profil zu ${pct} Prozent fertig`} />
              <div>
                <h2>Profil-Stärke</h2>
                <p>{pct >= 90 ? "Ausgezeichnet. So überzeugen Sie." : pct >= 60 ? "Gut! Ein paar Dinge fehlen noch." : "Noch ein paar Minuten, dann wirkt Ihre Seite."}</p>
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

          {/* QR + POSTER */}
          <section className={s.card}>
            <h2>Schaufenster & Kassa</h2>
            <p className={s.muted}>Fertiges Plakat mit QR-Code. Ausdrucken, aufhängen: Wer vorbeigeht, hat Ihre Preise in der Hand.</p>
            <div className={s.poster}>
              <div className={s.posterMock} style={{ ["--pa" as string]: b.accentColor }}>
                <small>Preise · Öffnungszeiten · Termine</small>
                <b>{b.name}</b>
                {/* eslint-disable-next-line @next/next/no-img-element -- data URL */}
                {qr && <img src={qr} alt={`QR-Code für ${url}`} />}
                <em>Jetzt scannen</em>
              </div>
              <div className={s.posterActions}>
                <button type="button" className={s.btnPrimary} onClick={downloadPoster}>Plakat herunterladen</button>
                {qr && <a className={s.btnGhost} href={qr} download={`veyndo-qr-${b.slug}.png`}>Nur QR-Code</a>}
              </div>
            </div>
          </section>

          {/* SHARE */}
          <section className={s.card}>
            <h2>Gefunden werden</h2>
            <ol className={s.share}>
              <li>
                <b>Google-Unternehmensprofil</b>
                <span>Tragen Sie Ihren Link als „Website“ ein. Dann führt Google direkt zu Ihren Preisen.</span>
                <a href="https://business.google.com/" target="_blank" rel="noopener noreferrer">Google-Profil öffnen ↗</a>
              </li>
              <li>
                <b>Instagram-Bio</b>
                <span>Link in die Bio, fertig. Ihre Follower sehen Preise und Zeiten mit einem Tipp.</span>
                <button type="button" className={s.linkBtn} onClick={copy}>{copied ? "Kopiert ✓" : "Link kopieren"}</button>
              </li>
              <li>
                <b>Stammkundschaft</b>
                <span>Schicken Sie den Link per WhatsApp an Ihre Kundinnen.</span>
                <a href={`https://wa.me/?text=${encodeURIComponent(`Hier finden Sie unsere Preise und Öffnungszeiten: ${url}`)}`} target="_blank" rel="noopener noreferrer">Per WhatsApp teilen ↗</a>
              </li>
            </ol>
          </section>
        </div>

        {/* PLAN */}
        <section id="plan" className={s.planSec}>
          <div className={s.secHead}>
            <h2>Ihr Plan</h2>
            <div className={s.seg} role="radiogroup" aria-label="Abrechnung">
              <button type="button" role="radio" aria-checked={!yearly} onClick={() => setYearly(false)}>Monatlich</button>
              <button type="button" role="radio" aria-checked={yearly} onClick={() => setYearly(true)}>Jährlich · 2 Monate gratis</button>
            </div>
          </div>
          <div className={s.plans}>
            {(["basis", "profil", "pro"] as const).map((t) => {
              const p = PLANS[t];
              const current = b.tier === t;
              const key = LOOKUPS[`${t}_${yearly ? "y" : "m"}`];
              return (
                <div key={t} className={`${s.plan} ${current ? s.planCurrent : ""} ${t === "profil" ? s.planHot : ""}`}>
                  {current && <span className={s.planTag}>Ihr Plan</span>}
                  {!current && t === "profil" && <span className={s.planTag}>Beliebt</span>}
                  <h3>{p.label}</h3>
                  <div className={s.price}>
                    {euro(yearly ? p.priceYearly : p.priceMonthly)}<small> / {yearly ? "Jahr" : "Monat"}</small>
                  </div>
                  <ul>{p.features.map((f) => <li key={f}>{f}</li>)}</ul>
                  {t === "basis" ? (
                    current ? <span className={s.planNote}>Kostenlos, für immer</span>
                      : <button type="button" className={s.btnGhost} onClick={portal}>Wechseln im Kundenportal</button>
                  ) : current ? (
                    <button type="button" className={s.btnGhost} onClick={portal}>Abo verwalten</button>
                  ) : (
                    <button type="button" className={s.btnPrimary} disabled={!!busy} onClick={() => checkout(key)}>
                      {busy === key ? "Einen Moment …" : "14 Tage gratis testen"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
          <p className={s.planFoot}>
            <button type="button" className={s.linkBtn} onClick={portal}>Rechnungen und Zahlungsart</button>
            {" · "}Monatlich kündbar.
          </p>
        </section>

        <p className={s.danger}>
          <button type="button" className={s.linkBtn} onClick={async () => {
            if (confirm("Profil wirklich löschen und neu beginnen? Das kann nicht rückgängig gemacht werden.")) {
              await clearBusiness();
              router.push("/start");
            }
          }}>Profil löschen und neu beginnen</button>
        </p>
      </main>
    </div>
  );
}
