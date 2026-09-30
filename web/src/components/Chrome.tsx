import Link from "next/link";

export function TopBar({ children }: { children?: React.ReactNode }) {
  return (
    <header className="topbar">
      <div className="wrap">
        <Link href="/" className="brand">Veyndo<span>.</span></Link>
        <nav className="nav">
          {children ?? (
            <>
              <Link href="/#so-gehts">So geht&apos;s</Link>
              <Link href="/#preise">Preise</Link>
              <Link href="/dashboard">Mein Profil</Link>
              <Link href="/start" className="btn small">Kostenlos starten</Link>
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
