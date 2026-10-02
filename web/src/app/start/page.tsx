"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import ProfileView from "@/components/ProfileView";
import Confetti from "@/components/Confetti";
import { PROFESSIONS, CATEGORIES, customProfession, getProfession, type Profession } from "@/lib/professions";
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
import s from "./start.module.css";

const STEPS = ["Beruf", "Name", "Look", "Fotos", "Wünsche", "Fertig"];
const WISH_TAGS = ["Online-Termine", "Mehrsprachig", "Online-Shop", "Google-Bewertungen", "Gutscheine", "Instagram verbinden", "Logo gesucht", "Texte schreiben lassen"];

export default function DemoStudio() {
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
    const fresh = fromProfession(p, name?.trim() || p.label);
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
          <img src="/brand/veyndo-sage.svg" alt="" width={24} height={24} /> Veyndo <span>Demo-Studio</span>
        </Link>
        <ol className={s.progress} aria-label="Fortschritt">
          {STEPS.map((label, i) => (
            <li key={label} className={i === step ? s.now : i < step ? s.done : ""}>
              <button type="button" disabled={i > step || (i > 0 && !b)} onClick={() => setStep(i)}>
                <i>{i < step ? "✓" : i + 1}</i><span>{label}</span>
              </button>
            </li>
          ))}
        </ol>
        <span className={s.badge}>🔒 Nur bei Veyndo</span>
      </header>

      <div className={s.body}>
        <main className={s.panel}>
          {step === 0 && (
            <section className={s.step}>
              <p className={s.kicker}>Schritt 1 · Beruf</p>
              <h1>Was machen Sie? <em>Wir bauen mit.</em></h1>
              <p className={s.sub}>Suchen Sie Ihren Beruf. Ihre Demo bekommt sofort typische Leistungen, Öffnungszeiten und <b>Beispielpreise</b>, also was Ihre Kundinnen bei Ihnen zahlen. Alles änderbar.</p>
              {hasDemo && <p className={s.resume}>Sie haben schon eine Demo. <Link href="/dashboard">Dort weitermachen →</Link></p>}
              <div className={s.search}>
                <span aria-hidden>⌕</span>
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="z. B. Friseur, Yoga, Elektriker …" aria-label="Beruf suchen" />
              </div>
              <div className={s.cats} role="tablist" aria-label="Kategorien">
                <button type="button" role="tab" aria-selected={!cat} onClick={() => setCat(null)}>Alle</button>
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
                {list.length === 0 && <p className={s.sub}>Nichts gefunden. Tippen Sie Ihren Beruf unten ein.</p>}
              </div>
              <form className={s.custom} onSubmit={(e) => { e.preventDefault(); if (custom.trim().length >= 3) pick(customProfession(custom)); }}>
                <label htmlFor="custom">Nicht dabei? Tippen Sie Ihren Beruf ein:</label>
                <div>
                  <input id="custom" value={custom} onChange={(e) => setCustom(e.target.value)} placeholder="z. B. Goldschmiede" maxLength={40} />
                  <button type="submit" disabled={custom.trim().length < 3}>Los</button>
                </div>
              </form>
            </section>
          )}

          {step === 1 && b && (
            <section className={s.step}>
              <p className={s.kicker}>Schritt 2 · Name</p>
              <h1>Wie heißt Ihr Betrieb?</h1>
              <p className={s.sub}>Schauen Sie auf die Vorschau: Ihr Name steht sofort auf Ihrer Seite.</p>
              <div className={s.field}>
                <label htmlFor="name">Name</label>
                <input id="name" className={s.big} value={b.name} maxLength={80} autoFocus
                  onChange={(e) => {
                    const name = e.target.value;
                    update({ name, slug: toSlug(name) });
                  }} onFocus={(e) => e.target.select()} />
              </div>
              <div className={s.field}>
                <label htmlFor="plz">Postleitzahl (optional)</label>
                <input id="plz" inputMode="numeric" value={b.postalCode} placeholder="1070"
                  onChange={(e) => {
                    const plz = e.target.value.replace(/\D/g, "").slice(0, 4);
                    update({ postalCode: plz, district: plz, tagline: b.tagline.replace(/ in Wien( \d{4})?$/, plz.length === 4 ? ` in Wien ${plz}` : " in Wien") });
                  }} />
              </div>
              <div className={s.field}>
                <label htmlFor="tag">Ein Satz unter dem Namen</label>
                <input id="tag" value={b.tagline} maxLength={90} onChange={(e) => update({ tagline: e.target.value })} />
              </div>
            </section>
          )}

          {step === 2 && b && (
            <section className={s.step}>
              <p className={s.kicker}>Schritt 3 · Look</p>
              <h1>Welche Stimmung passt zu Ihnen?</h1>
              <p className={s.sub}>Tippen Sie eine Palette an. Probieren erlaubt, so oft Sie wollen.</p>
              <button type="button" className={s.dice} onClick={surprise}>🎲 Überrasch mich</button>
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
                      <strong>{p.name}</strong>
                      <small>{p.mood}</small>
                    </button>
                  );
                })}
              </div>
              <p className={s.label}>Oder nur die Farbe ändern</p>
              <div className={s.swatches}>
                {SWATCHES.map((c) => (
                  <button key={c} type="button" aria-label={`Farbe ${c}`} className={s.swatch} style={{ background: c }}
                    aria-pressed={b.accentColor === c} onClick={() => update({ accentColor: c })} />
                ))}
                <label className={s.swatchCustom} title="Eigene Farbe">
                  <input type="color" value={b.accentColor} onChange={(e) => update({ accentColor: e.target.value })} aria-label="Eigene Farbe" />＋
                </label>
              </div>
            </section>
          )}

          {step === 3 && b && (
            <section className={s.step}>
              <p className={s.kicker}>Schritt 4 · Fotos</p>
              <h1>Mit Fotos oder ohne?</h1>
              <p className={s.sub}>Alles geht. Ihre Fotos bleiben bei Veyndo und werden nirgends veröffentlicht.</p>
              <div className={s.photoChoices}>
                <label className={`${s.photoChoice} ${photoPlan === "with" ? s.on : ""}`}>
                  <input type="file" accept="image/*" multiple className="sr-only" onChange={(e) => { upload(e.target.files); e.target.value = ""; }} />
                  <span className={s.emoji}>📸</span>
                  <strong>Eigene Fotos hochladen</strong>
                  <small>Bis zu 9 Fotos. Das erste wird das große Titelbild.</small>
                </label>
                {branchPhoto(prof?.base ?? prof?.key ?? "") && (
                  <button type="button" className={`${s.photoChoice} ${photoPlan === "later" ? s.on : ""}`} onClick={useSamplePhotos}>
                    <span className={s.emoji}>🖼️</span>
                    <strong>Beispielfotos zum Probieren</strong>
                    <small>Nur für die Demo. Eigene Fotos bringen Sie später mit.</small>
                  </button>
                )}
                <button type="button" className={`${s.photoChoice} ${photoPlan === "none" ? s.on : ""}`}
                  onClick={() => { update({ coverDataUrl: null, photos: [] }); setPhotoPlan("none"); }}>
                  <span className={s.emoji}>🎨</span>
                  <strong>Ohne Fotos</strong>
                  <small>Ihre Farbe und Ihr Anfangsbuchstabe als Titelbild.</small>
                </button>
              </div>
              {(b.coverDataUrl || (b.photos?.length ?? 0) > 0) && (
                <div className={s.thumbs}>
                  {b.coverDataUrl && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={b.coverDataUrl} alt="Titelbild" className={s.thumbMain} />
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
              <p className={s.kicker}>Schritt 5 · In Ihren Worten</p>
              <h1>Was wünschen Sie sich?</h1>
              <p className={s.sub}>Schreiben Sie frei, wie Sie reden. Wir lesen alles persönlich.</p>
              <div className={s.tags}>
                {WISH_TAGS.map((t) => (
                  <button type="button" key={t} aria-pressed={tags.includes(t)}
                    onClick={() => setTags((cur) => cur.includes(t) ? cur.filter((x) => x !== t) : [...cur, t])}>
                    {tags.includes(t) ? "✓ " : "＋ "}{t}
                  </button>
                ))}
              </div>
              <div className={s.field}>
                <label htmlFor="wishes">Ihre Wünsche</label>
                <textarea id="wishes" rows={5} maxLength={800} value={wishes} onChange={(e) => setWishes(e.target.value)}
                  placeholder="z. B. Kundinnen sollen sofort sehen, was eine Gelmodellage kostet, und per WhatsApp einen Termin anfragen können." />
              </div>
              <div className={s.field}>
                <label htmlFor="about">Ein paar Sätze über Sie (stehen auf der Seite)</label>
                <textarea id="about" rows={3} maxLength={600} value={b.about} onChange={(e) => update({ about: e.target.value })} />
              </div>
            </section>
          )}

          {step === 5 && b && (
            <section className={`${s.step} ${s.finish}`}>
              {!contactOpen && !sent && <Confetti colors={[b.accentColor, "#b9cf7e", "#f6f2ea", "#2c362b"]} />}
              <p className={s.kicker}>Fertig</p>
              <h1>Tada! <em>Das ist Ihre Seite.</em></h1>
              <p className={s.sub}>
                Ihre Demo ist gespeichert, nur bei Veyndo. Sie ist für niemanden sonst sichtbar und kann nicht veröffentlicht werden.
                Wenn sie echt online gehen soll, machen wir das gemeinsam.
              </p>

              {sent ? (
                <div className={s.thanks}>
                  <b>Danke! Ihre Anfrage ist da.</b>
                  <span>Wir melden uns persönlich bei Ihnen. Falls WhatsApp nicht aufgegangen ist: {CONTACT.phone}</span>
                </div>
              ) : contactOpen ? (
                <form className={s.contact} onSubmit={requestLive}>
                  <div className={s.row2}>
                    <div className={s.field}>
                      <label htmlFor="c-name">Ihr Name</label>
                      <input id="c-name" value={contact.person} onChange={(e) => setContact({ ...contact, person: e.target.value })} autoComplete="name" />
                    </div>
                    <div className={s.field}>
                      <label htmlFor="c-phone">Telefon *</label>
                      <input id="c-phone" type="tel" required value={contact.phone} onChange={(e) => setContact({ ...contact, phone: e.target.value })} autoComplete="tel" placeholder="+43 …" />
                    </div>
                  </div>
                  <div className={s.row2}>
                    <div className={s.field}>
                      <label htmlFor="c-mail">E-Mail (optional)</label>
                      <input id="c-mail" type="email" value={contact.email} onChange={(e) => setContact({ ...contact, email: e.target.value })} autoComplete="email" />
                    </div>
                    <div className={s.field}>
                      <label htmlFor="c-when">Wann erreichbar?</label>
                      <input id="c-when" value={contact.when} onChange={(e) => setContact({ ...contact, when: e.target.value })} placeholder="z. B. vormittags" />
                    </div>
                  </div>
                  <button type="submit" className={s.go} disabled={busy || !contact.phone.trim()}>{busy ? "Wird gesendet …" : "Anfrage senden 🚀"}</button>
                  <small className={s.fine}>Wir verwenden Ihre Angaben nur, um Sie wegen Ihrer Seite zu kontaktieren.</small>
                </form>
              ) : (
                <div className={s.finishActions}>
                  <button type="button" className={s.go} onClick={() => setContactOpen(true)}>🚀 Live schalten lassen</button>
                  <button type="button" className={s.ghost} onClick={() => router.push("/editor")}>Weiter verfeinern</button>
                </div>
              )}
              <p className={s.fine}>Preise für den echten Start finden Sie in der <Link href="/preise">Preisliste</Link>.</p>
            </section>
          )}

          {step < 5 && (
            <div className={s.nav}>
              {step > 0 && <button type="button" className={s.ghost} onClick={() => setStep(step - 1)}>← Zurück</button>}
              {step > 0 && step < 4 && <button type="button" className={s.go} disabled={!canNext} onClick={() => setStep(step + 1)}>Weiter →</button>}
              {step === 4 && <button type="button" className={s.go} disabled={busy} onClick={build}>{busy ? "Wird gebaut …" : "✨ Meine Demo bauen"}</button>}
            </div>
          )}
        </main>

        <aside className={`${s.stage} ${sheet ? s.sheetOpen : ""}`} aria-label="Live-Vorschau">
          <button type="button" className={s.sheetClose} onClick={() => setSheet(false)} aria-label="Vorschau schließen">×</button>
          {preview ? (
            <div className={s.phone}>
              <span className={s.ribbon}>DEMO</span>
              <span className={s.priceHint}>Preise = Beispiele für Ihre Kundinnen</span>
              <div className={s.screen}><ProfileView b={preview} today={today} /></div>
            </div>
          ) : (
            <div className={s.ghostPhone}>
              <span>👋</span>
              <p>Wählen Sie Ihren Beruf.<br />Hier entsteht live Ihre Seite.</p>
            </div>
          )}
          {pulse > 0 && <span key={pulse} className={s.spark} aria-hidden>✨ aktualisiert</span>}
        </aside>
      </div>

      {preview && step < 5 && <button type="button" className={s.fab} onClick={() => setSheet(true)}>👀 Vorschau</button>}
    </div>
  );
}
