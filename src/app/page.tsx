import Link from "next/link";
import Image from "next/image";
import { TopBar, Footer } from "@/components/Chrome";
import HeroDemo from "@/components/landing/HeroDemo";
import Reveal from "@/components/landing/Reveal";
import { getTemplates } from "@/lib/templates";
import { CONTACT, whatsappHref } from "@/lib/contact";
import { branchPhoto } from "@/lib/photos";
import { getLocale, getMessages } from "@/lib/i18n";
import s from "./landing.module.css";

export default async function Home() {
  const locale = await getLocale();
  const m = getMessages(locale);
  const templates = getTemplates(locale);

  return (
    <>
      <TopBar />
      <main className={s.page}>
        <section className={s.hero}>
          <div className={s.heroGlow} aria-hidden />
          <div className="wrap">
            <HeroDemo />
          </div>
        </section>

        <section id="so-gehts" className={s.section}>
          <div className="wrap">
            <Reveal>
              <p className={s.kicker}>{m.home.howKicker}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className={s.h2}>
                {m.home.howTitle}
                <br />
                <em>{m.home.howTitleEm}</em>
              </h2>
            </Reveal>
            <div className={s.path}>
              {m.home.steps.map(([n, title, text], i) => (
                <Reveal key={n} delay={i * 100} className={s.pathCard}>
                  <span className={s.pathNo} aria-hidden>
                    {n}
                  </span>
                  <h3>{title}</h3>
                  <p>{text}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.tight}`}>
          <div className="wrap">
            <Reveal>
              <p className={s.kicker}>{m.home.seeKicker}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className={s.h2}>
                {m.home.seeTitle}
                <br />
                <em>{m.home.seeTitleEm}</em>
              </h2>
            </Reveal>
            <div className={s.questions}>
              {m.home.questions.map(([q, a, icon], i) => (
                <Reveal key={q} delay={i * 100} className={s.qCard}>
                  <span className={s.qIcon} aria-hidden>
                    {icon}
                  </span>
                  <h3>{q}</h3>
                  <p>{a}</p>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.tight}`}>
          <div className="wrap">
            <div className={s.sectionHead}>
              <div>
                <Reveal>
                  <p className={s.kicker}>{m.home.examplesKicker}</p>
                </Reveal>
                <Reveal delay={80}>
                  <h2 className={s.h2}>{m.home.examplesTitle}</h2>
                </Reveal>
              </div>
              <Reveal delay={120}>
                <p className={s.sideNote}>{m.home.examplesNote}</p>
              </Reveal>
            </div>
            <div className={s.gallery}>
              {templates.map((t, i) => (
                <Reveal key={t.key} delay={(i % 3) * 70}>
                  <Link href={`/p/beispiel-${t.key}`} className={s.gCard}>
                    <Image
                      src={branchPhoto(t.key, 800, 1000)!}
                      alt={t.label}
                      fill
                      sizes="(max-width: 700px) 50vw, 33vw"
                      className={s.gImg}
                    />
                    <span className={s.gShade} />
                    <span className={s.gText}>
                      <b>{t.label}</b>
                      <small>
                        {t.services[0].title} · {t.services[0].price_label}
                      </small>
                    </span>
                    <span className={s.gArrow} aria-hidden>
                      ↗
                    </span>
                  </Link>
                </Reveal>
              ))}
            </div>
          </div>
        </section>

        <section id="preise" className={`${s.section} ${s.tight}`}>
          <div className="wrap">
            <Reveal>
              <p className={s.kicker}>{m.home.priceKicker}</p>
            </Reveal>
            <Reveal delay={80}>
              <h2 className={s.h2}>
                {m.home.priceTitle} <em>{m.home.priceTitleEm}</em>
              </h2>
            </Reveal>
            <div className={s.priceGrid}>
              <Reveal className={s.priceCard}>
                <p className={s.priceTag}>{m.home.priceNowTag}</p>
                <h3>{m.home.priceNowTitle}</h3>
                <p className={s.priceAmt}>{m.home.priceNowAmt}</p>
                <p>{m.home.priceNowText}</p>
                <Link href="/start" className={s.ctaDark}>
                  {m.home.priceNowCta}
                </Link>
              </Reveal>
              <Reveal delay={80} className={`${s.priceCard} ${s.priceCardHi}`}>
                <p className={s.priceTag}>{m.home.priceLiveTag}</p>
                <h3>{m.home.priceLiveTitle}</h3>
                <p className={s.priceAmt}>{m.home.priceLiveAmt}</p>
                <p>{m.home.priceLiveText}</p>
                <Link href="/preise#betreuung" className={s.ctaLight}>
                  {m.home.priceLiveCta}
                </Link>
              </Reveal>
              <Reveal delay={160} className={s.priceCard}>
                <p className={s.priceTag}>{m.home.priceUsTag}</p>
                <h3>{m.home.priceUsTitle}</h3>
                <p className={s.priceAmt}>{m.home.priceUsAmt}</p>
                <p>{m.home.priceUsText}</p>
                <Link href="/preise" className={s.ctaGhost}>
                  {m.home.priceUsCta}
                </Link>
              </Reveal>
            </div>
          </div>
        </section>

        <section className={`${s.section} ${s.tight}`}>
          <div className={`wrap ${s.faqWrap}`}>
            <div>
              <Reveal>
                <p className={s.kicker}>{m.home.faqKicker}</p>
              </Reveal>
              <Reveal delay={80}>
                <h2 className={s.h2}>{m.home.faqTitle}</h2>
              </Reveal>
            </div>
            <div className={s.faq}>
              {m.home.faq.map(([q, a]) => (
                <details key={q} className={s.faqItem}>
                  <summary>
                    {q}
                    <span aria-hidden>+</span>
                  </summary>
                  <p>{a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>

        <section className={s.final}>
          <div className={s.heroGlow} aria-hidden />
          <div className="wrap">
            <Reveal>
              <h2 className={s.finalH}>
                {m.home.finalTitle}
                <br />
                <em>{m.home.finalTitleEm}</em>
              </h2>
            </Reveal>
            <Reveal delay={100}>
              <div className={s.finalRow}>
                <Link href="/start" className={s.tryBtn}>
                  {m.home.finalCta}
                </Link>
                <a
                  href={whatsappHref(m.home.finalWhatsappMsg)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={s.ctaGhostOnDark}
                >
                  {m.home.finalWhatsapp}
                </a>
              </div>
              <p className={s.fine}>
                {m.home.finalCall} {CONTACT.phone}
              </p>
            </Reveal>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
