# Datenaufbewahrung (Retention)

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
