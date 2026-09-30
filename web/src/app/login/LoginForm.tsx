"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/Chrome";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/env";

export default function LoginForm() {
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabaseConfigured()) {
      setError("Supabase ist noch nicht eingerichtet.");
      return;
    }
    const supabase = createClient();
    const origin = window.location.origin;
    const { error: err } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: `${origin}/auth/callback?next=${encodeURIComponent(next)}` },
    });
    if (err) setError(err.message);
    else setSent(true);
  }

  return (
    <>
      <TopBar />
      <main className="wrap" style={{ padding: "48px 0 80px", maxWidth: 480 }}>
        <p className="kicker">Konto</p>
        <h1>Anmelden</h1>
        <p className="muted">Wir schicken Ihnen einen Link per E-Mail. Kein Passwort.</p>
        {sent ? (
          <div className="card">
            <p style={{ margin: 0 }}>Prüfen Sie Ihr Postfach. Der Link gilt ein paar Minuten.</p>
          </div>
        ) : (
          <form className="card" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">E-Mail</label>
              <input id="email" type="email" required value={email} onChange={(e) => setEmail(e.target.value)} autoFocus />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn" type="submit">Link senden</button>
          </form>
        )}
      </main>
    </>
  );
}
