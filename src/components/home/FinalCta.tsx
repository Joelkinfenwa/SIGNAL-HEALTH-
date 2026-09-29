import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import styles from "./FinalCta.module.css";

export function FinalCta() {
  return (
    <section data-theme="light" className={styles.section} aria-labelledby="final-title">
      <Container>
        <div data-theme="dark" className={styles.panel}>
          <h2 id="final-title" className={styles.title}>Start with one test.</h2>
          <p className={styles.body}>Answer a few quick questions and we&apos;ll recommend the right one for you.</p>
          <div className={styles.actions}>
            <Button href="/find-my-test" ctaId="final_find_my_test" location="final_cta">Find my test</Button>
            <Button href="/tests" variant="outline" ctaId="final_view_tests" location="final_cta">View tests</Button>
          </div>
        </div>
      </Container>
    </section>
  );
}
