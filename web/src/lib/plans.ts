import type { PlanTier } from "./types";

// Limits from docs/spec.md §3
export const PLANS: Record<PlanTier, {
  label: string;
  priceMonthly: number;
  priceYearly: number;
  maxServices: number;
  showPrices: boolean;
  maxPhotos: number;
  gallery: number; // gallery photos on top of the cover
  whatsapp: boolean;
  stats: boolean;
  features: string[];
}> = {
  basis: {
    label: "ბაზისი", priceMonthly: 0, priceYearly: 0,
    maxServices: 3, showPrices: false, maxPhotos: 1, gallery: 0, whatsapp: false, stats: false,
    features: ["1 პროფილის გვერდი", "მისამართი name.veyndo.ge", "QR კოდი", "3 მომსახურებამდე"],
  },
  profil: {
    label: "პროფილი", priceMonthly: 9, priceYearly: 90,
    maxServices: 100, showPrices: true, maxPhotos: 8, gallery: 8, whatsapp: true, stats: true,
    features: ["ყველაფერი ბაზისიდან", "ფასების სია ულიმიტოდ", "ფოტოგალერეა 8 ფოტოთი", "WhatsApp ღილაკი", "სტატისტიკა"],
  },
  pro: {
    label: "პრო", priceMonthly: 19, priceYearly: 190,
    maxServices: 100, showPrices: true, maxPhotos: 20, gallery: 20, whatsapp: true, stats: true,
    features: ["ყველაფერი პროფილიდან", "ფოტოგალერეა 20 ფოტოთი", "ონლაინ ვიზიტები (მალე)", "საკუთარი დომენი (მალე)"],
  },
};

export const euro = (n: number) =>
  n === 0 ? "€ 0" : `€ ${n.toLocaleString("de-AT", { minimumFractionDigits: 0 })}`;
