import type { PlanTier } from "./types";

// Limits from docs/spec.md §3
export const PLANS: Record<PlanTier, {
  label: string;
  priceMonthly: number;
  priceYearly: number;
  maxServices: number;
  showPrices: boolean;
  maxPhotos: number;
  whatsapp: boolean;
  stats: boolean;
  features: string[];
}> = {
  basis: {
    label: "Basis", priceMonthly: 0, priceYearly: 0,
    maxServices: 3, showPrices: false, maxPhotos: 1, whatsapp: false, stats: false,
    features: ["1 Profilseite", "Adresse name.veyndo.at", "QR-Code", "Bis zu 3 Leistungen"],
  },
  profil: {
    label: "Profil", priceMonthly: 9, priceYearly: 90,
    maxServices: 100, showPrices: true, maxPhotos: 8, whatsapp: true, stats: true,
    features: ["Alles aus Basis", "Preisliste ohne Limit", "Bis zu 8 Fotos", "WhatsApp-Button", "Statistik"],
  },
  pro: {
    label: "Pro", priceMonthly: 19, priceYearly: 190,
    maxServices: 100, showPrices: true, maxPhotos: 20, whatsapp: true, stats: true,
    features: ["Alles aus Profil", "Bis zu 20 Fotos", "Online-Termine (bald)", "Eigene Domain (bald)"],
  },
};

export const euro = (n: number) =>
  n === 0 ? "€ 0" : `€ ${n.toLocaleString("de-AT", { minimumFractionDigits: 0 })}`;
