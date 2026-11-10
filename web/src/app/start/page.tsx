"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import Confetti from "@/components/Confetti";
import { customProfession, getProfession, type Profession } from "@/lib/professions";
import { getCategories, getLocalizedProfessions } from "@/lib/professions-i18n";
import { PALETTES, THEME_BG } from "@/lib/palettes";
import { SWATCHES } from "@/lib/look";
import { fromProfession, uid } from "@/lib/factory";
import { branchPhoto, DEMO_GALLERY, photo } from "@/lib/photos";
import { loadBusiness, saveBusiness, slugTaken } from "@/lib/store";
import { toSlug } from "@/lib/slug";
import { ensureSession, sendDemoRequest } from "@/lib/session";
import { notifyByEmail } from "@/lib/notify";
import { saveWishes, savePhotoPlan, type PhotoPlan } from "@/lib/trial";
import { resizeImage } from "@/lib/image";
import { CONTACT } from "@/lib/contact";
import type { Business } from "@/lib/types";
import { Footer } from "@/components/Chrome";
import { useI18n } from "@/components/i18n/LocaleProvider";
import s from "./start.module.css";

export default function DemoStudio() {
  const { locale, m } = useI18n();
  const STEPS = m.start.steps;
  const WISH_TAGS = m.start.wishTags;
  const CATEGORIES = getCategories(locale);
  const PROFESSIONS = getLocalizedProfessions(locale);
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [prof, setProf] = useState<Profession | null>(null);
  const [b, setB] = useState<Business | null>(null);
  const [query, setQuery] = useState("");
  const [cat, setCat] = useState<string | null>(null);
  const [custom, setCustom] = useState("");
  const [paletteKey, setPaletteKey] = useState<string | null>(null);
  const [photoPlan, setPhotoPlan] = useState<PhotoPlan | null>(null);
  const [wishes, setWishes] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [hasDemo, setHasDemo] = useState(false);
  const [sheet, setSheet] = useState(false);
  const [busy, setBusy] = useState(false);
  const [contactOpen, setContactOpen] = useState(false);
  const [contact, setContact] = useState({ person: "", phone: "", email: "", when: "" });
  const [sent, setSent] = useState(false);
  const [pulse, setPulse] = useState(0);

  useEffect(() => {
    loadBusiness().then((x) => setHasDemo(!!x)).catch(() => {});
    const q = new URLSearchParams(window.location.search);
    const p = getProfession(q.get("t") ?? "");
    if (p) pick(p, q.get("n") ?? "");
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const list = useMemo(() => {
    const q = query.trim().toLowerCase();
    return PROFESSIONS.filter((p) => (!cat || p.cat === cat) && (!q || p.label.toLowerCase().includes(q)));
  }, [query, cat]);

  function update(patch: Partial<Business>) {
    setB((cur) => (cur ? { ...cur, ...patch } : cur));
    setPulse((n) => n + 1);
  }

  function pick(p: Profession, name?: string) {
    const fresh = fromProfession(p, name?.trim() || p.label, locale);
    setProf(p);
    setB((cur) => cur ? {
      ...fresh,
      name: cur.name, slug: cur.slug, postalCode: cur.postalCode, district: cur.district,
      theme: cur.theme, accentColor: paletteKey ? cur.accentColor : fresh.accentColor,
      coverDataUrl: cur.coverDataUrl, photos: cur.photos,
    } : fresh);
    setPulse((n) => n + 1);
    setStep(1);
  }

  function choosePalette(key: string) {
    const p = PALETTES.find((x) => x.key === key)!;
    setPaletteKey(key);
    update({ theme: p.theme, accentColor: p.accent });
  }

  function surprise() {
    const others = PALETTES.filter((p) => p.key !== paletteKey);
    choosePalette(others[Math.floor(Math.random() * others.length)].key);
  }

  function useSamplePhotos() {
    if (!b) return;
    const base = prof?.base ?? prof?.key ?? "";
    update({
      coverDataUrl: branchPhoto(base, 1200, 640),
      photos: (DEMO_GALLERY[base] ?? []).map((id) => ({ id: uid(), url: photo(id, 1200) })),
    });
    setPhotoPlan("later");
  }

  async function upload(files: FileList | null) {
    if (!files || !b) return;
    const urls = await Promise.all(Array.from(files).slice(0, 9).map((f) => resizeImage(f)));
    const ownCover = b.coverDataUrl?.startsWith("data:");
    const ownPhotos = (b.photos ?? []).filter((p) => p.url.startsWith("data:"));
    const [first, ...rest] = urls;
    update({
      coverDataUrl: ownCover ? b.coverDataUrl : first,
      photos: [...ownPhotos, ...(ownCover ? urls : rest).map((url) => ({ id: uid(), url }))].slice(0, 8),
    });
    setPhotoPlan("with");
  }

  async function build() {
    if (!b) return;
    setBusy(true);
    try {
      saveWishes(wishes.trim(), tags);
      savePhotoPlan(photoPlan ?? "none");
      await ensureSession();
      let slug = toSlug(b.name);
      if (slug.length < 2) slug = `demo-${uid().replace(/-/g, "").slice(0, 8)}`;
      if (await slugTaken(slug, b.id)) {
        slug = `${slug.slice(0, 32)}-${uid().replace(/-/g, "").slice(0, 6)}`;
      }
      const saved = await saveBusiness({ ...b, slug, isPublished: false });
      setB({ ...b, ...saved, tier: b.tier });
      setStep(5);
    } finally {
      setBusy(false);
    }
  }

  async function requestLive(e: React.FormEvent) {
    e.preventDefault();
    if (!b || !contact.phone.trim()) return;
    setBusy(true);
    const withPhone = { ...b, phone: b.phone || contact.phone.trim() };
    await saveBusiness({ ...withPhone, isPublished: false }).catch(() => b);
    const summary = [
      `Demo: ${b.name} (${prof?.label ?? ""})`,
      `Kontakt: ${contact.person || "—"}, ${contact.phone}${contact.email ? `, ${contact.email}` : ""}`,
      contact.when ? `Erreichbar: ${contact.when}` : "",
      tags.length ? `Wünsche: ${tags.join(", ")}` : "",
      wishes ? `In eigenen Worten: ${wishes}` : "",
    ].filter(Boolean).join("\n");
    const [saved, mailed] = await Promise.all([
      sendDemoRequest(summary),
      notifyByEmail({
        betrieb: b.name,
        branche: prof?.label ?? "",
        name: contact.person,
        telefon: contact.phone,
        email: contact.email,
        erreichbar: contact.when,
        wuensche: tags.join(", "),
        eigene_worte: wishes,
        demo_adresse: b.slug,
      }),
    ]);
    const ok = saved || mailed;
    setSent(ok);
    setBusy(false);
  }

  const preview = b ? { ...b, tier: "pro" as const } : null;
  const today = ((new Date().getDay() + 6) % 7) + 1;
  const canNext = [!!prof, !!b?.name.trim(), true, true, true, true][step];

  return (
    <div className={s.studio}>
      <header className={s.bar}>
        <Link href="/" className={s.brand}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/veyndo-sage.svg" alt="" width={24} height={24} /> {m.common.brandMark} <span>{m.chromeDemoStudio}</span>
        </Link>
        <ol className={s.progress} aria-label={m.start.progressAria}>
          {STEPS.map((label, i) => (
            <li key={label} className={i === step ? s.now : i < step ? s.done : ""}>
              <button type="button" disabled={i > step || (i > 0 && !b)} onClick={() => setStep(i)}>
                <i>{i < step ? "✓" : i + 1}</i><span>{label}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className={s.badge}>{m.start.privateBadge}</span>
      </header>

      <div className={s.body}>
        <main className={s.panel}>
          {step === 0 && (
            <section className={s.step}>
              <p className={s.kicker}>{m.start.step1Kicker}</p>
              <h1>{m.start.step1Title} <em>{m.start.step1TitleEm}</em></h1>
              <p className={s.sub}>{m.start.step1Sub}</p>
              {hasDemo && <p className={s.resume}>{m.start.resume} <Link href="/dashboard">{m.start.resumeLink}</Link></p>}
              <div className={s.search}>
                <span aria-hidden>⌕</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={m.start.searchPlaceholder} aria-label={m.start.searchAria} />
              </div>
              <div className={s.cats} role="tablist" aria-label={m.start.catsAria}>
                <button type="button" role="tab" aria-selected={!cat} onClick={() => setCat(null)}>{m.start.all}</button>
                {CATEGORIES.map((c) => (
                  <button type="button" role="tab" key={c} aria-selected={cat === c} onClick={() => setCat(c)}>{c}</button>
                ))}
              </div>
              <div className={s.profGrid}>
                {list.map((p) => (
                  <button type="button" key={p.key} className={`${s.prof} ${prof?.key === p.key ? s.on : ""}`} onClick={() => pick(p)}>
                    <span className={s.emoji} aria-hidden>{p.emoji}</span>
                    {p.label}
                  </button>
                ))}
                {list.length === 0 && <p className={s.sub}>{m.start.noneFound}</p>}
              </div>
              <form className={s.custom} onSubmit={(e) => { e.preventDefault(); if (custom.trim().length >= 3) pick(customProfession(custom)); }}>
                <label htmlFor="custom">{m.start.customLabel}</label>
                <div>
                  <input id="custom" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder={m.start.customPlaceholder} maxLength={40} />
                  <button type="submit" disabled={custom.trim().length < 3}>{m.start.customGo}</button>
                </div>
              </form>
            </section>
          )}

          {step === 1 && b && (
            <section className={s.step}>
              <p className={s.kicker}>{m.start.step2Kicker}</p>
              <h1>{m.start.step2Title}</h1>
              <p className={s.sub}>{m.start.step2Sub}</p>
              <div className={s.field}>
                <label htmlFor="name">{m.start.nameLabel}</label>
                <input id="name" className={s.big} value={b.name} maxLength={80} autoFocus
                  onChange={(e) => {
                    const name = e.target.value;
                    update({ name, slug: toSlug(name) });
                  }} onFocus={(e) => e.target.select()} />
              </div>
              <div className={s.field}>
                <label htmlFor="plz">{m.start.plzLabel}</label>
                <input id="plz" inputMode="numeric" value={b.postalCode} placeholder="1070"
                  onChange={(e) => {
                    const plz = e.target.value.replace(/\D/g, "").slice(0, 4);
                    update({ postalCode: plz, district: plz, tagline: b.tagline });
                  }} />
              </div>
              <div className={s.field}>
                <label htmlFor="tag">{m.start.tagLabel}</label>
                <input id="tag" value={b.tagline} maxLength={90} onChange={(e) => update({ tagline: e.target.value })} />
              </div>
            </section>
          )}

          {step === 2 && b && (
            <section className={s.step}>
              <p className={s.kicker}>{m.start.step3Kicker}</p>
              <h1>{m.start.step3Title}</h1>
              <p className={s.sub}>{m.start.step3Sub}</p>
              <button type="button" className={s.dice} onClick={surprise}>{m.start.surprise}</button>
              <div className={s.palettes}>
                {PALETTES.map((p) => {
                  const t = THEME_BG[p.theme];
                  return (
                    <button type="button" key={p.key} className={`${s.palette} ${paletteKey === p.key ? s.on : ""}`} onClick={() => choosePalette(p.key)}>
                      <span className={s.swatchMock} style={{ background: t.bg }}>
                        <i style={{ background: p.accent }} />
                        <b style={{ background: t.fg }} />
                        <em style={{ background: t.card }} />
                        <u style={{ background: p.accent }} />
                      </span>
                      <strong>{m.palettes[p.key]?.name ?? p.name}</strong>
                      <small>{m.palettes[p.key]?.mood ?? p.mood}</small>
                    </button>
                  );
                })}
              </div>
              <p className={s.label}>{m.start.orColor}</p>
              <div className={s.swatches}>
                {SWATCHES.map((c) => (
                  <button key={c} type="button" aria-label={`Farbe ${c}`} className={s.swatch} style={{ background: c }}
                    aria-pressed={b.accentColor === c} onClick={() => update({ accentColor: c })} />
                ))}
                <label className={s.swatchCustom} title={m.start.ownColor}>
                  <input type="color" value={b.accentColor} onChange={(e) => update({ accentColor: e.target.value })} aria-label={m.start.ownColor} />＋
                </label>
              </div>
            </section>
          )}

          {step === 3 && b && (
            <section className={s.step}>
              <p className={s.kicker}>{m.start.step4Kicker}</p>
              <h1>{m.start.step4Title}</h1>
              <p className={s.sub}>{m.start.step4Sub}</p>
              <div className={s.photoChoices}>
                <label className={`${s.photoChoice} ${photoPlan === "with" ? s.on : ""}`}>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
                  <span className={s.emoji}>📸</span>
                  <strong>{m.start.uploadTitle}</strong>
                  <small>{m.start.uploadSub}</small>
                </label>
                {branchPhoto(prof?.base ?? prof?.key ?? "") && (
                  <button type="button" className={`${s.photoChoice} ${photoPlan === "later" ? s.on : ""}`} onClick={useSamplePhotos}>
                    <span className={s.emoji}>🖼️</span>
                    <strong>{m.start.sampleTitle}</strong>
                    <small>{m.start.sampleSub}</small>
                  </button>
                )}
                <button type="button" className={`${s.photoChoice} ${photoPlan === "none" ? s.on : ""}`}
                  onClick={() => { update({ coverDataUrl: null, photos: [] }); setPhotoPlan("none"); }}>
                  <span className={s.emoji}>🎨</span>
                  <strong>{m.start.noneTitle}</strong>
                  <small>{m.start.noneSub}</small>
                </button>
              </div>
              {(b.coverDataUrl || (b.photos?.length ?? 0) > 0) && (
                <div className={s.thumbs}>
                  {b.coverDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.coverDataUrl} alt={m.start.coverAlt} className={s.thumbMain} />
                  )}
                  {(b.photos ?? []).map((p) => (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img key={p.id} src={p.url} alt="" />
                  ))}
                </div>
              )}
            </section>
          )}

          {step === 4 && b && (
            <section className={s.step}>
              <p className={s.kicker}>{m.start.step5Kicker}</p>
              <h1>{m.start.step5Title}</h1>
              <p className={s.sub}>{m.start.step5Sub}</p>
              <div className={s.tags}>
                {WISH_TAGS.map((t) => (
                  <button type="button" key={t} aria-pressed={tags.includes(t)}
                    onClick={() => setTags((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])}>
                    {tags.includes(t) ? "✓ " : "＋ "}{t}
                  </button>
                ))}
              </div>
              <div className={s.field}>
                <label htmlFor="wishes">{m.start.wishesLabel}</label>
                <textarea id="wishes" rows={5} maxLength={800} value={wishes} onChange={(e) => setWishes(e.target.value)}
                  placeholder={m.start.wishesPlaceholder} />
              </div>
              <div className={s.field}>
                <label htmlFor="about">{m.start.aboutLabel}</label>
                <textarea id="about" rows={3} maxLength={600} value={b.about} onChange={(e) => update({ about: e.target.value })} />
              </div>
            </section>
          )}

          {step === 5 && b && (
            <section className={`${s.step} ${s.finish}`}>
              {!contactOpen && !sent && <Confetti colors={[b.accentColor, "#b9cf7e", "#f6f2ea", "#2c362b"]} />}
              <p className={s.kicker}>{m.start.finishKicker}</p>
              <h1>{m.start.finishTitle} <em>{m.start.finishTitleEm}</em></h1>
              <p className={s.sub}>
                {m.start.finishSub}
              </p>

              {sent ? (
                <div className={s.thanks}>
                  <b>{m.start.thanksTitle}</b>
                  <span>{m.start.thanksText} {CONTACT.phone}</span>
                </div>
              ) : contactOpen ? (
                <form className={s.contact} onSubmit={requestLive}>
                  <div className={s.row2}>
                    <div className={s.field}>
                      <label htmlFor="c-name">{m.start.contactName}</label>
                      <input id="c-name" value={contact.person} onChange={(e) => setContact({ ...contact, person: e.target.value })} autoComplete="name" />
                    </div>
                    <div className={s.field}>
                      <label htmlFor="c-phone">{m.start.contactPhone}</label>
                      <input id="c-phone" type="tel" required value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" placeholder={m.start.phonePlaceholder} />
                    </div>
                  </div>
                  <div className={s.row2}>
                    <div className={s.field}>
                      <label htmlFor="c-mail">{m.start.contactEmail}</label>
                      <input id="c-mail" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" />
                    </div>
                    <div className={s.field}>
                      <label htmlFor="c-when">{m.start.contactWhen}</label>
                      <input id="c-when" value={contact.when} onChange={(e) => setContact({ ...contact, when: e.target.value })} placeholder={m.start.contactWhenPh} />
                    </div>
                  </div>
                  <p className={s.consent}>
                    {m.start.consent}{" "}
                    <Link href="/datenschutz">{m.start.consentLink}</Link>.
                  </p>
                  <button type="submit" className={s.go} disabled={busy || !contact.phone.trim()}>{busy ? m.start.sending : m.start.sendRequest}</button>
                  <small className={s.fine}>{m.start.contactFine}</small>
                </form>
              ) : (
                <div className={s.finishActions}>
                  <button type="button" className={s.go} onClick={() => setContactOpen(true)}>{m.start.goLive}</button>
                  <button type="button" className={s.ghost} onClick={() => router.push("/editor")}>{m.start.refine}</button>
                </div>
              )}
              <p className={s.fine}>{m.start.pricesNote} <Link href="/preise">{m.start.pricesLink}</Link>.</p>
            </section>
          )}

          {step < 5 && (
            <div className={s.nav}>
              {step > 0 && <button type="button" className={s.ghost} onClick={() => setStep(step - 1)}>{m.start.back}</button>}
              {step > 0 && step < 4 && <button type="button" className={s.go} disabled={!canNext} onClick={() => setStep(step + 1)}>{m.start.next}</button>}
              {step === 4 && <button type="button" className={s.go} disabled={busy} onClick={build}>{busy ? m.start.building : m.start.buildDemo}</button>}
            </div>
          )}
        </main>

        <aside className={`${s.stage} ${sheet ? s.sheetOpen : ""}`} aria-label={m.start.previewAria}>
          <button type="button" className={s.sheetClose} onClick={() => setSheet(false)} aria-label={m.start.closePreview}>×</button>
          {preview ? (
            <div className={s.phone}>
              <span className={s.ribbon}>DEMO</span>
              <span className={s.priceHint}>{m.start.priceHint}</span>
              <div className={s.screen}><ProfileView b={preview} today={today} /></div>
            </div>
          ) : (
            <div className={s.ghostPhone}>
              <span>👋</span>
              <p>{m.start.pickProfession.split("\n")[0]}<br />{m.start.pickProfession.split("\n")[1]}</p>
            </div>
          )}
          {pulse > 0 && <span key={pulse} className={s.spark} aria-hidden>{m.start.updated}</span>}
        </aside>
      </div>

      {preview && step < 5 && <button type="button" className={s.fab} onClick={() => setSheet(true)}>{m.start.fabPreview}</button>}
      <Footer />
    </div>
  );
}
