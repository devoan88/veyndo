import Link from "next/link";
import { TopBar } from "@/components/Chrome";

export default function NotFound() {
  return (
    <>
      <TopBar />
      <main className="wrap" style={{ padding: "64px 0" }}>
        <h1>Seite nicht gefunden</h1>
        <p className="muted">Dieses Profil gibt es nicht oder es ist nicht öffentlich.</p>
        <Link href="/" className="btn">Zur Startseite</Link>
      </main>
    </>
  );
}
