-- Local/schema change only. Do NOT apply from this task; Claude applies remotely.
-- Adds handled_at for admin "Erledigt" on service_requests.
-- Existing policy req_admin_upd already allows admin UPDATE.

alter table public.service_requests
  add column if not exists handled_at timestamptz null;
