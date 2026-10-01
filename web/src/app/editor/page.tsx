"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileView, { WEEKDAYS } from "@/components/ProfileView";
import Ring from "@/components/studio/Ring";
import { loadBusiness, newServiceId, saveBusiness, slugTaken } from "@/lib/store";
import { PLANS } from "@/lib/plans";
import { getTemplate } from "@/lib/templates";
import { slugProblem, toSlug, PROFILE_DOMAIN } from "@/lib/slug";
import { profileScore, type EditorTab } from "@/lib/completeness";
import { openState } from "@/lib/hours";
import type { Business, OpeningDay, ProfileTheme, Service } from "@/lib/types";
import s from "@/components/studio/studio.module.css";

const SECTIONS: { key: EditorTab; label: string; icon: string; title: string; sub: string }[] = [
  { key: "basis", label: "Auftritt", icon: "✦", title: "Ihr Auftritt", sub: "Name, Foto und Stil: der erste Eindruck in einer Sekunde." },
  { key: "leistungen", label: "Leistungen", icon: "€", title: "Leistungen & Preise", sub: "Klare Preise sind der häufigste Grund, warum Kundinnen anrufen." },
  { key: "fotos", label: "Galerie", icon: "▦", title: "Galerie", sub: "Zeigen Sie Ihre Arbeit, Ihre Räume und Ihr Team." },
  { key: "zeiten", label: "Zeiten", icon: "◷", title: "Öffnungszeiten", sub: "Daraus entsteht der Live-Status „Jetzt geöffnet“." },
  { key: "kontakt", label: "Kontakt", icon: "☏", title: "Kontakt & Adresse", sub: "So erreicht man Sie mit einem Tipp." },
  { key: "impressum", label: "Impressum", icon: "§", title: "Impressum", sub: "Pflicht in Österreich (§ 5 ECG, § 25 MedienG). Steht unten auf Ihrer Seite." },
];

const SWATCHES = ["#b98b86", "#8a9a62", "#3d4a3a", "#5b7c99", "#c27c4e", "#8e6fa8", "#b8a06a", "#2c2c2c"];
const THEMES: { key: ProfileTheme; label: string; bg: string; fg: string; card: string }[] = [
  { key: "klassisch", label: "Klassisch", bg: "#fffdf9", fg: "#2c362b", card: "#f1ebdf" },
  { key: "modern", label: "Modern", bg: "#121612", fg: "#eef0ea", card: "#232b24" },
  { key: "frisch", label: "Frisch", bg: "#ffffff", fg: "#1d221d", card: "#f0f2ea" },
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
  const [tab, setTab] = useState<EditorTab>("basis");
  const [saved, setSaved] = useState(true);
  const [sheet, setSheet] = useState(false); // mobile preview
  const [device, setDevice] = useState<"phone" | "desktop">("phone");
  const [taken, setTaken] = useState(false);
  const first = useRef(true);
  const deskBox = useRef<HTMLDivElement>(null);
  const [deskScale, setDeskScale] = useState(0.36);

  useEffect(() => {
    const q = new URLSearchParams(window.location.search).get("tab") as EditorTab | null;
    if (q && SECTIONS.some((x) => x.key === q)) setTab(q);
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
    const t = setTimeout(() => { slugTaken(b.slug, b.id).then(setTaken); }, 400);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [b?.slug, b?.id]);

  // Scale the desktop preview to the column width.
  useEffect(() => {
    const el = deskBox.current;
    if (!el || device !== "desktop") return;
    const ro = new ResizeObserver(([e]) => setDeskScale(e.contentRect.width / 1100));
    ro.observe(el);
    return () => ro.disconnect();
  }, [device, b !== null]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!b) return null;

  const plan = PLANS[b.tier];
  const tpl = getTemplate(b.templateKey);
  const set = <K extends keyof Business>(k: K, v: Business[K]) => setB({ ...b, [k]: v });
  const setSvc = (id: string, patch: Partial<Service>) =>
    set("services", b.services.map((x) => (x.id === id ? { ...x, ...patch } : x)));
  const moveSvc = (i: number, d: number) => {
    const a = [...b.services];
    [a[i], a[i + d]] = [a[i + d], a[i]];
    set("services", a);
  };
  const setDay = (wd: number, patch: Partial<OpeningDay>) =>
    set("hours", b.hours.map((h) => (h.weekday === wd ? { ...h, ...patch } : h)));
  const slugErr = slugProblem(b.slug);
  const today = ((new Date().getDay() + 6) % 7) + 1;
  const { pct, steps, next } = profileScore(b);
  const doneIn = (t: EditorTab) => { const own = steps.filter((x) => x.tab === t); return own.length > 0 && own.every((x) => x.done); };
  const canPublish = !slugErr && !taken && !!b.phone.trim() && !!b.legalName.trim();
  const section = SECTIONS.find((x) => x.key === tab)!;
  const suggestions = tpl.services.filter((ts) => !b.services.some((x) => x.title.trim().toLowerCase() === ts.title.toLowerCase()));
  const live = openState(b.hours);

  const preview = device === "phone" ? (
    <div className={s.device}><div className={s.deviceScreen}><ProfileView b={b} today={today} /></div></div>
  ) : (
    <div ref={deskBox} className={s.desk}>
      <div className={s.deskBar}><i /><i /><i /><span>{b.slug}.{PROFILE_DOMAIN}</span></div>
      <div className={s.deskViewport} style={{ height: 720 * deskScale }}>
        <div style={{ width: 1100, zoom: deskScale }}>
          <ProfileView b={b} today={today} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={s.shell}>
      {/* TOP BAR */}
      <header className={s.top}>
        <Link href="/dashboard" className={s.back}>← Übersicht</Link>
        <div className={s.topName}>
          <b>{b.name || "Ihr Betrieb"}</b>
          <span className={`${s.savePill} ${saved ? s.isSaved : ""}`} aria-live="polite">
            <i />{saved ? "Gespeichert" : "Speichert …"}
          </span>
        </div>
        <div className={s.topActions}>
          <Link href={`/p/${b.slug}`} target="_blank" className={s.btnGhost}>Ansehen ↗</Link>
          {b.isPublished ? (
            <span className={s.onlinePill}><i />Online</span>
          ) : (
            <button className={s.btnPrimary} disabled={!canPublish} onClick={() => set("isPublished", true)}
              title={canPublish ? "" : "Dafür fehlen noch Telefon und Impressum"}>
              Veröffentlichen
            </button>
          )}
        </div>
      </header>

      {/* SIDEBAR */}
      <nav className={s.side} aria-label="Bereiche">
        <div className={s.score}>
          <Ring pct={pct} label={`Profil zu ${pct} Prozent fertig`} />
          <div>
            <b>Profil zu {pct}% fertig</b>
            {next ? (
              <button type="button" className={s.nextStep} onClick={() => setTab(next.tab)}>Nächster Schritt: {next.label} →</button>
            ) : <small>Stark! Alles Wichtige ist drin.</small>}
          </div>
        </div>
        <ul className={s.navList}>
          {SECTIONS.map((x) => (
            <li key={x.key}>
              <button type="button" aria-current={tab === x.key ? "page" : undefined} onClick={() => setTab(x.key)}>
                <span className={s.navIcon} aria-hidden>{x.icon}</span>
                {x.label}
                {doneIn(x.key) && <span className={s.navDone} aria-label="erledigt">✓</span>}
              </button>
            </li>
          ))}
        </ul>
      </nav>

      {/* FORM PANEL */}
      <main className={s.panel}>
        <div className={s.panelHead}>
          <h1>{section.title}</h1>
          <p>{section.sub}</p>
        </div>

        {tab === "basis" && (
          <>
            <div className={s.box}>
              <label className={s.cover} style={b.coverDataUrl ? { backgroundImage: `url(${b.coverDataUrl})` } : undefined}>
                <input type="file" accept="image/*" className="sr-only" onChange={async (e) => {
                  const f = e.target.files?.[0];
                  e.target.value = "";
                  if (f) set("coverDataUrl", await resizeImage(f));
                }} />
                <span className={s.coverHint}>{b.coverDataUrl ? "Titelfoto ändern" : "＋ Titelfoto hochladen"}</span>
                {!b.coverDataUrl && <small>Am besten quer, z. B. Ihr Geschäft oder Ihre Arbeit.</small>}
              </label>
              {b.coverDataUrl && (
                <button type="button" className={s.linkBtn} onClick={() => set("coverDataUrl", null)}>Foto entfernen</button>
              )}
            </div>

            <div className={s.box}>
              <div className={s.field}>
                <label htmlFor="f-name">Name des Betriebs</label>
                <input id="f-name" value={b.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className={s.field}>
                <label htmlFor="f-tag">Kurzbeschreibung</label>
                <input id="f-tag" value={b.tagline} maxLength={90} onChange={(e) => set("tagline", e.target.value)} />
                <small>{b.tagline.length}/90 · Was Sie machen und wo, z. B. „Schnitt und Farbe in Wien 1070“.</small>
              </div>
              <div className={s.field}>
                <label htmlFor="f-slug">Adresse Ihrer Seite</label>
                <div className={s.slug}>
                  <input id="f-slug" value={b.slug} maxLength={40}
                    onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                  <span>.{PROFILE_DOMAIN}</span>
                </div>
                {slugErr ? <small className={s.err}>{slugErr}</small> : taken ? (
                  <small className={s.err}>Diese Adresse ist schon vergeben.</small>
                ) : (
                  <small className={s.ok}>✓ Verfügbar · <button type="button" className={s.linkBtn} onClick={() => set("slug", toSlug(b.name))}>aus dem Namen erzeugen</button></small>
                )}
              </div>
              <div className={s.field}>
                <label htmlFor="f-about">Über uns</label>
                <textarea id="f-about" value={b.about} maxLength={600} rows={4} onChange={(e) => set("about", e.target.value)} />
                <small>{b.about.length}/600 · Persönlich wirkt am besten: Wer sind Sie, was ist Ihnen wichtig?</small>
              </div>
            </div>

            <div className={s.box}>
              <span className={s.label}>Stil</span>
              <div className={s.themes} role="radiogroup" aria-label="Stil">
                {THEMES.map((t) => (
                  <button key={t.key} type="button" role="radio" aria-checked={(b.theme ?? "klassisch") === t.key}
                    className={s.theme} onClick={() => set("theme", t.key)}>
                    <span className={s.themeMock} style={{ background: t.bg }}>
                      <i style={{ background: b.accentColor }} />
                      <b style={{ background: t.fg }} />
                      <em style={{ background: t.card }} /><em style={{ background: t.card }} />
                    </span>
                    {t.label}
                  </button>
                ))}
              </div>
              <span className={s.label} style={{ marginTop: 18 }}>Farbe</span>
              <div className={s.swatches}>
                {SWATCHES.map((c) => (
                  <button key={c} type="button" className={s.swatch} style={{ background: c }}
                    aria-label={`Farbe ${c}`} aria-pressed={b.accentColor.toLowerCase() === c} onClick={() => set("accentColor", c)} />
                ))}
                <label className={s.swatchCustom} title="Eigene Farbe">
                  <input type="color" value={b.accentColor} onChange={(e) => set("accentColor", e.target.value)} aria-label="Eigene Farbe" />
                  ＋
                </label>
              </div>
            </div>
          </>
        )}

        {tab === "leistungen" && (
          <>
            {(!plan.showPrices || b.services.length > plan.maxServices) && (
              <div className={s.upsell}>
                <b>Preise sichtbar machen</b>
                <span>Im Plan {plan.label} sehen Kundinnen {plan.maxServices} Leistungen ohne Preise. Mit Profil zeigen Sie alles.</span>
                <Link href="/preise">Preisliste ansehen →</Link>
              </div>
            )}
            <div className={s.box}>
              <ul className={s.svcList}>
                {b.services.map((x, i) => (
                  <li key={x.id} className={s.svc} style={{ opacity: i < plan.maxServices ? 1 : 0.45 }}>
                    <div className={s.svcMove}>
                      <button type="button" aria-label="Nach oben" disabled={i === 0} onClick={() => moveSvc(i, -1)}>▲</button>
                      <button type="button" aria-label="Nach unten" disabled={i === b.services.length - 1} onClick={() => moveSvc(i, 1)}>▼</button>
                    </div>
                    <input className={s.svcTitle} aria-label="Leistung" value={x.title} placeholder="Leistung" onChange={(e) => setSvc(x.id, { title: e.target.value })} />
                    <input className={s.svcPrice} aria-label="Preis" value={x.priceLabel} placeholder="€ 30" onChange={(e) => setSvc(x.id, { priceLabel: e.target.value })} />
                    <input className={s.svcDur} aria-label="Dauer in Minuten" type="number" min={0} value={x.durationMin ?? ""} placeholder="Min."
                      onChange={(e) => setSvc(x.id, { durationMin: e.target.value ? Number(e.target.value) : null })} />
                    <button type="button" className={s.del} aria-label={`${x.title || "Leistung"} löschen`}
                      onClick={() => set("services", b.services.filter((y) => y.id !== x.id))}>×</button>
                  </li>
                ))}
              </ul>
              <button type="button" className={s.add}
                onClick={() => set("services", [...b.services, { id: newServiceId(), title: "", priceLabel: "", durationMin: null }])}>
                ＋ Leistung hinzufügen
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className={s.box}>
                <span className={s.label}>Vorschläge für {tpl.label}</span>
                <div className={s.chips}>
                  {suggestions.map((ts) => (
                    <button key={ts.title} type="button" className={s.chip} onClick={() => set("services", [...b.services,
                      { id: newServiceId(), title: ts.title, priceLabel: ts.price_label, durationMin: ts.duration_min }])}>
                      ＋ {ts.title} <small>{ts.price_label}</small>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </>
        )}

        {tab === "fotos" && (
          <>
            {plan.gallery === 0 ? (
              <div className={s.upsell}>
                <b>Galerie freischalten</b>
                <span>Mit Profil zeigen Sie bis zu 8 Fotos, die Kundinnen groß ansehen können.</span>
                <Link href="/preise">Preisliste ansehen →</Link>
              </div>
            ) : (
              <p className={s.meta}>{(b.photos ?? []).length} von {plan.gallery} Fotos · Das erste Foto wird groß gezeigt.</p>
            )}
            <div className={s.box}>
              <div className={s.photos}>
                {(b.photos ?? []).map((p, i, arr) => (
                  <div key={p.id} className={s.photo} style={{ opacity: i < plan.gallery ? 1 : 0.4 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`Foto ${i + 1}`} />
                    {i === 0 && <span className={s.photoMain}>Großes Foto</span>}
                    <div className={s.photoTools}>
                      <button type="button" aria-label="Nach vorne" disabled={i === 0}
                        onClick={() => { const a = [...arr]; [a[i - 1], a[i]] = [a[i], a[i - 1]]; set("photos", a); }}>‹</button>
                      <button type="button" aria-label="Foto löschen" onClick={() => set("photos", arr.filter((x) => x.id !== p.id))}>×</button>
                      <button type="button" aria-label="Nach hinten" disabled={i === arr.length - 1}
                        onClick={() => { const a = [...arr]; [a[i + 1], a[i]] = [a[i], a[i + 1]]; set("photos", a); }}>›</button>
                    </div>
                  </div>
                ))}
                {plan.gallery > 0 && (b.photos ?? []).length < plan.gallery && (
                  <label className={s.photoAdd}>
                    <input type="file" accept="image/*" multiple className="sr-only" onChange={async (e) => {
                      const files = Array.from(e.target.files ?? []);
                      e.target.value = "";
                      const room = plan.gallery - (b.photos ?? []).length;
                      const added = await Promise.all(files.slice(0, room).map(async (f) => ({ id: newServiceId(), url: await resizeImage(f, 1400) })));
                      setB((cur) => cur && ({ ...cur, photos: [...(cur.photos ?? []), ...added] }));
                    }} />
                    <span aria-hidden>＋</span>
                    Fotos hinzufügen
                  </label>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "zeiten" && (
          <>
            <p className={s.meta}>Live auf Ihrer Seite: <b>{live.label}</b></p>
            <div className={s.box}>
              {b.hours.map((h) => (
                <div key={h.weekday} className={`${s.day} ${h.closed ? s.dayOff : ""}`}>
                  <label className={s.switch}>
                    <input type="checkbox" checked={!h.closed}
                      onChange={(e) => setDay(h.weekday, e.target.checked
                        ? { closed: false, opens: h.opens || "09:00", closes: h.closes || "18:00" }
                        : { closed: true })} />
                    <span aria-hidden />
                    <b>{WEEKDAYS[h.weekday - 1]}</b>
                  </label>
                  {h.closed ? <span className={s.closedTxt}>geschlossen</span> : (
                    <div className={s.times}>
                      <input aria-label={`${WEEKDAYS[h.weekday - 1]} von`} type="time" value={h.opens ?? ""} onChange={(e) => setDay(h.weekday, { opens: e.target.value })} />
                      <span>–</span>
                      <input aria-label={`${WEEKDAYS[h.weekday - 1]} bis`} type="time" value={h.closes ?? ""} onChange={(e) => setDay(h.weekday, { closes: e.target.value })} />
                    </div>
                  )}
                </div>
              ))}
              <button type="button" className={s.add} onClick={() => {
                const mon = b.hours.find((h) => h.weekday === 1);
                if (!mon) return;
                set("hours", b.hours.map((h) => (h.weekday >= 2 && h.weekday <= 5 ? { ...h, closed: mon.closed, opens: mon.opens, closes: mon.closes, note: mon.note } : h)));
              }}>Zeiten vom Montag auf Di–Fr übertragen</button>
            </div>
          </>
        )}

        {tab === "kontakt" && (
          <div className={s.box}>
            <div className={s.row2}>
              <div className={s.field}>
                <label htmlFor="f-phone">☏ Telefon</label>
                <input id="f-phone" type="tel" value={b.phone} placeholder="+43 1 234 56 78" onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className={s.field}>
                <label htmlFor="f-wa">✆ WhatsApp</label>
                <input id="f-wa" type="tel" value={b.whatsapp} placeholder="+43 664 123 45 67" onChange={(e) => set("whatsapp", e.target.value)} />
                {!plan.whatsapp && <small>Der WhatsApp-Button wird persönlich freigeschaltet. <Link href="/preise">Preisliste</Link></small>}
              </div>
            </div>
            <div className={s.field}>
              <label htmlFor="f-street">📍 Straße und Hausnummer</label>
              <input id="f-street" value={b.street} placeholder="Neubaugasse 12" onChange={(e) => set("street", e.target.value)} />
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label htmlFor="f-plz">PLZ</label>
                <input id="f-plz" value={b.postalCode} inputMode="numeric" maxLength={4} onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className={s.field}>
                <label htmlFor="f-city">Ort</label>
                <input id="f-city" value={b.city} onChange={(e) => set("city", e.target.value)} />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label htmlFor="f-mail">✉ E-Mail</label>
                <input id="f-mail" type="email" value={b.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className={s.field}>
                <label htmlFor="f-ig">◎ Instagram</label>
                <input id="f-ig" value={b.instagram} placeholder="@ihrstudio" onChange={(e) => set("instagram", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {tab === "impressum" && (
          <div className={s.box}>
            <div className={s.field}>
              <label htmlFor="f-legal">Firmenname oder Vor- und Nachname</label>
              <input id="f-legal" value={b.legalName} onChange={(e) => set("legalName", e.target.value)} />
            </div>
            <div className={s.row2}>
              <div className={s.field}>
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
              <div className={s.field}>
                <label htmlFor="f-uid">UID-Nummer (falls vorhanden)</label>
                <input id="f-uid" value={b.uidNumber} placeholder="ATU12345678" onChange={(e) => set("uidNumber", e.target.value.toUpperCase())} />
              </div>
            </div>
            <small className={s.meta}>Adresse und E-Mail kommen aus „Kontakt“.</small>
          </div>
        )}

        <div className={s.pager}>
          {(() => {
            const i = SECTIONS.findIndex((x) => x.key === tab);
            const nextSec = SECTIONS[i + 1];
            return nextSec
              ? <button type="button" className={s.btnPrimary} onClick={() => { setTab(nextSec.key); window.scrollTo({ top: 0, behavior: "smooth" }); }}>Weiter: {nextSec.label} →</button>
              : <Link href="/dashboard" className={s.btnPrimary}>Fertig → Übersicht</Link>;
          })()}
        </div>
      </main>

      {/* PREVIEW */}
      <aside className={`${s.previewCol} ${sheet ? s.sheetOpen : ""}`} aria-label="Vorschau">
        <div className={s.previewHead}>
          <div className={s.seg} role="radiogroup" aria-label="Gerät">
            <button type="button" role="radio" aria-checked={device === "phone"} onClick={() => setDevice("phone")}>Handy</button>
            <button type="button" role="radio" aria-checked={device === "desktop"} onClick={() => setDevice("desktop")}>Computer</button>
          </div>
          <button type="button" className={s.sheetClose} onClick={() => setSheet(false)} aria-label="Vorschau schließen">×</button>
        </div>
        {preview}
      </aside>

      <button type="button" className={s.fab} onClick={() => setSheet(true)}>Vorschau ansehen</button>
    </div>
  );
}
