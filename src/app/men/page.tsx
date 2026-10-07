import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { StickyCta } from "@/components/home/StickyCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LandingPageView } from "@/components/lp/LandingPageView";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { addonsFromCents, menFunnel as f, trackOffer, unverifiedClaimCount, type Claim } from "@/config/funnel/men";
import { getAddon, addonNewMarkers } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { getCollectionMethod } from "@/config/collection";
import { productCategoryCount, productMarkerCount, signalTest } from "@/config/products";
import { formatDiscount } from "@/config/retest-offer";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { quoteRetest } from "@/lib/retest/offer";
import styles from "./page.module.css";

const PREVIEW = process.env.VERCEL_ENV !== "production";

/** Fill price tokens from config so nothing on the page can go stale. */
function fill(s: string): string {
  const price = signalTest.priceCents;
  const t6 = trackOffer("retest_6m"), t3 = trackOffer("retest_3m");
  const q6 = price !== null && t6 ? quoteRetest(price, t6) : null;
  const q3 = price !== null && t3 ? quoteRetest(price, t3) : null;
  const tokens: Record<string, string> = {
    price: price !== null ? formatAUD(price) : "TBC",
    perWeek: price !== null ? formatAUD(Math.ceil(price / 52 / 100) * 100) : "TBC",
    addonsFrom: Number.isFinite(addonsFromCents()) ? formatAUD(addonsFromCents()) : "TBC",
    track6Price: q6 ? formatAUD(q6.recurringPriceCents) : "TBC",
    track3Price: q3 ? formatAUD(q3.recurringPriceCents) : "TBC",
    track6Discount: t6 ? formatDiscount(t6.discountBps) : "",
    track3Discount: t3 ? formatDiscount(t3.discountBps) : "",
    markers: String(productMarkerCount(signalTest)),
    areas: String(productCategoryCount(signalTest)),
    buckets: String(f.panel.buckets.length),
    homeVisit: getCollectionMethod("mobile").priceDeltaCents !== null ? formatAUD(getCollectionMethod("mobile").priceDeltaCents!) : "TBC",
  };
  return s.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}

export const metadata: Metadata = { title: f.seo.title, description: fill(f.seo.description), robots: { index: false, follow: false } };

/** Unverified claims render on previews only (with a ? marker). Production shows verified lines alone. */
const visible = (claims: Claim[]) => claims.filter((c) => c.verified || PREVIEW);
const ClaimText = ({ c }: { c: Claim }) => <>{fill(c.text)}{!c.verified && PREVIEW ? <span className={styles.todo} title="Unverified claim: see README claims register">?</span> : null}</>;

const Cta = ({ id, location, label, full }: { id: string; location: string; label?: string; full?: boolean }) => (
  <Button href={f.hero.primaryCta.href} ctaId={id} location={location} full={full}>{fill(label ?? f.hero.primaryCta.label)} <Icon name="arrow" size={18} /></Button>
);

/**
 * Funnel page for paid, mobile-first traffic, built to be read in twenty
 * seconds: hero, three steps, four-line value, markers collapsed, trust and
 * guarantee, five short FAQs, close. One product, one price, one button.
 * Copy from config/funnel/men.ts.
 */
export default function MenFunnelPage() {
  const unverified = unverifiedClaimCount();

  return (
    <>
      <header className={styles.header} data-theme="light">
        <Container className={styles.headerInner}>
          <Logo />
          <ul className={styles.trustStrip} aria-label="Trust">
            {visible(f.trustStrip).map((c) => <li key={c.text}><ClaimText c={c} /></li>)}
          </ul>
        </Container>
      </header>
      {PREVIEW && unverified > 0 ? <p className={styles.previewNote}>Preview: {unverified} claims on this page are marked unverified (shown with a ?). Clear them in the README claims register before paid traffic.</p> : null}

      <main id="main">
        {/* 1. Hero: callout, value, CTA */}
        <section id="hero" data-theme="dark" className={styles.hero} aria-labelledby="hero-title">
          <Container className={styles.heroInner}>
            <div className={styles.heroCopy}>
              <p className={styles.eyebrow}>{f.hero.eyebrow}</p>
              <h1 id="hero-title" className={styles.title}>{f.hero.headline}</h1>
              <p className={styles.lede}>{f.hero.subheadline.map((l, i) => <span key={i} className={styles.ledeLine}>{fill(l)}</span>)}</p>
              <div className={styles.actions}>
                <Cta id="men_hero_primary" location="men_hero" full />
              </div>
              <p className={styles.trustLine}>
                {visible(f.hero.trustLine).map((c, i) => <span key={i}>{i > 0 ? <span className={styles.dot} aria-hidden="true"> · </span> : null}<ClaimText c={c} /></span>)}
              </p>
            </div>
            <aside className={styles.heroCard} data-theme="light" aria-label="The offer at a glance">
              <div className={styles.heroCardHead}>
                <span className={styles.heroCardTitle}>{f.hero.card.title}</span>
                <span className={cx(styles.heroCardPrice, "num")}>{fill("{price}")}</span>
              </div>
              <ul className={styles.heroCardRows}>
                {visible(f.hero.card.rows).map((c, i) => <li key={i}><Icon name="check" size={14} /> <ClaimText c={c} /></li>)}
              </ul>
              <p className={styles.heroCardFoot}>{fill(f.hero.card.foot)}</p>
            </aside>
          </Container>
        </section>

        {/* 2. How it works */}
        <section data-theme="light" className={styles.section} aria-labelledby="steps-title">
          <Container className={styles.narrow}>
            <h2 id="steps-title" className={styles.h2}>{f.steps.title}</h2>
            <ol className={styles.steps}>
              {f.steps.items.map((s, i) => (
                <li key={s.title} className={styles.step}>
                  <span className={styles.stepNum}><span className="num">{i + 1}</span></span>
                  <div>
                    <h3 className={styles.stepTitle}>{s.title}</h3>
                    <p className={styles.stepBody}>{fill(s.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.sectionCta}><Cta id="men_steps_cta" location="men_steps" label="Book your SIGNAL test" /></div>
          </Container>
        </section>

        {/* 3. Value: four lines */}
        <section id="included" data-theme="shell" className={styles.section} aria-labelledby="included-title">
          <Container className={styles.narrow}>
            <h2 id="included-title" className={styles.h2}>{fill(f.included.title)}</h2>
            <ul className={styles.stack}>
              {f.included.bullets.map((b) => (
                <li key={b} className={styles.stackItem}><Icon name="check" size={16} /><span><strong>{fill(b)}</strong></span></li>
              ))}
            </ul>
            <div className={styles.sectionCta}>
              <Cta id="men_included_cta" location="men_included" label="Book your SIGNAL test" />
              <a href="#panel" className={styles.secondary}>{f.included.panelLink}</a>
            </div>
          </Container>
        </section>

        {/* 3b. Every marker, collapsed by area */}
        <section id="panel" data-theme="light" className={styles.section} aria-labelledby="panel-title">
          <Container className={styles.narrow}>
            <h2 id="panel-title" className={styles.h2}>{f.panel.title}</h2>
            <p className={styles.intro}>{f.panel.intro}</p>
            <ul className={styles.buckets}>
              {f.panel.buckets.map((b) => (
                <li key={b.id}>
                  <details className={styles.bucket}>
                    <summary className={styles.bucketSummary}>
                      <span className={styles.bucketText}><span className={styles.bucketName}>{b.name}</span><span className={styles.bucketCount}><span className="num">{b.markerIds.length}</span> {b.markerIds.length === 1 ? "marker" : "markers"}</span></span>
                      <span className={styles.faqToggle} aria-hidden="true"><Icon name="plus" size={18} className={styles.plus} /><Icon name="minus" size={18} className={styles.minus} /></span>
                    </summary>
                    <div className={styles.bucketBody}>
                      <p>{b.explanation}</p>
                      <ul className={styles.markerChips}>{b.markerIds.map((id) => <li key={id}>{getBiomarker(id).name}</li>)}</ul>
                    </div>
                  </details>
                </li>
              ))}
            </ul>
            <details className={styles.bucket}>
              <summary className={styles.bucketSummary}>
                <span className={styles.bucketText}><span className={styles.bucketName}>{fill(f.panel.addonsTitle)}</span><span className={styles.bucketCount}><span className="num">{f.panel.addonBuckets.length}</span> add-ons</span></span>
                <span className={styles.faqToggle} aria-hidden="true"><Icon name="plus" size={18} className={styles.plus} /><Icon name="minus" size={18} className={styles.minus} /></span>
              </summary>
              <ul className={styles.addonBuckets}>
                {f.panel.addonBuckets.map((ab) => {
                  const a = getAddon(ab.addonId);
                  if (!a || !a.launchEnabled) return null;
                  return (
                    <li key={ab.addonId} className={styles.addonBucket}>
                      <div className={styles.addonBucketHead}><span className={styles.bucketName}>{ab.name}</span><span className={styles.addonBucketPrice}>{a.name} · {a.priceCents !== null ? `+${formatAUD(a.priceCents)}` : "TBC"}</span></div>
                      <p className={styles.addonBucketMarkers}>{addonNewMarkers(a, signalTest).map((id) => getBiomarker(id).name).join(", ")}</p>
                    </li>
                  );
                })}
              </ul>
            </details>
          </Container>
        </section>

        {/* 4. Trust, limits and guarantee */}
        <section data-theme="light" className={styles.section} aria-labelledby="safety-title">
          <Container className={styles.split}>
            <div>
              <h2 id="safety-title" className={styles.h2}>{f.safety.title}</h2>
              <ul className={styles.safety}>
                {visible(f.safety.bullets).map((c, i) => <li key={i}><Icon name="check" size={16} /> <ClaimText c={c} /></li>)}
              </ul>
              <p className={styles.disclaimerLine}>{f.safety.disclaimer}</p>
            </div>
            {f.safety.guarantee.verified || PREVIEW ? (
              <div className={styles.guarantee}>
                <p className={styles.guaranteeEyebrow}>Our guarantee</p>
                <h3 id="guarantee-title" className={styles.guaranteeTitle}>{f.safety.guarantee.title}{!f.safety.guarantee.verified && PREVIEW ? <span className={styles.todo}>?</span> : null}</h3>
                <p className={styles.guaranteeBody}>{f.safety.guarantee.body.map((l, i) => <span key={i} className={styles.ledeLine}>{fill(l)}</span>)}</p>
                <p className={styles.guaranteeTerms}>{f.safety.guarantee.terms} <Link href="/legal/terms">Read the terms</Link>.</p>
                <div className={styles.sectionCta}><Cta id="men_guarantee_cta" location="men_guarantee" label="Book your SIGNAL test" /></div>
              </div>
            ) : null}
          </Container>
        </section>

        {/* 5. FAQ */}
        <section data-theme="shell" className={styles.section} aria-labelledby="faq-title">
          <Container className={styles.faqInner}>
            <h2 id="faq-title" className={styles.h2}>{f.faq.title}</h2>
            <ul className={styles.faq}>
              {f.faq.items.map((item) => (
                <li key={item.q}>
                  <details className={styles.faqItem}>
                    <summary className={styles.faqSummary}><span>{item.q}</span><span className={styles.faqToggle} aria-hidden="true"><Icon name="plus" size={18} className={styles.plus} /><Icon name="minus" size={18} className={styles.minus} /></span></summary>
                    <p className={styles.faqAnswer}>{fill(item.a)}</p>
                  </details>
                </li>
              ))}
            </ul>
          </Container>
        </section>

        {/* 6. Final CTA strip */}
        <section data-theme="dark" className={styles.close} aria-labelledby="close-title">
          <Container className={styles.closeInner}>
            <h2 id="close-title" className={styles.closeTitle}>{f.close.headline}</h2>
            <Cta id="men_close_cta" location="men_close" label={f.close.cta.label} />
            <p className={styles.closeFine}>{f.close.micro}</p>
            <Link href={f.close.plansLink.href} className={styles.secondary}>{f.close.plansLink.label}</Link>
          </Container>
        </section>
      </main>
      <SiteFooter />
      <StickyCta priceLine={fill("{price} · doctor-reviewed")} href={f.hero.primaryCta.href} label="Book now" ctaId="men_sticky" />
      <LandingPageView slug={f.slug} />
    </>
  );
}
