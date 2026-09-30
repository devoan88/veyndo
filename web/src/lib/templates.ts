import type { Template } from "./types";
import nagelstudio from "@/content/templates/de/nagelstudio.json";
import friseur from "@/content/templates/de/friseur.json";
import kosmetik from "@/content/templates/de/kosmetik.json";
import physiotherapie from "@/content/templates/de/physiotherapie.json";
import massage from "@/content/templates/de/massage.json";
import psychotherapie from "@/content/templates/de/psychotherapie.json";
import elektriker from "@/content/templates/de/elektriker.json";
import installateur from "@/content/templates/de/installateur.json";
import reinigung from "@/content/templates/de/reinigung.json";

export const TEMPLATES: Template[] = [
  nagelstudio, friseur, kosmetik,
  physiotherapie, massage, psychotherapie,
  elektriker, installateur, reinigung,
] as Template[];

export const GROUPS: Record<Template["group"], string> = {
  schoenheit: "Schönheit",
  gesundheit: "Gesundheit",
  handwerk: "Handwerk",
};

export function getTemplate(key: string): Template {
  return TEMPLATES.find((t) => t.key === key) ?? TEMPLATES[0];
}
