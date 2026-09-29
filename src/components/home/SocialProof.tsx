import Image from "next/image";
import { Section, SectionHeader } from "@/components/ui/Section";
import { approvedReviews, hasSocialProof, pressLogos } from "@/config/social-proof";
import styles from "./SocialProof.module.css";

/**
 * Press logos and approved reviews. Renders nothing until real, approved
 * content exists in config/social-proof.ts. No outcome testimonials, no
 * invented ratings or counts.
 */
export function SocialProof() {
  if (!hasSocialProof()) return null;
  const logos = pressLogos.filter((l) => l.approved);
  return (
    <Section id="social-proof" theme="light" labelledBy="social-title">
      <SectionHeader id="social-title" align="center" title="What people say about the experience" />
      {logos.length > 0 ? (
        <ul className={styles.logos} aria-label="As featured in">
          {logos.map((l) => (
            <li key={l.id}>
              {l.href ? (
                <a href={l.href} rel="noopener" target="_blank"><Image src={l.src} alt={l.name} width={140} height={40} /></a>
              ) : (
                <Image src={l.src} alt={l.name} width={140} height={40} />
              )}
            </li>
          ))}
        </ul>
      ) : null}
      {approvedReviews.length > 0 ? (
        <ul className={styles.reviews}>
          {approvedReviews.map((r) => (
            <li key={r.id} className={styles.review}>
              <blockquote>
                <p className={styles.quote}>&ldquo;{r.quote}&rdquo;</p>
                <footer className={styles.attribution}>{r.attribution}</footer>
              </blockquote>
            </li>
          ))}
        </ul>
      ) : null}
    </Section>
  );
}
