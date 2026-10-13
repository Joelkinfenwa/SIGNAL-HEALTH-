import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { LandingPageView } from "@/components/lp/LandingPageView";
import { OfferBuilder } from "@/components/women/OfferBuilder";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import type { Claim } from "@/config/funnel/men";
import { womenAddonsFromCents, womenFunnel as f, womenTrackOffer, womenUnverifiedClaimCount } from "@/config/funnel/women";
import { getAddon, addonNewMarkers } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { getCollectionMethod } from "@/config/collection";
import { womenMedia } from "@/config/media";
import { productCategoryCount, productMarkerCount } from "@/config/products";
import { formatDiscount } from "@/config/retest-offer";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { quoteRetest } from "@/lib/retest/offer";
import styles from "./page.module.css";

const PREVIEW = process.env.VERCEL_ENV !== "production";
const product = f.product;

/** Fill price tokens from config so nothing on the page can go stale. */
function fill(s: string): string {
  const price = product.priceCents;
  const t6 = womenTrackOffer("retest_6m"), t3 = womenTrackOffer("retest_3m");
  const q6 = price !== null && t6 ? quoteRetest(price, t6) : null;
  const q3 = price !== null && t3 ? quoteRetest(price, t3) : null;
  const tokens: Record<string, string> = {
    price: price !== null ? formatAUD(price) : "TBC",
    compareAt: product.compareAtPriceCents !== null ? formatAUD(product.compareAtPriceCents) : "",
    addonsFrom: Number.isFinite(womenAddonsFromCents()) ? formatAUD(womenAddonsFromCents()) : "TBC",
    track6Price: q6 ? formatAUD(q6.recurringPriceCents) : "TBC",
    track3Price: q3 ? formatAUD(q3.recurringPriceCents) : "TBC",
    track6Discount: t6 ? formatDiscount(t6.discountBps) : "",
    track3Discount: t3 ? formatDiscount(t3.discountBps) : "",
    markers: String(productMarkerCount(product)),
    areas: String(productCategoryCount(product)),
    homeVisit: getCollectionMethod("mobile").priceDeltaCents !== null ? formatAUD(getCollectionMethod("mobile").priceDeltaCents!) : "TBC",
  };
  return s.replace(/\{(\w+)\}/g, (m, k: string) => tokens[k] ?? m);
}

export const metadata: Metadata = { title: f.seo.title, description: fill(f.seo.description), robots: { index: false, follow: false } };

const visible = (claims: Claim[]) => claims.filter((c) => c.verified || PREVIEW);
const ClaimText = ({ c }: { c: Claim }) => <>{fill(c.text)}{!c.verified && PREVIEW ? <span className={styles.todo} title="Unverified claim: see README claims register">?</span> : null}</>;

const Cta = ({ id, location, label, full, href }: { id: string; location: string; label?: string; full?: boolean; href?: string }) => (
  <Button href={href ?? f.hero.primaryCta.href} ctaId={id} location={location} full={full}>{fill(label ?? f.hero.primaryCta.label)} <Icon name="arrow" size={18} /></Button>
);

/**
 * Women's funnel page for paid, mobile-first traffic: the same test at the
 * women's price, with add-ons and retesting plans doing the work. Copy from
 * config/funnel/women.ts; styles shared with /men.
 */
export default function WomenFunnelPage() {
  const unverified = womenUnverifiedClaimCount();
  const compare = product.compareAtPriceCents !== null && product.priceCents !== null && product.compareAtPriceCents > product.priceCents;

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
        {/* 1. Hero */}
        <section id="hero" data-theme="dark" className={cx(styles.hero, styles.heroPhoto)} aria-labelledby="hero-title">
          <div className={styles.heroMedia} aria-hidden="true">
            <Image src={womenMedia.hero.src} alt="" fill priority sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 30%" }} />
            <div className={styles.heroShade} />
          </div>
          <Container className={styles.heroInner}>
            <p className={styles.eyebrow}>{f.hero.eyebrow}</p>
            <h1 id="hero-title" className={styles.title}>{f.hero.headline}</h1>
            <p className={styles.lede}>{f.hero.subheadline.map((l, i) => <span key={i} className={styles.ledeLine}>{fill(l)}</span>)}</p>
            <div className={styles.actions}>
              <Cta id="women_hero_primary" location="women_hero" full />
              {compare ? <p className={styles.priceNote}>{fill(f.hero.priceNote).replace(fill("{compareAt}"), "")}<s className="num">{fill("{compareAt}")}</s></p> : null}
            </div>
            <p className={styles.trustLine}>
              {visible(f.hero.trustLine).map((c, i) => <span key={i}>{i > 0 ? <span className={styles.dot} aria-hidden="true"> · </span> : null}<ClaimText c={c} /></span>)}
            </p>
          </Container>
        </section>

        {/* 2. The offer */}
        <section id="offer" data-theme="shell" className={styles.section} aria-labelledby="offer-title">
          <Container className={styles.narrow}>
            <div className={styles.offer}>
              <div className={styles.offerHead}>
                <h2 id="offer-title" className={styles.offerTitle}>{fill(f.offer.title)}</h2>
                <span className={styles.offerPrices}>
                  {compare ? <s className={cx(styles.strike, "num")}>{fill("{compareAt}")}</s> : null}
                  <span className={cx(styles.offerPrice, "num")}>{fill("{price}")}</span>
                </span>
              </div>
              <ul className={styles.offerTiles}>
                {f.offer.tiles.filter((t) => t.verified || PREVIEW).map((t) => (
                  <li key={t.label} className={styles.offerTile}>
                    <span className={styles.offerTileIcon}><Icon name={t.icon} size={18} /></span>
                    <span className={cx(styles.offerTileFigure, "num")}>{fill(t.figure)}</span>
                    <span className={styles.offerTileLabel}>{t.label}</span>
                  </li>
                ))}
              </ul>
              <p className={styles.offerFoot}>{fill(f.offer.foot)}</p>
              <Cta id="women_offer_cta" location="women_offer" full />
            </div>
          </Container>
        </section>

        {/* 2b. Photo band */}
        <figure className={styles.band} aria-label={womenMedia.collection.alt}>
          <Image src={womenMedia.collection.src} alt={womenMedia.collection.alt} fill sizes="100vw" style={{ objectFit: "cover" }} />
          <figcaption className={styles.bandCaption}><span>Walk in. No appointment. About five minutes.</span></figcaption>
        </figure>

        {/* 3. Add what matters: the upsell, built on the page */}
        <section id="addons" data-theme="light" className={styles.section} aria-labelledby="upsell-title">
          <Container className={styles.narrow}>
            <h2 id="upsell-title" className={styles.h2}>{f.upsell.title}</h2>
            <p className={styles.intro}>{fill(f.upsell.intro)}</p>
            <OfferBuilder
              productId={product.id}
              priceCents={product.priceCents ?? 0}
              compareAtCents={product.compareAtPriceCents}
              addons={f.upsell.addonIds.map((id) => getAddon(id)).filter((a): a is NonNullable<typeof a> => Boolean(a && a.launchEnabled && product.addonIds.includes(a.id) && a.priceCents !== null)).map((a) => ({ id: a.id, name: a.name, priceCents: a.priceCents!, body: a.shortDescription, markers: addonNewMarkers(a, product).map((m) => getBiomarker(m).name) }))}
              ctaLabel="Get tested"
              stickyLine="Your test"
              cardTitle="Your test"
              more={f.upsell.more}
            />
          </Container>
        </section>

        {/* 4. What's checked: every marker, visible, grouped by area */}
        <section id="panel" data-theme="shell" className={styles.section} aria-labelledby="panel-title">
          <Container className={styles.narrow}>
            <h2 id="panel-title" className={styles.h2}>{f.panel.title}</h2>
            <p className={styles.intro}>{fill(f.panel.intro)}</p>
            <div className={styles.panelCard}>
              <div className={styles.panelHead}><span>The SIGNAL Test</span><span className="num">{fill("{markers}")} markers · {fill("{price}")}</span></div>
              <ul className={styles.panelGroups}>
                {f.panel.buckets.map((b) => (
                  <li key={b.id} className={styles.panelGroup}>
                    <span className={styles.panelGroupName}><Icon name="check" size={14} /> {b.name} <span className={styles.panelCount}><span className="num">{b.markerIds.length}</span></span></span>
                    <ul className={styles.markerChips}>{b.markerIds.map((id) => <li key={id}>{getBiomarker(id).name}</li>)}</ul>
                  </li>
                ))}
              </ul>
              <div className={cx(styles.panelHead, styles.panelHeadAddons)}><span>Optional add-ons, same draw</span><span>from {fill("{addonsFrom}")}</span></div>
              <ul className={styles.panelGroups}>
                {f.panel.addonBuckets.map((ab) => {
                  const a = getAddon(ab.addonId);
                  if (!a || !a.launchEnabled || !product.addonIds.includes(a.id)) return null;
                  return (
                    <li key={ab.addonId} className={cx(styles.panelGroup, styles.panelGroupAddon)}>
                      <span className={styles.panelGroupName}><Icon name="plus" size={14} /> {a.name} <span className={styles.panelCount}>{a.priceCents !== null ? `+${formatAUD(a.priceCents)}` : "TBC"}</span></span>
                      <ul className={styles.markerChips}>{addonNewMarkers(a, product).map((id) => <li key={id}>{getBiomarker(id).name}</li>)}</ul>
                    </li>
                  );
                })}
              </ul>
            </div>
          </Container>
        </section>

        {/* 5. How it works */}
        <section data-theme="light" className={styles.section} aria-labelledby="steps-title">
          <Container className={styles.narrow}>
            <h2 id="steps-title" className={styles.h2}>{f.steps.title}</h2>
            <ol className={styles.steps}>
              {f.steps.items.map((st, i) => (
                <li key={st.title} className={styles.step}>
                  <span className={styles.stepNum}><span className="num">{i + 1}</span></span>
                  <div>
                    <h3 className={styles.stepTitle}>{st.title}</h3>
                    <p className={styles.stepBody}>{fill(st.body)}</p>
                  </div>
                </li>
              ))}
            </ol>
            <div className={styles.sectionCta}><Cta id="women_steps_cta" location="women_steps" /></div>
          </Container>
        </section>

        {/* 5b. Photo band */}
        <figure className={styles.band} aria-label={womenMedia.reading.alt}>
          <Image src={womenMedia.reading.src} alt={womenMedia.reading.alt} fill sizes="100vw" style={{ objectFit: "cover" }} />
          <figcaption className={styles.bandCaption}><span>Every result explained in plain English. Yours to keep.</span></figcaption>
        </figure>

        {/* 6. Sound familiar */}
        <section data-theme="shell" className={styles.section} aria-labelledby="familiar-title">
          <Container className={styles.narrow}>
            <h2 id="familiar-title" className={styles.h2}>{f.familiar.title}</h2>
            <ul className={styles.familiar}>
              {f.familiar.items.map((t) => <li key={t}>{t}</li>)}
            </ul>
            <p className={styles.familiarNote}>{f.familiar.note}</p>
          </Container>
        </section>

        {/* 7. Keep an eye on it: plans */}
        <section id="plans" data-theme="light" className={styles.section} aria-labelledby="plans-title">
          <Container className={styles.narrow}>
            <h2 id="plans-title" className={styles.h2}>{f.plans.title}</h2>
            <p className={styles.intro}>{fill(f.plans.intro)}</p>
            <ul className={styles.plans}>
              {f.plans.rows.map((r) => (
                <li key={r.id} className={cx(styles.plan, r.id !== "one_time" && styles.planFeatured)}>
                  <h3 className={styles.planName}>{r.name}</h3>
                  <p className={styles.planPrice}>{(() => { const [amount, ...rest] = fill(r.price).split(" "); return <><span className="num">{amount}</span>{rest.length ? <span className={styles.planPer}> {rest.join(" ")}</span> : null}</>; })()}</p>
                  <p className={styles.planTagline}>{fill(r.sub)}</p>
                  <Button href={r.href} full variant={r.id === "one_time" ? "solid" : "outline"} ctaId={`women_plan_${r.id}`} location="women_plans">{r.cta} <Icon name="arrow" size={18} /></Button>
                </li>
              ))}
            </ul>
            <p className={styles.optionalNote}>{fill(f.plans.optionalNote)}</p>
            <p className={styles.disclosure}>{fill(f.plans.disclosure)}</p>
          </Container>
        </section>

        {/* 8. Guarantee + trust */}
        {f.safety.guarantee.verified || PREVIEW ? (
          <section data-theme="shell" className={styles.section} aria-labelledby="guarantee-title">
            <Container className={styles.narrow}>
              <div className={styles.guarantee}>
                <p className={styles.guaranteeEyebrow}>Our guarantee</p>
                <h2 id="guarantee-title" className={styles.guaranteeTitle}>{f.safety.guarantee.title}{!f.safety.guarantee.verified && PREVIEW ? <span className={styles.todo}>?</span> : null}</h2>
                <p className={styles.guaranteeBody}>{f.safety.guarantee.body.map((l, i) => <span key={i} className={styles.ledeLine}>{fill(l)}</span>)}</p>
                <ul className={styles.safety}>
                  {visible(f.safety.bullets).map((c, i) => <li key={i}><Icon name="check" size={16} /> <ClaimText c={c} /></li>)}
                </ul>
                <p className={styles.guaranteeTerms}>{f.safety.guarantee.terms} <Link href="/legal/terms">Read the terms</Link>.</p>
                <p className={styles.disclaimerLine}>{f.safety.disclaimer}</p>
              </div>
            </Container>
          </section>
        ) : null}

        {/* 9. Close */}
        <section data-theme="dark" className={cx(styles.close, styles.closePhoto)} aria-labelledby="close-title">
          <div className={styles.heroMedia} aria-hidden="true">
            <Image src={womenMedia.close.src} alt="" fill sizes="100vw" style={{ objectFit: "cover", objectPosition: "center 40%" }} />
            <div className={styles.closeShade} />
          </div>
          <Container className={styles.closeInner}>
            <h2 id="close-title" className={styles.closeTitle}>{f.close.headline}</h2>
            <p className={styles.closeSub}>{fill(f.close.sub)}</p>
            <Cta id="women_close_cta" location="women_close" label={f.close.cta.label} />
            <p className={styles.closeFine}>{f.close.micro}</p>
          </Container>
        </section>

        {/* 10. FAQ */}
        <section data-theme="light" className={styles.section} aria-labelledby="faq-title">
          <Container className={styles.narrow}>
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
      </main>
      <SiteFooter />
      <LandingPageView slug={f.slug} />
    </>
  );
}
