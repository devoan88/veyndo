# Stripe: პროდუქტები და ფასები (ავსტრია)

ეს Stripe-ის პანელში შექმნის გეგმაა. ანგარიშს შენ გახსნი, პროდუქტებს კი ამ სიის მიხედვით ერთად შევქმნით.

## პროდუქტები

| Stripe-ის პროდუქტი | ფასის ID (lookup key) | ფასი | ინტერვალი | საცდელი |
|---|---|---|---|---|
| Veyndo Profil | `profil_monthly` | €9,00 | თვე | 14 დღე |
| Veyndo Profil | `profil_yearly` | €90,00 | წელი | 14 დღე |
| Veyndo Pro | `pro_monthly` | €19,00 | თვე | 14 დღე |
| Veyndo Pro | `pro_yearly` | €190,00 | წელი | 14 დღე |

Basis უფასოა და Stripe-ში საერთოდ არ ჩანს.

## გადახდის მეთოდები (ჩასართავი Stripe-ში)

ბარათი, Apple Pay, Google Pay, **EPS** (ავსტრიული ბანკები), SEPA Direct Debit.

## როგორ მუშაობს აპში

1. კლიენტი აჭერს „Abo starten“ → სერვერი ქმნის **Stripe Checkout Session**-ს → კლიენტი Stripe-ის გვერდზე იხდის.
2. Stripe აგზავნის **webhook**-ს ჩვენს სერვერზე: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`.
3. webhook წერს `subscriptions` ცხრილში (ტარიფი, სტატუსი, პერიოდის ბოლო). ბრაუზერს ამ ცხრილში ჩაწერა არ შეუძლია.
4. ინვოისებს, ბარათის შეცვლას და გაუქმებას კლიენტი **Stripe Customer Portal**-ში აკეთებს: ღილაკი „Rechnungen und Zahlung“ ანგარიშის გვერდზე.

ბარათის მონაცემები ჩვენს სერვერს არასდროს ეხება.

## დღგ

- **Kleinunternehmer** (წლიური ბრუნვა €55.000-მდე): დღგ არ ემატება, ინვოისზე წერია „Umsatzsteuerbefreit – Kleinunternehmer gem. § 6 Abs. 1 Z 27 UStG“.
- ზღვრის გადაჭარბებისას ჩავრთავთ **Stripe Tax**-ს. ის ავსტრიის 20% დღგ-ს ავტომატურად დაითვლის.
- ტექსტი ბუღალტერთან ან WKO-სთან შეამოწმე.

## საკომისიო (ორიენტირი)

ევროპული ბარათები ~1,5% + €0,25 გადახდაზე, Stripe Billing +0,7%. €9-იან გამოწერაზე ~€0,45 თვეში.
