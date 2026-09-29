import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { finalCta } from "@/config/home";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section data-theme="light" className={styles.section} aria-labelledby="final-title">
      <Container>
        <div data-theme="dark" className={styles.panel}>
          <h2 id="final-title" className={styles.title}>{finalCta.title}</h2>
          <p className={styles.body}>{finalCta.body}</p>
          <div className={styles.actions}>
            <Button href={finalCta.primaryCta.href} ctaId="final_find_my_test" location="final_cta">
              {finalCta.primaryCta.label} <Icon name="arrow" size={18} />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
