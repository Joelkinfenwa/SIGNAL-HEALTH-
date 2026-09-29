import type { ReactNode } from "react";
import { cx } from "@/lib/cx";
import { Container } from "./Container";
import styles from "./Section.module.css";

export type SectionTheme = "light" | "shell" | "dark";

interface SectionProps {
  id?: string;
  theme?: SectionTheme;
  labelledBy?: string;
  className?: string;
  children: ReactNode;
}

/** Page section. Sets the colour theme; all children use semantic tokens. */
export function Section({ id, theme = "light", labelledBy, className, children }: SectionProps) {
  return (
    <section id={id} data-theme={theme} aria-labelledby={labelledBy} className={cx(styles.section, className)}>
      <Container>{children}</Container>
    </section>
  );
}

interface SectionHeaderProps {
  id: string;
  title: ReactNode;
  intro?: ReactNode;
  className?: string;
}

export function SectionHeader({ id, title, intro, className }: SectionHeaderProps) {
  return (
    <header className={cx(styles.header, className)}>
      <h2 id={id} className={styles.title}>{title}</h2>
      {intro ? <p className={styles.intro}>{intro}</p> : null}
    </header>
  );
}
