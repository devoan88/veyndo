"use client";

/** Sends the demo request to Netlify Forms, which e-mails Ani (see public/__forms.html). */
export async function notifyByEmail(fields: Record<string, string>): Promise<boolean> {
  try {
    const res = await fetch("/__forms.html", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({ "form-name": "demo-request", ...fields }).toString(),
    });
    return res.ok;
  } catch {
    return false;
  }
}
