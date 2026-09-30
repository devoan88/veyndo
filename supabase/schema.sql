-- Veyndo App · database schema (Supabase / Postgres), v1
-- Region: eu-central-1 (Frankfurt). Row Level Security is ON for every table.

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------
-- Types
-- ---------------------------------------------------------------
create type plan_tier as enum ('basis', 'profil', 'pro');
create type sub_status as enum ('trialing', 'active', 'past_due', 'canceled', 'incomplete');
create type event_kind as enum ('view', 'call', 'whatsapp', 'route', 'qr');

-- ---------------------------------------------------------------
-- Owners (one row per signed-in user, linked to auth.users)
-- ---------------------------------------------------------------
create table owners (
  id            uuid primary key references auth.users(id) on delete cascade,
  email         text not null,
  full_name     text,
  is_admin      boolean not null default false,
  stripe_customer_id text unique,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Businesses (v1: exactly one per owner)
-- ---------------------------------------------------------------
create table businesses (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null unique references owners(id) on delete cascade,
  slug          text not null unique
                check (slug ~ '^[a-z0-9](?:[a-z0-9-]{1,38}[a-z0-9])$'),
  previous_slug text,
  slug_changed_at timestamptz,
  template_key  text not null,               -- e.g. 'nagelstudio'
  name          text not null check (char_length(name) between 2 and 80),
  tagline       text check (char_length(tagline) <= 120),
  about         text check (char_length(about) <= 600),
  street        text,
  postal_code   text,
  city          text not null default 'Wien',
  district      text,                        -- e.g. '1070'
  phone         text,
  whatsapp      text,
  email         text,
  website       text,
  instagram     text,
  facebook      text,
  maps_url      text,
  accent_color  text not null default '#3d4a3a' check (accent_color ~ '^#[0-9a-fA-F]{6}$'),
  cover_path    text,                        -- storage path in bucket 'photos'
  -- Impressum (required in Austria, filled by the owner)
  legal_name    text,
  legal_form    text,
  uid_number    text,
  trade_authority text,
  is_published  boolean not null default false,
  is_blocked    boolean not null default false,  -- set by admin
  created_at    timestamptz not null default now(),
  updated_at    timestamptz not null default now()
);

create table reserved_slugs (slug text primary key);
insert into reserved_slugs(slug) values
  ('app'),('www'),('admin'),('api'),('mail'),('veyndo'),('hilfe'),
  ('support'),('login'),('status'),('blog'),('impressum'),('datenschutz'),('agb');

create or replace function check_reserved_slug() returns trigger language plpgsql as $$
begin
  if exists (select 1 from reserved_slugs r where r.slug = new.slug) then
    raise exception 'slug % is reserved', new.slug;
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger businesses_slug_guard before insert or update on businesses
  for each row execute function check_reserved_slug();

-- ---------------------------------------------------------------
-- Services (price list)
-- ---------------------------------------------------------------
create table services (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  position      int  not null default 0,
  title         text not null check (char_length(title) between 1 and 80),
  price_label   text check (char_length(price_label) <= 30),   -- '€ 29', 'ab € 60', 'kostenlos'
  duration_min  int check (duration_min between 5 and 600),
  description   text check (char_length(description) <= 200)
);
create index on services(business_id, position);

-- ---------------------------------------------------------------
-- Opening hours (weekday 1 = Monday … 7 = Sunday)
-- ---------------------------------------------------------------
create table opening_hours (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  weekday       smallint not null check (weekday between 1 and 7),
  opens         time,
  closes        time,
  closed        boolean not null default false,
  note          text check (char_length(note) <= 60)          -- 'nach Vereinbarung'
);
create index on opening_hours(business_id, weekday);

-- ---------------------------------------------------------------
-- Photos (files live in storage bucket 'photos')
-- ---------------------------------------------------------------
create table photos (
  id            uuid primary key default gen_random_uuid(),
  business_id   uuid not null references businesses(id) on delete cascade,
  path          text not null,
  alt           text check (char_length(alt) <= 120),
  position      int not null default 0,
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Subscriptions (written ONLY by the Stripe webhook, never by the browser)
-- ---------------------------------------------------------------
create table subscriptions (
  id                     uuid primary key default gen_random_uuid(),
  owner_id               uuid not null references owners(id) on delete cascade,
  stripe_subscription_id text unique,
  tier                   plan_tier not null default 'basis',
  status                 sub_status not null default 'active',
  interval               text check (interval in ('month','year')),
  current_period_end     timestamptz,
  cancel_at_period_end   boolean not null default false,
  updated_at             timestamptz not null default now()
);
create unique index subscriptions_one_per_owner on subscriptions(owner_id);

-- Effective tier for an owner (falls back to 'basis')
create or replace function owner_tier(o uuid) returns plan_tier
language sql stable security definer set search_path = public as $$
  select coalesce(
    (select tier from subscriptions
      where owner_id = o and status in ('active','trialing','past_due')),
    'basis'::plan_tier)
$$;

-- ---------------------------------------------------------------
-- Analytics events (anonymous: no IP, no cookies)
-- ---------------------------------------------------------------
create table events (
  id            bigint generated always as identity primary key,
  business_id   uuid not null references businesses(id) on delete cascade,
  kind          event_kind not null,
  created_at    timestamptz not null default now()
);
create index on events(business_id, created_at);

-- ---------------------------------------------------------------
-- "Veyndo erledigt es für Sie" requests (done-for-you upsell)
-- ---------------------------------------------------------------
create table service_requests (
  id            uuid primary key default gen_random_uuid(),
  owner_id      uuid not null references owners(id) on delete cascade,
  topic         text not null,       -- 'website', 'google', 'ads', 'other'
  message       text check (char_length(message) <= 1000),
  status        text not null default 'new' check (status in ('new','contacted','won','lost')),
  created_at    timestamptz not null default now()
);

-- ---------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------
alter table owners           enable row level security;
alter table businesses       enable row level security;
alter table services         enable row level security;
alter table opening_hours    enable row level security;
alter table photos           enable row level security;
alter table subscriptions    enable row level security;
alter table events           enable row level security;
alter table service_requests enable row level security;
alter table reserved_slugs   enable row level security;

-- helper functions are SECURITY DEFINER so policies can call them without recursing into RLS
create or replace function is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select is_admin from owners where id = auth.uid()), false)
$$;

-- owners: see / edit only yourself
create policy owners_self on owners for select using (id = auth.uid() or is_admin());
create policy owners_self_upd on owners for update using (id = auth.uid()) with check (id = auth.uid());

-- owners may not promote themselves: is_admin and stripe_customer_id only change via service role
create or replace function protect_owner_fields() returns trigger language plpgsql as $$
begin
  if current_setting('request.jwt.claim.role', true) is distinct from 'service_role' then
    new.is_admin := old.is_admin;
    new.stripe_customer_id := old.stripe_customer_id;
  end if;
  return new;
end $$;
create trigger owners_protect before update on owners
  for each row execute function protect_owner_fields();

-- businesses: public can read published, unblocked profiles; owner manages own
create policy biz_public_read on businesses for select
  using ((is_published and not is_blocked) or owner_id = auth.uid() or is_admin());
create policy biz_owner_ins on businesses for insert with check (owner_id = auth.uid());
create policy biz_owner_upd on businesses for update using (owner_id = auth.uid())
  with check (owner_id = auth.uid() and is_blocked = false);
create policy biz_admin_upd on businesses for update using (is_admin());
create policy biz_owner_del on businesses for delete using (owner_id = auth.uid());

-- child tables: readable if the parent business is readable; writable by its owner
create or replace function owns_business(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from businesses where id = b and owner_id = auth.uid())
$$;
create or replace function business_is_public(b uuid) returns boolean
language sql stable security definer set search_path = public as $$
  select exists (select 1 from businesses where id = b and is_published and not is_blocked)
$$;

create policy svc_read on services for select using (business_is_public(business_id) or owns_business(business_id) or is_admin());
create policy svc_write on services for all using (owns_business(business_id)) with check (owns_business(business_id));

create policy hours_read on opening_hours for select using (business_is_public(business_id) or owns_business(business_id) or is_admin());
create policy hours_write on opening_hours for all using (owns_business(business_id)) with check (owns_business(business_id));

create policy photos_read on photos for select using (business_is_public(business_id) or owns_business(business_id) or is_admin());
create policy photos_write on photos for all using (owns_business(business_id)) with check (owns_business(business_id));

-- subscriptions: owner can read own; nobody writes from the browser (service role only)
create policy subs_read on subscriptions for select using (owner_id = auth.uid() or is_admin());

-- events: anyone may insert for a public business; only owner/admin read
create policy events_insert on events for insert with check (business_is_public(business_id));
create policy events_read on events for select using (owns_business(business_id) or is_admin());

-- service requests
create policy req_insert on service_requests for insert with check (owner_id = auth.uid());
create policy req_read on service_requests for select using (owner_id = auth.uid() or is_admin());
create policy req_admin_upd on service_requests for update using (is_admin());

create policy reserved_read on reserved_slugs for select using (true);

-- ---------------------------------------------------------------
-- Storage: bucket 'photos' (public read, owner write under own folder)
-- Path convention: {business_id}/{uuid}.jpg
-- ---------------------------------------------------------------
insert into storage.buckets (id, name, public) values ('photos', 'photos', true)
  on conflict (id) do nothing;

create policy photos_bucket_write on storage.objects for insert to authenticated
  with check (bucket_id = 'photos' and owns_business(((storage.foldername(name))[1])::uuid));
create policy photos_bucket_delete on storage.objects for delete to authenticated
  using (bucket_id = 'photos' and owns_business(((storage.foldername(name))[1])::uuid));

-- ---------------------------------------------------------------
-- New auth user → owners row
-- ---------------------------------------------------------------
create or replace function handle_new_user() returns trigger
language plpgsql security definer set search_path = public as $$
begin
  insert into owners(id, email) values (new.id, new.email);
  insert into subscriptions(owner_id, tier, status) values (new.id, 'basis', 'active');
  return new;
end $$;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function handle_new_user();
