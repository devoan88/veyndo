import Link from "next/link";
import Image from "next/image";
import QRCode from "qrcode";
import { TopBar, Footer } from "@/components/Chrome";
import HeroDemo from "@/components/landing/HeroDemo";
import Reveal from "@/components/landing/Reveal";
import { TEMPLATES } from "@/lib/templates";
import { CONTACT, whatsappHref } from "@/lib/contact";
import { branchPhoto, photo, PEOPLE } from "@/lib/photos";
import s from "./landing.module.css";

const FAQ: [string, string][] = [
  ["Muss ich selbst etwas machen?",
    "Nein. Wir richten alles persönlich für Sie ein: Texte, Preise, Fotos, Öffnungszeiten und Impressum. Sie schicken uns, was Sie haben, und prüfen am Ende. Kleine Änderungen können Sie danach selbst machen, so einfach wie eine WhatsApp-Nachricht."],
  ["Was kostet es?",
    "Alle Leistungen haben einen Festpreis, Sie finden sie in unserer Preisliste. Vor dem Start bekommen Sie ein klares schriftliches Angebot, ohne versteckte Kosten."],
  ["Wie schnell ist meine Seite online?",
    "Meist in wenigen Tagen nach unserem Gespräch, je nachdem, wie schnell Fotos und Texte da sind."],
  ["Und das Impressum?",
    "Die Pflichtangaben nach § 5 E-Commerce-Gesetz sind als Felder eingebaut. Sie tragen Ihre Daten ein, das Impressum steht automatisch auf Ihrer Seite."],
  ["Wo liegen meine Daten?",
    "In der EU, auf Servern in Frankfurt. Ihre Seite setzt keine Werbe-Cookies und zählt Besuche ohne IP-Adressen."],
  ["Ich habe schon ein Google-Profil. Wozu Veyndo?",
    "Perfekt, dann tragen Sie Ihre Veyndo-Adresse dort als Website ein. Google zeigt dann einen Link zu einer Seite mit Ihren echten Preisen und Leistungen statt zu nichts."],
  ["Kann ich meine Seite später wieder löschen?",
    "Ja. Sie können Ihre Seite jederzeit offline nehmen oder ganz löschen lassen. Ohne Kündigungsfrist."],
];

export default async function Home() {
  const qrSvg = await QRCode.toString("https://salon-mira.veyndo.at", {
    type: "svg", margin: 0, color: { dark: "#1f2a1f", light: "#00000000" },
  });

  return (
    <>
      <TopBar />
      <main className={s.page}>
        {/* HERO */}
        <section className={s.hero}>
          <div className={s.heroGlow} aria-hidden />
          <div className="wrap"><HeroDemo /></div>
        </section>

        {/* MARQUEE */}
        <div className={s.marquee} aria-hidden>
          <div className={s.marqueeTrack}>
            {[...TEMPLATES, ...TEMPLATES].map((t, i) => (
              <span key={i}>{t.label}<i>✦</i></span>
            ))}
          </div>
        </div>

        {/* THREE QUESTIONS */}
        <section className={s.section}>
          <div className="wrap">
            <Reveal><p className={s.kicker}>Warum eine eigene Seite</p></Reveal>
            <Reveal delay={80}>
              <h2 className={s.h2}>Wer Sie sucht, hat drei Fragen.<br /><em>Ihre Seite beantwortet alle.</em></h2>
            </Reveal>
            <div className={s.questions}>
              {[
                ["Was kostet das?", "Ihre Preisliste, immer aktuell. Kein „Preis auf Anfrage“, kein Rätselraten.", "€"],
                ["Haben Sie heute offen?", "Öffnungszeiten mit Live-Status. Kundinnen sehen sofort: geöffnet bis 19:00.", "◷"],
                ["Wie erreiche ich Sie?", "Anrufen, WhatsApp oder Route. Ein Tipp mit dem Daumen, fertig.", "☏"],
              ].map(([q, a, icon], i) => (
                <Reveal key={q} delay={i * 120} className={s.qCard}>
                  <span className={s.qIcon} aria-hidden>{icon}</span>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* BRANCH GALLERY */}
        <section className={`${s.section} ${s.tight}`}>
          <div className="wrap">
            <div className={s.sectionHead}>
              <div>
                <Reveal><p className={s.kicker}>Fertige Vorlagen</p></Reveal>
                <Reveal delay={80}><h2 className={s.h2}>Für Ihren Beruf gemacht.</h2></Reveal>
              </div>
              <Reveal delay={160}><p className={s.sideNote}>Tippen Sie auf eine Branche und sehen Sie eine fertige Beispielseite. Genau so sieht Ihre aus, nur mit Ihrem Namen.</p></Reveal>
            </div>
            <div className={s.gallery}>
              {TEMPLATES.map((t, i) => (
                <Reveal key={t.key} delay={(i % 3) * 90}>
                  <Link href={`/p/beispiel-${t.key}`} className={s.gCard}>
                    <Image src={branchPhoto(t.key, 800, 1000)!} alt={t.label} fill sizes="(max-width: 700px) 50vw, 33vw" className={s.gImg} />
                    <span className={s.gShade} />
                    <span className={s.gText}>
                      <b>{t.label}</b>
                      <small>{t.services[0].title} · {t.services[0].price_label}</small>
                    </span>
                    <span className={s.gArrow} aria-hidden>↗</span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        {/* FROM SEARCH TO CALL */}
        <section id="so-gehts" className={`${s.section} ${s.dark}`}>
          <div className="wrap">
            <Reveal><p className={s.kicker}>So funktioniert&apos;s</p></Reveal>
            <Reveal delay={80}><h2 className={s.h2}>Vom Suchen zum Anrufen.<br /><em>In drei Sekunden.</em></h2></Reveal>
            <div className={s.flow}>
              <Reveal className={s.flowStep}>
                <span className={s.stepNo}>1</span>
                <div className={s.mock}>
                  <div className={s.gSearch}>friseur wien 1060</div>
                  <div className={s.gResult}>
                    <b>Salon Mira</b>
                    <small>Friseur · Mariahilfer Str. · <span className={s.green}>Geöffnet</span></small>
                    <div className={s.gBtns}><span>Website</span><span>Route</span><span>Anrufen</span></div>
                  </div>
                </div>
                <h3>Kundin sucht auf Google</h3>
                <p>Ihre Veyndo-Adresse steht in Ihrem Google-Profil als Website.</p>
              </Reveal>
              <Reveal delay={140} className={s.flowStep}>
                <span className={s.stepNo}>2</span>
                <div className={s.mock}>
                  <div className={s.miniCover} style={{ backgroundImage: `url(${branchPhoto("friseur", 500, 260)})` }} />
                  <div className={s.miniRow}><span>Damenschnitt</span><b>€ 49</b></div>
                  <div className={s.miniRow}><span>Färben</span><b>ab € 60</b></div>
                  <div className={s.miniRow}><span>Herrenschnitt</span><b>€ 28</b></div>
                </div>
                <h3>Sieht Preise und Zeiten</h3>
                <p>Alles auf einen Blick, schnell geladen, perfekt am Handy.</p>
              </Reveal>
              <Reveal delay={280} className={s.flowStep}>
                <span className={s.stepNo}>3</span>
                <div className={`${s.mock} ${s.callMock}`}>
                  <div className={s.ring} aria-hidden>☏</div>
                  <b>Salon Mira</b>
                  <small>Anruf wird verbunden …</small>
                </div>
                <h3>Und ruft an</h3>
                <p>Ein Tipp. Kein Suchen nach der Nummer, kein Abspringen.</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* BENTO */}
        <section className={s.section}>
          <div className="wrap">
            <Reveal><p className={s.kicker}>Alles drin</p></Reveal>
            <Reveal delay={80}><h2 className={s.h2}>Alles drin. <em>Fertig für Sie eingerichtet.</em></h2></Reveal>
            <div className={s.bento}>
              <Reveal className={`${s.tile} ${s.tileQr}`}>
                <div className={s.qr} dangerouslySetInnerHTML={{ __html: qrSvg }} />
                <div>
                  <h3>QR-Code fürs Schaufenster</h3>
                  <p>Ausdrucken, aufkleben. Wer vorbeigeht, hat Ihre Preise in der Hand, auch nach Ladenschluss.</p>
                </div>
              </Reveal>
              <Reveal delay={100} className={`${s.tile} ${s.tileStats}`}>
                <h3>Sehen, was passiert</h3>
                <p>Aufrufe, Anrufe und Routen pro Woche. Ohne Cookies.</p>
                <div className={s.bars} aria-hidden>
                  {[38, 52, 45, 70, 64, 88, 76].map((h, i) => <span key={i} style={{ height: `${h}%` }} />)}
                </div>
                <small className={s.example}>Beispieldaten</small>
              </Reveal>
              <Reveal delay={200} className={`${s.tile} ${s.tilePhoto}`}>
                <Image src={photo(PEOPLE.customer, 900, 700)} alt="Frau schaut im Café auf ihr Handy" fill sizes="(max-width: 700px) 100vw, 33vw" className={s.gImg} />
                <span className={s.gShade} />
                <div className={s.tileOver}>
                  <h3>Gebaut fürs Handy</h3>
                  <p>Dort, wo Ihre Kundschaft sucht.</p>
                </div>
              </Reveal>
              <Reveal className={s.tile}>
                <span className={s.tIcon}>§</span>
                <h3>Impressum eingebaut</h3>
                <p>Die Pflichtangaben nach österreichischem Recht als einfache Felder.</p>
              </Reveal>
              <Reveal delay={100} className={s.tile}>
                <span className={s.tIcon}>✎</span>
                <h3>Preis geändert? 5 Sekunden.</h3>
                <p>Am Handy selbst ändern, sofort online. Oder kurz schreiben, wir machen es.</p>
              </Reveal>
              <Reveal delay={200} className={s.tile}>
                <span className={s.tIcon}>◐</span>
                <h3>Ihre Farbe, Ihr Foto</h3>
                <p>Logo-Farbe wählen, Titelfoto hochladen. Sieht nach Ihnen aus, nicht nach Baukasten.</p>
              </Reveal>
            </div>
          </div>
        </section>

        {/* MADE IN VIENNA */}
        <section className={`${s.section} ${s.tight}`}>
          <div className={`wrap ${s.vienna}`}>
            <Reveal className={s.viennaPhoto}>
              <Image src={photo(PEOPLE.shop, 900, 1100)} alt="Inhaberin in ihrem Geschäft" fill sizes="(max-width: 800px) 100vw, 45vw" className={s.gImg} />
            </Reveal>
            <div>
              <Reveal><p className={s.kicker}>Aus Wien, für Wien</p></Reveal>
              <Reveal delay={80}><h2 className={s.h2}>Sie machen Ihr Handwerk.<br /><em>Wir machen Sie sichtbar.</em></h2></Reveal>
              <Reveal delay={160}>
                <p className={s.body}>
                  Veyndo entsteht in Wien, für Betriebe, die keine Zeit für Agenturen, Baukästen und Technik haben.
                  Für die Friseurin in Mariahilf, den Elektriker in Favoriten, die Physiotherapeutin in Döbling.
                </p>
                <p className={s.body}>
                  Persönlich statt Baukasten: Wir treffen uns oder telefonieren, und Sie bekommen eine fertige Seite.
                </p>
                <div className="cta-row">
                  <a href={whatsappHref("Hallo, ich interessiere mich für eine Veyndo-Seite.")} target="_blank" rel="noopener noreferrer" className={s.ctaDark}>Per WhatsApp anfragen</a>
                  <a href={CONTACT.phoneHref} className={s.ctaGhost}>Anrufen: {CONTACT.phone}</a>
                </div>
              </Reveal>
            </div>
          </div>
        </section>

        {/* PRICING TEASER */}
        <section id="preise" className={`${s.section} ${s.tight}`}>
          <div className="wrap">
            <Reveal className={s.priceTeaser}>
              <div>
                <p className={s.kicker}>Preise</p>
                <h2 className={s.h2}>Festpreise. <em>Ohne Überraschungen.</em></h2>
                <p className={s.body}>Website, Google-Profil, Sichtbarkeit, Software und Betreuung: alles mit klarem Preis in unserer Preisliste.</p>
              </div>
              <Link href="/preise" className={s.ctaDark}>Zur Preisliste →</Link>
            </Reveal>
          </div>
        </section>

        {/* FAQ */}
        <section className={`${s.section} ${s.tight}`}>
          <div className={`wrap ${s.faqWrap}`}>
            <div>
              <Reveal><p className={s.kicker}>Fragen</p></Reveal>
              <Reveal delay={80}><h2 className={s.h2}>Ehrliche Antworten.</h2></Reveal>
            </div>
            <div className={s.faq}>
              {FAQ.map(([q, a]) => (
                <details key={q} className={s.faqItem}>
                  <summary>{q}<span aria-hidden>+</span></summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        {/* FINAL CTA */}
        <section className={s.final}>
          <div className={s.heroGlow} aria-hidden />
          <div className="wrap">
            <Reveal>
              <h2 className={s.finalH}>Ihre Kundschaft sucht Sie schon.<br /><em>Lassen Sie sich finden.</em></h2>
            </Reveal>
            <Reveal delay={120}>
              <a href={whatsappHref("Hallo, ich möchte eine Veyndo-Seite für meinen Betrieb.")} target="_blank" rel="noopener noreferrer" className={s.tryBtn}>Kostenloses Erstgespräch →</a>
              <p className={s.fine}>WhatsApp oder {CONTACT.phone} · unverbindlich</p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
