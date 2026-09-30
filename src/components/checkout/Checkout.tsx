"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { NextSteps } from "@/components/journey/NextSteps";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { addonNewMarkers, sellableAddonsFor } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { collectionMethods, type CollectionMethodId } from "@/config/collection";
import { signalTest } from "@/config/products";
import { visibleTrustClaims } from "@/config/trust";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { defaultConfiguration, parseConfiguration, quoteConfiguration, serializeConfiguration, toggleAddon, type Configuration } from "@/lib/pricing";
import styles from "./Checkout.module.css";

/**
 * Checkout: order summary you can still edit, collection choice, what happens
 * next, then payment. Payment is a Stripe boundary (lib/checkout/create-order);
 * until it is connected the pay button says so honestly instead of pretending.
 */
export function Checkout() {
  const [cfg, setCfg] = useState<Configuration>(() => defaultConfiguration(signalTest));
  const [hydrated, setHydrated] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const quote = useMemo(() => quoteConfiguration(cfg), [cfg]);
  const methods = collectionMethods.filter((m) => signalTest.collectionMethodIds.includes(m.id));
  const options = sellableAddonsFor(signalTest);
  const trust = visibleTrustClaims().filter((c) => c.status === "verified").slice(0, 3);
  const paymentsLive = false; // flipped by phase 6 when createOrder returns "ready"

  useEffect(() => {
    const parsed = parseConfiguration(new URLSearchParams(window.location.search), signalTest);
    setCfg(parsed);
    setAddonsOpen(parsed.addonIds.length === 0);
    setHydrated(true);
    track({ name: "checkout_started", props: { product_id: signalTest.id, addon_ids: parsed.addonIds } });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    window.history.replaceState(null, "", `${window.location.pathname}${serializeConfiguration(cfg)}`);
  }, [cfg, hydrated]);

  function toggle(id: string) {
    const has = cfg.addonIds.includes(id);
    track({ name: has ? "addon_removed" : "addon_selected", props: { addon_id: id } });
    setCfg(toggleAddon(cfg, id));
  }

  function chooseCollection(id: CollectionMethodId) {
    setCfg({ ...cfg, collectionMethodId: id });
    track({ name: "collection_method_selected", props: { product_id: signalTest.id, method: id } });
  }

  const canPay = paymentsLive && quote.pricingComplete && Boolean(cfg.collectionMethodId);

  return (
    <div className={styles.wrap}>
      <div className={styles.main}>
        <section className={styles.block} aria-labelledby="summary-title">
          <h2 id="summary-title" className={styles.blockTitle}><span className={styles.n}>1</span> Your SIGNAL</h2>
          <ul className={styles.lines}>
            {quote.lines.filter((l) => l.kind !== "collection").map((l) => (
              <li key={l.id} className={styles.line}>
                <span className={styles.lineText}>
                  <span className={styles.lineLabel}>{l.label}</span>
                  {l.kind === "product" ? <span className={styles.lineSub}><span className="num">{quote.categoryCount}</span> areas of health · <span className="num">{quote.markerCount}</span> markers, every one explained</span> : null}
                </span>
                <span className={styles.lineRight}>
                  <span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span>
                  {l.kind === "addon" ? <button type="button" className={styles.remove} onClick={() => toggle(l.id)}>Remove</button> : null}
                </span>
              </li>
            ))}
          </ul>
          <details className={styles.addons} open={addonsOpen} onToggle={(e) => setAddonsOpen((e.currentTarget as HTMLDetailsElement).open)}>
            <summary className={styles.addonsSummary}>
              <span>{cfg.addonIds.length ? "Add more depth" : "Go deeper where it matters to you"} <span className={styles.optional}>optional</span></span>
              <span className={styles.toggle} aria-hidden="true"><Icon name="plus" size={16} className={styles.plus} /><Icon name="minus" size={16} className={styles.minus} /></span>
            </summary>
            <ul className={styles.addonList}>
              {options.map((a) => {
                const on = cfg.addonIds.includes(a.id);
                return (
                  <li key={a.id} className={cx(styles.addonRow, on && styles.addonRowOn)}>
                    <span className={styles.addonText}>
                      <span className={styles.addonName}>{a.name} <span className={styles.addonPrice}>{a.priceCents !== null ? `+${formatAUD(a.priceCents)}` : "Price TBC"}</span></span>
                      <span className={styles.addonFor}>{a.shortDescription}</span>
                      <span className={styles.addonMarkers}><span className="num">+{addonNewMarkers(a, signalTest).length}</span> · {addonNewMarkers(a, signalTest).map((id) => getBiomarker(id).short ?? getBiomarker(id).name).join(" · ")}</span>
                    </span>
                    <button type="button" className={cx(styles.addBtn, on && styles.addBtnOn)} aria-pressed={on} onClick={() => toggle(a.id)}>
                      {on ? <><Icon name="check" size={16} /> Added</> : <><Icon name="plus" size={16} /> Add</>}
                    </button>
                  </li>
                );
              })}
            </ul>
            <p className={styles.hint}>Not sure? <Link href="/find-my-signal">Answer four quick questions</Link> and we&apos;ll suggest the add-ons that fit.</p>
          </details>
        </section>

        <section className={styles.block} aria-labelledby="collection-title">
          <h2 id="collection-title" className={styles.blockTitle}><span className={styles.n}>2</span> How would you like to be collected?</h2>
          <div className={styles.methods} role="radiogroup" aria-labelledby="collection-title">
            {methods.map((m) => {
              const on = cfg.collectionMethodId === m.id;
              return (
                <button key={m.id} type="button" role="radio" aria-checked={on} className={cx(styles.method, on && styles.methodOn)} onClick={() => chooseCollection(m.id)}>
                  <span className={styles.radio} aria-hidden="true" />
                  <span className={styles.methodText}>
                    <span className={styles.methodName}>{m.name}</span>
                    <span className={styles.methodBody}>{m.description} {m.availabilityNote}</span>
                  </span>
                  <span className={styles.methodPrice}>{m.priceDeltaCents === null ? "Price TBC" : m.priceDeltaCents === 0 ? "Included" : `+${formatAUD(m.priceDeltaCents)}`}</span>
                </button>
              );
            })}
          </div>
          <p className={styles.hint}>You pick the exact time and place after payment. No referral paperwork to organise.</p>
        </section>

        <section className={styles.block} aria-labelledby="next-title-inline">
          <h2 id="next-title-inline" className={styles.blockTitle}><span className={styles.n}>3</span> What happens next</h2>
          <NextSteps bare current="pay" only={["pay", "book", "collect", "results"]} />
        </section>
      </div>

      <aside className={styles.pay} aria-labelledby="pay-title">
        <p id="pay-title" className={styles.payTitle}>Order total</p>
        <ul className={styles.payLines}>
          {quote.lines.map((l) => (
            <li key={l.id}><span>{l.label}</span><span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span></li>
          ))}
        </ul>
        <div className={styles.total}><span>Total</span><span className={cx(styles.totalValue, "num")}>{quote.totalCents !== null ? formatAUD(quote.totalCents) : "Pricing coming soon"}</span></div>
        <button type="button" className={styles.payButton} disabled={!canPay} aria-disabled={!canPay}>
          {paymentsLive ? "Pay securely" : "Payments open at launch"} <Icon name="arrow" size={18} />
        </button>
        <p className={styles.payNote}>
          {paymentsLive
            ? "Card, Apple Pay and Google Pay. Secured by Stripe."
            : cfg.collectionMethodId ? "Card, Apple Pay and Google Pay will be available here." : "Choose a collection option to continue."}
        </p>
        {trust.length ? (
          <ul className={styles.trust}>
            {trust.map((c) => <li key={c.id}><Icon name={c.icon} size={14} /> {c.text}</li>)}
          </ul>
        ) : null}
        <p className={styles.fine}>You&apos;ll receive an email confirmation and a link to book your collection. Prices in AUD.</p>
      </aside>

      <div className={styles.bar} data-theme="light">
        <div className={styles.barInner}>
          <span className={styles.barText}>
            <span className={styles.barLabel}>Total</span>
            <span className={cx(styles.barPrice, "num")}>{quote.totalCents !== null ? formatAUD(quote.totalCents) : "Pricing coming soon"}</span>
          </span>
          <button type="button" className={cx(styles.payButton, styles.barButton)} disabled={!canPay} aria-disabled={!canPay}>{paymentsLive ? "Pay" : "Opens at launch"}</button>
        </div>
      </div>
    </div>
  );
}
