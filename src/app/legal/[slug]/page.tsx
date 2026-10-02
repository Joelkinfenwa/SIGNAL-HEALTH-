import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Container } from "@/components/ui/Container";
import { getLegalDocument, legalDocuments } from "@/config/legal";
import { legalEntity, legalPlaceholders } from "@/config/legal/entity";
import styles from "./page.module.css";

export const dynamicParams = false;
export function generateStaticParams() { return legalDocuments.map((d) => ({ slug: d.slug })); }
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const doc = getLegalDocument((await params).slug);
  return { title: doc?.title ?? "Legal", description: doc?.intro.slice(0, 150) };
}

const PREVIEW = process.env.VERCEL_ENV !== "production";

/** Legal documents rendered from config/legal/*. Bullets inside a section are "- " lines. */
export default async function LegalPage({ params }: { params: Promise<{ slug: string }> }) {
  const doc = getLegalDocument((await params).slug);
  if (!doc) notFound();
  const missing = legalPlaceholders();
  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <Container className={styles.inner}>
          <aside className={styles.side}>
            <p className={styles.sideTitle}>Legal</p>
            <ul className={styles.docs}>
              {legalDocuments.map((d) => <li key={d.slug}><Link href={`/legal/${d.slug}`} aria-current={d.slug === doc.slug ? "page" : undefined}>{d.title}</Link></li>)}
            </ul>
            <p className={styles.sideTitle}>On this page</p>
            <ul className={styles.toc}>
              {doc.sections.map((s) => <li key={s.id}><a href={`#${s.id}`}>{s.title}</a></li>)}
            </ul>
          </aside>
          <article className={styles.article}>
            {PREVIEW && missing.length ? <p className={styles.draft}>Draft for legal review. Entity details still to fill in config/legal/entity.ts: {missing.join(", ")}.</p> : null}
            <h1 className={styles.title}>{doc.title}</h1>
            <p className={styles.meta}>Last updated {legalEntity.lastUpdated}</p>
            <p className={styles.intro}>{doc.intro}</p>
            {doc.sections.map((s) => (
              <section key={s.id} id={s.id} className={styles.section}>
                <h2 className={styles.h2}>{s.title}</h2>
                {renderBody(s.body)}
              </section>
            ))}
          </article>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}

function renderBody(lines: string[]) {
  const out: React.ReactNode[] = [];
  let bullets: string[] = [];
  const flush = () => { if (bullets.length) { out.push(<ul key={`ul-${out.length}`} className={styles.list}>{bullets.map((b, i) => <li key={i}>{b}</li>)}</ul>); bullets = []; } };
  lines.forEach((l, i) => {
    if (l.startsWith("- ")) bullets.push(l.slice(2));
    else { flush(); out.push(<p key={i}>{l}</p>); }
  });
  flush();
  return out;
}
