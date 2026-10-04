import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import styles from "./PriceTag.module.css";

/**
 * Price display that copes with pricing not being set yet.
 * TODO(pricing): once every product has a price, the fallback never renders.
 */
export function PriceTag({ priceCents, size = "md", className }: { priceCents: number | null; size?: "md" | "lg"; className?: string }) {
  if (priceCents === null) {
    return <span className={cx(styles.tbc, className)}>Pricing coming soon</span>;
  }
  return (
    <span className={cx(styles.price, styles[size], "num", className)}>
      {formatAUD(priceCents)}
      <span className={styles.note}>one test</span>
    </span>
  );
}
