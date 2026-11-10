"use client";

import Link from "next/link";
import { AuthNav } from "./AuthNav";
import { useI18n } from "./i18n/LocaleProvider";

export function TopBar({ children }: { children?: React.ReactNode }) {
  const { m } = useI18n();
  return (
    <header className="topbar">
      <div className="wrap">
        <Link href="/" className="brand">
          {/* decorative mark; SVG is 28px */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/veyndo-sage.svg" alt="" width={28} height={28} />
          {m.common.brandMark}
        </Link>
        <nav className="nav">
          {children ?? (
            <>
              <Link href="/#so-gehts">{m.nav.howItWorks}</Link>
              <Link href="/preise">{m.nav.prices}</Link>
              <Link href="/dashboard">{m.nav.myProfile}</Link>
              <AuthNav />
              <Link href="/start" className="btn small">{m.nav.buildDemo}</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  const { m } = useI18n();
  return (
    <footer className="footer">
      <div className="wrap">
        <span>
          © {new Date().getFullYear()} {m.common.brandMark} · {m.footer.locationKa}
        </span>
        <span>
          <Link href="/impressum">{m.footer.imprint}</Link>
          {" · "}
          <Link href="/datenschutz">{m.footer.privacy}</Link>
        </span>
      </div>
    </footer>
  );
}
