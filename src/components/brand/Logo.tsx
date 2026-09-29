import Link from "next/link";
import { brand, type EndorsementLevel } from "@/config/brand";
import { cx } from "@/lib/cx";
import styles from "./Logo.module.css";

/**
 * SIGNAL lockup. The mark is three readings joined by a line —
 * test, retest, retest — the core product idea in one glyph.
 * Endorsement prominence is driven by config/brand.ts.
 */
export function Logo({ level = brand.endorsementLevel, className }: { level?: EndorsementLevel; className?: string }) {
  return (
    <Link href="/" className={cx(styles.logo, className)} title="Home">
      <span className={styles.row}>
        <SignalMark className={styles.mark} />
        <span className={styles.word}>{brand.name}</span>
      </span>
      {level !== "hidden" ? (
        <span className={cx(styles.endorse, level === "subtle" && styles.subtle)}>{brand.endorsement}</span>
      ) : null}
    </Link>
  );
}

export function SignalMark({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 28 20" aria-hidden="true" focusable="false">
      <polyline points="3,15 14,9 25,5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="3" cy="15" r="2.6" fill="currentColor" />
      <circle cx="14" cy="9" r="2.6" fill="currentColor" />
      <circle cx="25" cy="5" r="3.2" fill="var(--accent)" />
    </svg>
  );
}
