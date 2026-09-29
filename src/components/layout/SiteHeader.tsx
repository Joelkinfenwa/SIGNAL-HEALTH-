import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { cx } from "@/lib/cx";
import styles from "./SiteHeader.module.css";

const NAV = [
  { href: "/tests", label: "Tests" },
  { href: "/#how-it-works", label: "How it works" },
  { href: "/retesting", label: "Retesting" },
  { href: "/#faq", label: "FAQ" },
];

/**
 * Deliberately minimal. On mobile only the logo and the primary action show —
 * paid traffic lands here and the next step should be obvious.
 */
/**
 * `overlay` floats the header over a full-bleed hero: transparent, white text,
 * absolutely positioned. The hero must reserve top padding for it.
 */
export function SiteHeader({ theme = "light", overlay = false }: { theme?: "light" | "dark"; overlay?: boolean }) {
  return (
    <header data-theme={overlay ? "dark" : theme} className={cx(styles.header, overlay && styles.overlay)}>
      <Container className={styles.inner}>
        <Logo />
        <nav aria-label="Main" className={styles.nav}>
          <ul>
            {NAV.map((item) => (
              <li key={item.href}>
                <a href={item.href}>{item.label}</a>
              </li>
            ))}
          </ul>
        </nav>
        <Button href="/find-my-test" size="sm" ctaId="header_find_my_test" location="header">
          Find my test
        </Button>
      </Container>
    </header>
  );
}
