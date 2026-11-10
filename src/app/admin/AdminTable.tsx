"use client";

import { useState } from "react";

type Row = {
  id: string;
  name: string;
  slug: string;
  city: string;
  published: boolean;
  blocked: boolean;
  email: string;
  tier: string;
  status: string;
};

export default function AdminTable({ rows }: { rows: Row[] }) {
  const [list, setList] = useState(rows);

  async function toggle(id: string, blocked: boolean) {
    const res = await fetch("/api/admin/block", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, blocked }),
    });
    if (!res.ok) {
      alert("Nicht erlaubt.");
      return;
    }
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, blocked } : r)));
  }

  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ padding: 8 }}>Name</th>
            <th style={{ padding: 8 }}>Slug</th>
            <th style={{ padding: 8 }}>E-Mail</th>
            <th style={{ padding: 8 }}>Plan</th>
            <th style={{ padding: 8 }}>Status</th>
            <th style={{ padding: 8 }}></th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--line)" }}>
              <td style={{ padding: 8 }}>{r.name}<div className="small muted">{r.city} · {r.published ? "online" : "entwurf"}</div></td>
              <td style={{ padding: 8 }}><a href={`/p/${r.slug}`}>{r.slug}</a></td>
              <td style={{ padding: 8 }}>{r.email}</td>
              <td style={{ padding: 8 }}>{r.tier} / {r.status}</td>
              <td style={{ padding: 8 }}>{r.blocked ? "gesperrt" : "aktiv"}</td>
              <td style={{ padding: 8 }}>
                <button className="btn ghost small" type="button" onClick={() => toggle(r.id, !r.blocked)}>
                  {r.blocked ? "Freigeben" : "Sperren"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <p className="muted">Noch keine Betriebe.</p>}
    </div>
  );
}

export function RequestsTable({
  rows,
}: {
  rows: { id: string; name: string; slug: string; message: string; created_at: string; handled_at: string | null }[];
}) {
  const [list, setList] = useState(rows);

  async function mark(id: string, handled: boolean) {
    const res = await fetch("/api/admin/request-handled", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, handled }),
    });
    if (!res.ok) {
      alert("Nicht erlaubt oder Spalte handled_at fehlt (Migration anwenden).");
      return;
    }
    const handled_at = handled ? new Date().toISOString() : null;
    setList((prev) => prev.map((r) => (r.id === id ? { ...r, handled_at } : r)));
  }
  return (
    <div className="card" style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
        <thead>
          <tr style={{ textAlign: "left" }}>
            <th style={{ padding: 8 }}>Betrieb</th>
            <th style={{ padding: 8 }}>Nachricht</th>
            <th style={{ padding: 8 }}>Wann</th>
            <th style={{ padding: 8 }}></th>
            <th style={{ padding: 8 }}>Erledigt</th>
          </tr>
        </thead>
        <tbody>
          {list.map((r) => (
            <tr key={r.id} style={{ borderTop: "1px solid var(--line)" }}>
              <td style={{ padding: 8 }}>
                <b>{r.name}</b>
                <div className="small muted">{r.slug || "kein Slug"}</div>
              </td>
              <td style={{ padding: 8, whiteSpace: "pre-wrap", maxWidth: 420 }}>{r.message}</td>
              <td style={{ padding: 8, whiteSpace: "nowrap" }}>{new Date(r.created_at).toLocaleString("de-AT")}</td>
              <td style={{ padding: 8 }}>
                {r.slug ? <a className="btn ghost small" href={`/p/${r.slug}`}>Vorschau ansehen</a> : "—"}
              </td>
              <td style={{ padding: 8 }}>
                <button className="btn ghost small" type="button" onClick={() => mark(r.id, !r.handled_at)}>
                  {r.handled_at ? "Offen setzen" : "Erledigt"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      {!list.length && <p className="muted">Noch keine Anfragen.</p>}
    </div>
  );
}
