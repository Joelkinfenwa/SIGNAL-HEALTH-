import { Icon } from "@/components/ui/Icon";
import { cx } from "@/lib/cx";
import styles from "./Steps.module.css";

export const CHECKOUT_STEPS = ["Your test", "Your details", "Pay"] as const;

/** Three-step progress strip shown at the top of both checkout screens. */
export function Steps({ current }: { current: 1 | 2 | 3 }) {
  return (
    <ol className={styles.steps} aria-label="Checkout progress">
      {CHECKOUT_STEPS.map((label, i) => {
        const n = i + 1;
        const state = n < current ? "done" : n === current ? "current" : "todo";
        return (
          <li key={label} className={cx(styles.step, styles[state])} aria-current={state === "current" ? "step" : undefined}>
            <span className={styles.num} aria-hidden="true">{state === "done" ? <Icon name="check" size={12} /> : n}</span>
            <span className={styles.label}>{label}</span>
          </li>
        );
      })}
    </ol>
  );
}
