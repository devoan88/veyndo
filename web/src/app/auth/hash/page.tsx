"use client";

import { Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/env";

function HashInner() {
  const router = useRouter();
  const params = useSearchParams();

  useEffect(() => {
    const nextRaw = params.get("next") || "/editor";
    const next = nextRaw.startsWith("/") && !nextRaw.startsWith("//") ? nextRaw : "/editor";
    if (!supabaseConfigured()) {
      router.replace("/login");
      return;
    }
    const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
    const access_token = hash.get("access_token");
    const refresh_token = hash.get("refresh_token");
    if (!access_token || !refresh_token) {
      router.replace("/login?error=1");
      return;
    }
    createClient()
      .auth.setSession({ access_token, refresh_token })
      .then(async ({ error }) => {
        if (error) {
          window.location.replace("/login?error=1");
          return;
        }
        window.location.replace(next);
      });
  }, [params, router]);

  return (
    <main className="wrap" style={{ padding: "48px 0" }}>
      <p className="muted">Anmelden…</p>
    </main>
  );
}

export default function AuthHashPage() {
  return (
    <Suspense fallback={null}>
      <HashInner />
    </Suspense>
  );
}
