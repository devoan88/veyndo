"use client";

import { createContext, useContext, useMemo } from "react";
import type { Locale } from "@/lib/i18n/config";
import { getMessages, format, type Messages } from "@/lib/i18n/messages";
import { profileDomainFor } from "@/lib/i18n/config";

type Ctx = {
  locale: Locale;
  m: Messages;
  domain: string;
  format: typeof format;
};

const LocaleContext = createContext<Ctx | null>(null);

export function LocaleProvider({
  locale,
  children,
}: {
  locale: Locale;
  children: React.ReactNode;
}) {
  const value = useMemo<Ctx>(
    () => ({
      locale,
      m: getMessages(locale),
      domain: profileDomainFor(locale),
      format,
    }),
    [locale],
  );
  return <LocaleContext.Provider value={value}>{children}</LocaleContext.Provider>;
}

export function useI18n(): Ctx {
  const ctx = useContext(LocaleContext);
  if (!ctx) {
    // Safe fallback for any stray client tree outside the provider.
    const locale: Locale = "de";
    return { locale, m: getMessages(locale), domain: profileDomainFor(locale), format };
  }
  return ctx;
}
