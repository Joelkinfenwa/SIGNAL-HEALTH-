import type { Metadata } from "next";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Photo } from "@/components/home/Photo";
import { StickyCta } from "@/components/home/StickyCta";
import { TrendCard } from "@/components/home/TrendCard";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LandingPageView } from "@/components/lp/LandingPageView";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { addonsFromCents, menFunnel as f, trackOffer, unverifiedClaimCount, type Claim } from "@/config/funnel/men";
import { getAddon, addonNewMarkers } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { getCollectionMethod } from "@/config/collection";
import { resultsPreview } from "@/config/home";
import { menMedia } from "@/config/media";
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

/**
 * Funnel page for paid traffic: hook, stack, steps, fit, proof, offer, risk
 * reversal, FAQ, close. Structure and copy from config/funnel/men.ts.
 * Minimal header (logo + trust strip, no nav) so the only exits are the CTAs.
 */
export default function MenFunnelPage() {
  const unverified = unverifiedClaimCount();
  const primary = { label: fill(f.hero.primaryCta.label), href: f.hero.primaryCta.href };

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
        {/* 1. Above the fold */}
        <section id="hero" data-theme="light" className={styles.hero} aria-labelledby="hero-title">
          <Container className={styles.heroInner}>
            <div>
              <p className={styles.eyebrow}>{f.hero.eyebrow}</p>
              <h1 id="hero-title" className={styles.title}>{f.hero.headline}</h1>
              <p className={styles.lede}>{f.hero.subheadline}</p>
              <div className={styles.actions}>
                <Button href={primary.href} ctaId="men_hero_primary" location="men_hero">{primary.label} <Icon name="arrow" size={18} /></Button>
                <a href={f.hero.secondaryCta.href} className={styles.secondary}>{f.hero.secondaryCta.label}</a>
              </div>
              <p className={styles.supporting}>{fill(f.hero.supporting)}</p>
              <ul className={styles.miniTrust}>
                {visible(f.hero.miniTrust).map((c, i) => <li key={i}><Icon name="check" size={14} /> <ClaimText c={c} /></li>)}
              </ul>
            </div>
            <Photo asset={menMedia.hero} sizes="(min-width: 64rem) 46vw, 100vw" className={styles.heroPhoto} priority position="center 30%" />
          </Container>
        </section>

        {/* 2. What you get */}
        <section id="included" data-theme="shell" className={styles.section} aria-labelledby="included-title">
          <Container className={styles.split}>
            <div>
              <h2 id="included-title" className={styles.h2}>{fill(f.included.title)}</h2>
              <p className={styles.intro}>{fill(f.included.intro)}</p>
              <ol className={styles.stack}>
                {f.included.bullets.map((b) => (
                  <li key={b.title} className={styles.stackItem}>
                    <strong>{fill(b.title)}</strong>
                    <span className={styles.stackBody}>{fill(b.body)}</span>
                  </li>
                ))}
              </ol>
              <Button href={primary.href} ctaId="men_included_cta" location="men_included">{primary.label} <Icon name="arrow" size={18} /></Button>
            </div>
            <figure className={styles.report} aria-label="Illustrative example of a results page">
              <div className={styles.reportHead}>
                <span>Example results page</span>
                <span className={styles.reportTag}>Example</span>
              </div>
              <p className={styles.reportPeriod}>{resultsPreview.previousLabel} → {resultsPreview.currentLabel}</p>
              <div className={styles.reportCards}>
                {resultsPreview.markers.map((m) => (
                  <TrendCard key={m.markerId} name={getBiomarker(m.markerId).name} unit={m.unit} previous={m.previous} current={m.current} direction={m.direction} note={m.note} />
                ))}
              </div>
              <p className={styles.reportPlan}><strong>Your report.</strong> Every marker explained in plain English, with anything outside the expected range flagged for follow-up with your GP.</p>
              <figcaption className={styles.reportCaption}>Illustrative example only. Not real results.</figcaption>
            </figure>
          </Container>
        </section>

        {/* 2b. Panel detail by plain-English bucket; marker names from the catalogue */}
        <section id="panel" data-theme="light" className={styles.section} aria-labelledby="panel-title">
          <Container>
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
            <h3 className={styles.h3}>{f.panel.addonsTitle}</h3>
            <ul className={styles.addonBuckets}>
              {f.panel.addonBuckets.map((ab) => {
                const a = getAddon(ab.addonId);
                if (!a || !a.launchEnabled) return null;
                const markers = addonNewMarkers(a, signalTest);
                return (
                  <li key={ab.addonId} className={styles.addonBucket}>
                    <div className={styles.addonBucketHead}><span className={styles.bucketName}>{ab.name}</span><span className={styles.addonBucketPrice}>{a.name} · {a.priceCents !== null ? `+${formatAUD(a.priceCents)}` : "TBC"}</span></div>
                    <p className={styles.addonBucketBody}>{ab.explanation}</p>
                    <p className={styles.addonBucketMarkers}>{markers.map((id) => getBiomarker(id).name).join(", ")}</p>
                  </li>
                );
              })}
            </ul>
            <div className={styles.proofCta}><Button href={primary.href} ctaId="men_panel_cta" location="men_panel">{primary.label} <Icon name="arrow" size={18} /></Button></div>
          </Container>
        </section>

        {/* 3. How it works */}
        <section data-theme="light" className={styles.section} aria-labelledby="steps-title">
          <Container className={styles.split}>
            <div>
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
            </div>
            <Photo asset={menMedia.collection} sizes="(min-width: 64rem) 40vw, 100vw" className={styles.sidePhoto} position="center" />
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

        {/* 5. Trust facts: factual only. No testimonials (AHPRA, National Law s133). */}
        <section data-theme="light" className={styles.section} aria-labelledby="proof-title">
          <Container className={styles.split}>
            <div>
              <h2 id="proof-title" className={styles.h2}>{f.proof.title}</h2>
              <p className={styles.intro}>{f.proof.intro}</p>
              <ul className={styles.facts}>
                {visible(f.proof.facts).map((c, i) => <li key={i}><Icon name="check" size={16} /> <ClaimText c={c} /></li>)}
              </ul>
              <div className={styles.proofCta}>
                <Button href={f.proof.cta.href} ctaId="men_proof_cta" location="men_proof">{fill(f.proof.cta.label)} <Icon name="arrow" size={18} /></Button>
              </div>
            </div>
            <Photo asset={menMedia.reading} sizes="(min-width: 64rem) 40vw, 100vw" className={styles.sidePhoto} position="center" />
          </Container>
        </section>

        {/* 6. Pricing and options */}
        <section id="plans" data-theme="shell" className={styles.section} aria-labelledby="plans-title">
          <Container>
            <h2 id="plans-title" className={styles.h2}>{f.plans.title}</h2>
            <p className={styles.intro}>{f.plans.intro}</p>
            <ul className={styles.plans}>
              {f.plans.cards.map((c) => (
                <li key={c.id} className={cx(styles.plan, c.badge && styles.planFeatured)} data-theme={c.badge ? "dark" : undefined}>
                  <div className={styles.planHead}>
                    <h3 className={styles.planName}>{c.name}</h3>
                    {c.badge ? <span className={styles.planBadge}>{fill(c.badge)}</span> : null}
                  </div>
                  <p className={styles.planPrice}><span className="num">{fill(c.priceLine)}</span></p>
                  {c.priceSub ? <p className={styles.planPriceSub}>{fill(c.priceSub)}</p> : null}
                  <p className={styles.planTagline}>{c.tagline}</p>
                  <ul className={styles.planBullets}>
                    {visible(c.bullets).map((b, i) => <li key={i}><Icon name="check" size={14} /> <ClaimText c={b} /></li>)}
                  </ul>
                  <Button href={c.cta.href} full variant={c.badge ? "solid" : "outline"} ctaId={`men_plan_${c.id}`} location="men_plans">{c.cta.label} <Icon name="arrow" size={18} /></Button>
                </li>
              ))}
            </ul>
            <table className={styles.compare}>
              <thead><tr><th scope="col"><span className={styles.srOnly}>Feature</span></th>{f.plans.cards.map((c) => <th key={c.id} scope="col">{c.name.replace("SIGNAL ", "").replace(" SIGNAL Panel", "")}</th>)}</tr></thead>
              <tbody>{f.plans.compare.rows.map((r) => <tr key={r.label}><th scope="row">{r.label}</th>{r.values.map((v, i) => <td key={i} className="num">{fill(v)}</td>)}</tr>)}</tbody>
            </table>
            <p className={styles.optionalNote}>{fill(f.plans.optionalNote)}</p>
            <p className={styles.disclosure}>{fill(f.plans.disclosure)}</p>
          </Container>
        </section>

        {/* 7. Safety and guarantee */}
        <section data-theme="light" className={styles.section} aria-labelledby="safety-title">
          <Container className={styles.split}>
            <div>
              <Photo asset={menMedia.doctor} sizes="(min-width: 64rem) 50vw, 100vw" className={styles.safetyPhoto} position="center 40%" />
              <h2 id="safety-title" className={styles.h2}>{f.safety.title}</h2>
              <ul className={styles.safety}>
                {visible(f.safety.bullets).map((c, i) => <li key={i}><Icon name="check" size={16} /> <ClaimText c={c} /></li>)}
              </ul>
            </div>
            <div className={styles.disclaimer}>
              <h3 className={styles.disclaimerTitle}>{f.safety.disclaimer.title}</h3>
              {f.safety.disclaimer.body.map((t) => <p key={t}>{t}</p>)}
            </div>
            {f.safety.guarantee.verified || PREVIEW ? (
              <div className={styles.guarantee}>
                <h3 className={styles.guaranteeTitle}>{f.safety.guarantee.title}{!f.safety.guarantee.verified && PREVIEW ? <span className={styles.todo}>?</span> : null}</h3>
                <p className={styles.guaranteeBody}>{fill(f.safety.guarantee.body)}</p>
                <p className={styles.guaranteeTerms}>{f.safety.guarantee.terms} <Link href="/legal/terms">Read the terms</Link>.</p>
              </div>
            ) : null}
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
