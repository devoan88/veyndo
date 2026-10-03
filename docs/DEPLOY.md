# დეპლოი — მხოლოდ 29 ოქტომბრის შემდეგ (ან Upgrade-ის შემდეგ)

Netlify Free-ზე წარმოების დეპლოი ამ თვეში ამოიწურა (20×15 კრედიტი). **ახალ `--prod`-ს არ ვუშვებთ** სანამ პერიოდი **2026-10-29**-ზე არ განახლდება, ან სანამ Ani Personal/$9-ზე არ აიყვანს ანგარიშს.

არ გამოვიყენოთ draft-ის restore / alias production-ზე — ეს ბილინგის ლიმიტს უვლის გვერდს.

## ერთი ბრძანება (29 ოქტ ან Upgrade-ის შემდეგ)

ჯერ დახურე `next dev`. შემდეგ პროექტის ფოლდერიდან:

```bash
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"
bash scripts/deploy-once.sh
```

სკრიპტი: თუ `next dev` გაშვებულია — უარს ამბობს; აკოპირებს რეპოს დროებით ფოლდერში **`.env.local`-ის გარეშე**; აკეთებს **ერთ** `netlify deploy --build --prod`; ამოწმებს `/` `/start` `/preise` `/p/beispiel-friseur`; ბეჭდავს `listSiteForms`.

## ფორმა „demo-request“

დეპლოის შემდეგ Netlify Forms-ში უნდა გამოჩნდეს **demo-request** (`web/public/__forms.html`). Form detection უკვე ჩართულია (`processing_settings.ignore_html_forms=false`).

შემდეგ **Ani** (არა აგენტი):

1. Netlify → საიტი **veyndo-app** → **Forms** → **Form notifications** → **Email notification**
2. მისამართი: `anidevdariani1997@gmail.com`
3. ტელეფონიდან **ერთი** სატესტო მოთხოვნა Demo-Studio-დან (`/start` → Live schalten lassen)

შემოწმება: მეილი მოვიდა და `/admin`-ზე ჩანს Demo-Anfragen (უახლესი ზემოთ).
