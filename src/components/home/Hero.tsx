import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { media } from "@/config/media";
import { lowestPriceCents } from "@/config/products";
import { formatAUD } from "@/lib/money";
import { Photo } from "./Photo";
import { SignalCard } from "./SignalCard";
import styles from "./Hero.module.css";

export function Hero() {
  return (
    <section data-theme="light" className={styles.hero} aria-labelledby="hero-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <p className={styles.kicker}>
            <Icon name="sparkle" size={16} /> Advanced blood testing, made simple
          </p>
          <h1 id="hero-title" className={styles.title}>Know what your body is telling&nbsp;you.</h1>
          <p className={styles.lede}>
            One simple blood test shows how your body is really doing. We collect at your home or nearby,
            explain your results in plain language, and help you track how things change.
          </p>
          <div className={styles.actions}>
            <Button href="/find-my-test" ctaId="hero_find_my_test" location="hero">Find my test</Button>
            <Button href="/tests" variant="outline" ctaId="hero_view_tests" location="hero">View tests</Button>
          </div>
          <ul className={styles.reassure}>
            <li><Icon name="home" size={18} /> At-home collection where available</li>
            <li><Icon name="chat" size={18} /> Results in plain language</li>
            <li><Icon name="tube" size={18} /> Tests from <span className="num">{formatAUD(lowestPriceCents())}</span></li>
          </ul>
        </div>

        <div className={styles.visual}>
          <Photo asset={media.heroSwim} priority sizes="(min-width: 64rem) 46vw, 100vw" className={styles.photo} position="center 30%" />
          <div className={styles.booked} aria-hidden="true">
            <span className={styles.bookedIcon}><Icon name="calendar" size={18} /></span>
            <span>
              <strong>Nurse visit booked</strong>
              <span className={styles.bookedSub}>At home, Tuesday 7:30am</span>
            </span>
          </div>
          <SignalCard className={styles.signal} />
        </div>
      </Container>
    </section>
  );
}
