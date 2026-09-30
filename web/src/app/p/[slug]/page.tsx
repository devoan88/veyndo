"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import Link from "next/link";
import ProfileView from "@/components/ProfileView";
import { fromTemplate, loadBusiness } from "@/lib/store";
import { TEMPLATES } from "@/lib/templates";
import type { Business } from "@/lib/types";

// Until Supabase is connected, a profile is only visible in the browser that created it.
// "beispiel-<branche>" shows the template as a demo profile.
function resolve(slug: string): Business | null {
  if (slug.startsWith("beispiel-")) {
    const t = TEMPLATES.find((x) => x.key === slug.slice("beispiel-".length));
    if (!t) return null;
    const b = fromTemplate(t);
    return {
      ...b,
      slug,
      tier: "profil",
      phone: "+43 1 234 56 78",
      whatsapp: "+43 664 123 45 67",
      street: "Beispielgasse 1",
      postalCode: t.example.district,
      legalName: `${t.example.name} (Beispiel)`,
    };
  }
  const own = loadBusiness();
  return own && own.slug === slug ? own : null;
}

export default function PublicProfile() {
  const { slug } = useParams<{ slug: string }>();
  const [state, setState] = useState<{ b: Business | null; ready: boolean }>({ b: null, ready: false });

  useEffect(() => {
    const b = resolve(slug);
    setState({ b, ready: true });
    if (b) document.title = `${b.name} · ${b.tagline}`;
  }, [slug]);

  if (!state.ready) return null;
  const today = ((new Date().getDay() + 6) % 7) + 1;

  if (!state.b) {
    return (
      <main className="wrap" style={{ padding: "80px 0", textAlign: "center" }}>
        <h1>Seite nicht gefunden</h1>
        <p className="muted">Unter dieser Adresse gibt es noch kein Profil.</p>
        <Link href="/start" className="btn">Eigenes Profil erstellen</Link>
      </main>
    );
  }

  const { b } = state;
  const isDemo = slug.startsWith("beispiel-");
  return (
    <>
      {(isDemo || !b.isPublished) && (
        <div className="notice" style={{ borderRadius: 0, margin: 0, textAlign: "center" }}>
          {isDemo ? (
            <>Beispielprofil. <Link href="/start">So eines in 10 Minuten erstellen</Link></>
          ) : (
            <>Vorschau: Diese Seite ist noch nicht veröffentlicht. <Link href="/dashboard">Zum Dashboard</Link></>
          )}
        </div>
      )}
      <div className="profile-page"><ProfileView b={b} today={today} /></div>
    </>
  );
}
