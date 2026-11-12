# NOTES — საირა / Cyra (`veyndo-ge-v2`)

Static KA+EN studio site. No German. Branch work: `feature/cyra-next`.

## Done (owner checklist)
- Brand: **საირა / Cyra** throughout; domain config `https://cyra.ge` (not purchased yet)
- Palette Variant 1 kept: bg `#F7F3EC`, text `#2B2A28`, terracotta `#C8553D`, olive `#5C6B3A`; dark = dark brown `#241C18`
- WCAG AA: muted `#5A554C` (~6.7:1 on paper). Primary button fill uses `--accent-btn: #B84A34` (white text ~5.16:1); terracotta `#C8553D` kept for accents (white-on-`#C8553D` was ~4.35:1, below AA)
- Contact phone/WhatsApp: `+995 555 690 945` with `tel:+995555690945` and `https://wa.me/995555690945`
- Prices remain `[TODO: რეალური ფასი]`; price table `table-layout: fixed` + wrap (no invented numbers)
- Automation: general capability copy (form→email, invoice template, booking reminder); one `[TODO: რეალური ინტეგრაცია]` — no claimed live integrations
- Pronunciation button `🔊 საირა` under H1; stays `hidden` until `assets/audio/cyra.mp3` exists (HEAD check)
- Contact form: honeypot + name / email-or-phone / message validation; placeholder submit (`action="#"`) — no Netlify Forms yet
- SEO: Georgian titles/descriptions with საირა; `sitemap.xml` + `robots.txt` → `https://cyra.ge` only
- Mobile 375/768: `scrollWidth === clientWidth` on all pages; nav + KA/EN + dark mode on all pages
- KA first, EN via `data-en`; Konturi / კონტური removed from site copy

## TODOs (owner)
- [ ] Buy/register `cyra.ge` + DNS
- [ ] Contact email (replace `[TODO: contact email]`)
- [ ] Tbilisi address + map embed
- [ ] Real prices
- [ ] Real portfolio items
- [ ] Add `assets/audio/cyra.mp3` for pronunciation
- [ ] Wire form delivery (email / Telegram) when ready — confirm before Netlify Forms
- [ ] Legal review of privacy/terms
- [ ] Confirm merge/deploy when ready

## Owner decisions recorded
- Brand: საირა / Cyra
- Domain intent: cyra.ge (not bought yet)
- Phone/WhatsApp: +995 555 690 945

## Local preview
```bash
cd veyndo-ge-v2 && python3 -m http.server 8765 --bind 127.0.0.1
```
