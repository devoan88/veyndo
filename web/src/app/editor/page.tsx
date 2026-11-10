"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import Ring from "@/components/studio/Ring";
import { loadBusiness, newServiceId, saveBusiness, slugTaken } from "@/lib/store";
import { PLANS } from "@/lib/plans";
import { getTemplates } from "@/lib/templates";
import { getProfession, professionLabel } from "@/lib/professions";
import { slugProblem, toSlug, profileDomain } from "@/lib/slug";
import { profileScore, type EditorTab } from "@/lib/completeness";
import { openState, hoursCopy } from "@/lib/hours";
import { SWATCHES, THEMES } from "@/lib/look";
import type { Business, OpeningDay, Service } from "@/lib/types";
import { useI18n } from "@/components/i18n/LocaleProvider";
import { format } from "@/lib/i18n/messages";
import s from "@/components/studio/studio.module.css";

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
  const { locale, m } = useI18n();
  const WEEKDAYS = hoursCopy(locale).weekdays;
  const SECTIONS = m.editor.sections as { key: EditorTab; label: string; icon: string; title: string; sub: string }[];
  const domain = profileDomain(locale);
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

  // Demos (not live) show every feature, so visitors see the full result.
  const demo = !b.isPublished;
  const plan = PLANS[demo ? "pro" : b.tier];
  const shown = demo ? { ...b, tier: "pro" as const } : b;
  const prof = getProfession(b.templateKey);
  const tplServices = getTemplates(locale).find((t) => t.key === (prof?.base ?? b.templateKey))?.services
    ?? (prof?.services ?? []).map(([title, price_label, duration_min]) => ({ title, price_label, duration_min }));
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
  const slugErr = slugProblem(b.slug, locale);
  const today = ((new Date().getDay() + 6) % 7) + 1;
  const { pct, steps, next } = profileScore(b, locale);
  const doneIn = (t: EditorTab) => { const own = steps.filter((x) => x.tab === t); return own.length > 0 && own.every((x) => x.done); };
  const section = SECTIONS.find((x) => x.key === tab)!;
  const suggestions = tplServices.filter((ts) => !b.services.some((x) => x.title.trim().toLowerCase() === ts.title.toLowerCase()));
  const live = openState(b.hours, new Date(), hoursCopy(locale));

  const preview = device === "phone" ? (
    <div className={s.device}><div className={s.deviceScreen}><ProfileView b={shown} today={today} /></div></div>
  ) : (
    <div ref={deskBox} className={s.desk}>
      <div className={s.deskBar}><i /><i /><i /><span>{m.editor.previewBar}</span></div>
      <div className={s.deskViewport} style={{ height: 720 * deskScale }}>
        <div style={{ width: 1100, zoom: deskScale }}>
          <ProfileView b={shown} today={today} />
        </div>
      </div>
    </div>
  );

  return (
    <div className={s.shell}>
      {/* TOP BAR */}
      <header className={s.top}>
        <Link href="/dashboard" className={s.back}>{m.editor.back}</Link>
        <div className={s.topName}>
          <b>{b.name || m.editor.yourBusiness}</b>
          <span className={`${s.savePill} ${saved ? s.isSaved : ""}`} aria-live="polite">
            <i />{saved ? m.editor.saved : m.editor.saving}
          </span>
        </div>
        <div className={s.topActions}>
          <span className={s.onlinePill} style={{ color: "var(--muted)", background: "var(--soft)" }}>{m.editor.previewOnly}</span>
        </div>
      </header>

      {/* SIDEBAR */}
      <nav className={s.side} aria-label="Bereiche">
        <div className={s.score}>
          <Ring pct={pct} label={format(m.editor.profilePct, { pct })} />
          <div>
            <b>{format(m.editor.profilePct, { pct })}</b>
            {next ? (
              <button type="button" className={s.nextStep} onClick={() => setTab(next.tab)}>{format(m.editor.nextStep, { label: next.label })}</button>
            ) : <small>{m.editor.allDone}</small>}
          </div>
        </div>
        <ul className={s.navList}>
          {SECTIONS.map((x) => (
            <li key={x.key}>
              <button type="button" aria-current={tab === x.key ? "page" : undefined} onClick={() => setTab(x.key)}>
                <span className={s.navIcon} aria-hidden>{x.icon}</span>
                {x.label}
                {doneIn(x.key) && <span className={s.navDone} aria-label={m.editor.doneAria}>✓</span>}
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
                <span className={s.coverHint}>{b.coverDataUrl ? m.editor.changeCover : m.editor.uploadCover}</span>
                {!b.coverDataUrl && <small>{m.editor.coverHint}</small>}
              </label>
              {b.coverDataUrl && (
                <button type="button" className={s.linkBtn} onClick={() => set("coverDataUrl", null)}>{m.editor.removePhoto}</button>
              )}
            </div>

            <div className={s.box}>
              <div className={s.field}>
                <label htmlFor="f-name">{m.editor.nameLabel}</label>
                <input id="f-name" value={b.name} maxLength={80} onChange={(e) => set("name", e.target.value)} />
              </div>
              <div className={s.field}>
                <label htmlFor="f-tag">{m.editor.tagLabel}</label>
                <input id="f-tag" value={b.tagline} maxLength={90} onChange={(e) => set("tagline", e.target.value)} />
                <small>{format(m.editor.tagHint, { n: b.tagline.length })}</small>
              </div>
              <div className={s.field}>
                <label htmlFor="f-slug">{m.editor.slugLabel}</label>
                <div className={s.slug}>
                  <input id="f-slug" value={b.slug} maxLength={40}
                    onChange={(e) => set("slug", e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ""))} />
                  <span>.{domain}</span>
                </div>
                {slugErr ? <small className={s.err}>{slugErr}</small> : taken ? (
                  <small className={s.err}>{m.editor.slugErrTaken}</small>
                ) : (
                  <small>{m.editor.slugHint} <button type="button" className={s.linkBtn} onClick={() => set("slug", toSlug(b.name))}>{m.editor.slugFromName}</button></small>
                )}
              </div>
              <div className={s.field}>
                <label htmlFor="f-about">{m.editor.aboutLabel}</label>
                <textarea id="f-about" value={b.about} maxLength={600} rows={4} onChange={(e) => set("about", e.target.value)} />
                <small>{format(m.editor.aboutHint, { n: b.about.length })}</small>
              </div>
            </div>

            <div className={s.box}>
              <span className={s.label}>{m.editor.styleLabel}</span>
              <div className={s.themes} role="radiogroup" aria-label={m.editor.styleLabel}>
                {THEMES.map((t) => (
                  <button key={t.key} type="button" role="radio" aria-checked={(b.theme ?? "klassisch") === t.key}
                    className={s.theme} onClick={() => set("theme", t.key)}>
                    <span className={s.themeMock} style={{ background: t.bg }}>
                      <i style={{ background: b.accentColor }} />
                      <b style={{ background: t.fg }} />
                      <em style={{ background: t.card }} /><em style={{ background: t.card }} />
                    </span>
                    {m.themes[t.key] ?? t.label}
                  </button>
                ))}
              </div>
              <span className={s.label} style={{ marginTop: 18 }}>{m.editor.colorLabel}</span>
              <div className={s.swatches}>
                {SWATCHES.map((c) => (
                  <button key={c} type="button" className={s.swatch} style={{ background: c }}
                    aria-label={`Farbe ${c}`} aria-pressed={b.accentColor.toLowerCase() === c} onClick={() => set("accentColor", c)} />
                ))}
                <label className={s.swatchCustom} title={m.editor.ownColor}>
                  <input type="color" value={b.accentColor} onChange={(e) => set("accentColor", e.target.value)} aria-label={m.editor.ownColor} />
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
                <b>{m.editor.showPricesTitle}</b>
                <span>{format(m.editor.showPricesText, { plan: plan.label, n: plan.maxServices })}</span>
                <Link href="/preise">{m.editor.seePrices}</Link>
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
                    <input className={s.svcTitle} aria-label={m.editor.service} value={x.title} placeholder={m.editor.service} onChange={(e) => setSvc(x.id, { title: e.target.value })} />
                    <input className={s.svcPrice} aria-label={m.editor.price} value={x.priceLabel} placeholder="€ 30" onChange={(e) => setSvc(x.id, { priceLabel: e.target.value })} />
                    <input className={s.svcDur} aria-label="Dauer in Minuten" type="number" min={0} value={x.durationMin ?? ""} placeholder={m.editor.duration}
                      onChange={(e) => setSvc(x.id, { durationMin: e.target.value ? Number(e.target.value) : null })} />
                    <button type="button" className={s.del} aria-label={`${x.title || "Leistung"} löschen`}
                      onClick={() => set("services", b.services.filter((y) => y.id !== x.id))}>×</button>
                  </li>
                ))}
              </ul>
              <button type="button" className={s.add}
                onClick={() => set("services", [...b.services, { id: newServiceId(), title: "", priceLabel: "", durationMin: null }])}>
                {m.editor.addService}
              </button>
            </div>
            {suggestions.length > 0 && (
              <div className={s.box}>
                <span className={s.label}>{format(m.editor.suggestions, { label: professionLabel(b.templateKey) })}</span>
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
                <b>{m.editor.unlockGallery}</b>
                <span>{m.editor.unlockGalleryText}</span>
                <Link href="/preise">{m.editor.seePrices}</Link>
              </div>
            ) : (
              <p className={s.meta}>{format(m.editor.photosOf, { n: (b.photos ?? []).length, max: plan.gallery })}</p>
            )}
            <div className={s.box}>
              <div className={s.photos}>
                {(b.photos ?? []).map((p, i, arr) => (
                  <div key={p.id} className={s.photo} style={{ opacity: i < plan.gallery ? 1 : 0.4 }}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={p.url} alt={`Foto ${i + 1}`} />
                    {i === 0 && <span className={s.photoMain}>{m.editor.mainPhoto}</span>}
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
                    {m.editor.addPhotos}
                  </label>
                )}
              </div>
            </div>
          </>
        )}

        {tab === "zeiten" && (
          <>
            <p className={s.meta}>{live.label}</p>
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
                  {h.closed ? <span className={s.closedTxt}>{m.editor.closed}</span> : (
                    <div className={s.times}>
                      <input aria-label={`${WEEKDAYS[h.weekday - 1]} ${m.editor.opens}`} type="time" value={h.opens ?? ""} onChange={(e) => setDay(h.weekday, { opens: e.target.value })} />
                      <span>–</span>
                      <input aria-label={`${WEEKDAYS[h.weekday - 1]} ${m.editor.closes}`} type="time" value={h.closes ?? ""} onChange={(e) => setDay(h.weekday, { closes: e.target.value })} />
                    </div>
                  )}
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "kontakt" && (
          <div className={s.box}>
            <div className={s.row2}>
              <div className={s.field}>
                <label htmlFor="f-phone">☏ {m.editor.phone}</label>
                <input id="f-phone" type="tel" value={b.phone} placeholder="+995 …" onChange={(e) => set("phone", e.target.value)} />
              </div>
              <div className={s.field}>
                <label htmlFor="f-wa">✆ {m.editor.whatsapp}</label>
                <input id="f-wa" type="tel" value={b.whatsapp} placeholder="+995 …" onChange={(e) => set("whatsapp", e.target.value)} />
                {!plan.whatsapp && <small><Link href="/preise">{m.editor.seePrices}</Link></small>}
              </div>
            </div>
            <div className={s.field}>
              <label htmlFor="f-street">📍 {m.editor.street}</label>
              <input id="f-street" value={b.street} placeholder="რუსთაველის გამზ. 1" onChange={(e) => set("street", e.target.value)} />
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label htmlFor="f-plz">{m.editor.plz}</label>
                <input id="f-plz" value={b.postalCode} inputMode="numeric" maxLength={4} onChange={(e) => set("postalCode", e.target.value.replace(/\D/g, ""))} />
              </div>
              <div className={s.field}>
                <label htmlFor="f-city">{m.editor.city}</label>
                <input id="f-city" value={b.city} onChange={(e) => set("city", e.target.value)} />
              </div>
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label htmlFor="f-mail">✉ {m.editor.email}</label>
                <input id="f-mail" type="email" value={b.email} onChange={(e) => set("email", e.target.value)} />
              </div>
              <div className={s.field}>
                <label htmlFor="f-ig">◎ {m.editor.instagram}</label>
                <input id="f-ig" value={b.instagram} placeholder="@studio" onChange={(e) => set("instagram", e.target.value)} />
              </div>
            </div>
          </div>
        )}

        {tab === "impressum" && (
          <div className={s.box}>
            <div className={s.field}>
              <label htmlFor="f-legal">{m.editor.legalName}</label>
              <input id="f-legal" value={b.legalName} onChange={(e) => set("legalName", e.target.value)} />
            </div>
            <div className={s.row2}>
              <div className={s.field}>
                <label htmlFor="f-form">{m.editor.legalForm}</label>
                <select id="f-form" value={b.legalForm} onChange={(e) => set("legalForm", e.target.value)}>
                  <option value="">ინდ. მეწარმე</option>
                  <option value="შპს">შპს</option>
                  <option value="სს">სს</option>
                  <option value="კოოპერატივი">კოოპერატივი</option>
                </select>
              </div>
              <div className={s.field}>
                <label htmlFor="f-uid">{m.editor.uid}</label>
                <input id="f-uid" value={b.uidNumber} placeholder="123456789" onChange={(e) => set("uidNumber", e.target.value.toUpperCase())} />
              </div>
            </div>
            <small className={s.meta}>{m.editor.legalHint}</small>
          </div>
        )}

        <div className={s.pager}>
          {(() => {
            const i = SECTIONS.findIndex((x) => x.key === tab);
            const nextSec = SECTIONS[i + 1];
            return nextSec
              ? <button type="button" className={s.btnPrimary} onClick={() => { setTab(nextSec.key); window.scrollTo({ top: 0, behavior: "smooth" }); }}>{m.start.next.replace("→","").trim()}: {nextSec.label} →</button>
              : <Link href="/dashboard" className={s.btnPrimary}>{m.start.finishKicker} → {m.editor.back.replace("← ", "")}</Link>;
          })()}
        </div>
      </main>

      {/* PREVIEW */}
      <aside className={`${s.previewCol} ${sheet ? s.sheetOpen : ""}`} aria-label={m.start.previewAria}>
        <div className={s.previewHead}>
          <div className={s.seg} role="radiogroup" aria-label={m.editor.desktopPreview}>
            <button type="button" role="radio" aria-checked={device === "phone"} onClick={() => setDevice("phone")}>{m.editor.phonePreview}</button>
            <button type="button" role="radio" aria-checked={device === "desktop"} onClick={() => setDevice("desktop")}>{m.editor.desktopPreview}</button>
          </div>
          <button type="button" className={s.sheetClose} onClick={() => setSheet(false)} aria-label={m.start.closePreview}>×</button>
        </div>
        {preview}
      </aside>

      <button type="button" className={s.fab} onClick={() => setSheet(true)}>{m.dashboard.viewPreview}</button>
    </div>
  );
}
