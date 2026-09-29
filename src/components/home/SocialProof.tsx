import Image from "next/image";
import { Section, SectionHeader } from "@/components/ui/Section";
import { approvedReviews, creatorQuotes, hasSocialProof, pressLogos, ugcVideos } from "@/config/social-proof";
import { showPlaceholders } from "@/config/trust";
import styles from "./SocialProof.module.css";

/**
 * Press logos and approved reviews. Renders nothing until real, approved
 * content exists in config/social-proof.ts. No outcome testimonials, no
 * invented ratings or counts.
 */
export function SocialProof() {
  if (!hasSocialProof()) {
    if (!showPlaceholders()) return null;
    return (
      <Section id="social-proof" theme="shell" labelledBy="social-title">
        <SectionHeader id="social-title" align="center" eyebrow="Social proof · placeholder" title="Reviews and creator content go here." intro="Development placeholder. Renders only on previews. Populate config/social-proof.ts with approved reviews, UGC video and creator quotes; nothing here is a claim." />
        <ul className={styles.placeholders} aria-hidden="true">
          <li>UGC video card</li><li>Written review</li><li>Creator quote</li>
        </ul>
      </Section>
    );
  }
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
      {ugcVideos.length > 0 ? (
        <ul className={styles.ugc}>
          {ugcVideos.map((v) => (
            <li key={v.id} className={styles.ugcCard}>
              <video controls preload="none" poster={v.poster} playsInline><source src={v.src} type="video/mp4" /></video>
              <p className={styles.quote}>&ldquo;{v.quote}&rdquo;</p>
              <p className={styles.attribution}>{v.creator}</p>
            </li>
          ))}
        </ul>
      ) : null}
      {creatorQuotes.length > 0 ? (
        <ul className={styles.reviews}>
          {creatorQuotes.map((q) => (
            <li key={q.id} className={styles.review}><blockquote><p className={styles.quote}>&ldquo;{q.quote}&rdquo;</p><footer className={styles.attribution}>{q.creator}</footer></blockquote></li>
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
