import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { finalCta } from "@/config/home";
import styles from "./FinalCta.module.css";

interface FinalCtaProps { title?: string; body?: string; cta?: { label: string; href: string }; ctaId?: string }

export function FinalCta({ title = finalCta.title, body = finalCta.body, cta = finalCta.primaryCta, ctaId = "final_find_my_test" }: FinalCtaProps = {}) {
  return (
    <section data-theme="light" className={styles.section} aria-labelledby="final-title">
      <Container>
        <div data-theme="dark" className={styles.panel}>
          <h2 id="final-title" className={styles.title}>{title}</h2>
          <p className={styles.body}>{body}</p>
          <div className={styles.actions}>
            <Button href={cta.href} ctaId={ctaId} location="final_cta">
              {cta.label} <Icon name="arrow" size={18} />
            </Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
