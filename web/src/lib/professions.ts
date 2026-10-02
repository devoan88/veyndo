// Catalog for the demo builder. Professions with `base` reuse a full template
// (services, hours, texts); the others bring a few typical services.
export type Profession = {
  key: string;
  label: string;
  emoji: string;
  cat: string;
  base?: string;
  accent: string;
  tagline?: string;
  services?: [string, string, number | null][];
  hours?: "werktags" | "salon" | "spaet" | "termin";
};

export const CATEGORIES = [
  "Schönheit", "Gesundheit", "Handwerk", "Essen & Handel", "Sport & Lernen", "Kreativ & Beratung", "Auto & Tier",
];

export const PROFESSIONS: Profession[] = [
  // Schönheit
  { key: "friseur", label: "Friseur", emoji: "💇‍♀️", cat: "Schönheit", base: "friseur", accent: "#b98b86" },
  { key: "barbershop", label: "Barbershop", emoji: "💈", cat: "Schönheit", accent: "#2c2c2c", hours: "salon",
    services: [["Haarschnitt", "€ 25", 30], ["Bart trimmen", "€ 15", 20], ["Schnitt und Bart", "€ 35", 45], ["Nassrasur", "€ 22", 30]] },
  { key: "nagelstudio", label: "Nagelstudio", emoji: "💅", cat: "Schönheit", base: "nagelstudio", accent: "#b98b86" },
  { key: "kosmetik", label: "Kosmetikstudio", emoji: "🧖‍♀️", cat: "Schönheit", base: "kosmetik", accent: "#c27c4e" },
  { key: "wimpern", label: "Wimpern & Brauen", emoji: "👁️", cat: "Schönheit", accent: "#8e6fa8", hours: "salon",
    services: [["Wimpernverlängerung Neuset", "€ 89", 120], ["Auffüllen", "€ 49", 60], ["Brauen färben und formen", "€ 25", 30], ["Lash Lifting", "€ 55", 60]] },
  { key: "massage", label: "Massage", emoji: "💆", cat: "Schönheit", base: "massage", accent: "#8a9a62" },
  { key: "tattoo", label: "Tattoo-Studio", emoji: "🖋️", cat: "Schönheit", accent: "#2c2c2c", hours: "spaet",
    services: [["Kleines Motiv", "ab € 80", null], ["Stundensatz", "€ 120", 60], ["Beratungsgespräch", "kostenlos", 30]] },
  { key: "makeup", label: "Make-up Artist", emoji: "💄", cat: "Schönheit", accent: "#e0725a", hours: "termin",
    services: [["Braut-Make-up mit Probe", "€ 220", 120], ["Event-Make-up", "€ 79", 60], ["Make-up-Kurs", "€ 120", 120]] },

  // Gesundheit
  { key: "physiotherapie", label: "Physiotherapie", emoji: "🦴", cat: "Gesundheit", base: "physiotherapie", accent: "#5b7c99" },
  { key: "psychotherapie", label: "Psychotherapie", emoji: "🧠", cat: "Gesundheit", base: "psychotherapie", accent: "#8a9a62" },
  { key: "osteopathie", label: "Osteopathie", emoji: "🤲", cat: "Gesundheit", accent: "#4f9d8a", hours: "werktags",
    services: [["Erstbehandlung", "€ 120", 60], ["Folgebehandlung", "€ 100", 50], ["Kinderosteopathie", "€ 90", 45]] },
  { key: "ernaehrung", label: "Ernährungsberatung", emoji: "🥗", cat: "Gesundheit", accent: "#5f8a5a", hours: "termin",
    services: [["Erstgespräch", "€ 90", 60], ["Folgetermin", "€ 60", 45], ["Ernährungsplan", "€ 120", null]] },
  { key: "lebensberatung", label: "Lebens- und Sozialberatung", emoji: "🌱", cat: "Gesundheit", accent: "#8a9a62", hours: "termin",
    services: [["Einzelberatung", "€ 90", 50], ["Paarberatung", "€ 120", 75], ["Online-Beratung", "€ 80", 50]] },
  { key: "ergotherapie", label: "Ergotherapie", emoji: "🧩", cat: "Gesundheit", accent: "#5b7c99", hours: "werktags",
    services: [["Ergotherapie Einheit", "€ 80", 45], ["Kinder-Ergotherapie", "€ 80", 45], ["Hausbesuch", "€ 100", 60]] },

  // Handwerk
  { key: "elektriker", label: "Elektriker", emoji: "⚡", cat: "Handwerk", base: "elektriker", accent: "#c9a227" },
  { key: "installateur", label: "Installateur", emoji: "🔧", cat: "Handwerk", base: "installateur", accent: "#5b7c99" },
  { key: "reinigung", label: "Reinigung", emoji: "🧽", cat: "Handwerk", base: "reinigung", accent: "#4f9d8a" },
  { key: "maler", label: "Maler & Anstreicher", emoji: "🎨", cat: "Handwerk", accent: "#c27c4e", hours: "werktags",
    services: [["Zimmer ausmalen", "ab € 290", null], ["Stundensatz", "€ 55", 60], ["Lackierarbeiten", "auf Anfrage", null]] },
  { key: "tischler", label: "Tischlerei", emoji: "🪚", cat: "Handwerk", accent: "#8b6a4e", hours: "werktags",
    services: [["Maßmöbel", "auf Anfrage", null], ["Küchenmontage", "ab € 390", null], ["Reparaturen", "€ 60 / Std.", null]] },
  { key: "fliesen", label: "Fliesenleger", emoji: "🧱", cat: "Handwerk", accent: "#9aa3ad", hours: "werktags",
    services: [["Bad komplett", "auf Anfrage", null], ["Fliesen verlegen pro m²", "ab € 45", null], ["Silikonfugen erneuern", "ab € 120", null]] },
  { key: "garten", label: "Gartenpflege", emoji: "🌿", cat: "Handwerk", accent: "#5f8a5a", hours: "werktags",
    services: [["Rasen mähen", "ab € 40", null], ["Heckenschnitt", "ab € 90", null], ["Gartenpflege Stunde", "€ 45", 60]] },
  { key: "umzug", label: "Umzug & Transport", emoji: "🚚", cat: "Handwerk", accent: "#e0725a", hours: "werktags",
    services: [["Kleinumzug", "ab € 290", null], ["Möbeltransport", "ab € 89", null], ["Entrümpelung", "auf Anfrage", null]] },
  { key: "schneiderei", label: "Schneiderei", emoji: "🧵", cat: "Handwerk", accent: "#8e6fa8", hours: "salon",
    services: [["Hose kürzen", "€ 15", null], ["Reißverschluss tauschen", "€ 18", null], ["Kleid ändern", "ab € 25", null]] },

  // Essen & Handel
  { key: "cafe", label: "Café", emoji: "☕", cat: "Essen & Handel", accent: "#8b6a4e", hours: "spaet",
    services: [["Melange", "€ 4,20", null], ["Frühstück", "ab € 9,50", null], ["Hausgemachter Kuchen", "€ 4,80", null]] },
  { key: "restaurant", label: "Restaurant", emoji: "🍽️", cat: "Essen & Handel", accent: "#8c3b4a", hours: "spaet",
    services: [["Mittagsmenü", "€ 11,90", null], ["Wiener Schnitzel", "€ 18,50", null], ["Tagessuppe", "€ 5,20", null]] },
  { key: "baeckerei", label: "Bäckerei", emoji: "🥐", cat: "Essen & Handel", accent: "#b8a06a", hours: "werktags",
    services: [["Handsemmel", "€ 0,70", null], ["Bauernbrot", "€ 4,90", null], ["Torte auf Bestellung", "ab € 39", null]] },
  { key: "blumen", label: "Blumengeschäft", emoji: "💐", cat: "Essen & Handel", accent: "#e0725a", hours: "werktags",
    services: [["Strauß der Saison", "ab € 25", null], ["Brautstrauß", "ab € 120", null], ["Lieferung in Wien", "€ 12", null]] },
  { key: "boutique", label: "Boutique", emoji: "👗", cat: "Essen & Handel", accent: "#2c2c2c", hours: "werktags",
    services: [["Persönliche Stilberatung", "kostenlos", 30], ["Änderungsservice", "ab € 15", null], ["Gutscheine", "ab € 20", null]] },

  // Sport & Lernen
  { key: "yoga", label: "Yoga-Studio", emoji: "🧘", cat: "Sport & Lernen", accent: "#8a9a62", hours: "spaet",
    services: [["Einzelstunde", "€ 22", 75], ["10er-Block", "€ 190", null], ["Probestunde", "€ 12", 75]] },
  { key: "personaltrainer", label: "Personal Trainer", emoji: "🏋️", cat: "Sport & Lernen", accent: "#e0725a", hours: "termin",
    services: [["Einzeltraining", "€ 75", 60], ["10er-Paket", "€ 690", null], ["Trainingsplan", "€ 120", null]] },
  { key: "tanz", label: "Tanzschule", emoji: "💃", cat: "Sport & Lernen", accent: "#8e6fa8", hours: "spaet",
    services: [["Kurs 8 Abende", "€ 160", null], ["Hochzeitstanz privat", "€ 79", 60], ["Schnupperstunde", "kostenlos", 60]] },
  { key: "nachhilfe", label: "Nachhilfe", emoji: "📚", cat: "Sport & Lernen", accent: "#5b7c99", hours: "spaet",
    services: [["Einzelstunde", "€ 35", 60], ["Maturavorbereitung", "€ 45", 60], ["Gruppenkurs", "€ 20", 90]] },
  { key: "musik", label: "Musikunterricht", emoji: "🎹", cat: "Sport & Lernen", accent: "#b8a06a", hours: "spaet",
    services: [["Klavier 45 Min.", "€ 40", 45], ["Gitarre 45 Min.", "€ 38", 45], ["Probestunde", "€ 20", 30]] },
  { key: "sprachen", label: "Sprachkurse", emoji: "🗣️", cat: "Sport & Lernen", accent: "#4f9d8a", hours: "spaet",
    services: [["Deutsch A1–B2 Kurs", "€ 290", null], ["Einzelstunde", "€ 45", 60], ["Online-Stunde", "€ 40", 60]] },

  // Kreativ & Beratung
  { key: "fotograf", label: "Fotografie", emoji: "📷", cat: "Kreativ & Beratung", accent: "#2c2c2c", hours: "termin",
    services: [["Porträt-Shooting", "€ 190", 60], ["Hochzeitsreportage", "ab € 1.490", null], ["Business-Fotos", "€ 290", 90]] },
  { key: "grafik", label: "Grafikdesign", emoji: "✏️", cat: "Kreativ & Beratung", accent: "#e0725a", hours: "werktags",
    services: [["Logo", "ab € 390", null], ["Flyer", "ab € 150", null], ["Visitenkarte", "€ 120", null]] },
  { key: "coaching", label: "Coaching", emoji: "🎯", cat: "Kreativ & Beratung", accent: "#5b7c99", hours: "termin",
    services: [["Erstgespräch", "kostenlos", 30], ["Coaching-Einheit", "€ 120", 60], ["Paket 5 Einheiten", "€ 540", null]] },
  { key: "steuer", label: "Steuerberatung", emoji: "📊", cat: "Kreativ & Beratung", accent: "#3d4a3a", hours: "werktags",
    services: [["Arbeitnehmerveranlagung", "ab € 90", null], ["Einnahmen-Ausgaben-Rechnung", "auf Anfrage", null], ["Gründungsberatung", "€ 150", 60]] },
  { key: "immobilien", label: "Immobilien", emoji: "🏠", cat: "Kreativ & Beratung", accent: "#b8a06a", hours: "werktags",
    services: [["Wertermittlung", "kostenlos", null], ["Verkauf", "auf Anfrage", null], ["Vermietung", "auf Anfrage", null]] },
  { key: "events", label: "Hochzeit & Events", emoji: "🎉", cat: "Kreativ & Beratung", accent: "#8c3b4a", hours: "termin",
    services: [["Hochzeitsplanung", "ab € 1.900", null], ["Tagesbegleitung", "€ 690", null], ["Deko-Verleih", "auf Anfrage", null]] },

  // Auto & Tier
  { key: "kfz", label: "KFZ-Werkstatt", emoji: "🚗", cat: "Auto & Tier", accent: "#c9a227", hours: "werktags",
    services: [["Pickerl (§57a)", "€ 69", 45], ["Service", "ab € 189", null], ["Reifenwechsel", "€ 39", 30]] },
  { key: "fahrrad", label: "Fahrradwerkstatt", emoji: "🚲", cat: "Auto & Tier", accent: "#4f9d8a", hours: "werktags",
    services: [["Service", "€ 59", null], ["Schlauch wechseln", "€ 15", 15], ["E-Bike-Check", "€ 79", null]] },
  { key: "hundesalon", label: "Hundesalon", emoji: "🐩", cat: "Auto & Tier", accent: "#b98b86", hours: "salon",
    services: [["Baden und Föhnen", "ab € 35", 60], ["Komplettpflege", "ab € 60", 120], ["Krallen schneiden", "€ 10", 15]] },
  { key: "hundeschule", label: "Hundeschule", emoji: "🐕", cat: "Auto & Tier", accent: "#8a9a62", hours: "spaet",
    services: [["Welpenkurs", "€ 149", null], ["Einzeltraining", "€ 60", 60], ["Hundeführschein-Kurs", "€ 190", null]] },
];

export function getProfession(key: string): Profession | undefined {
  return PROFESSIONS.find((p) => p.key === key);
}

/** Own profession typed by the visitor, stored as template_key "eigene:<Label>". */
export const CUSTOM_PREFIX = "eigene:";

export function professionLabel(key: string): string {
  if (key.startsWith(CUSTOM_PREFIX)) return key.slice(CUSTOM_PREFIX.length);
  return getProfession(key)?.label ?? key;
}

export function customProfession(label: string): Profession {
  return {
    key: CUSTOM_PREFIX + label.trim().slice(0, 40),
    label: label.trim().slice(0, 40),
    emoji: "✨",
    cat: "",
    accent: "#8a9a62",
    hours: "werktags",
    services: [["Ihre erste Leistung", "€ …", null], ["Ihre zweite Leistung", "€ …", null], ["Erstgespräch", "kostenlos", 30]],
  };
}
