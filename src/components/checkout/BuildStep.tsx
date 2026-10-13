"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Steps } from "@/components/checkout/Steps";
import { Icon } from "@/components/ui/Icon";
import { addonNewMarkers, sellableAddonsFor } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { collectionMethods, type CollectionMethodId } from "@/config/collection";
import { guarantee } from "@/config/panel";
import { getProduct, signalTest } from "@/config/products";
import { retestOffers, type RetestOffer } from "@/config/retest-offer";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { defaultConfiguration, displayTotal, parseConfiguration, quoteConfiguration, serializeConfiguration, toggleAddon, type Configuration } from "@/lib/pricing";
import styles from "./BuildStep.module.css";

export const DETAILS_PATH = "/checkout/details";

/** Link into the checkout stage carrying everything chosen here. */
export function detailsHref(cfg: Configuration, plan: RetestOffer | null): string {
  const base = serializeConfiguration(cfg);
  return `${DETAILS_PATH}${base}${plan ? `${base ? "&" : "?"}plan=${plan.id}` : ""}`;
}

const METHOD_ICON: Record<CollectionMethodId, "pin" | "home"> = { centre: "pin", mobile: "home" };

/**
 * Step one of checkout: build the test. Two decisions, both in plain sight:
 * where the blood is taken, and whether to add depth. Nothing is typed here.
 * The chosen configuration travels in the URL to the checkout stage.
 */
export function BuildStep() {
  const [cfg, setCfg] = useState<Configuration>(() => ({ ...defaultConfiguration(signalTest), collectionMethodId: "centre" }));
  const [plan, setPlan] = useState<RetestOffer | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const product = getProduct(cfg.productId) ?? signalTest;
  const quote = useMemo(() => quoteConfiguration(cfg), [cfg]);
  const methods = collectionMethods.filter((m) => product.collectionMethodIds.includes(m.id));
  const options = sellableAddonsFor(product);
  const total = displayTotal(quote, formatAUD, "Pricing coming soon");
  const next = detailsHref(cfg, plan);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseConfiguration(params, signalTest);
    setCfg({ ...parsed, collectionMethodId: parsed.collectionMethodId ?? "centre" });
    setPlan(retestOffers.find((o) => o.active && o.id === params.get("plan")) ?? null);
    setHydrated(true);
    track({ name: "checkout_started", props: { product_id: parsed.productId, addon_ids: parsed.addonIds } });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    const base = serializeConfiguration(cfg);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${base}${plan ? `${base ? "&" : "?"}plan=${plan.id}` : ""}`);
  }, [cfg, plan, hydrated]);

  function toggle(id: string) {
    const has = cfg.addonIds.includes(id);
    track({ name: has ? "addon_removed" : "addon_selected", props: { addon_id: id } });
    setCfg(toggleAddon(cfg, id));
  }
  function chooseCollection(id: CollectionMethodId) {
    setCfg({ ...cfg, collectionMethodId: id });
    track({ name: "collection_method_selected", props: { product_id: cfg.productId, method: id } });
  }

  const productLine = quote.lines.find((l) => l.kind === "product");
  const compare = product.compareAtPriceCents !== null && productLine?.priceCents !== null && productLine && product.compareAtPriceCents > productLine.priceCents ? product.compareAtPriceCents : null;

  const summary = (
    <aside className={styles.summary} aria-labelledby="summary-title">
      <p className={styles.summaryTag}>Your test</p>
      <h2 id="summary-title" className={styles.summaryTitle}>The SIGNAL Test</h2>
      <ul className={styles.summaryLines}>
        {quote.lines.map((l) => (
          <li key={l.id}>
            <span>{l.label}</span>
            <span className="num">
              {l.kind === "product" && compare ? <s className={styles.compare}>{formatAUD(compare)}</s> : null}
              {l.priceCents === null ? "TBC" : l.priceCents === 0 ? "Included" : formatAUD(l.priceCents)}
            </span>
          </li>
        ))}
      </ul>
      <div className={styles.total}><span>Total</span><span className={cx(styles.totalValue, "num")}>{total}</span></div>
      <Link href={next} className={styles.continue}>Continue to checkout <Icon name="arrow" size={18} /></Link>
      <p className={styles.summaryNote}>Your details next, then card, Apple Pay or Google Pay.</p>
      <p className={styles.summaryGuarantee}><Icon name="check" size={14} /> {guarantee.title}</p>
    </aside>
  );

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <Steps current={1} />
        <h1 className={styles.title}>Build your test.</h1>
        <p className={styles.intro}>Two quick choices. Then your details and payment.</p>
      </header>

      <div className={styles.main}>
        <section className={styles.block} aria-labelledby="collection-title">
          <div className={styles.blockHead}>
            <h2 id="collection-title" className={styles.blockTitle}>Where would you like your blood taken?</h2>
            <p className={styles.blockSub}>Both are the same test, the same markers and the same doctor&apos;s explanation.</p>
          </div>
          <div className={styles.methods} role="radiogroup" aria-labelledby="collection-title">
            {methods.map((m) => {
              const on = cfg.collectionMethodId === m.id;
              return (
                <button key={m.id} type="button" role="radio" aria-checked={on} className={cx(styles.method, on && styles.methodOn)} onClick={() => chooseCollection(m.id)}>
                  <span className={styles.methodIcon}><Icon name={METHOD_ICON[m.id]} size={20} /></span>
                  <span className={styles.methodText}>
                    <span className={styles.methodName}>{m.name}</span>
                    <span className={styles.methodBody}>{m.description}</span>
                    <span className={styles.methodNote}>{m.availabilityNote}</span>
                  </span>
                  <span className={styles.methodRight}>
                    <span className={cx(styles.methodPrice, "num")}>{m.priceDeltaCents === null ? "Price TBC" : m.priceDeltaCents === 0 ? "Included" : `+${formatAUD(m.priceDeltaCents)}`}</span>
                    <span className={styles.radio} aria-hidden="true">{on ? <Icon name="check" size={14} /> : null}</span>
                  </span>
                </button>
              );
            })}
          </div>
        </section>

        <section className={styles.block} aria-labelledby="addons-title">
          <div className={styles.blockHead}>
            <h2 id="addons-title" className={styles.blockTitle}>Go deeper where it matters to you <span className={styles.optional}>optional</span></h2>
            <p className={styles.blockSub}>Same blood draw, same visit, same report. Add any of these.</p>
          </div>
          <ul className={styles.addons}>
            {options.map((a) => {
              const on = cfg.addonIds.includes(a.id);
              const markers = addonNewMarkers(a, product);
              return (
                <li key={a.id} className={cx(styles.addon, on && styles.addonOn)}>
                  <div className={styles.addonHead}>
                    <span className={styles.addonName}>{a.name}</span>
                    <span className={cx(styles.addonPrice, "num")}>{a.priceCents !== null ? `+${formatAUD(a.priceCents)}` : "Price TBC"}</span>
                  </div>
                  <p className={styles.addonFor}>{a.shortDescription}</p>
                  <p className={styles.addonMarkers}><span className="num">+{markers.length}</span> markers · {markers.map((id) => getBiomarker(id).short ?? getBiomarker(id).name).join(" · ")}</p>
                  <button type="button" className={cx(styles.addBtn, on && styles.addBtnOn)} aria-pressed={on} onClick={() => toggle(a.id)}>
                    {on ? <><Icon name="check" size={16} /> Added</> : <><Icon name="plus" size={16} /> Add to my test</>}
                  </button>
                </li>
              );
            })}
          </ul>
        </section>

        {plan ? (
          <section className={cx(styles.block, styles.planBlock)} aria-label="Retest plan">
            <p className={styles.planTitle}><Icon name="refresh" size={16} /> {plan.cadence} retesting plan</p>
            <p className={styles.planBody}>Pay for today&apos;s test now. You confirm the plan straight after payment.</p>
            <button type="button" className={styles.remove} onClick={() => setPlan(null)}>Remove plan</button>
          </section>
        ) : null}
      </div>

      {summary}

      <div className={styles.bar} data-theme="light">
        <div className={styles.barInner}>
          <span className={styles.barText}>
            <span className={styles.barLabel}>Your test</span>
            <span className={cx(styles.barPrice, "num")}>{total}</span>
          </span>
          <Link href={next} className={cx(styles.continue, styles.barButton)}>Continue <Icon name="arrow" size={16} /></Link>
        </div>
      </div>
    </div>
  );
}
