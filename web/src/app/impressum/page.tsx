import type { Metadata } from "next";
import { TopBar, Footer } from "@/components/Chrome";
import s from "../legal.module.css";

export const metadata: Metadata = {
  title: "Impressum",
  description: "Impressum von Veyndo, Ani Devdariani, Wien.",
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  return (
    <>
      <TopBar />
      <main className={`wrap ${s.page}`}>
        <header className={s.head}>
          <p className={s.kicker}>Rechtliches</p>
          <h1 className={s.h1}>Impressum</h1>
          <p className={s.lead}>Angaben gemäß § 5 ECG, § 14 UGB und § 25 MedienG.</p>
        </header>
        <article className={s.body}>
          <h2>Medieninhaberin und Verantwortliche</h2>
          <p>
            Ani Devdariani<br />
            Einzelunternehmerin<br />
            Dieselgasse 10/1/30<br />
            1100 Wien, Österreich
          </p>
          <p>
            Telefon: <a href="tel:+436644390540">+43 664 4390540</a>
            <br />
            E-Mail: <span className={s.offen}>[OFFEN: Geschäfts-E-Mail, z. B. hallo@veyndo.at]</span>
          </p>

          <h2>Unternehmensgegenstand</h2>
          <p>Erstellung von Websites und digitale Dienstleistungen.</p>

          <h2>Gewerbe</h2>
          <p>
            <span className={s.offen}>[OFFEN: Gewerbewortlaut + GISA-Zahl nach Anmeldung]</span>
            <br />
            Gewerbebehörde: Magistratisches Bezirksamt für den 10. Bezirk.
          </p>

          <h2>Kammer / Rechtsvorschriften</h2>
          <p>
            Nach Gewerbeanmeldung: Wirtschaftskammer Wien.
            <br />
            Anwendbare Rechtsvorschrift: Gewerbeordnung,{" "}
            <a href="https://www.ris.bka.gv.at" rel="noopener noreferrer">www.ris.bka.gv.at</a>.
          </p>

          <h2>Umsatzsteuer</h2>
          <p>Kleinunternehmerin gemäß § 6 Abs. 1 Z 27 UStG – es wird keine Umsatzsteuer ausgewiesen.</p>

          <h2>Blattlinie (§ 25 MedienG)</h2>
          <p>Information über die Leistungen von Veyndo.</p>

          <h2>Streitbeilegung</h2>
          <p>
            Die EU-Plattform zur Online-Streitbeilegung (ODR) wurde am 20. Juli 2025 eingestellt.
            Verbraucherstreitigkeiten klären wir direkt.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
