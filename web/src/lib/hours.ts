import type { OpeningDay } from "./types";
import type { Messages } from "./i18n/messages";
import { getMessages, format } from "./i18n/messages";
import type { Locale } from "./i18n/config";
import { DEFAULT_LOCALE } from "./i18n/config";

export type HoursCopy = Messages["hours"];

export function hoursCopy(locale: Locale = DEFAULT_LOCALE): HoursCopy {
  return getMessages(locale).hours;
}

export const WEEKDAYS = hoursCopy(DEFAULT_LOCALE).weekdays;
export const WEEKDAYS_SHORT = hoursCopy(DEFAULT_LOCALE).weekdaysShort;

const toMin = (t?: string) => {
  if (!t) return null;
  const [h, m] = t.split(":").map(Number);
  return Number.isFinite(h) ? h * 60 + (m || 0) : null;
};

export type OpenState = { open: boolean; soon: boolean; appt?: boolean; label: string };

/** "09:00 – 18:00", closed, or by-appointment note. */
export function dayText(h: OpeningDay, sep = " – ", copy: HoursCopy = hoursCopy()): string {
  if (h.closed) return copy.closed;
  if (!h.opens || !h.closes) return h.note || copy.byAppointment;
  return `${h.opens}${sep}${h.closes}`;
}

/** Live status label for a profile. */
export function openState(
  hours: OpeningDay[],
  now = new Date(),
  copy: HoursCopy = hoursCopy(),
): OpenState {
  const wd = ((now.getDay() + 6) % 7) + 1;
  const mins = now.getHours() * 60 + now.getMinutes();
  const day = hours.find((h) => h.weekday === wd);
  const o = toMin(day?.opens),
    c = toMin(day?.closes);

  if (day && !day.closed && o !== null && c !== null && mins >= o && mins < c) {
    return { open: true, soon: c - mins <= 60, label: format(copy.openUntil, { time: day.closes! }) };
  }
  for (let i = 0; i < 8; i++) {
    const w = ((wd - 1 + i) % 7) + 1;
    const d = hours.find((h) => h.weekday === w);
    const start = toMin(d?.opens);
    if (!d || d.closed || start === null) continue;
    if (i === 0 && mins >= start) continue;
    const when = i === 0 ? copy.today : i === 1 ? copy.tomorrow : copy.weekdaysShort[w - 1];
    return {
      open: false,
      soon: false,
      label: format(copy.closedOpens, { when, time: d.opens! }),
    };
  }
  if (hours.some((h) => !h.closed && (!h.opens || !h.closes))) {
    return { open: false, soon: false, appt: true, label: copy.appointmentOnly };
  }
  return { open: false, soon: false, label: copy.currentlyClosed };
}
