import type { Metadata } from "next";
import { TopBar, Footer } from "@/components/Chrome";
import { PRICE_LIST } from "@/lib/pricelist";
import { CONTACT, whatsappHref } from "@/lib/contact";
import s from "./preise.module.css";

export const metadata: Metadata = {
  title: "Preisliste",
  description: "Festpreise für Websites, Google-Profil, Sichtbarkeit, Software und Betreuung. Persönlich umgesetzt in Wien.",
};

export default function PreisePage() {
  return (
    <>
      <TopBar />
      <main className={s.page}>
        <header className={s.head}>
          <div className="wrap">
            <p className={s.kicker}>Preisliste</p>
            <h1 className={s.h1}>Klare Festpreise. <em>Persönlich umgesetzt.</em></h1>
            <p className={s.lead}>
              Sie wissen vorher, was es kostet. Nach einem kostenlosen Erstgespräch bekommen Sie ein schriftliches Angebot.
            </p>
            <nav className={s.jump} aria-label="Bereiche">
              {PRICE_LIST.map((g) => <a key={g.key} href={`#${g.key}`}>{g.title}</a>)}
            </nav>
          </div>
        </header>

        <div className={`wrap ${s.list}`}>
          {PRICE_LIST.map((g) => (
            <section key={g.key} id={g.key} className={s.group}>
              <div className={s.groupHead}>
                <h2>{g.title}</h2>
                <p>{g.intro}</p>
              </div>
              <ul className={s.items}>
                <li className={s.cols} aria-hidden>
                  <span>Leistung</span>
                  <span>Preis</span>
                </li>
                {g.items.map((it) => (
                  <li key={it.name} className={s.item}>
                    <div>
                      <b>{it.name}</b>
                      <span>{it.desc}</span>
                    </div>
                    <strong className={s.price}>{it.price}</strong>
                  </li>
                ))}
              </ul>
              <a className={s.ask} href={whatsappHref(`Hallo, ich habe eine Frage zu „${g.title}“ aus Ihrer Preisliste.`)}
                target="_blank" rel="noopener noreferrer">Dazu anfragen →</a>
            </section>
          ))}

          <aside className={s.note}>
            <p>
              Alle Preise in Euro, Festpreise ohne versteckte Kosten. Für Betriebe in Österreich kann eine Förderung wie
              KMU.DIGITAL einen Teil der Kosten übernehmen.
            </p>
          </aside>
        </div>

        <section className={s.cta}>
          <div className="wrap">
            <h2>Kostenloses Erstgespräch</h2>
            <p>Erzählen Sie kurz, was Sie brauchen. Sie bekommen eine ehrliche Empfehlung und einen Festpreis.</p>
            <div className={s.ctaRow}>
              <a className={s.btnLight} href={whatsappHref("Hallo, ich möchte ein kostenloses Erstgespräch.")} target="_blank" rel="noopener noreferrer">Per WhatsApp schreiben</a>
              <a className={s.btnGhost} href={CONTACT.phoneHref}>Anrufen: {CONTACT.phone}</a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
