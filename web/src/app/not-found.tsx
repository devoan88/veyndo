import Link from "next/link";
import { TopBar } from "@/components/Chrome";
import { getLocale, getMessages } from "@/lib/i18n";

export default async function NotFound() {
  const locale = await getLocale();
  const m = getMessages(locale);
  return (
    <>
      <TopBar />
      <main className="wrap" style={{ padding: "64px 0" }}>
        <h1>{m.notFound.title}</h1>
        <p className="muted">{m.notFound.text}</p>
        <Link href="/" className="btn">
          {m.notFound.home}
        </Link>
      </main>
    </>
  );
}
