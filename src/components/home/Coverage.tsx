import { Container } from "@/components/ui/Container";
import { media } from "@/config/media";
import { Photo } from "./Photo";
import { PostcodeChecker } from "./PostcodeChecker";
import styles from "./Coverage.module.css";

/** Section wrapper for the postcode checker. Server component; the form is the client island. */
export function Coverage() {
  return (
    <section id="coverage" data-theme="shell" className={styles.section} aria-labelledby="coverage-title">
      <Container className={styles.inner}>
        <div className={styles.copy}>
          <h2 id="coverage-title" className={styles.title}>Can a nurse come to you?</h2>
          <p className={styles.intro}>
            Enter your postcode to see whether mobile collection is available where you are, or where your nearest collection centre is.
          </p>
          <PostcodeChecker />
        </div>
        <div className={styles.media}>
          <Photo asset={media.nurseArrival} sizes="(min-width: 64rem) 40vw, 100vw" className={styles.photo} />
        </div>
      </Container>
    </section>
  );
}
