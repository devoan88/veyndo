import type { Locale } from "../config";
import type { Messages } from "./types";
import { de } from "./de";
import { ka } from "./ka";

export type { Messages };

const catalogs: Record<Locale, Messages> = { de, ka };

export function getMessages(locale: Locale): Messages {
  return catalogs[locale] ?? de;
}

/** Replace `{key}` placeholders in a message string. */
export function format(template: string, vars: Record<string, string | number> = {}): string {
  return template.replace(/\{(\w+)\}/g, (_, key: string) =>
    vars[key] !== undefined ? String(vars[key]) : `{${key}}`,
  );
}
