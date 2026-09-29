"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { addonNewMarkers, addonsFor, type Addon } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { productCategories, productMarkerCount, signalTest } from "@/config/products";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { defaultConfiguration, parseConfiguration, quoteConfiguration, serializeConfiguration, toggleAddon, type Configuration } from "@/lib/pricing";
import styles from "./SignalConfigurator.module.css";

/**
 * Step 1: the SIGNAL Test (always included). Step 2: make it yours (add-ons).
 * Total, summary and coverage update instantly; the selection is mirrored to
 * the URL (?addons=) so it is shareable and survives a reload. The sticky bar
 * keeps price and Continue in reach on mobile.
 *
 * Analytics: configurator_started on first interaction, addon_selected /
 * addon_removed with the add-on id (first-party only; never to ad platforms).
 */
export function SignalConfigurator() {
  const [cfg, setCfg] = useState<Configuration>(() => defaultConfiguration(signalTest));
  const [hydrated, setHydrated] = useState(false);
  const started = useRef(false);
  const quote = useMemo(() => quoteConfiguration(cfg), [cfg]);
  const options = addonsFor(signalTest);
  const baseAreas = productCategories(signalTest).length;
  const checkoutHref = `/checkout${serializeConfiguration(cfg)}`;

  // Read the deep-linked selection (?addons=) on the client so the page stays static.
  useEffect(() => {
    setCfg(parseConfiguration(new URLSearchParams(window.location.search), signalTest));
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const url = `${window.location.pathname}${serializeConfiguration(cfg)}${window.location.hash}`;
    window.history.replaceState(null, "", url);
  }, [cfg, hydrated]);

  function toggle(a: Addon) {
    if (a.status !== "live" && a.status !== "planned") return;
    if (!started.current) { started.current = true; track({ name: "configurator_started", props: { product_id: signalTest.id } }); }
    const has = cfg.addonIds.includes(a.id);
    track({ name: has ? "addon_removed" : "addon_selected", props: { addon_id: a.id } });
    setCfg(toggleAddon(cfg, a.id));
  }

  return (
    <div className={styles.wrap}>
      <div className={styles.steps}>
        <section className={styles.step} aria-labelledby="step1">
          <p className={styles.stepLabel}><span className="num">1</span> The test</p>
          <h2 id="step1" className={styles.stepTitle}>{signalTest.name}</h2>
          <p className={styles.stepBody}>Everything in the comprehensive base. Always included.</p>
          <div className={styles.baseCard}>
            <div className={styles.baseHead}>
              <span className={styles.included}><Icon name="check" size={14} /> Included</span>
              <span className={styles.basePrice}>{signalTest.priceCents !== null ? <span className="num">{formatAUD(signalTest.priceCents)}</span> : <span className={styles.tbc}>Pricing coming soon</span>}</span>
            </div>
            <p className={styles.baseCounts}><span className="num">{baseAreas}</span> areas of health · <span className="num">{productMarkerCount(signalTest)}</span> markers</p>
            <ul className={styles.baseAreas}>
              {productCategories(signalTest).map((c) => <li key={c.id}>{c.name}</li>)}
            </ul>
            <a href="#what-is-tested" className={styles.baseLink}>See every marker</a>
          </div>
        </section>

        <section className={styles.step} aria-labelledby="step2">
          <p className={styles.stepLabel}><span className="num">2</span> Make it yours</p>
          <h2 id="step2" className={styles.stepTitle}>Go deeper where it matters to you.</h2>
          <p className={styles.stepBody}>Optional depth on top of the base test. Add or remove any time before you pay.</p>
          <ul className={styles.addons}>
            {options.map((a) => {
              const on = cfg.addonIds.includes(a.id);
              const markers = addonNewMarkers(a, signalTest);
              return (
                <li key={a.id}>
                  <button
                    type="button"
                    className={cx(styles.addon, on && styles.addonOn)}
                    aria-pressed={on}
                    onClick={() => toggle(a)}
                  >
                    <span className={styles.check} aria-hidden="true">{on ? <Icon name="check" size={16} /> : <Icon name="plus" size={16} />}</span>
                    <span className={styles.addonText}>
                      <span className={styles.addonHead}>
                        <span className={styles.addonName}>{a.name}</span>
                        <span className={styles.addonPrice}>{a.priceCents !== null ? <span className="num">+{formatAUD(a.priceCents)}</span> : "Price TBC"}</span>
                      </span>
                      <span className={styles.addonBenefit}>{a.benefit}</span>
                      <span className={styles.addonMarkers}>{markers.map((id) => getBiomarker(id).short ?? getBiomarker(id).name).join(" · ")}</span>
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>
        </section>
      </div>

      <aside className={styles.summary} aria-labelledby="summary-title">
        <p id="summary-title" className={styles.summaryTitle}>Your SIGNAL</p>
        <ul className={styles.lines}>
          {quote.lines.map((l) => (
            <li key={l.id} className={styles.line}>
              <span>{l.label}</span>
              <span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span>
            </li>
          ))}
        </ul>
        <p className={styles.coverage}><span className="num">{quote.categoryCount}</span> areas of health · <span className="num">{quote.markerCount}</span> markers</p>
        <div className={styles.total}>
          <span>Total</span>
          <span className={cx(styles.totalValue, "num")}>{quote.totalCents !== null ? formatAUD(quote.totalCents) : "Pricing coming soon"}</span>
        </div>
        <Button href={checkoutHref} full ctaId="configurator_continue" location="configurator">Continue <Icon name="arrow" size={18} /></Button>
        <p className={styles.note}>Collection options and any details are shown before you pay.</p>
      </aside>

      <div className={styles.bar} data-theme="light">
        <div className={styles.barInner}>
          <span className={styles.barText}>
            <span className={styles.barLabel}>Your SIGNAL{quote.addons.length ? ` + ${quote.addons.length}` : ""}</span>
            <span className={cx(styles.barPrice, "num")}>{quote.totalCents !== null ? formatAUD(quote.totalCents) : `${quote.markerCount} markers`}</span>
          </span>
          <Button href={checkoutHref} size="sm" ctaId="configurator_continue_sticky" location="configurator_bar" className={styles.barButton}>Continue</Button>
        </div>
      </div>
    </div>
  );
}
