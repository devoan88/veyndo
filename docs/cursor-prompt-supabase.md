# Cursor prompt: connect Supabase (week 4)

Run this only after the Supabase project exists and `web/.env.local` contains:

```
NEXT_PUBLIC_SUPABASE_URL=...
NEXT_PUBLIC_SUPABASE_ANON_KEY=...
```

(Both values are in Supabase → Project Settings → API. Never put the `service_role` key in this file.)

---

**Prompt to paste into Cursor (Agent mode), opened in the `veyndo-app` folder:**

> You are working in `veyndo-app/web`, a Next.js 15 App Router app (TypeScript, no Tailwind, plain CSS in `src/app/globals.css`). Read `docs/spec.md`, `supabase/schema.sql` and `README.md` first.
>
> Today all data lives in the browser: `src/lib/store.ts` exposes `loadBusiness`, `saveBusiness`, `clearBusiness`, `newBusiness`, `fromTemplate`, `newServiceId`. Pages `/start`, `/editor`, `/dashboard`, `/p/[slug]` only use these functions. Replace the storage with Supabase without changing the UI:
>
> 1. Install `@supabase/supabase-js` and `@supabase/ssr`. Create `src/lib/supabase/client.ts` (browser) and `src/lib/supabase/server.ts` (server, cookies) per the official @supabase/ssr Next.js guide, plus `src/middleware.ts` that refreshes the session.
> 2. Add `/login`: e-mail magic link (`signInWithOtp`, redirect to `/auth/callback`) and `/auth/callback/route.ts` that exchanges the code and redirects to `/dashboard`. German UI text, same CSS classes as the other pages (`card`, `field`, `btn`).
> 3. Protect `/editor` and `/dashboard`: not logged in → redirect to `/login`. `/start` may be used logged out; on "Profil erstellen" keep the draft in localStorage, send the user to `/login`, and after login insert the draft into Supabase once, then clear localStorage.
> 4. Rewrite `store.ts` as async functions with the same names (`loadBusiness(): Promise<Business|null>` etc.) mapping `Business` ⇄ tables `businesses`, `services` (ordered by `position`), `opening_hours`. The tier comes from `subscriptions` (read only; the client must never write it). Update the call sites to await.
> 5. Title photo: upload to storage bucket `photos` at `{business_id}/cover.jpg` instead of storing a data URL; keep the client-side resize in the editor.
> 6. `/p/[slug]`: make it a server component that loads the business with the anon key (RLS only returns published, non-blocked rows) and returns `notFound()` otherwise. Keep the `beispiel-<branche>` demo profiles. Add `generateMetadata` (title = name · tagline, description = about) and LocalBusiness JSON-LD.
> 7. Slug: check availability live in the editor (debounced select on `businesses.slug`), show "Adresse ist schon vergeben".
> 8. Do not touch Stripe yet. Do not change `supabase/schema.sql` unless a query fails; if so, explain the change.
> 9. Run `npm run build` and fix all errors. Summarise what changed and what I must configure in the Supabase dashboard (Auth → URL configuration: Site URL and redirect `http://localhost:3000/auth/callback`).

---

## What only Ani can do (no tool can do it for her)

1. **Supabase account** → supabase.com, sign in with GitHub or Google, *New project*, name `veyndo`, region **Frankfurt (eu-central-1)**, save the database password in a password manager.
2. In the project: **SQL Editor** → paste all of `supabase/schema.sql` → *Run*.
3. Copy URL and anon key (Project Settings → API) into `web/.env.local`.
4. Then open Cursor and paste the prompt above.

Later (week 5–6): Stripe account (needs Gewerbe / UID), domain `veyndo.at`.
