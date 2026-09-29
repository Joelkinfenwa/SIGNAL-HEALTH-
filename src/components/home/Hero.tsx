import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { activeHeadline, hero, heroHeadlines } from "@/config/home";
import { heroVideo } from "@/config/media";
import { fillHomeTokens, pickPriced } from "@/lib/home-tokens";
import { SignalCard } from "./SignalCard";
import styles from "./Hero.module.css";

/**
 * Full-bleed hero. The poster image is always rendered (it is the LCP element);
 * when a video source exists it plays muted and looped on top, and is hidden
 * under prefers-reduced-motion by CSS. No JavaScript.
 */
export function Hero() {
  const headline = heroHeadlines.find((h) => h.id === activeHeadline) ?? heroHeadlines[0]!;
  const poster = heroVideo.poster;
  return (
    <section id="hero" data-theme="dark" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        {poster.src ? (
          <Image src={poster.src} alt="" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 35%" }} />
        ) : null}
        {heroVideo.src ? (
          <video className={styles.video} autoPlay muted loop playsInline preload="metadata" poster={poster.src || undefined}>
            <source src={heroVideo.src} type="video/mp4" />
          </video>
        ) : null}
        <div className={styles.shade} />
      </div>

      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>{hero.eyebrow}</p>
          <h1 id="hero-title" className={styles.title}>{headline.text}</h1>
          <p className={styles.lede}>{pickPriced(hero.subheadline, hero.subheadlineUnpriced)}</p>
          <div className={styles.actions}>
            <Button href={hero.primaryCta.href} ctaId="hero_find_my_test" location="hero">
              {hero.primaryCta.label} <Icon name="arrow" size={18} />
            </Button>
            <Button href={hero.secondaryCta.href} variant="outline" ctaId="hero_view_tests" location="hero">
              {hero.secondaryCta.label}
            </Button>
          </div>
          <ul className={styles.chips} aria-label="Highlights">
            {hero.chips.map((c) => <li key={c}><Icon name="check" size={14} /> {fillHomeTokens(c)}</li>)}
          </ul>
        </div>
        <SignalCard className={styles.signal} />
      </Container>
    </section>
  );
}
