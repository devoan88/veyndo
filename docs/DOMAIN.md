# დომენი veyndo.at — რა უნდა გააკეთო CloudPit-ის მეილის შემდეგ

easyname-მა დომენი უკვე გადაიხადე (Bestellung **20261003-sbs8z**). სანამ nic.at-ზე „Prüfung“ არ დამთავრდება, `veyndo.at` რეესტრში არ ჩანს და DNS-ს აქედან ვერ დავაყენებთ.

## როცა CloudPit-ის ელფოსტა მოვა

1. შედი [CloudPit](https://cloudpit.easyname.com/) იმ მომხმარებლით, რომელიც მეილში წერია.
2. **Domains** → **veyndo.at** → **DNS**.
3. დააყენე მხოლოდ ეს (MX **არ** წაშალო):
   - **A** სახელი `@` → `75.2.60.5`
   - **CNAME** სახელი `www` → `veyndo-app.netlify.app`
4. შეინახე. SSL Netlify-ზე თავისით მოვა, როცა DNS გავრცელდება (ხშირად 5–60 წუთი).
5. ტერმინალში პროექტის ფოლდერიდან გაუშვი:

```bash
export PATH="$HOME/.local/node/bin:$HOME/.local/bin:$PATH"
bash scripts/check-domain.sh
```

წარმატება: `registered: yes`, A არის `75.2.60.5`, www CNAME არის `veyndo-app.netlify.app`, HTTPS არის **200** (ან 301/308 www-დან).

## თუ სამშაბათს 6 ოქტომბერს CloudPit-ის მეილი ჯერ არ არის

თვითონ დაწერე **support@easyname.com**-ზე (მე არ გავგზავნი). სამი ხაზი:

```
Betreff: Bestellung 20261003-sbs8z — CloudPit-Zugang / Domain veyndo.at

Guten Tag, ich habe am 3.10.2026 die Domain veyndo.at bestellt (Bestellnr. 20261003-sbs8z, Ani Devdariani). Die CloudPit-Zugangsmail ist noch nicht angekommen. Bitte Prüfung abschließen und mir den Login senden.

Freundliche Grüße
Ani Devdariani
```
