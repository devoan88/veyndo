import type { Metadata } from "next";
import Link from "next/link";
import { TopBar, Footer } from "@/components/Chrome";
import s from "../legal.module.css";

export const metadata: Metadata = {
  title: "Datenschutz",
  description: "Datenschutzerklärung von Veyndo (DSGVO Art. 13).",
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  return (
    <>
      <TopBar />
      <main className={`wrap ${s.page}`}>
        <header className={s.head}>
          <p className={s.kicker}>Rechtliches</p>
          <h1 className={s.h1}>Datenschutzerklärung</h1>
          <p className={s.lead}>Informationen nach Art. 13 DSGVO über die Verarbeitung personenbezogener Daten auf veyndo.at.</p>
        </header>
        <article className={s.body}>
          <h2>1. Verantwortliche</h2>
          <p>
            Ani Devdariani, Einzelunternehmerin, Dieselgasse 10/1/30, 1100 Wien, Österreich.
            Telefon +43 664 4390540, E-Mail:{" "}
            <span className={s.offen}>[OFFEN: Geschäfts-E-Mail, z. B. hallo@veyndo.at]</span>.
            Vollständige Angaben: <Link href="/impressum">Impressum</Link>.
          </p>

          <h2>2. Hosting</h2>
          <p>
            Die Website wird bei Netlify, Inc. (USA) betrieben. Dabei können Verbindungsdaten
            (IP-Adresse, Zeitpunkt, aufgerufene URL) in Serverprotokollen anfallen. Netlify stützt
            Übermittlungen in die USA auf Standardvertragsklauseln bzw. das EU-US Data Privacy Framework.
          </p>

          <h2>3. Datenbank, Anmeldung, Dateien (Supabase)</h2>
          <p>
            Datenbank, anonyme Anmeldung und Foto-Speicher laufen über Supabase (Postgres, Auth, Storage),
            Projektregion <strong>eu-central-1 (Frankfurt)</strong>.
          </p>

          <h2>4. Anonyme Demo (Demo-Studio)</h2>
          <p>
            Besucherinnen können ohne Konto eine Demo-Seite bauen. Dafür öffnet die App eine anonyme
            Supabase-Sitzung. Gespeichert werden Betriebsdaten (Name, Branche, Texte, Adresse, Leistungen,
            Öffnungszeiten, Farben) und hochgeladene Fotos im Storage-Bucket „photos“. Zusätzlich liegt
            ein Entwurf im Browser (localStorage). Demos werden nicht veröffentlicht; nur die Inhaberin
            von Veyndo (Admin) kann sie sehen. Löschung: auf Anfrage an die E-Mail im Impressum.
            Rechtsgrundlage: Art. 6 Abs. 1 lit. b DSGVO (Schritte zur Vertragsanbahnung) bzw. lit. f
            (Betrieb der Demo-Funktion).
          </p>

          <h2>5. Anfrageformular</h2>
          <p>
            Wenn Sie „Live schalten lassen“ senden, speichern wir Name, Telefon, E-Mail, Erreichbarkeit
            und Nachricht in der Tabelle <code>service_requests</code> und übermitteln dieselben Felder
            an das Netlify-Formular „demo-request“ (Benachrichtigung an uns). Rechtsgrundlage: Art. 6
            Abs. 1 lit. b DSGVO (Anfrage vor Vertrag).
          </p>

          <h2>6. Zahlungen</h2>
          <p>
            Stripe ist im Code vorbereitet, aber nur für den Testmodus. Echte Kartenzahlungen finden
            derzeit nicht statt. Sobald Live-Zahlungen starten, wird dieser Abschnitt ergänzt.
          </p>

          <h2>7. Schriftarten</h2>
          <p>
            Figtree und Newsreader werden von dieser Website selbst ausgeliefert (<code>public/fonts</code>,
            @font-face). Es wird kein Google-Fonts-CDN geladen.
          </p>

          <h2>8. Beispielbilder (Unsplash)</h2>
          <p>
            Landingpage, Demo-Studio und Beispielprofile laden Vorschaubilder direkt von
            <code> images.unsplash.com</code> (Hotlink, Unsplash License). Eigene Betriebsfotos liegen
            bei uns (Supabase Storage), nicht bei Unsplash.
          </p>

          <h2>9. Keine Analyse-Cookies Dritter</h2>
          <p>
            Es gibt keine Tracking-Cookies und kein Google Analytics, Matomo, Meta-Pixel o. Ä.
            Auf veröffentlichten Profilen sendet die App ohne Cookie Nutzungsereignisse (Aufruf, Anruf,
            WhatsApp, Route, QR) an unseren Endpunkt <code>/api/events</code>, gespeichert in der Tabelle
            <code>events</code>, nur für uns bzw. den Betrieb. Das ist keine Drittanbieter-Analyse;
            wir entfernen es hier nicht still. Rechtsgrundlage: Art. 6 Abs. 1 lit. f DSGVO (Auswertung
            der eigenen Profilnutzung).
          </p>

          <h2>10. Speicherdauer</h2>
          <ul>
            <li>Demo-Daten und Fotos: bis zur Löschung auf Anfrage oder bis das anonyme Konto entfällt.</li>
            <li>Anfragen (<code>service_requests</code> / Netlify Forms): bis zur Bearbeitung, danach{" "}
              <span className={s.offen}>[OFFEN: Aufbewahrungsfrist in Monaten]</span>.</li>
            <li>Ereignisse (<code>events</code>):{" "}
              <span className={s.offen}>[OFFEN: Aufbewahrungsfrist für Aufrufstatistiken]</span>.</li>
            <li>Netlify-Serverprotokolle: nach Vorgabe des Hosters.</li>
          </ul>

          <h2>11. Ihre Rechte</h2>
          <p>
            Sie haben das Recht auf Auskunft, Berichtigung, Löschung, Einschränkung, Datenübertragbarkeit
            und Widerspruch (Art. 15–21 DSGVO). Beschwerde: Österreichische Datenschutzbehörde,
            Barichgasse 40–42, 1030 Wien, <a href="https://www.dsb.gv.at">www.dsb.gv.at</a>.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
