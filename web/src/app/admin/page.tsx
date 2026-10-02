import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { supabaseConfigured } from "@/lib/env";
import { TopBar } from "@/components/Chrome";
import AdminTable, { RequestsTable } from "./AdminTable";

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

  const { data: reqs } = await supabase
    .from("service_requests")
    .select("id,owner_id,message,created_at")
    .order("created_at", { ascending: false });

  const bizByOwner = new Map((rows || []).map((r: { owner_id: string; name: string; slug: string }) => [r.owner_id, r]));
  const requests = (reqs || []).map((r: { id: string; owner_id: string; message: string | null; created_at: string }) => ({
    id: r.id,
    name: bizByOwner.get(r.owner_id)?.name || "—",
    slug: bizByOwner.get(r.owner_id)?.slug || "",
    message: r.message || "",
    created_at: r.created_at,
  }));

  return (
    <>
      <TopBar />
      <main className="wrap" style={{ padding: "32px 0 80px" }}>
        <p className="kicker">Admin</p>
        <h1 style={{ fontSize: "2rem" }}>Betriebe</h1>
        <AdminTable rows={list} />

        <h2 style={{ fontSize: "1.5rem", marginTop: 48 }}>Demo-Anfragen</h2>
        <p className="muted">„Live schalten lassen“ aus dem Demo-Studio, neueste zuerst.</p>
        <RequestsTable rows={requests} />
      </main>
    </>
  );
}
