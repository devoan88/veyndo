// Price list (Preisliste). Same prices as the original Veyndo offer.
export type PriceItem = { name: string; desc: string; price: string };
export type PriceGroup = { key: string; title: string; intro: string; items: PriceItem[] };

export const PRICE_LIST: PriceGroup[] = [
  {
    key: "websites",
    title: "Websites",
    intro: "Persönlich für Sie gebaut, mit Preisen, Öffnungszeiten, Galerie, Anruf- und WhatsApp-Button.",
    items: [
      { name: "Website", desc: "1 bis 3 Seiten: Start, Leistungen, Kontakt. Impressum und Datenschutz, Domain und E-Mail eingerichtet.", price: "€ 990" },
      { name: "Website mit Team und Referenzen", desc: "4 bis 8 Seiten, Deutsch und Englisch, Google-Profil, SEO-Grundlagen und Besucherstatistik.", price: "€ 2.190" },
      { name: "Website mit Shop oder Terminbuchung", desc: "Online-Shop oder Buchungssystem, Zahlung per Karte oder Überweisung, 3 Monate Betreuung inklusive.", price: "€ 3.490" },
    ],
  },
  {
    key: "sichtbarkeit",
    title: "Sichtbarkeit",
    intro: "Damit Sie auf Google, Maps, Social Media und in Branchenportalen gefunden werden.",
    items: [
      { name: "Google-Unternehmensprofil", desc: "Eintrag auf Maps mit Fotos, Leistungen und Öffnungszeiten.", price: "€ 190" },
      { name: "Sichtbar Start", desc: "Google-Profil, Apple Maps, Bing und 5 Verzeichnisse, überall mit denselben Daten.", price: "€ 390" },
      { name: "Sichtbar Plus", desc: "Wie Start, dazu Instagram, Facebook, LinkedIn und die Portale Ihrer Branche. Bis zu 20 Einträge.", price: "€ 790" },
      { name: "Sichtbarkeit laufend", desc: "Beiträge auf Google und Instagram, neue Fotos, Antworten auf Bewertungen.", price: "€ 149 / Monat" },
      { name: "Lokale SEO", desc: "Laufend besser gefunden werden auf Google und Maps.", price: "ab € 390 / Monat" },
    ],
  },
  {
    key: "extras",
    title: "Einzelleistungen",
    intro: "Einzeln dazu buchbar, zum Festpreis.",
    items: [
      { name: "Weitere Seite", desc: "Zum Beispiel Team, FAQ oder ein Projekt.", price: "€ 150" },
      { name: "Texte schreiben", desc: "Texte für bis zu 5 Seiten, in Ihrem Ton.", price: "€ 290" },
      { name: "Zweite Sprache", desc: "Die ganze Seite auf Englisch oder Deutsch.", price: "€ 390" },
      { name: "Logo und Visitenkarte", desc: "Ein klares Zeichen und eine Druckdatei.", price: "€ 390" },
      { name: "Online-Termine", desc: "Kundinnen buchen direkt auf Ihrer Seite.", price: "€ 390" },
      { name: "Online-Shop nachrüsten", desc: "Produkte, Warenkorb und Zahlung für Ihre bestehende Seite.", price: "€ 1.490" },
      { name: "Sicherheits-Check", desc: "Ihre bestehende Website wird geprüft und abgesichert.", price: "€ 290" },
      { name: "Digitale Strategie", desc: "Zwei Stunden Gespräch und ein klarer schriftlicher Plan.", price: "€ 390" },
    ],
  },
  {
    key: "software",
    title: "Assistenten und Software",
    intro: "Nach einem kurzen Gespräch bekommen Sie ein Festpreis-Angebot.",
    items: [
      { name: "KI-Assistent", desc: "Beantwortet Fragen auf Ihrer Website rund um die Uhr. Betrieb € 49 / Monat.", price: "ab € 1.490" },
      { name: "Automatische Antworten", desc: "Per E-Mail oder WhatsApp, in Ihrem Ton.", price: "ab € 690" },
      { name: "Arbeitsheft oder Journal", desc: "Digital, für Sie, Ihr Team oder Ihre Klienten.", price: "ab € 790" },
      { name: "Kundenportal oder interne Seite", desc: "Dateien, Termine und Abläufe an einem geschützten Ort.", price: "ab € 1.290" },
      { name: "Rechnungs- und Buchhaltungsprogramm", desc: "Nach Ihren Abläufen gebaut, mit Export für die Steuerberatung.", price: "ab € 2.900" },
      { name: "App", desc: "Für Ihre Kunden oder Ihr Team, auf Handy und Computer.", price: "ab € 3.900" },
    ],
  },
  {
    key: "betreuung",
    title: "Laufende Betreuung",
    intro: "Monatlich kündbar.",
    items: [
      { name: "Hosting und Schutz", desc: "Online, aktuell und geschützt, mit täglichen Backups.", price: "€ 39 / Monat" },
      { name: "Betreuung Plus", desc: "Wie oben, dazu bis zu 1 Stunde Änderungen pro Monat.", price: "€ 89 / Monat" },
    ],
  },
];
