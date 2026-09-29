import { Logo } from "@/components/brand/Logo";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
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
export function SiteHeader({ theme = "light" }: { theme?: "light" | "dark" }) {
  return (
    <header data-theme={theme} className={styles.header}>
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
