import { Container } from "@/components/ui/Container";
import { Icon, type IconName } from "@/components/ui/Icon";
import { trustPoints } from "@/config/brand";
import styles from "./TrustStrip.module.css";

const ICONS: Record<string, IconName> = { network: "pin", laboratory: "shield", pricing: "check" };

export function TrustStrip() {
  return (
    <section data-theme="shell" className={styles.strip} aria-label="Why you can trust SIGNAL">
      <Container>
        <ul className={styles.list}>
          {trustPoints.map((t) => (
            <li key={t.id} className={styles.item}>
              <span className={styles.icon}><Icon name={ICONS[t.id] ?? "check"} /></span>
              <span>
                <strong className={styles.title}>{t.title}</strong>
                <span className={styles.body}>{t.body}</span>
              </span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
