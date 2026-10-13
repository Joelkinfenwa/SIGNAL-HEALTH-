"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import styles from "./OfferBuilder.module.css";

export interface BuilderAddon { id: string; name: string; priceCents: number; body: string; markers: string[] }

/**
 * The upsell, done on the page: tap an add-on and the total and every
 * "Get tested" button update. One link into checkout carries the choice,
 * so the customer lands on payment with the basket already built.
 */
export function OfferBuilder({ productId, priceCents, compareAtCents, addons, ctaLabel, stickyLine, cardTitle, more }: {
  productId: string; priceCents: number; compareAtCents: number | null; addons: BuilderAddon[]; ctaLabel: string; stickyLine: string; cardTitle: string; more?: string;
}) {
  const [selected, setSelected] = useState<string[]>([]);
  const [visible, setVisible] = useState(false);
  const total = useMemo(() => priceCents + addons.filter((a) => selected.includes(a.id)).reduce((n, a) => n + a.priceCents, 0), [priceCents, addons, selected]);
  const href = `/checkout?product=${productId}${selected.length ? `&addons=${selected.join(",")}` : ""}`;
  const label = `${ctaLabel} – ${formatAUD(total)}`;

  useEffect(() => {
    const hero = document.getElementById("hero");
    if (!hero || !("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver(([entry]) => setVisible(entry ? !entry.isIntersecting : false), { threshold: 0 });
    io.observe(hero);
    return () => io.disconnect();
  }, []);

  const toggle = (id: string) => {
    const on = selected.includes(id);
    track({ name: on ? "addon_removed" : "addon_selected", props: { addon_id: id } });
    setSelected(on ? selected.filter((x) => x !== id) : [...selected, id]);
  };

  return (
    <>
      <ul className={styles.cards}>
        {addons.map((a) => {
          const on = selected.includes(a.id);
          return (
            <li key={a.id} className={cx(styles.card, on && styles.cardOn)}>
              <button type="button" className={styles.cardButton} aria-pressed={on} onClick={() => toggle(a.id)}>
                <span className={styles.head}>
                  <span className={styles.name}>{a.name}</span>
                  <span className={cx(styles.price, "num")}>+{formatAUD(a.priceCents)}</span>
                </span>
                <span className={styles.body}>{a.body}</span>
                <span className={styles.markers}>{a.markers.join(" · ")}</span>
                <span className={cx(styles.state, on && styles.stateOn)}>{on ? <><Icon name="check" size={16} /> Added</> : <><Icon name="plus" size={16} /> Add to my test</>}</span>
              </button>
            </li>
          );
        })}
      </ul>
      {more ? <p className={styles.more}>{more}</p> : null}

      <div className={styles.summary}>
        <div className={styles.summaryHead}>
          <span className={styles.summaryTitle}>{cardTitle}</span>
          <span className={styles.summaryPrices}>
            {compareAtCents !== null && selected.length === 0 ? <s className={cx(styles.strike, "num")}>{formatAUD(compareAtCents)}</s> : null}
            <span className={cx(styles.total, "num")}>{formatAUD(total)}</span>
          </span>
        </div>
        <ul className={styles.summaryLines}>
          <li><span>The SIGNAL Test</span><span className="num">{formatAUD(priceCents)}</span></li>
          {addons.filter((a) => selected.includes(a.id)).map((a) => <li key={a.id}><span>{a.name}</span><span className="num">+{formatAUD(a.priceCents)}</span></li>)}
        </ul>
        <Button href={href} full ctaId="women_builder_cta" location="women_builder">{label} <Icon name="arrow" size={18} /></Button>
        <p className={styles.fine}>One payment. Walk in, no appointment. Clear explanation or your fee back.</p>
      </div>

      <div className={cx(styles.bar, visible && styles.visible)} aria-hidden={!visible} data-theme="light">
        <div className={styles.barInner}>
          <span className={styles.barText}><span className={styles.barLabel}>{stickyLine}</span><span className={cx(styles.barPrice, "num")}>{formatAUD(total)}</span></span>
          <Button href={href} size="sm" ctaId="women_sticky" location="sticky_bar" className={styles.barButton}>{ctaLabel}</Button>
        </div>
      </div>
    </>
  );
}
