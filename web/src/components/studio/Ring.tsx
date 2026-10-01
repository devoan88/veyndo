import s from "./studio.module.css";

/** Circular progress, 0–100. */
export default function Ring({ pct, size = 64, label }: { pct: number; size?: number; label?: string }) {
  const r = 26;
  const c = 2 * Math.PI * r;
  return (
    <div className={s.ring} style={{ width: size, height: size }} role="img" aria-label={label ?? `${pct} Prozent`}>
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden>
        <circle cx="32" cy="32" r={r} className={s.ringTrack} />
        <circle cx="32" cy="32" r={r} className={s.ringBar} strokeDasharray={c} strokeDashoffset={c * (1 - pct / 100)} />
      </svg>
      <span>{pct}<small>%</small></span>
    </div>
  );
}
