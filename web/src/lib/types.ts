export type PlanTier = "basis" | "profil" | "pro";

export type Photo = { id: string; url: string };

export type ProfileTheme = "klassisch" | "modern" | "frisch";

export type Service = {
  id: string;
  title: string;
  priceLabel: string;
  durationMin?: number | null;
};

export type OpeningDay = {
  weekday: number; // 1 = Montag … 7 = Sonntag
  closed: boolean;
  opens?: string;
  closes?: string;
  note?: string;
};

export type Business = {
  id: string;
  slug: string;
  templateKey: string;
  name: string;
  tagline: string;
  about: string;
  street: string;
  postalCode: string;
  city: string;
  district: string;
  phone: string;
  whatsapp: string;
  email: string;
  instagram: string;
  accentColor: string;
  theme?: ProfileTheme;
  coverDataUrl: string | null;
  photos?: Photo[];
  services: Service[];
  hours: OpeningDay[];
  legalName: string;
  legalForm: string;
  uidNumber: string;
  isPublished: boolean;
  tier: PlanTier;
  updatedAt: string;
};

export type TemplateService = { title: string; price_label: string; duration_min: number | null };

export type Template = {
  key: string;
  group: "schoenheit" | "gesundheit" | "handwerk";
  label: string;
  google_category: string;
  accent_color: string;
  example: { name: string; city: string; district: string };
  tagline: string;
  about: string;
  services: TemplateService[];
  opening_hours: OpeningDay[];
  checklist: string[];
};
