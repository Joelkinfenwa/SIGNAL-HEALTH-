import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { proofStrip } from "@/config/home";
import { fillHomeTokens } from "@/lib/home-tokens";
import styles from "./ProofStrip.module.css";

/** Three-item proof strip under the hero. Wording lives in config/home.ts. */
export function ProofStrip() {
  return (
    <Container>
      <ul className={styles.list} aria-label="What you get with SIGNAL">
        {proofStrip.map((p) => (
          <li key={p.id} className={styles.item}>
            <span className={styles.icon}><Icon name={p.icon} size={20} /></span>
            <span>
              <strong className={styles.title}>{fillHomeTokens(p.title)}</strong>
              <span className={styles.body}>{fillHomeTokens(p.body)}</span>
            </span>
          </li>
        ))}
      </ul>
    </Container>
  );
}
