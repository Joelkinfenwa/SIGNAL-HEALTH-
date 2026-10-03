import { Logo } from "@/components/brand/Logo";
import { Container } from "@/components/ui/Container";
import { brand } from "@/config/brand";
import styles from "./SiteFooter.module.css";

const GROUPS = [
  { title: "The test", links: [{ href: "/signal", label: "The SIGNAL Test" }, { href: "/signal#add-ons", label: "Add-ons" }, { href: "/find-my-signal", label: "Find my SIGNAL" }] },
  { title: "SIGNAL", links: [{ href: "/#how-it-works", label: "How it works" }, { href: "/#what-is-tested", label: "What's tested" }, { href: "/retesting", label: "Retesting" }, { href: "/#faq", label: "FAQ" }] },
  { title: "Legal", links: [{ href: "/legal/privacy", label: "Privacy policy" }, { href: "/legal/terms", label: "Terms of service" }, { href: "/legal/retesting-terms", label: "Retesting terms" }] },
];

export function SiteFooter() {
  const year = new Date().getFullYear();
  return (
    <footer data-theme="shell" className={styles.footer}>
      <Container>
        <div className={styles.top}>
          <Logo />
          <div className={styles.groups}>
            {GROUPS.map((g) => (
              <nav key={g.title} aria-label={g.title}>
                <h2 className={styles.groupTitle}>{g.title}</h2>
                <ul>
                  {g.links.map((l) => (
                    <li key={l.href}><a href={l.href}>{l.label}</a></li>
                  ))}
                </ul>
              </nav>
            ))}
          </div>
        </div>
        <div className={styles.bottom}>
          {/* TODO: clinical/legal review of this disclaimer before launch. */}
          <p>
            SIGNAL blood tests provide information about your health. They are not a diagnosis and do not replace
            advice from your doctor. If you are unwell, contact your GP or call 000 in an emergency.
          </p>
          <p>© {year} {brand.legalName}. SIGNAL is a service of {brand.legalName}.</p>
        </div>
      </Container>
    </footer>
  );
}
