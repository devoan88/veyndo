-- PREVIEW (read-only, no delete). Run this in the SQL Editor first:
--
-- select
--   (select count(*) from public.service_requests
--     where handled_at < now() - interval '12 months') as requests_handled_old,
--   (select count(*) from public.service_requests
--     where handled_at is null and created_at < now() - interval '12 months') as requests_unhandled_old,
--   (select count(*) from public.events
--     where created_at < now() - interval '12 months') as events_old;

-- Daily cleanup so Datenschutz (max. 12 months) holds.
-- Does not touch businesses, owners, or Storage.

create or replace function public.retention_cleanup()
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  n_req_handled int := 0;
  n_req_open int := 0;
  n_events int := 0;
begin
  delete from public.service_requests
  where handled_at < now() - interval '12 months';
  get diagnostics n_req_handled = row_count;

  delete from public.service_requests
  where handled_at is null
    and created_at < now() - interval '12 months';
  get diagnostics n_req_open = row_count;

  delete from public.events
  where created_at < now() - interval '12 months';
  get diagnostics n_events = row_count;

  return jsonb_build_object(
    'service_requests_handled', n_req_handled,
    'service_requests_unhandled', n_req_open,
    'events', n_events
  );
end;
$$;

revoke all on function public.retention_cleanup() from public, anon, authenticated;

create extension if not exists pg_cron with schema extensions;

select cron.unschedule(jobid)
from cron.job
where jobname = 'veyndo-retention';

select cron.schedule(
  'veyndo-retention',
  '15 3 * * *',
  $$select public.retention_cleanup()$$
);
