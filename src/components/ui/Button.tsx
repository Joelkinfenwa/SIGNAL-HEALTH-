import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import styles from "./Button.module.css";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  size?: "md" | "sm";
  /** Analytics id — every primary CTA should have one. */
  ctaId?: string;
  location?: string;
  className?: string;
}

/**
 * Link styled as a button. Colours come from the surrounding section theme,
 * so the same component works on light and dark sections.
 */
export function Button({ href, children, variant = "solid", size = "md", ctaId, location = "unknown", className }: ButtonProps) {
  return (
    <TrackedLink
      href={href}
      className={cx(styles.button, styles[variant], styles[size], className)}
      event={ctaId ? { name: "cta_clicked", props: { cta_id: ctaId, location } } : undefined}
    >
      {children}
    </TrackedLink>
  );
}
