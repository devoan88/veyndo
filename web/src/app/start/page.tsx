"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TopBar } from "@/components/Chrome";
import { TEMPLATES, GROUPS } from "@/lib/templates";
import { loadBusiness, newBusiness, saveBusiness } from "@/lib/store";

export default function StartPage() {
  const router = useRouter();
  const [templateKey, setTemplateKey] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [postal, setPostal] = useState("");

  function create(e: React.FormEvent) {
    e.preventDefault();
    if (!templateKey) return;
    if (loadBusiness() && !confirm("Es gibt schon ein Profil in diesem Browser. Ersetzen?")) return;
    const b = newBusiness(templateKey, name);
    if (postal.trim()) {
      b.postalCode = postal.trim();
      b.district = postal.trim();
      b.tagline = b.tagline.replace(/Wien \d{4}/, `Wien ${postal.trim()}`);
    }
    saveBusiness(b);
    router.push("/editor");
  }

  return (
    <>
      <TopBar><span className="small muted">Schritt {templateKey ? 2 : 1} von 2</span></TopBar>
      <main className="wrap" style={{ padding: "40px 0 80px" }}>
        {!templateKey ? (
          <>
            <h1>Was machen Sie?</h1>
            <p className="muted">Wählen Sie Ihre Branche. Alles lässt sich danach ändern.</p>
            {(Object.keys(GROUPS) as (keyof typeof GROUPS)[]).map((g) => (
              <div key={g} style={{ marginTop: 28 }}>
                <h3>{GROUPS[g]}</h3>
                <div className="grid c3">
                  {TEMPLATES.filter((t) => t.group === g).map((t) => (
                    <button key={t.key} className="card tpl" onClick={() => setTemplateKey(t.key)}>
                      <span className="dot" style={{ background: t.accent_color }} />
                      <strong>{t.label}</strong>
                      <span className="small muted">{t.services.slice(0, 3).map((s) => s.title).join(" · ")}</span>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </>
        ) : (
          <form onSubmit={create} className="card" style={{ maxWidth: 520 }}>
            <h1 style={{ fontSize: "2rem" }}>Wie heißt Ihr Betrieb?</h1>
            <div className="field">
              <label htmlFor="name">Name</label>
              <input id="name" value={name} onChange={(e) => setName(e.target.value)}
                placeholder={TEMPLATES.find((t) => t.key === templateKey)?.example.name} autoFocus required maxLength={80} />
            </div>
            <div className="field">
              <label htmlFor="postal">Postleitzahl</label>
              <input id="postal" value={postal} onChange={(e) => setPostal(e.target.value.replace(/\D/g, "").slice(0, 4))}
                inputMode="numeric" placeholder="1070" />
              <span className="hint">Für die Kurzbeschreibung und die Route auf Google Maps.</span>
            </div>
            <div className="cta-row">
              <button className="btn" type="submit">Profil erstellen</button>
              <button className="btn ghost" type="button" onClick={() => setTemplateKey(null)}>Zurück</button>
            </div>
          </form>
        )}
      </main>
    </>
  );
}
