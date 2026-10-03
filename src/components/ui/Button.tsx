import type { ReactNode } from "react";
import type React from "react";
import { cx } from "@/lib/cx";
import { TrackedLink } from "@/components/analytics/TrackedLink";
import styles from "./Button.module.css";

interface ButtonProps {
  href: string;
  children: ReactNode;
  variant?: "solid" | "outline";
  size?: "md" | "sm";
  /** Stretch to the container width (mobile buy boxes, sticky bar). */
  full?: boolean;
  /** Analytics id — every primary CTA should have one. */
  ctaId?: string;
  location?: string;
  className?: string;
  onClick?: React.MouseEventHandler<HTMLAnchorElement>;
}

/**
 * Link styled as a button. Colours come from the surrounding section theme,
 * so the same component works on light and dark sections.
 */
export function Button({ href, children, variant = "solid", size = "md", full, ctaId, location = "unknown", className, onClick }: ButtonProps) {
  return (
    <TrackedLink
      href={href}
      onClick={onClick}
      className={cx(styles.button, styles[variant], styles[size], full && styles.full, className)}
      event={ctaId ? { name: "cta_clicked", props: { cta_id: ctaId, location } } : undefined}
    >
      {children}
    </TrackedLink>
  );
}
