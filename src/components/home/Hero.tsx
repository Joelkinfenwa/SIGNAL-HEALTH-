import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { activeHeadline, hero, heroHeadlines } from "@/config/home";
import { media } from "@/config/media";
import { pickPriced } from "@/lib/home-tokens";
import { Photo } from "./Photo";
import { ProofStrip } from "./ProofStrip";
import { SignalCard } from "./SignalCard";
import styles from "./Hero.module.css";

export function Hero() {
  const headline = heroHeadlines.find((h) => h.id === activeHeadline) ?? heroHeadlines[0]!;
  return (
    <section id="hero" data-theme="light" className={styles.hero} aria-labelledby="hero-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <Icon name="sparkle" size={16} /> {hero.kicker}
          </p>
          <h1 id="hero-title" className={styles.title}>{headline.text}</h1>
          <p className={styles.lede}>{pickPriced(hero.offerLine, hero.offerLineUnpriced)}</p>
          <div className={styles.actions}>
            <Button href={hero.primaryCta.href} ctaId="hero_find_my_test" location="hero">
              {hero.primaryCta.label} <Icon name="arrow" size={18} />
            </Button>
            <Button href={hero.secondaryCta.href} variant="outline" ctaId="hero_view_tests" location="hero">
              {hero.secondaryCta.label}
            </Button>
          </div>
        </div>

        <div className={styles.visual}>
          <Photo asset={media.heroSwim} priority sizes="(min-width: 64rem) 46vw, 100vw" className={styles.photo} position="center 30%" />
          <div className={styles.booked} aria-hidden="true">
            <span className={styles.bookedIcon}><Icon name="calendar" size={18} /></span>
            <span>
              <strong>{hero.bookedPill.title}</strong>
              <span className={styles.bookedSub}>{hero.bookedPill.sub}</span>
            </span>
          </div>
          <SignalCard className={styles.signal} />
        </div>
      </Container>
      <ProofStrip />
    </section>
  );
}
