import type { Metadata } from "next";
import Link from "next/link";
import { TopBar, Footer } from "@/components/Chrome";
import { DEFAULT_LOCALE, format, getMessages, profileDomainFor } from "@/lib/i18n";
import s from "../legal.module.css";

const m = getMessages(DEFAULT_LOCALE);
const domain = profileDomainFor();

export const metadata: Metadata = {
  title: m.meta.datenschutzTitle,
  description: m.meta.datenschutzDescription,
  robots: { index: true, follow: true },
};

export default function DatenschutzPage() {
  const d = m.datenschutz;
  return (
    <>
      <TopBar />
      <main className={`wrap ${s.page}`}>
        <header className={s.head}>
          <p className={s.kicker}>{d.kicker}</p>
          <h1 className={s.h1}>{d.title}</h1>
          <p className={s.lead}>{format(d.lead, { domain })}</p>
        </header>
        <article className={s.body}>
          {d.sections.map((sec) => (
            <section key={sec.h}>
              <h2>{sec.h}</h2>
              <p>
                {sec.h.startsWith("1.") ? (
                  <>
                    ანი დევდარიანი, ინდივიდუალური მეწარმე, Dieselgasse 10/1/30, 1100 ვენა, ავსტრია.
                    ტელეფონი +43 664 4390540, ელფოსტა:{" "}
                    <a href="mailto:anidevdariani1997@gmail.com">anidevdariani1997@gmail.com</a>.
                    სრული მონაცემები: <Link href="/impressum">{m.footer.imprint}</Link>.
                  </>
                ) : (
                  sec.p
                )}
              </p>
            </section>
          ))}
        </article>
      </main>
      <Footer />
    </>
  );
}
