import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Photo } from "@/components/home/Photo";
import { SignalCard } from "@/components/home/SignalCard";
import { StickyCta } from "@/components/home/StickyCta";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LandingPageView } from "@/components/lp/LandingPageView";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { addonsFromCents, menFunnel as f, trackOffer, unverifiedClaimCount, type Claim } from "@/config/funnel/men";
import { signalMedia } from "@/config/media";
import { productCategoryCount, productMarkerCount, signalTest } from "@/config/products";
import { formatDiscount } from "@/config/retest-offer";
import { approvedReviews, featuredTestimonials, placeholderReviews, placeholderTestimonials } from "@/config/social-proof";
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
    addonsFrom: Number.isFinite(addonsFromCents()) ? formatAUD(addonsFromCents()) : "TBC",
    track6Price: q6 ? formatAUD(q6.recurringPriceCents) : "TBC",
    track3Price: q3 ? formatAUD(q3.recurringPriceCents) : "TBC",
    track6Discount: t6 ? formatDiscount(t6.discountBps) : "",
    track3Discount: t3 ? formatDiscount(t3.discountBps) : "",
    markers: String(productMarkerCount(signalTest)),
    areas: String(productCategoryCount(signalTest)),
  };
  return s.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}

export const metadata: Metadata = { title: f.seo.title, description: fill(f.seo.description), robots: { index: false, follow: false } };

const ClaimText = ({ c }: { c: Claim }) => <>{fill(c.text)}{!c.verified && PREVIEW ? <span className={styles.todo} title="Unverified claim: see README claims register">?</span> : null}</>;

/**
 * Funnel page for paid traffic: hook, stack, steps, fit, proof, offer, risk
 * reversal, FAQ, close. Structure and copy from config/funnel/men.ts.
 * Minimal header (logo + trust strip, no nav) so the only exits are the CTAs.
 */
export default function MenFunnelPage() {
  const featured = featuredTestimonials.length ? featuredTestimonials : PREVIEW ? placeholderTestimonials : [];
  const wall = approvedReviews.length ? approvedReviews : PREVIEW ? placeholderReviews : [];
  const showProof = featured.length > 0 || wall.length > 0;
  const placeholdersShown = PREVIEW && featuredTestimonials.length === 0 && approvedReviews.length === 0 && showProof;
  const unverified = unverifiedClaimCount();
  const primary = { label: fill(f.hero.primaryCta.label), href: f.hero.primaryCta.href };

  return (
    <>
      <header className={styles.header} data-theme="light">
        <Container className={styles.headerInner}>
          <Logo />
          <ul className={styles.trustStrip} aria-label="Trust">
            {f.trustStrip.map((c) => <li key={c.text}><ClaimText c={c} /></li>)}
          </ul>
        </Container>
      </header>
      {PREVIEW && unverified > 0 ? <p className={styles.previewNote}>Preview: {unverified} claims on this page are marked unverified (shown with a ?). Clear them in the README claims register before paid traffic.</p> : null}

      <main id="main">
        {/* 1. Above the fold */}
        <section id="hero" data-theme="light" className={styles.hero} aria-labelledby="hero-title">
          <Container className={styles.heroInner}>
            <div>
              <h1 id="hero-title" className={styles.title}>{f.hero.headline}</h1>
              <p className={styles.lede}>{f.hero.subheadline}</p>
              <div className={styles.actions}>
                <Button href={primary.href} ctaId="men_hero_primary" location="men_hero">{primary.label} <Icon name="arrow" size={18} /></Button>
                <a href={f.hero.secondaryCta.href} className={styles.secondary}>{f.hero.secondaryCta.label}</a>
              </div>
              <ul className={styles.miniTrust}>
                {f.hero.miniTrust.map((c) => <li key={c.text}><Icon name="check" size={14} /> <ClaimText c={c} /></li>)}
              </ul>
            </div>
            <div className={styles.heroVisual}>
              <Photo asset={signalMedia.hero} sizes="(min-width: 64rem) 46vw, 100vw" className={styles.heroPhoto} priority position="center 30%" />
              <SignalCard className={styles.heroCard} />
            </div>
          </Container>
        </section>

        {/* 2. What you get */}
        <section id="included" data-theme="shell" className={styles.section} aria-labelledby="included-title">
          <Container className={styles.split}>
            <div>
              <h2 id="included-title" className={styles.h2}>{f.included.title}</h2>
              <p className={styles.intro}>{fill(f.included.intro)}</p>
              <ul className={styles.stack}>
                {f.included.bullets.map((b, i) => (
                  <li key={b.title} className={styles.stackItem}>
                    <span className={styles.stackNum}><span className="num">{i + 1}</span></span>
                    <span><strong>{fill(b.title)}</strong><span className={styles.stackBody}>{fill(b.body)}</span></span>
                  </li>
                ))}
              </ul>
              <Button href={primary.href} ctaId="men_included_cta" location="men_included">{primary.label} <Icon name="arrow" size={18} /></Button>
            </div>
            <div className={styles.reportVisual}>
              <Photo asset={signalMedia.results} sizes="(min-width: 64rem) 40vw, 100vw" className={styles.reportPhoto} position="center 35%" />
              <SignalCard className={styles.reportCard} />
            </div>
          </Container>
        </section>

        {/* 3. How it works */}
        <section data-theme="light" className={styles.section} aria-labelledby="steps-title">
          <Container>
            <h2 id="steps-title" className={styles.h2}>{f.steps.title}</h2>
            <ol className={styles.steps}>
              {f.steps.items.map((s, i) => (
                <li key={s.title} className={styles.step}>
                  <span className={styles.stepIcon}><Icon name={s.icon} size={22} /></span>
                  <span className={styles.stepNum}><span className="num">{i + 1}</span></span>
                  <h3 className={styles.stepTitle}>{s.title}</h3>
                  <p className={styles.stepBody}>{fill(s.body)}</p>
                </li>
              ))}
            </ol>
          </Container>
        </section>

        {/* 4. Who it's for */}
        <section data-theme="shell" className={styles.section} aria-labelledby="fit-title">
          <Container>
            <h2 id="fit-title" className={styles.h2}>{f.fit.title}</h2>
            <div className={styles.fit}>
              <div className={cx(styles.fitCol, styles.fitYes)}>
                <h3 className={styles.fitTitle}><Icon name="check" size={18} /> {f.fit.bestForTitle}</h3>
                <ul>{f.fit.bestFor.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
              <div className={cx(styles.fitCol, styles.fitNo)}>
                <h3 className={styles.fitTitle}><Icon name="close" size={18} /> {f.fit.notForTitle}</h3>
                <ul>{f.fit.notFor.map((t) => <li key={t}>{t}</li>)}</ul>
              </div>
            </div>
          </Container>
        </section>

        {/* 5. Proof: renders only with approved content (placeholders on previews) */}
        {showProof ? (
          <section data-theme="light" className={styles.section} aria-labelledby="proof-title">
            <Container>
              <h2 id="proof-title" className={styles.h2}>{f.proof.title}</h2>
              {placeholdersShown ? <p className={styles.placeholderNote}>PLACEHOLDERS: layout only. Add real, approved quotes in config/social-proof.ts. Nothing here renders in production until then.</p> : null}
              <ul className={styles.featured}>
                {featured.map((t) => (
                  <li key={t.id} className={styles.testimonial}>
                    <span className={styles.avatar} aria-hidden="true">{t.photo ? null : t.name.replace(/[^A-Za-z]/g, "").slice(0, 1) || "?"}</span>
                    <blockquote className={styles.quote}>{t.quote}</blockquote>
                    <p className={styles.who}>{t.name}{t.age ? `, ${t.age}` : ""}{t.location ? `, ${t.location}` : ""}</p>
                  </li>
                ))}
              </ul>
              {wall.length ? (
                <ul className={styles.wall}>
                  {wall.map((r) => <li key={r.id}><blockquote>{r.quote}</blockquote><span>{r.attribution}</span></li>)}
                </ul>
              ) : null}
              <div className={styles.proofCta}>
                <Button href={f.proof.cta.href} ctaId="men_proof_cta" location="men_proof">{fill(f.proof.cta.label)} <Icon name="arrow" size={18} /></Button>
              </div>
            </Container>
          </section>
        ) : null}

        {/* 6. Pricing and options */}
        <section id="plans" data-theme="shell" className={styles.section} aria-labelledby="plans-title">
          <Container>
            <h2 id="plans-title" className={styles.h2}>{f.plans.title}</h2>
            <ul className={styles.plans}>
              {f.plans.cards.map((c) => (
                <li key={c.id} className={cx(styles.plan, c.badge && styles.planFeatured)} data-theme={c.badge ? "dark" : undefined}>
                  <div className={styles.planHead}>
                    <h3 className={styles.planName}>{c.name}</h3>
                    {c.badge ? <span className={styles.planBadge}>{c.badge}</span> : null}
                  </div>
                  <p className={styles.planPrice}><span className="num">{fill(c.priceLine)}</span></p>
                  {c.priceSub ? <p className={styles.planPriceSub}>{fill(c.priceSub)}</p> : null}
                  <p className={styles.planTagline}>{c.tagline}</p>
                  <ul className={styles.planBullets}>
                    {c.bullets.filter((b) => b.verified || PREVIEW).map((b) => <li key={b.text}><Icon name="check" size={14} /> <ClaimText c={b} /></li>)}
                  </ul>
                  <Button href={c.cta.href} full variant={c.badge ? "solid" : "outline"} ctaId={`men_plan_${c.id}`} location="men_plans">{c.cta.label} <Icon name="arrow" size={18} /></Button>
                </li>
              ))}
            </ul>
            <table className={styles.compare}>
              <thead><tr><th scope="col"><span className={styles.srOnly}>Feature</span></th>{f.plans.cards.map((c) => <th key={c.id} scope="col">{c.name.replace("SIGNAL ", "").replace(" SIGNAL Panel", "")}</th>)}</tr></thead>
              <tbody>{f.plans.compare.rows.map((r) => <tr key={r.label}><th scope="row">{r.label}</th>{r.values.map((v, i) => <td key={i} className="num">{fill(v)}</td>)}</tr>)}</tbody>
            </table>
            <p className={styles.disclosure}>{fill(f.plans.disclosure)}</p>
          </Container>
        </section>

        {/* 7. Safety and guarantee */}
        <section data-theme="light" className={styles.section} aria-labelledby="safety-title">
          <Container className={styles.split}>
            <div>
              <h2 id="safety-title" className={styles.h2}>{f.safety.title}</h2>
              <ul className={styles.safety}>
                {f.safety.bullets.map((c) => <li key={c.text}><Icon name="check" size={16} /> <ClaimText c={c} /></li>)}
              </ul>
            </div>
            <div className={styles.guarantee}>
              <span className={styles.guaranteeIcon}><Icon name="shield" size={26} /></span>
              <h3 className={styles.guaranteeTitle}>{f.safety.guarantee.title}{!f.safety.guarantee.verified && PREVIEW ? <span className={styles.todo}>?</span> : null}</h3>
              <p className={styles.guaranteeBody}>{fill(f.safety.guarantee.body)}</p>
            </div>
          </Container>
        </section>

        {/* 8. FAQ */}
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

        {/* 9. Close */}
        <section data-theme="dark" className={styles.close} aria-labelledby="close-title">
          <Container className={styles.closeInner}>
            <h2 id="close-title" className={styles.closeTitle}>{f.close.headline}</h2>
            <p className={styles.closeSub}>{f.close.sub}</p>
            <Button href={f.close.cta.href} ctaId="men_close_cta" location="men_close">{fill(f.close.cta.label)} <Icon name="arrow" size={18} /></Button>
            <p className={styles.closeFine}><Link href="/signal">See every marker in the SIGNAL Test</Link></p>
          </Container>
        </section>
      </main>
      <SiteFooter />
      <StickyCta priceLine={fill("{price} · doctor-reviewed")} href={primary.href} label="Order now" ctaId="men_sticky" />
      <LandingPageView slug={f.slug} />
    </>
  );
}
