"use client";

import { useEffect } from "react";
import type { Business } from "@/lib/types";
import ProfileView from "@/components/ProfileView";

function eventSid(): string {
  try {
    const key = "veyndo.event.sid";
    let sid = sessionStorage.getItem(key);
    if (!sid) {
      sid = crypto.randomUUID();
      sessionStorage.setItem(key, sid);
    }
    return sid;
  } catch {
    return "anon";
  }
}

function ping(slug: string, kind: string) {
  fetch("/api/events", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ slug, kind, sid: eventSid() }),
    keepalive: true,
  }).catch(() => {});
}

export default function PublicProfileClient({ b, srcQr }: { b: Business; srcQr: boolean }) {
  const today = ((new Date().getDay() + 6) % 7) + 1;
  useEffect(() => {
    ping(b.slug, srcQr ? "qr" : "view");
  }, [b.slug, srcQr]);
  return (
    <div className="profile-page">
      <ProfileView b={b} today={today} onTrack={(kind) => ping(b.slug, kind)} />
    </div>
  );
}
