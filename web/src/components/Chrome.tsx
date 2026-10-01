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
              <a href="https://wa.me/436643568802?text=Hallo%2C%20ich%20interessiere%20mich%20f%C3%BCr%20eine%20Veyndo-Seite." target="_blank" rel="noopener noreferrer" className="btn small">Anfrage senden</a>
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
          <a href="https://veyndo-at.netlify.app/impressum.html">Impressum</a> ·{" "}
          <a href="https://veyndo-at.netlify.app/datenschutz.html">Datenschutz</a>
        </span>
      </div>
    </footer>
  );
}
