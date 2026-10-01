import type { OpeningDay } from "./types";

export const WEEKDAYS = ["Montag", "Dienstag", "Mittwoch", "Donnerstag", "Freitag", "Samstag", "Sonntag"];
export const WEEKDAYS_SHORT = ["Mo", "Di", "Mi", "Do", "Fr", "Sa", "So"];

const toMin = (t?: string) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : null;
};

export type OpenState = { open: boolean; soon: boolean; appt?: boolean; label: string };

/** "09:00 – 18:00", "geschlossen" or the note ("nach Vereinbarung"). */
export function dayText(h: OpeningDay, sep = " – ") {
  if (h.closed) return "geschlossen";
  if (!h.opens || !h.closes) return h.note || "nach Vereinbarung";
  return `${h.opens}${sep}${h.closes}`;
}

/** Live status like "Geöffnet · bis 19:00" or "Geschlossen · öffnet Di 10:00". */
export function openState(hours: OpeningDay[], now = new Date()): OpenState {
  const wd = ((now.getDay() + 6) % 7) + 1;
  const mins = now.getHours() * 60 + now.getMinutes();
  const day = hours.find((h) => h.weekday === wd);
  const o = toMin(day?.opens), c = toMin(day?.closes);

  if (day && !day.closed && o !== null && c !== null && mins >= o && mins < c) {
    return { open: true, soon: c - mins <= 60, label: `Geöffnet · bis ${day.closes}` };
  }
  // Next opening: later today, or one of the next 7 days.
  for (let i = 0; i < 8; i++) {
    const w = ((wd - 1 + i) % 7) + 1;
    const d = hours.find((h) => h.weekday === w);
    const start = toMin(d?.opens);
    if (!d || d.closed || start === null) continue;
    if (i === 0 && mins >= start) continue;
    const when = i === 0 ? "heute" : i === 1 ? "morgen" : WEEKDAYS_SHORT[w - 1];
    return { open: false, soon: false, label: `Geschlossen · öffnet ${when} ${d.opens}` };
  }
  if (hours.some((h) => !h.closed && (!h.opens || !h.closes))) {
    return { open: false, soon: false, appt: true, label: "Termine nach Vereinbarung" };
  }
  return { open: false, soon: false, label: "Derzeit geschlossen" };
}
