import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { TopBar } from "@/components/Chrome";
import AdminTable from "./AdminTable";

export default async function AdminPage() {
  if (!supabaseConfigured()) notFound();
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) notFound();
  const { data: me } = await supabase.from("owners").select("is_admin").eq("id", user.id).maybeSingle();
  if (!me?.is_admin) notFound();

  const { data: rows } = await supabase
    .from("businesses")
    .select("id,name,slug,is_published,is_blocked,owner_id,updated_at,city")
    .order("updated_at", { ascending: false });

  const ownerIds = [...new Set((rows || []).map((r: { owner_id: string }) => r.owner_id))];
  const { data: subs } = ownerIds.length
    ? await supabase.from("subscriptions").select("owner_id,tier,status").in("owner_id", ownerIds)
    : { data: [] as { owner_id: string; tier: string; status: string }[] };
  const { data: owners } = ownerIds.length
    ? await supabase.from("owners").select("id,email").in("id", ownerIds)
    : { data: [] as { id: string; email: string }[] };

  const tierBy = new Map((subs || []).map((s: { owner_id: string; tier: string; status: string }) => [s.owner_id, s]));
  const emailBy = new Map((owners || []).map((o: { id: string; email: string }) => [o.id, o.email]));

  const list = (rows || []).map((r: {
    id: string; name: string; slug: string; is_published: boolean; is_blocked: boolean; owner_id: string; city: string;
  }) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    city: r.city,
    published: r.is_published,
    blocked: r.is_blocked,
    email: emailBy.get(r.owner_id) || "",
    tier: tierBy.get(r.owner_id)?.tier || "basis",
    status: tierBy.get(r.owner_id)?.status || "",
  }));

  return (
    <>
      <TopBar />
      <main className="wrap" style={{ padding: "32px 0 80px" }}>
        <p className="kicker">Admin</p>
        <h1 style={{ fontSize: "2rem" }}>Betriebe</h1>
        <AdminTable rows={list} />
      </main>
    </>
  );
}
