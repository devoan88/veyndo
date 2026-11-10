import type { Metadata } from "next";
import { TopBar, Footer } from "@/components/Chrome";
import { getPriceList } from "@/lib/pricelist";
import { CONTACT, whatsappHref } from "@/lib/contact";
import { format, getLocale, getMessages } from "@/lib/i18n";
import s from "./preise.module.css";

export async function generateMetadata(): Promise<Metadata> {
  const locale = await getLocale();
  const m = getMessages(locale);
  return {
    title: m.meta.preiseTitle,
    description: m.meta.preiseDescription,
  };
}

export default async function PreisePage() {
  const locale = await getLocale();
  const m = getMessages(locale);
  const PRICE_LIST = getPriceList(locale);

  return (
    <>
      <TopBar />
      <main className={s.page}>
        <header className={s.head}>
          <div className="wrap">
            <p className={s.kicker}>{m.preise.kicker}</p>
            <h1 className={s.h1}>
              {m.preise.title} <em>{m.preise.titleEm}</em>
            </h1>
            <p className={s.lead}>{m.preise.lead}</p>
            <nav className={s.jump} aria-label={m.preise.jumpAria}>
              {PRICE_LIST.map((g) => (
                <a key={g.key} href={`#${g.key}`}>
                  {g.title}
                </a>
              ))}
            </nav>
          </div>
        </header>

        <div className={`wrap ${s.list}`}>
          {PRICE_LIST.map((g) => (
            <section key={g.key} id={g.key} className={s.group}>
              <div className={s.groupHead}>
                <h2>{g.title}</h2>
                <p>{g.intro}</p>
              </div>
              <ul className={s.items}>
                <li className={s.cols} aria-hidden>
                  <span>{m.preise.colService}</span>
                  <span>{m.preise.colPrice}</span>
                </li>
                {g.items.map((it) => (
                  <li key={it.name} className={s.item}>
                    <div>
                      <b>{it.name}</b>
                      <span>{it.desc}</span>
                    </div>
                    <strong className={s.price}>{it.price}</strong>
                  </li>
                ))}
              </ul>
              <a
                className={s.ask}
                href={whatsappHref(format(m.preise.askMsg, { title: g.title }))}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m.preise.ask}
              </a>
            </section>
          ))}

          <aside className={s.note}>
            <p>{m.preise.note}</p>
          </aside>
        </div>

        <section className={s.cta}>
          <div className="wrap">
            <h2>{m.preise.ctaTitle}</h2>
            <p>{m.preise.ctaText}</p>
            <div className={s.ctaRow}>
              <a
                className={s.btnLight}
                href={whatsappHref(m.preise.ctaWhatsappMsg)}
                target="_blank"
                rel="noopener noreferrer"
              >
                {m.preise.ctaWhatsapp}
              </a>
              <a className={s.btnGhost} href={CONTACT.phoneHref}>
                {m.preise.ctaCall} {CONTACT.phone}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
