/** Relative in-app path only — blocks protocol-relative and backslash open redirects. */
export function safeNext(raw: string | null | undefined, fallback = "/dashboard"): string {
  if (!raw) return fallback;
  if (!raw.startsWith("/")) return fallback;
  if (raw.startsWith("//") || raw.startsWith("/\\")) return fallback;
  if (raw.includes("\\")) return fallback;
  if (raw.includes("://")) return fallback;
  return raw;
}
