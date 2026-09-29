import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { visibleTrustClaims } from "@/config/trust";
import styles from "./TrustBar.module.css";

/**
 * C. Trust strip. Verified claims only in production; placeholders render on
 * previews with a visible "To confirm" tag so they can never pass as facts.
 */
export function TrustBar() {
  const claims = visibleTrustClaims();
  if (claims.length === 0) return null;
  return (
    <section data-theme="light" className={styles.section} aria-label="Why you can trust SIGNAL">
      <Container>
        <ul className={styles.list}>
          {claims.map((c) => (
            <li key={c.id} className={styles.item}>
              <Icon name={c.icon} size={18} />
              <span>{c.text}</span>
              {c.status === "placeholder" ? <span className={styles.todo}>To confirm</span> : null}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
