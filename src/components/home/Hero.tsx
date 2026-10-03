import Image from "next/image";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { activeHeadline, hero, heroHeadlines } from "@/config/home";
import { heroVideo, type MediaAsset, type VideoAsset } from "@/config/media";
import { fillHomeTokens, pickPriced } from "@/lib/home-tokens";
import { SignalCard } from "./SignalCard";
import styles from "./Hero.module.css";

/**
 * Full-bleed hero. The poster image is always rendered (it is the LCP element);
 * when a video source exists it plays muted and looped on top, and is hidden
 * under prefers-reduced-motion by CSS. No JavaScript.
 */
export interface HeroProps {
  eyebrow?: string;
  headline?: string;
  subheadline?: string;
  media?: MediaAsset | VideoAsset;
  primaryCta?: { label: string; href: string };
  secondaryCta?: { label: string; href: string } | null;
  chips?: string[];
  ctaLocation?: string;
}

const isVideo = (m: MediaAsset | VideoAsset): m is VideoAsset => "poster" in m;

export function Hero(props: HeroProps = {}) {
  const headline = props.headline ?? (heroHeadlines.find((h) => h.id === activeHeadline) ?? heroHeadlines[0]!).text;
  const media = props.media ?? heroVideo;
  const poster = isVideo(media) ? media.poster : media;
  const videoSrc = isVideo(media) ? media.src : "";
  const primary = props.primaryCta ?? hero.primaryCta;
  const secondary = props.secondaryCta === undefined ? hero.secondaryCta : props.secondaryCta;
  const chips = props.chips ?? hero.chips;
  const eyebrow = props.eyebrow ?? hero.eyebrow;
  const sub = props.subheadline ?? pickPriced(hero.subheadline, hero.subheadlineUnpriced);
  const loc = props.ctaLocation ?? "hero";
  return (
    <section id="hero" data-theme="dark" className={styles.hero} aria-labelledby="hero-title">
      <div className={styles.media} aria-hidden="true">
        {poster.src ? (
          <Image src={poster.src} alt="" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 35%" }} />
        ) : null}
        {videoSrc ? (
          <video className={styles.video} autoPlay muted loop playsInline preload="metadata" poster={poster.src || undefined}>
            <source src={videoSrc} type="video/mp4" />
          </video>
        ) : null}
        <div className={styles.shade} />
      </div>

      <Container className={styles.inner}>
        <div className={styles.copy}>
          {eyebrow ? <p className={styles.kicker}>{eyebrow}</p> : null}
          <h1 id="hero-title" className={styles.title}>{headline}</h1>
          <p className={styles.lede}>{fillHomeTokens(sub)}</p>
          <div className={styles.actions}>
            <Button href={primary.href} ctaId="hero_primary" location={loc}>
              {primary.label} <Icon name="arrow" size={18} />
            </Button>
            {secondary ? (
              <Button href={secondary.href} variant="outline" ctaId="hero_secondary" location={loc}>
                {secondary.label}
              </Button>
            ) : null}
          </div>
          <ul className={styles.chips} aria-label="Highlights">
            {chips.map((c) => <li key={c}><Icon name="check" size={14} /> {fillHomeTokens(c)}</li>)}
          </ul>
        </div>
        <SignalCard className={styles.signal} />
      </Container>
    </section>
  );
}
