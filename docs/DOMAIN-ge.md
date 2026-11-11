# დომენი veyndo.ge — ქართული ზედაპირი

პროდუქტი ახლა **ქართულზეა** მიმართული (`lang=ka`, მეტა/OG `ka_GE`, პროფილის დომენი `veyndo.ge`).

## 0) ჯერ დომენი უნდა იყიდო

`veyndo.ge` nic.ge WHOIS-ზე **არ ჩანს** (`No match` / NXDOMAIN) — ანუ რეგისტრირებული არაა.  
აგენტს რეგისტრატორზე გადახდა/ანგარიში არ აქვს; იყიდე `.ge` აკრედიტებულ რეგისტრატორთან (მაგ. [proservice.ge](https://www.proservice.ge/), ან სხვა nic.ge reseller), შემდეგ:

## DNS (რეგისტრატორზე — ყიდვის შემდეგ)

Netlify-ზე უკვე მიმაგრებულია: `veyndo.ge` (primary) + `www.veyndo.ge` (+ ძველი `veyndo.at` aliases).  
Netlify DNS zone შექმნილია — **რეგისტრატორზე nameserver-ები შეცვალე** ამაზე:

```
dns1.p06.nsone.net
dns2.p06.nsone.net
dns3.p06.nsone.net
dns4.p06.nsone.net
```

ალტერნატივა (NS-ის გარეშე): **A** `@` → `75.2.60.5`, **CNAME** `www` → `veyndo-app.netlify.app`.

SSL Netlify-ზე თავისით მოვა DNS გავრცელების შემდეგ (ხშირად 5–60 წთ).

## Env

Netlify / `.env.local`:

```
NEXT_PUBLIC_SITE_URL=https://veyndo.ge
NEXT_PUBLIC_PROFILE_DOMAIN=veyndo.ge
```

## შენიშვნა

იურიდიული მისამართი იმპრესუმში ჯერ კიდევ ვენაშია (Ani Devdariani, ავსტრია) — ეს ფაქტია; ტექსტები ქართულადაა. საქართველოს საბაზრო იურიდიული ტექსტები საჭიროებისამებრ უნდა განახლდეს ადვოკატთან.
