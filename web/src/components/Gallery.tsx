"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { Photo } from "@/lib/types";
import s from "./gallery.module.css";

/** Photo grid (first photo large) with a full-screen viewer: arrows, swipe, keyboard, Esc. */
export default function Gallery({ photos, name }: { photos: Photo[]; name: string }) {
  const [open, setOpen] = useState<number | null>(null);
  const touchX = useRef<number | null>(null);
  const closeBtn = useRef<HTMLButtonElement>(null);
  const n = photos.length;

  const go = useCallback((d: number) => setOpen((i) => (i === null ? i : (i + d + n) % n)), [n]);

  useEffect(() => {
    if (open === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(null);
      if (e.key === "ArrowRight") go(1);
      if (e.key === "ArrowLeft") go(-1);
    };
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    window.addEventListener("keydown", onKey);
    closeBtn.current?.focus();
    return () => { window.removeEventListener("keydown", onKey); document.body.style.overflow = prev; };
  }, [open, go]);

  if (n === 0) return null;
  const shown = photos.slice(0, 5);
  const more = n - shown.length;

  return (
    <>
      <div className={`${s.grid} ${s["n" + Math.min(n, 5)]}`}>
        {shown.map((p, i) => (
          <button key={p.id} type="button" className={s.cell} onClick={() => setOpen(i)}
            aria-label={`Foto ${i + 1} von ${n} vergrößern`}>
            {/* eslint-disable-next-line @next/next/no-img-element -- user photos (storage or data URL) */}
            <img src={p.url} alt={`${name}, Foto ${i + 1}`} loading="lazy" />
            {i === shown.length - 1 && more > 0 && <span className={s.more}>+{more}</span>}
          </button>
        ))}
      </div>

      {open !== null && (
        <div className={s.viewer} role="dialog" aria-modal="true" aria-label={`Fotos von ${name}`}
          onClick={(e) => { if (e.target === e.currentTarget) setOpen(null); }}
          onTouchStart={(e) => { touchX.current = e.touches[0].clientX; }}
          onTouchEnd={(e) => {
            if (touchX.current === null) return;
            const dx = e.changedTouches[0].clientX - touchX.current;
            if (Math.abs(dx) > 40) go(dx < 0 ? 1 : -1);
            touchX.current = null;
          }}>
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img key={photos[open].id} className={s.big} src={photos[open].url} alt={`${name}, Foto ${open + 1}`} />
          <button ref={closeBtn} type="button" className={s.close} onClick={() => setOpen(null)} aria-label="Schließen">×</button>
          {n > 1 && (
            <>
              <button type="button" className={`${s.nav} ${s.prev}`} onClick={() => go(-1)} aria-label="Vorheriges Foto">‹</button>
              <button type="button" className={`${s.nav} ${s.next}`} onClick={() => go(1)} aria-label="Nächstes Foto">›</button>
            </>
          )}
          <div className={s.counter}>{open + 1} / {n}</div>
        </div>
      )}
    </>
  );
}
