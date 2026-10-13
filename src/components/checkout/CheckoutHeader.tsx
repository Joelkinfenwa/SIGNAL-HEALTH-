import Link from "next/link";
import { Logo } from "@/components/brand/Logo";
import { Icon } from "@/components/ui/Icon";
import { Container } from "@/components/ui/Container";
import styles from "./CheckoutHeader.module.css";

/**
 * Trimmed header for the checkout stage: logo, a "secure checkout" mark, and
 * one way back. No navigation, no competing calls to action.
 */
export function CheckoutHeader({ backHref, backLabel }: { backHref: string; backLabel: string }) {
  return (
    <header className={styles.header}>
      <Container className={styles.inner}>
        <Logo />
        <span className={styles.secure}><Icon name="shield" size={14} /> Secure checkout</span>
        <Link href={backHref} className={styles.back}><Icon name="arrow" size={14} className={styles.backIcon} /> {backLabel}</Link>
      </Container>
    </header>
  );
}
