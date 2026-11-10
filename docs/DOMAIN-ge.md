# დომენი veyndo.ge — ქართული ზედაპირი

პროდუქტი ახლა **ქართულზეა** მიმართული (`lang=ka`, მეტა/OG `ka_GE`, პროფილის დომენი `veyndo.ge`).

## DNS (როცა დომენი თქვენია)

Netlify საიტზე **veyndo-app** დაამატეთ კასტომ დომენი `veyndo.ge` / `www.veyndo.ge`, შემდეგ DNS-ში:

- **A** `@` → Netlify load balancer IP (ხშირად `75.2.60.5` — შეამოწმეთ Netlify UI)
- **CNAME** `www` → `veyndo-app.netlify.app`

SSL Netlify-ზე თავისით მოვა DNS გავრცელების შემდეგ.

## Env

Netlify / `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://veyndo.ge
NEXT_PUBLIC_PROFILE_DOMAIN=veyndo.ge
```

## შენიშვნა

იურიდიული მისამართი იმპრესუმში ჯერ კიდევ ვენაშია (Ani Devdariani, ავსტრია) — ეს ფაქტია; ტექსტები ქართულადაა. საქართველოს საბაზრო იურიდიული ტექსტები საჭიროებისამებრ უნდა განახლდეს ადვოკატთან.
