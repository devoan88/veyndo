# Veyndo

**DE.** Veyndo ist ein Demo-Studio und eine öffentliche Preisliste für kleine Betriebe in Österreich. Besucherinnen bauen ohne Konto eine unveröffentlichte Demo. Veröffentlichen kann nur die Administration.

**EN.** Veyndo is a demo studio and public price list for small businesses in Austria. Visitors build an unpublished demo without an account. Only admin can publish.

Live: https://veyndo.at  
Fallback while DNS is pending: https://veyndo-app.netlify.app

## Stack

Next.js 15 (App Router) · TypeScript · React 19 · Supabase (Auth, Postgres, Storage, RLS) · Stripe **test mode** · Netlify

## Local

```bash
export PATH="$HOME/.local/node/bin:$PATH"
cd web && npm run dev
```

Do not commit `.env.local`. Never put `service_role` or live Stripe keys in the client.
