import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured, siteOrigin } from "@/lib/env";
import { demoBusiness } from "@/lib/demo";

const DEMOS = ["beispiel-nagelstudio", "beispiel-friseur", "beispiel-massage"];

export default async function sitemap() {
  const origin = siteOrigin();
  const staticPages = ["", "/start", "/preise", "/impressum", "/datenschutz"].map((p) => ({
    url: `${origin}${p || "/"}`,
    changeFrequency: "weekly" as const,
    priority: p === "" ? 1 : 0.6,
  }));
  const demos = DEMOS.filter((s) => demoBusiness(s)).map((slug) => ({
    url: `${origin}/p/${slug}`,
    changeFrequency: "monthly" as const,
    priority: 0.4,
  }));
  if (!supabaseConfigured()) return [...staticPages, ...demos];
  try {
    const supabase = await createClient();
    const { data } = await supabase
      .from("businesses")
      .select("slug,updated_at")
      .eq("is_published", true)
      .eq("is_blocked", false);
    const pubs = (data || []).map((row: { slug: string; updated_at: string }) => ({
      url: `${origin}/p/${row.slug}`,
      lastModified: row.updated_at,
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));
    return [...staticPages, ...demos, ...pubs];
  } catch {
    return [...staticPages, ...demos];
  }
}
