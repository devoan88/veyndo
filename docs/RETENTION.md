# Datenaufbewahrung (Retention)

Automatisch (nach Apply der Migration): `service_requests` und `events` höchstens 12 Monate.  
Nicht automatisch: Storage-Dateien, Netlify Forms, anonyme Demos (siehe Vorschlag unten).

## Was die Funktion löscht

Täglich 03:15 UTC, `public.retention_cleanup()`:

- `service_requests` mit `handled_at` älter als 12 Monate
- `service_requests` ohne `handled_at`, wenn `created_at` älter als 12 Monate
- `events` mit `created_at` älter als 12 Monate

Nicht angefasst: `businesses` (auch unveröffentlicht), Owner, Admin, Storage.

## Anwenden (du, SQL Editor)

Datei: `supabase/migrations/20261005_retention_cleanup.sql`

1. Zuerst nur die PREVIEW-Abfrage (Datei-Kopf, nur Counts).
2. Wenn die Zahlen stimmen: ganze Datei in Supabase → SQL Editor einfügen → **Run**.
3. Remote-Apply macht der Agent in diesem Task **nicht**.

### PREVIEW (nur zählen)

```sql
select
  (select count(*) from public.service_requests
    where handled_at < now() - interval '12 months') as requests_handled_old,
  (select count(*) from public.service_requests
    where handled_at is null and created_at < now() - interval '12 months') as requests_unhandled_old,
  (select count(*) from public.events
    where created_at < now() - interval '12 months') as events_old;
```

### Prüfen

```sql
select * from cron.job;
select * from cron.job_run_details order by start_time desc limit 5;
```

### Rückgängig (Job aus, Funktion bleibt)

```sql
select cron.unschedule('veyndo-retention');
```

## Netlify Forms

Einträge von `demo-request` liegen **nicht** in Postgres. SQL löscht sie nicht. Nach 12 Monaten: Netlify → Forms → **demo-request** → manuell löschen.

## Vorschlag — anonyme Demos nach 12 Monaten (noch nicht gebaut)

Ziel: unveröffentlichte Demos anonymer Nutzerinnen nach 12 Monaten Inaktivität löschen. **Kein Delete-Code in diesem Task.**

### Was zusammenhängt

- Demo-Studio: `signInAnonymously()` → Zeile in `auth.users` (`is_anonymous`).
- Trigger `on_auth_user_created` legt `owners` + `subscriptions` an.
- Genau ein `businesses`-Datensatz pro Owner (`owner_id unique`). Fotos: Tabelle `photos` + Dateien im Bucket `photos` unter `{business_id}/…`, Cover-Pfad `businesses.cover_path`.

### FK (ON DELETE CASCADE)

`auth.users` → `owners` → `businesses` → `services`, `opening_hours`, `photos` (Zeilen), `events`.  
`owners` → `subscriptions`, `service_requests`.

SQL-Cascade löscht **keine** Objekte in `storage.objects`. Dateien im Bucket `photos` bleiben als Leichen liegen, bis jemand Storage extra räumt (API `storage.from('photos').remove` oder Dashboard).

### Was später gelöscht werden dürfte

Nur wenn **alle** gelten:

1. `auth.users.is_anonymous = true`
2. Inaktivität 12 Monate — sinnvoll: `last_sign_in_at` (sonst `created_at` / `businesses.updated_at`) `[OFFEN: welche Uhr]`
3. zugehöriges `businesses.is_published = false` (sonst **nicht** löschen)
4. `owners.is_admin = false` (Admin-Konto **nicht** löschen)

Dann: User in Auth löschen (cascade auf Postgres-Zeilen) **und** Storage-Pfade extra.

### Risiken

- Veröffentlichtes Profil oder Admin darf nie mitgelöscht werden.
- Falsche Inaktivitäts-Spalte löscht zu früh (jemand kommt nach Monaten zurück).
- Storage-Leichen kosten und bleiben öffentlich, solange die URL bekannt ist.
- `service_requests` des anonymen Users gingen mit dem User mit — parallel zur 12-Monats-Regel für Anfragen.
