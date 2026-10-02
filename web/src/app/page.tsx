import Link from "next/link";
import Image from "next/image";
import { TopBar, Footer } from "@/components/Chrome";
import HeroDemo from "@/components/landing/HeroDemo";
import Reveal from "@/components/landing/Reveal";
import { TEMPLATES } from "@/lib/templates";
import { CONTACT, whatsappHref } from "@/lib/contact";
import { branchPhoto } from "@/lib/photos";
import s from "./landing.module.css";

const FAQ: [string, string][] = [
  ["Was ist kostenlos?",
    "Sie bauen Ihre Seite und sehen die Vorschau so lange Sie wollen: Preise, Öffnungszeiten, Fotos, Kontakt. Dafür zahlen Sie nichts."],
  ["Wann kostet es etwas?",
    "Erst wenn Kundinnen die Seite wirklich öffnen sollen — QR im Schaufenster, Link bei Google, WhatsApp-Button live. Dann Hosting und Schutz für € 39 im Monat, monatlich kündbar."],
  ["Muss ich selbst etwas machen?",
    "Nein, müssen Sie nicht. Entweder Sie bauen selbst im Editor, oder wir richten alles nach einem kurzen Gespräch für Sie ein. Kleine Änderungen danach gehen so einfach wie eine Nachricht."],
  ["Was steht auf der Seite?",
    "Ihre Preise, ob Sie heute offen haben, Anrufen, WhatsApp, Route, Galerie und das Impressum nach österreichischem Recht."],
  ["Wo liegen meine Daten?",
    "In der EU, auf Servern in Frankfurt. Keine Werbe-Cookies, Besuche ohne IP-Adressen."],
  ["Kann ich später wieder aufhören?",
    "Ja. Vorschau bleibt bei Ihnen. Online nehmen Sie jederzeit vom Netz, Hosting kündigen Sie zum Monatsende."],
];

export default function Home() {
  return (
    <>
      <TopBar />
      <main className={s.page}>
        <section className={s.hero}>
          <div className={s.heroGlow} aria-hidden />
          <div className="wrap"><HeroDemo /></div>
        </section>

        <section id="so-gehts" className={s.section}>
          <div className="wrap">
            <Reveal><p className={s.kicker}>So geht&apos;s</p></Reveal>
            <Reveal delay={80}>
              <h2 className={s.h2}>Drei Schritte.<br /><em>Zahlung erst im letzten.</em></h2>
            </Reveal>
            <div className={s.path}>
              {[
                ["1", "Kostenlos bauen", "Name, Preise, Zeiten, Fotos. Sie sehen sofort, wie Ihre Seite am Handy aussieht."],
                ["2", "In Ruhe ansehen", "Nur bei Veyndo. Kein Link für Kundinnen, kein QR, kein Google."],
                ["3", "Online für Kundinnen", "QR, Google, Anruf und WhatsApp. Dafür Hosting € 39 im Monat — erst dann."],
              ].map(([n, title, text], i) => (
                <Reveal key={n} delay={i * 100} className={s.pathCard}>
                  <span className={s.pathNo} aria-hidden>{n}</span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.tight}`}>
          <div className="wrap">
            <Reveal><p className={s.kicker}>Was Kundinnen sehen</p></Reveal>
            <Reveal delay={80}>
              <h2 className={s.h2}>Drei Fragen.<br /><em>Eine Seite, alle Antworten.</em></h2>
            </Reveal>
            <div className={s.questions}>
              {[
                ["Was kostet das?", "Ihre Preisliste, immer aktuell. Kein „Preis auf Anfrage“.", "€"],
                ["Haben Sie offen?", "Öffnungszeiten mit Live-Status: geöffnet bis 19:00.", "◷"],
                ["Wie erreiche ich Sie?", "Anrufen, WhatsApp oder Route. Ein Tipp.", "☏"],
              ].map(([q, a, icon], i) => (
                <Reveal key={q} delay={i * 100} className={s.qCard}>
                  <span className={s.qIcon} aria-hidden>{icon}</span>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.tight}`}>
          <div className="wrap">
            <div className={s.sectionHead}>
              <div>
                <Reveal><p className={s.kicker}>Beispiele</p></Reveal>
                <Reveal delay={80}><h2 className={s.h2}>So kann Ihre Seite aussehen.</h2></Reveal>
              </div>
              <Reveal delay={120}>
                <p className={s.sideNote}>Branche antippen. Die Preise dort sind Beispiele dafür, was Ihre Kundinnen bei Ihnen zahlen. Sie ersetzen sie durch Ihre eigenen.</p>
              </Reveal>
            </div>
            <div className={s.gallery}>
              {TEMPLATES.map((t, i) => (
                <Reveal key={t.key} delay={(i % 3) * 70}>
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

        <section id="preise" className={`${s.section} ${s.tight}`}>
          <div className="wrap">
            <Reveal><p className={s.kicker}>Was es kostet</p></Reveal>
            <Reveal delay={80}><h2 className={s.h2}>Erst zahlen, <em>wenn Kundinnen kommen.</em></h2></Reveal>
            <div className={s.priceGrid}>
              <Reveal className={s.priceCard}>
                <p className={s.priceTag}>Jetzt</p>
                <h3>Seite bauen</h3>
                <p className={s.priceAmt}>Kostenlos</p>
                <p>Editor, Vorschau, Preise und Zeiten. So lange Sie wollen.</p>
                <Link href="/start" className={s.ctaDark}>Jetzt Demo bauen</Link>
              </Reveal>
              <Reveal delay={80} className={`${s.priceCard} ${s.priceCardHi}`}>
                <p className={s.priceTag}>Wenn sie live soll</p>
                <h3>Online für Kundinnen</h3>
                <p className={s.priceAmt}>€ 39 / Monat</p>
                <p>Hosting und Schutz. QR, Google-Link, Anruf und WhatsApp funktionieren. Monatlich kündbar.</p>
                <Link href="/preise#betreuung" className={s.ctaLight}>Hosting in der Preisliste</Link>
              </Reveal>
              <Reveal delay={160} className={s.priceCard}>
                <p className={s.priceTag}>Wenn wir bauen</p>
                <h3>Von uns eingerichtet</h3>
                <p className={s.priceAmt}>Festpreis</p>
                <p>Website ab € 1.490. Schriftliches Angebot nach einem kurzen Gespräch.</p>
                <Link href="/preise" className={s.ctaGhost}>Zur Preisliste</Link>
              </Reveal>
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.tight}`}>
          <div className={`wrap ${s.faqWrap}`}>
            <div>
              <Reveal><p className={s.kicker}>Fragen</p></Reveal>
              <Reveal delay={80}><h2 className={s.h2}>Kurz und ehrlich.</h2></Reveal>
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

        <section className={s.final}>
          <div className={s.heroGlow} aria-hidden />
          <div className="wrap">
            <Reveal>
              <h2 className={s.finalH}>Bauen Sie Ihre Seite.<br /><em>Online gehen Sie später.</em></h2>
            </Reveal>
            <Reveal delay={100}>
              <div className={s.finalRow}>
                <Link href="/start" className={s.tryBtn}>✨ Jetzt Demo bauen →</Link>
                <a href={whatsappHref("Hallo, ich möchte eine Veyndo-Seite, bitte richtet ihr sie für mich ein.")} target="_blank" rel="noopener noreferrer" className={s.ctaGhostOnDark}>Lieber per WhatsApp fragen</a>
              </div>
              <p className={s.fine}>Oder anrufen: {CONTACT.phone}</p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
