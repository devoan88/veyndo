import Link from "next/link";
import { AuthNav } from "./AuthNav";

export function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <div className="wrap">
        <Link href="/" className="brand">
          {/* decorative mark; SVG is 28px */}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/brand/veyndo-sage.svg" alt="" width={28} height={28} />
          Veyndo
        </Link>
        <nav className="nav">
          {children ?? (
            <>
              <Link href="/#so-gehts">So geht&apos;s</Link>
              <Link href="/preise">Preise</Link>
              <Link href="/dashboard">Mein Profil</Link>
              <AuthNav />
              <Link href="/start" className="btn small">✨ Demo bauen</Link>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}

export function Footer() {
  return (
    <footer className="footer">
      <div className="wrap">
        <span>© {new Date().getFullYear()} Veyndo · Wien</span>
        <span>
          <Link href="/impressum">Impressum</Link>
          {" · "}
          <Link href="/datenschutz">Datenschutz</Link>
        </span>
      </div>
    </footer>
  );
}
