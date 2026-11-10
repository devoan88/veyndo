import type { Metadata } from "next";
import { TopBar, Footer } from "@/components/Chrome";
import { DEFAULT_LOCALE, getMessages } from "@/lib/i18n";
import s from "../legal.module.css";

const m = getMessages(DEFAULT_LOCALE);

export const metadata: Metadata = {
  title: m.meta.impressumTitle,
  description: m.meta.impressumDescription,
  robots: { index: true, follow: true },
};

export default function ImpressumPage() {
  const i = m.impressum;
  return (
    <>
      <TopBar />
      <main className={`wrap ${s.page}`}>
        <header className={s.head}>
          <p className={s.kicker}>{i.kicker}</p>
          <h1 className={s.h1}>{i.title}</h1>
          <p className={s.lead}>{i.lead}</p>
        </header>
        <article className={s.body}>
          <h2>{i.ownerH}</h2>
          <p>
            ანი დევდარიანი
            <br />
            {i.soleTrader}
            <br />
            Dieselgasse 10/1/30
            <br />
            1100 ვენა, ავსტრია
          </p>
          <p>
            {i.phone} <a href="tel:+436644390540">+43 664 4390540</a>
            <br />
            {i.email} <a href="mailto:anidevdariani1997@gmail.com">anidevdariani1997@gmail.com</a>
          </p>

          <h2>{i.subjectH}</h2>
          <p>{i.subject}</p>

          <h2>{i.tradeH}</h2>
          <p>
            <span className={s.offen}>{i.tradeOpen}</span>
            <br />
            {i.tradeAuth}
          </p>

          <h2>{i.chamberH}</h2>
          <p>
            {i.chamber}
            <br />
            {i.law}{" "}
            <a href="https://www.ris.bka.gv.at" rel="noopener noreferrer">
              www.ris.bka.gv.at
            </a>
            .
          </p>

          <h2>{i.vatH}</h2>
          <p>{i.vat}</p>

          <h2>{i.mediaH}</h2>
          <p>{i.media}</p>

          <h2>{i.disputeH}</h2>
          <p>{i.dispute}</p>
        </article>
      </main>
      <Footer />
    </>
  );
}
