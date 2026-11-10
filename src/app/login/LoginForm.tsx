"use client";

import { FormEvent, useState } from "react";
import { useSearchParams } from "next/navigation";
import { TopBar } from "@/components/Chrome";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/env";
import { useI18n } from "@/components/i18n/LocaleProvider";

export default function LoginForm() {
  const { m } = useI18n();
  const params = useSearchParams();
  const next = params.get("next") || "/dashboard";
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError("");
    if (!supabaseConfigured()) {
      setError(m.login.noSupabase);
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
        <p className="kicker">{m.login.kicker}</p>
        <h1>{m.login.title}</h1>
        <p className="muted">{m.login.lead}</p>
        {sent ? (
          <div className="card">
            <p style={{ margin: 0 }}>{m.login.sent}</p>
          </div>
        ) : (
          <form className="card" onSubmit={onSubmit}>
            <div className="field">
              <label htmlFor="email">{m.login.email}</label>
              <input
                id="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                autoFocus
              />
            </div>
            {error && <p className="error">{error}</p>}
            <button className="btn" type="submit">
              {m.login.submit}
            </button>
          </form>
        )}
      </main>
    </>
  );
}
