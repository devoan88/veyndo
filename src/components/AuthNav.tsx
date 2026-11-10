"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";
import { supabaseConfigured } from "@/lib/env";
import { useI18n } from "./i18n/LocaleProvider";

export function AuthNav() {
  const { m } = useI18n();
  const [email, setEmail] = useState<string | null | undefined>(undefined);
  useEffect(() => {
    if (!supabaseConfigured()) {
      setEmail(null);
      return;
    }
    const supabase = createClient();
    supabase.auth.getUser().then(({ data }) => setEmail(data.user?.email ?? null));
  }, []);
  if (email === undefined) return null;
  if (!email) return <Link href="/login">{m.nav.signIn}</Link>;
  return (
    <>
      <span className="small muted">{email}</span>
      <button
        className="linkbtn small"
        type="button"
        onClick={async () => {
          await createClient().auth.signOut();
          window.location.href = "/";
        }}
      >
        {m.nav.signOut}
      </button>
    </>
  );
}
