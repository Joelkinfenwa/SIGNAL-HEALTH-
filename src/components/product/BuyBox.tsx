"use client";

import { useId, useState } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import type { RetestOffer } from "@/config/retest-offer";
import { formatDiscount } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";
import { formatInterval, quoteRetest } from "@/lib/retest/offer";
import { cx } from "@/lib/cx";
import styles from "./BuyBox.module.css";

interface BuyBoxProps {
  slug: string;
  shortName: string;
  priceCents: number | null;
  offers: RetestOffer[];
}

/**
 * Purchase options: one-time, or an Automatic Retesting rhythm. The chosen
 * plan is carried to checkout as ?plan=. Recurring billing is disclosed inline.
 */
export function BuyBox({ slug, shortName, priceCents, offers }: BuyBoxProps) {
  const [plan, setPlan] = useState<string>("once");
  const name = useId();
  const chosen = offers.find((o) => o.id === plan);
  const quote = chosen && priceCents !== null ? quoteRetest(priceCents, chosen) : null;

  return (
    <div className={styles.box}>
      <div className={styles.priceRow}>
        {priceCents === null ? (
          <span className={styles.tbc}>Pricing coming soon</span>
        ) : (
          <>
            <span className={cx(styles.price, "num")}>{formatAUD(quote ? quote.recurringPriceCents : priceCents)}</span>
            <span className={styles.priceNote}>{quote ? `per test, every ${formatInterval(quote.intervalMonths)}` : "one test"}</span>
            {quote ? <span className={styles.was}>{formatAUD(priceCents)}</span> : null}
          </>
        )}
      </div>

      <fieldset className={styles.plans}>
        <legend className={styles.legend}>How often?</legend>
        <label className={cx(styles.plan, plan === "once" && styles.selected)}>
          <input type="radio" name={name} value="once" checked={plan === "once"} onChange={() => setPlan("once")} />
          <span className={styles.planText}>
            <span className={styles.planName}>One test</span>
            <span className={styles.planSub}>No commitment</span>
          </span>
        </label>
        {offers.map((o) => (
          <label key={o.id} className={cx(styles.plan, plan === o.id && styles.selected)}>
            <input type="radio" name={name} value={o.id} checked={plan === o.id} onChange={() => setPlan(o.id)} />
            <span className={styles.planText}>
              <span className={styles.planName}>{o.cadence}</span>
              <span className={styles.planSub}>{o.perks.length ? `${o.perks.join(" · ")}` : "Booked and discounted for you"}</span>
            </span>
            <span className={styles.save}>Save {formatDiscount(o.discountBps)}</span>
          </label>
        ))}
      </fieldset>

      <Button href={`/checkout/${slug}?plan=${plan}`} full ctaId={`choose_${slug}`} location="product_buybox">
        Choose {shortName} <Icon name="arrow" size={18} />
      </Button>

      <p className={styles.note}>
        {plan === "once"
          ? "Collection options are shown before you pay."
          : "Automatic Retesting is recurring billing: charged per test at the start of each interval until you cancel. Change, pause or cancel any time from your account."}
      </p>
    </div>
  );
}
