"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { addonBadgeLabels, addonNewMarkers, displayableAddonsFor, isSellable, type Addon } from "@/config/addons";
import { getBiomarker, groupByCategory } from "@/config/biomarkers";
import { configuratorCopy as copy, configuratorHeadings, resolveHeadingVariant } from "@/config/configurator";
import { getCollectionMethod } from "@/config/collection";
import { productMarkerCount, signalTest } from "@/config/products";
import { bestDiscountBps, formatDiscount } from "@/config/retest-offer";
import { readAnalyticsContext } from "@/lib/analytics/context";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { defaultConfiguration, displayTotal, parseConfiguration, parseRecommended, quoteConfiguration, serializeConfiguration, toggleAddon, type Configuration } from "@/lib/pricing";
import styles from "./SignalConfigurator.module.css";

/**
 * Step 1: the SIGNAL Test (always included, no checkbox). Step 2: add-ons as
 * cards with a selected / recommended / disabled state and an expandable
 * "What you get". Total, "What's included" and coverage update instantly;
 * the selection is mirrored to the URL (?addons=, ?rec=) so it is shareable
 * and survives a reload. The sticky bar keeps price and Continue in reach on
 * mobile.
 *
 * Copy, order and badges come from config (configurator.ts, products.ts,
 * addons.ts). Nothing medical is typed here.
 *
 * Analytics (first-party only; add-on ids never reach ad platforms):
 * configurator_started, addon_viewed, addon_selected, addon_removed,
 * configurator_completed.
 */
export function SignalConfigurator() {
  const [cfg, setCfg] = useState<Configuration>(() => defaultConfiguration(signalTest));
  const [recommended, setRecommended] = useState<string[]>([]);
  const [heading, setHeading] = useState(configuratorHeadings[copy.defaultHeading]);
  const [hydrated, setHydrated] = useState(false);
  const started = useRef(false);
  const quote = useMemo(() => quoteConfiguration(cfg), [cfg]);
  const options = displayableAddonsFor(signalTest);
  const baseGroups = groupByCategory(signalTest.markerIds);
  const checkoutHref = `/checkout${serializeConfiguration(cfg)}`;

  // Read the deep-linked selection on the client so the page stays static.
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setCfg(parseConfiguration(params, signalTest));
    setRecommended(parseRecommended(params, signalTest));
    const ctx = readAnalyticsContext();
    if (ctx.experiment_id === "configurator_heading") setHeading(configuratorHeadings[resolveHeadingVariant(ctx.variant)]);
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const url = `${window.location.pathname}${serializeConfiguration(cfg, { recommendedAddonIds: recommended })}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [cfg, recommended, hydrated]);

  function start() {
    if (started.current) return;
    started.current = true;
    track({ name: "configurator_started", props: { product_id: signalTest.id } });
  }

  function toggle(a: Addon) {
    if (!isSellable(a)) return;
    start();
    const has = cfg.addonIds.includes(a.id);
    track({ name: has ? "addon_removed" : "addon_selected", props: { addon_id: a.id } });
    setCfg(toggleAddon(cfg, a.id));
  }

  function viewed(a: Addon, open: boolean) {
    if (!open) return;
    start();
    track({ name: "addon_viewed", props: { addon_id: a.id } });
  }

  function complete() {
    track({
      name: "configurator_completed",
      props: {
        product_id: signalTest.id,
        addon_ids: cfg.addonIds,
        addon_count: cfg.addonIds.length,
        ...(quote.totalCents !== null ? { value: quote.totalCents / 100, currency: "AUD" as const } : {}),
      },
    });
  }

  // "What's included": every area in the current configuration, with how many
  // markers come from the base and which add-on adds the rest.
  const included = groupByCategory(quote.markerIds).map((g) => {
    const base = g.markers.filter((m) => signalTest.markerIds.includes(m.id)).length;
    const from = quote.addons.filter((a) => a.markerIds.some((id) => g.markers.some((m) => m.id === id)));
    return { id: g.category.id, name: g.category.name, count: g.markers.length, base, from };
  });

  return (
    <div className={styles.wrap}>
      <div className={styles.steps}>
        <section className={styles.step} aria-labelledby="step1">
          <p className={styles.stepLabel}><span className="num">1</span> {copy.step1Label}</p>
          <h2 id="step1" className={styles.stepTitle}>{signalTest.name}</h2>
          <p className={styles.stepBody}>{copy.step1Body}</p>
          <div className={styles.baseCard}>
            <div className={styles.baseHead}>
              <span className={styles.included}><Icon name="check" size={14} /> {copy.includedLabel}</span>
              <span className={styles.basePrice}>{signalTest.priceCents !== null ? <span className="num">{formatAUD(signalTest.priceCents)}</span> : <span className={styles.tbc}>{copy.pricingSoon}</span>}</span>
            </div>
            <p className={styles.baseCounts}><span className="num">{baseGroups.length}</span> areas of health · <span className="num">{productMarkerCount(signalTest)}</span> markers</p>
            <ul className={styles.baseAreas} aria-label="Areas in the SIGNAL Test">
              {baseGroups.map((g) => <li key={g.category.id}>{g.category.name} <span className={cx(styles.areaCount, "num")}>{g.markers.length}</span></li>)}
            </ul>
            <a href="#what-is-tested" className={styles.baseLink}>See every marker</a>
          </div>
        </section>

        <section className={styles.step} aria-labelledby="step2">
          <p className={styles.stepLabel}><span className="num">2</span> {copy.step2Label}</p>
          <h2 id="step2" className={styles.stepTitle}>{heading.title}</h2>
          <p className={styles.stepBody}>{heading.body}</p>
          <ul className={styles.addons}>
            {options.map((a) => {
              const on = cfg.addonIds.includes(a.id);
              const sellable = isSellable(a);
              const rec = !on && sellable && recommended.includes(a.id);
              const markers = addonNewMarkers(a, signalTest);
              const badge = rec ? copy.recommendedLabel : !sellable ? copy.comingLabel : a.badge ? addonBadgeLabels[a.badge] : null;
              return (
                <li key={a.id} id={a.slug}>
                  <article className={cx(styles.card, on && styles.cardOn, rec && styles.cardRec, !sellable && styles.cardOff)} aria-labelledby={`${a.slug}-name`}>
                    <div className={styles.cardBody}>
                      <div className={styles.cardHead}>
                        <h3 id={`${a.slug}-name`} className={styles.cardName}>{a.name}</h3>
                        {badge ? <span className={cx(styles.badge, rec && styles.badgeRec, !sellable && styles.badgeOff)}>{badge}</span> : null}
                        <span className={styles.cardPrice}>{!sellable ? "" : a.priceCents !== null ? <span className="num">+{formatAUD(a.priceCents)}</span> : copy.priceTbc}</span>
                      </div>
                      <p id={`${a.slug}-desc`} className={styles.cardShort}>{a.shortDescription}</p>
                      <p className={styles.markersLabel}>{copy.markersLabel(markers.length)}</p>
                      <ul className={styles.markerChips} aria-label={`Markers in ${a.name}`}>
                        {markers.map((id) => { const m = getBiomarker(id); return <li key={id} className={cx(styles.chip, m.derivedFrom && styles.chipDerived)}>{m.short ?? m.name}</li>; })}
                      </ul>
                      <div className={styles.actions}>
                        <button
                          type="button"
                          className={cx(styles.cta, on && styles.ctaOn)}
                          aria-pressed={on}
                          aria-disabled={!sellable}
                          disabled={!sellable}
                          aria-describedby={`${a.slug}-desc`}
                          onClick={() => toggle(a)}
                        >
                          {on ? <><Icon name="check" size={16} /> {copy.addedLabel}</> : !sellable ? copy.comingLabel : <><Icon name="plus" size={16} /> {copy.addLabel}</>}
                        </button>
                        <span className={styles.actionHint} aria-live="polite">{on ? copy.removeHint : !sellable ? copy.comingHint : ""}</span>
                      </div>
                    </div>
                    <details className={styles.details} onToggle={(e) => viewed(a, (e.currentTarget as HTMLDetailsElement).open)}>
                      <summary className={styles.detailsSummary}>
                        <span>{copy.detailsLabel}</span>
                        <span className={styles.detailsToggle} aria-hidden="true"><Icon name="plus" size={14} className={styles.plus} /><Icon name="minus" size={14} className={styles.minus} /></span>
                      </summary>
                      <div className={styles.detailsBody}>
                        <p className={styles.long}>{a.longDescription}</p>
                        <p className={styles.forWho}><strong>For you if</strong> {a.forWho}</p>
                        <ul className={styles.markerGrid}>
                          {markers.map((id) => { const m = getBiomarker(id); return <li key={id} className={m.derivedFrom ? styles.derived : undefined}>{m.name}{m.derivedFrom ? <span className={styles.calc}> · calculated</span> : null}</li>; })}
                        </ul>
                        <p className={styles.detailsFoot}>{copy.additionalMarkers(markers.length)} on top of the {productMarkerCount(signalTest)} in every SIGNAL.</p>
                      </div>
                    </details>
                  </article>
                </li>
              );
            })}
          </ul>
          <p className={styles.help}>{copy.quizPrompt} <a href="/find-my-signal">{copy.quizLink}</a> {copy.quizAfter}</p>
        </section>
      </div>

      <aside className={styles.summary} aria-labelledby="summary-title">
        <div className={styles.summaryHead}>
          <p id="summary-title" className={styles.summaryTitle}>{copy.summaryTitle}</p>
          <span className={styles.coveragePill}><span className="num">{quote.categoryCount}</span> areas · <span className="num">{quote.markerCount}</span> markers</span>
        </div>

        <ul className={styles.cart}>
          <li className={styles.cartBase}>
            <span className={styles.cartText}>
              <span className={styles.cartName}>{signalTest.name}</span>
              <span className={styles.cartSub}><span className="num">{baseGroups.length}</span> areas · <span className="num">{productMarkerCount(signalTest)}</span> markers · always included</span>
            </span>
            <span className={cx(styles.cartPrice, "num")}>{signalTest.priceCents !== null ? formatAUD(signalTest.priceCents) : "TBC"}</span>
          </li>
          {quote.addons.map((a) => (
            <li key={a.id} className={styles.cartRow}>
              <span className={styles.cartText}>
                <span className={styles.cartName}>{a.name} <span className={cx(styles.cartInline, "num")}>{copy.markersUnit(addonNewMarkers(a, signalTest).length)}</span></span>
              </span>
              <span className={cx(styles.cartPrice, "num")}>{a.priceCents !== null ? formatAUD(a.priceCents) : "TBC"}</span>
              <button type="button" className={styles.cartRemove} onClick={() => toggle(a)} aria-label={copy.removeLabel(a.name)}><Icon name="close" size={14} /></button>
            </li>
          ))}
          {quote.addons.length === 0 ? <li className={styles.cartEmpty}>{copy.summaryEmpty}</li> : null}
        </ul>

        <div className={styles.coverage}>
          <p className={styles.coverageTitle}>{copy.coverageTitle}</p>
          <ul className={styles.areaChips} aria-label="Areas of health in your SIGNAL">
            {included.map((g) => (
              <li key={g.id} className={cx(styles.areaChip, g.from.length > 0 && styles.areaChipAdded)} title={g.from.length ? `${g.base ? `${g.count - g.base} added by` : "With"} ${g.from.map((a) => a.name).join(", ")}` : undefined}>
                <span>{g.name}</span>
                <span className={cx(styles.areaCount, "num")}>{g.count}</span>
                {g.from.length && g.base ? <span className={cx(styles.areaPlus, "num")}>+{g.count - g.base}</span> : g.from.length ? <span className={styles.areaPlus} aria-hidden="true">+</span> : null}
              </li>
            ))}
          </ul>
          <a href="#what-is-tested" className={styles.coverageLink}>{copy.coverageLink}</a>
        </div>

        <div className={styles.total}>
          <span>Total</span>
          <span className={cx(styles.totalValue, "num")}>{displayTotal(quote, formatAUD, copy.pricingSoon)}</span>
        </div>
        <Button href={checkoutHref} full ctaId="configurator_continue" location="configurator" onClick={complete}>{copy.continueLabel} <Icon name="arrow" size={18} /></Button>
        <ul className={styles.trust}>
          {getCollectionMethod("centre").priceDeltaCents === 0 ? <li><Icon name="check" size={13} /> {copy.summaryTrust.centreIncluded}</li> : null}
          <li><Icon name="check" size={13} /> {copy.summaryTrust.payment}</li>
        </ul>
        {bestDiscountBps() > 0 ? <p className={styles.note}>{copy.summaryRetestHint.replace("{discount}", formatDiscount(bestDiscountBps()))}</p> : null}
      </aside>

      <div className={styles.bar} data-theme="light">
        <div className={styles.barInner}>
          <span className={styles.barText}>
            <span className={styles.barLabel}>{copy.stickyLabel}{quote.addons.length ? ` + ${quote.addons.length}` : ""}</span>
            <span className={cx(styles.barPrice, "num")}>{displayTotal(quote, formatAUD, `${quote.markerCount} markers`)}</span>
          </span>
          <Button href={checkoutHref} size="sm" ctaId="configurator_continue_sticky" location="configurator_bar" className={styles.barButton} onClick={complete}>{copy.continueLabel}</Button>
        </div>
      </div>
    </div>
  );
}
