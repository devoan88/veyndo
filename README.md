# ვეინდო / Veyndo

ქართული პროდუქტი მცირე ბიზნესებისთვის (**veyndo.ge**): დემო-სტუდია და საჯარო ფასების სია. ვიზიტორები ანგარიშის გარეშე აშენებენ გამოუქვეყნებელ დემოს. გამოქვეყნება მხოლოდ ადმინს შეუძლია.

**UI ენა:** ქართული (`ka`) — ნაგულისხმევი ყველგან (ლოკალური გადახედვაც). ლოგოში/URL-ში ბრენდი რჩება **Veyndo**; ტექსტში ბუნებრივად **ვეინდო**.

Live (როცა DNS მზად იქნება): https://veyndo.ge  
Fallback: https://veyndo-app.netlify.app

## Stack

Next.js 15 (App Router) · TypeScript · React 19 · Supabase (Auth, Postgres, Storage, RLS) · Stripe **test mode** · Netlify

## Local

```bash
export PATH="$HOME/.local/node/bin:$PATH"
npm run dev
```

გახსენით http://localhost:3000 — ინტერფეისი ქართულია (`lang=ka`).

Do not commit `.env.local`. Never put `service_role` or live Stripe keys in the client.

ოფციონალური env:

- `NEXT_PUBLIC_SITE_URL=https://veyndo.ge`
- `NEXT_PUBLIC_PROFILE_DOMAIN=veyndo.ge`
