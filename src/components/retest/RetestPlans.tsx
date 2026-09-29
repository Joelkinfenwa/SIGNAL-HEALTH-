import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import type { Product } from "@/config/products";
import { activeRetestOffers, formatDiscount } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";
import { formatInterval, quoteRetest } from "@/lib/retest/offer";
import { cx } from "@/lib/cx";
import styles from "./RetestPlans.module.css";

/**
 * The Automatic Retesting plans, side by side. Used on product pages and
 * /retesting. Discount and perks come from config; when the product has a
 * price the per-test amount is quoted with the same function that will charge.
 *
 * Billing disclosure is part of the component, not optional copy.
 */
export function RetestPlans({ product, theme = "shell", compact }: { product?: Product; theme?: "light" | "shell"; compact?: boolean }) {
  const offers = activeRetestOffers();
  return (
    <Section id="retesting-plans" theme={theme} labelledBy="plans-title">
      <SectionHeader
        id="plans-title"
        eyebrow="Automatic Retesting"
        title={product ? `Make ${product.shortName} a habit and save.` : "Test once, or make it a habit."}
        intro="One test tells you where you are. Retesting tells you which way you're heading. Choose a rhythm after your first test and every retest is booked and discounted for you."
      />
      <ul className={cx(styles.grid, compact && styles.compact)}>
        {offers.map((o) => {
          const quote = product && product.priceCents !== null ? quoteRetest(product.priceCents, o) : null;
          return (
            <li key={o.id} data-theme={o.featured ? "dark" : undefined} className={cx(styles.plan, o.featured && styles.featured)}>
              <div className={styles.head}>
                <span className={styles.cadence}>{o.cadence}</span>
                {o.featured ? <span className={styles.badge}>Best value</span> : null}
              </div>
              <h3 className={styles.name}>{o.name}</h3>
              <p className={styles.save}>
                Save <span className="num">{formatDiscount(o.discountBps)}</span> on every test
              </p>
              {quote ? (
                <p className={styles.quote}>
                  <span className="num">{formatAUD(quote.recurringPriceCents)}</span> per {product!.shortName} test, every {formatInterval(o.intervalMonths)}
                </p>
              ) : (
                <p className={styles.quoteTbc}>Per-test price shown once pricing is set.</p>
              )}
              <ul className={styles.perks}>
                <li><Icon name="check" size={16} /> Your next test booked for you, every {formatInterval(o.intervalMonths)}</li>
                <li><Icon name="check" size={16} /> Change the date, pause or cancel from your account</li>
                {o.perks.map((p) => <li key={p}><Icon name="check" size={16} /> {p}</li>)}
              </ul>
            </li>
          );
        })}
      </ul>
      <p className={styles.disclosure}>
        Automatic Retesting uses recurring billing. You&apos;re charged the discounted price for each test at the start of each interval, and it continues until you cancel.
        It&apos;s offered after your first purchase, and you can change the date, pause or cancel at any time from your account.
      </p>
    </Section>
  );
}
