"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/Chrome";
import ProfileView, { WEEKDAYS } from "@/components/ProfileView";
import { loadBusiness, newServiceId, saveBusiness, slugTaken } from "@/lib/store";
import { PLANS } from "@/lib/plans";
import { slugProblem, toSlug, PROFILE_DOMAIN } from "@/lib/slug";
import type { Business, OpeningDay, Service } from "@/lib/types";

type Tab = "basis" | "kontakt" | "leistungen" | "fotos" | "zeiten" | "impressum";
const TABS: [Tab, string][] = [
  ["basis", "Basis"],
  ["kontakt", "Kontakt"],
  ["leistungen", "Leistungen"],
  ["fotos", "Fotos"],
  ["zeiten", "Öffnungszeiten"],
  ["impressum", "Impressum"],
];

async function resizeImage(file: File, max = 1200): Promise<string> {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise<HTMLImageElement>((res, rej) => {
      const i = new Image();
      i.onload = () => res(i);
      i.onerror = rej;
      i.src = url;
    });
    const scale = Math.min(1, max / Math.max(img.width, img.height));
    const c = document.createElement("canvas");
    c.width = Math.round(img.width * scale);
    c.height = Math.round(img.height * scale);
    c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
    return c.toDataURL("image/jpeg", 0.8);
  } finally {
    URL.revokeObjectURL(url);
  }
}

export default function EditorPage() {
  const router = useRouter();
  const [b, setB] = useState<Business | null>(null);
  const [tab, setTab] = useState<Tab>("basis");
  const [saved, setSaved] = useState(true);
  const [showPreview, setShowPreview] = useState(false);
  const [taken, setTaken] = useState(false);
  const first = useRef(true);

  useEffect(() => {
    loadBusiness().then((loaded) => {
      if (!loaded) router.replace("/start");
      else setB(loaded);
    });
  }, [router]);

  // Autosave, debounced
  useEffect(() => {
    if (!b) return;
    if (first.current) { first.current = false; return; }
    setSaved(false);
    const t = setTimeout(() => {
      saveBusiness(b).then((next) => {
        const urls = new Map((next.photos ?? []).map((p) => [p.id, p.url]));
        const changed = next.coverDataUrl !== b.coverDataUrl || (b.photos ?? []).some((p) => urls.has(p.id) && urls.get(p.id) !== p.url);
        if (changed) {
          setB((cur) => cur && ({
            ...cur,
            coverDataUrl: cur.coverDataUrl === b.coverDataUrl ? next.coverDataUrl : cur.coverDataUrl,
            photos: cur.photos?.map((p) => ({ ...p, url: urls.get(p.id) ?? p.url })),
          }));
        }
        setSaved(true);
      });
    }, 400);
    return () => clearTimeout(t);
  }, [b]);

  useEffect(() => {
    if (!b) return;
    const t = setTimeout(() => {
      slugTaken(b.slug, b.id).then(setTaken);
    }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b?.slug, b?.id]);

  if (!b) return null;

  const plan = PLANS[b.tier];
  const set = <K extends keyof Business>(k: K, v: Business[K]) => setB({ ...b, [k]: v });
  const setSvc = (id: string, patch: Partial<Service>) =>
    set("services", b.services.map((s) => (s.id === id ? { ...s, ...patch } : s)));
  const setDay = (wd: number, patch: Partial<OpeningDay>) =>
    set("hours", b.hours.map((h) => (h.weekday === wd ? { ...h, ...patch } : h)));
  const slugErr = slugProblem(b.slug);
  const today = ((new Date().getDay() + 6) % 7) + 1;

  return (
    <>
      <TopBar>
        <span className="small muted" aria-live="polite">{saved ? "Gespeichert" : "Speichert …"}</span>
        <button className="btn ghost small mobile-toggle" onClick={() => setShowPreview((v) => !v)}>
          {showPreview ? "Bearbeiten" : "Vorschau"}
        </button>
        <Link href="/dashboard" className="btn small">Fertig</Link>
      </TopBar>

      <main className={`wrap editor${showPreview ? " show-preview" : ""}`}>
        <div className="form">
          <div className="tabs" role="tablist">
            {TABS.map(([k, label]) => (
              <button key={k} role="tab" aria-selected={tab === k} onClick={() => setTab(k)}>{label}</button>
            ))}
          </div>

          <div className="card">
            {tab === "basis" && (
              <>
                <div className="field">
                  <label htmlFor="f-name">Name des Betriebs</label>
                  <input id="f-name" value={b.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />
                </div>
                <div className="field">
                  <label htmlFor="f-slug">Adresse Ihrer Seite</label>
                  <div className="slugbox">
                    <input id="f-slug" value={b.slug} maxLength={40}
                      onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                    <span>.{PROFILE_DOMAIN}</span>
                  </div>
                  {slugErr ? <span className="error">{slugErr}</span> : taken ? (
                    <span className="error">Adresse ist schon vergeben.</span>
                  ) : (
                    <button type="button" className="linkbtn small" style={{ alignSelf: "flex-start" }}
                      onClick={() => set("slug", toSlug(b.name))}>Aus dem Namen erzeugen</button>
                  )}
                </div>
                <div className="field">
                  <label htmlFor="f-tag">Kurzbeschreibung</label>
                  <input id="f-tag" value={b.tagline} maxLength={90} onChange={(e) => set("tagline", e.target.value)} />
                  <span className="hint">Eine Zeile unter dem Namen, z. B. was Sie machen und wo.</span>
                </div>
                <div className="field">
                  <label htmlFor="f-about">Über uns</label>
                  <textarea id="f-about" value={b.about} maxLength={600} onChange={(e) => set("about", e.target.value)} />
                </div>
                <div className="field">
                  <span className="label-like">Stil</span>
                  <div className="theme-pick" role="radiogroup" aria-label="Stil">
                    {([
                      ["klassisch", "Klassisch", "#fffdf9", "#2c362b"],
                      ["modern", "Modern", "#121612", "#eef0ea"],
                      ["frisch", "Frisch", "#ffffff", "#1d221d"],
                    ] as const).map(([key, label, bg, fg]) => (
                      <button key={key} type="button" role="radio" aria-checked={(b.theme ?? "klassisch") === key}
                        onClick={() => set("theme", key)} style={{ background: bg, color: fg }}>
                        <i style={{ background: b.accentColor }} />{label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="row2">
                  <div className="field">
                    <label htmlFor="f-color">Farbe</label>
                    <input id="f-color" type="color" value={b.accentColor} style={{ height: 44, padding: 4 }}
                      onChange={(e) => set("accentColor", e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="f-cover">Titelfoto</label>
                    <input id="f-cover" type="file" accept="image/*" onChange={async (e) => {
                      const f = e.target.files?.[0];
                      if (f) set("coverDataUrl", await resizeImage(f));
                    }} />
                    {b.coverDataUrl && (
                      <button type="button" className="linkbtn small" style={{ alignSelf: "flex-start" }}
                        onClick={() => set("coverDataUrl", null)}>Foto entfernen</button>
                    )}
                  </div>
                </div>
              </>
            )}

            {tab === "kontakt" && (
              <>
                <div className="row2">
                  <div className="field">
                    <label htmlFor="f-phone">Telefon</label>
                    <input id="f-phone" type="tel" value={b.phone} placeholder="+43 1 234 56 78" onChange={(e) => set("phone", e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="f-wa">WhatsApp</label>
                    <input id="f-wa" type="tel" value={b.whatsapp} placeholder="+43 664 123 45 67" onChange={(e) => set("whatsapp", e.target.value)} />
                    {!plan.whatsapp && <span className="hint">Der WhatsApp-Button erscheint ab Plan Profil.</span>}
                  </div>
                </div>
                <div className="field">
                  <label htmlFor="f-street">Straße und Hausnummer</label>
                  <input id="f-street" value={b.street} placeholder="Neubaugasse 12" onChange={(e) => set("street", e.target.value)} />
                </div>
                <div className="row2">
                  <div className="field">
                    <label htmlFor="f-plz">PLZ</label>
                    <input id="f-plz" value={b.postalCode} inputMode="numeric" maxLength={4}
                      onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))} />
                  </div>
                  <div className="field">
                    <label htmlFor="f-city">Ort</label>
                    <input id="f-city" value={b.city} onChange={(e) => set("city", e.target.value)} />
                  </div>
                </div>
                <div className="row2">
                  <div className="field">
                    <label htmlFor="f-mail">E-Mail</label>
                    <input id="f-mail" type="email" value={b.email} onChange={(e) => set("email", e.target.value)} />
                  </div>
                  <div className="field">
                    <label htmlFor="f-ig">Instagram</label>
                    <input id="f-ig" value={b.instagram} placeholder="@ihrstudio" onChange={(e) => set("instagram", e.target.value)} />
                  </div>
                </div>
              </>
            )}

            {tab === "fotos" && (
              <>
                {plan.gallery === 0 ? (
                  <div className="notice">
                    Die Fotogalerie gibt es ab Plan Profil (€ 9 / Monat): bis zu 8 Fotos, die Kundinnen groß ansehen können.{" "}
                    <Link href="/dashboard#plan">Plan ansehen</Link>
                  </div>
                ) : (
                  <p className="small muted" style={{ marginTop: 0 }}>
                    {(b.photos ?? []).length} von {plan.gallery} Fotos. Tipp: Arbeiten, Räume und Team. Das erste Foto wird groß gezeigt.
                  </p>
                )}
                <div className="photo-grid">
                  {(b.photos ?? []).map((p, i, arr) => (
                    <div key={p.id} className="photo-item" style={{ opacity: i < plan.gallery ? 1 : 0.4 }}>
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.url} alt={`Foto ${i + 1}`} />
                      <div className="photo-tools">
                        <button type="button" aria-label="Nach vorne" disabled={i === 0}
                          onClick={() => { const a = [...arr]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set("photos", a); }}>‹</button>
                        <button type="button" aria-label="Foto löschen"
                          onClick={() => set("photos", arr.filter((x) => x.id !== p.id))}>×</button>
                        <button type="button" aria-label="Nach hinten" disabled={i === arr.length - 1}
                          onClick={() => { const a = [...arr]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set("photos", a); }}>›</button>
                      </div>
                    </div>
                  ))}
                  {plan.gallery > 0 && (b.photos ?? []).length < plan.gallery && (
                    <label className="photo-add">
                      <input type="file" accept="image/*" multiple className="sr-only" onChange={async (e) => {
                        const files = Array.from(e.target.files ?? []);
                        e.target.value = "";
                        const room = plan.gallery - (b.photos ?? []).length;
                        const added = await Promise.all(files.slice(0, room).map(async (f) => ({ id: newServiceId(), url: await resizeImage(f, 1400) })));
                        setB((cur) => cur && ({ ...cur, photos: [...(cur.photos ?? []), ...added] }));
                      }} />
                      <span aria-hidden>+</span>
                      Fotos hinzufügen
                    </label>
                  )}
                </div>
              </>
            )}

            {tab === "leistungen" && (
              <>
                {(!plan.showPrices || b.services.length > plan.maxServices) && (
                  <div className="notice">
                    Im Plan {plan.label} sind {plan.maxServices} Leistungen ohne Preise sichtbar.
                    Mit Profil (€ 9 / Monat) zeigen Sie alle Leistungen mit Preisen.{" "}
                    <Link href="/dashboard#plan">Plan ansehen</Link>
                  </div>
                )}
                {b.services.map((s, i) => (
                  <div className="svc-row" key={s.id} style={{ opacity: i < plan.maxServices ? 1 : 0.5 }}>
                    <input aria-label="Leistung" value={s.title} placeholder="Leistung" onChange={(e) => setSvc(s.id, { title: e.target.value })} />
                    <input aria-label="Preis" value={s.priceLabel} placeholder="€ 30" onChange={(e) => setSvc(s.id, { priceLabel: e.target.value })} />
                    <input aria-label="Dauer in Minuten" className="dur" type="number" min={0} value={s.durationMin ?? ""} placeholder="Min."
                      onChange={(e) => setSvc(s.id, { durationMin: e.target.value ? Number(e.target.value) : null })} />
                    <button className="iconbtn" aria-label={`${s.title || "Leistung"} löschen`}
                      onClick={() => set("services", b.services.filter((x) => x.id !== s.id))}>×</button>
                  </div>
                ))}
                <button className="btn ghost small" style={{ marginTop: 6 }}
                  onClick={() => set("services", [...b.services, { id: newServiceId(), title: "", priceLabel: "", durationMin: null }])}>
                  + Leistung hinzufügen
                </button>
              </>
            )}

            {tab === "zeiten" && (
              <>
                {b.hours.map((h) => (
                  <div className="hours-row" key={h.weekday}>
                    <strong className="small">{WEEKDAYS[h.weekday - 1]}</strong>
                    <input aria-label={`${WEEKDAYS[h.weekday - 1]} von`} type="time" value={h.opens ?? ""} disabled={h.closed}
                      onChange={(e) => setDay(h.weekday, { opens: e.target.value })} />
                    <input aria-label={`${WEEKDAYS[h.weekday - 1]} bis`} type="time" value={h.closes ?? ""} disabled={h.closed}
                      onChange={(e) => setDay(h.weekday, { closes: e.target.value })} />
                    <label className="small closed" style={{ display: "flex", gap: 6, alignItems: "center" }}>
                      <input type="checkbox" style={{ width: "auto" }} checked={h.closed}
                        onChange={(e) => setDay(h.weekday, e.target.checked
                          ? { closed: true }
                          : { closed: false, opens: h.opens || "09:00", closes: h.closes || "18:00" })} />
                      geschlossen
                    </label>
                  </div>
                ))}
              </>
            )}

            {tab === "impressum" && (
              <>
                <div className="notice">
                  In Österreich braucht jede geschäftliche Website ein Impressum (§ 5 ECG, § 25 MedienG).
                  Diese Angaben stehen unten auf Ihrer Seite.
                </div>
                <div className="field">
                  <label htmlFor="f-legal">Firmenname oder Vor- und Nachname</label>
                  <input id="f-legal" value={b.legalName} onChange={(e) => set("legalName", e.target.value)} />
                </div>
                <div className="row2">
                  <div className="field">
                    <label htmlFor="f-form">Rechtsform</label>
                    <select id="f-form" value={b.legalForm} onChange={(e) => set("legalForm", e.target.value)}>
                      <option value="">Einzelunternehmen</option>
                      <option value="e.U.">e.U.</option>
                      <option value="GmbH">GmbH</option>
                      <option value="OG">OG</option>
                      <option value="KG">KG</option>
                      <option value="Verein">Verein</option>
                    </select>
                  </div>
                  <div className="field">
                    <label htmlFor="f-uid">UID-Nummer (falls vorhanden)</label>
                    <input id="f-uid" value={b.uidNumber} placeholder="ATU12345678" onChange={(e) => set("uidNumber", e.target.value.toUpperCase())} />
                  </div>
                </div>
                <p className="small muted" style={{ margin: 0 }}>Adresse und E-Mail kommen aus dem Bereich Kontakt.</p>
              </>
            )}
          </div>
        </div>

        <aside className="preview" aria-label="Vorschau">
          <p className="small muted" style={{ margin: "0 0 8px" }}>Live-Vorschau</p>
          <div className="phone"><ProfileView b={b} today={today} /></div>
        </aside>
      </main>
    </>
  );
}
