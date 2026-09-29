import type { ReactNode } from "react";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import type { MediaAsset } from "@/config/media";
import { cx } from "@/lib/cx";
import { Photo } from "./Photo";
import styles from "./FeatureSplit.module.css";

interface FeatureSplitProps {
  id: string;
  title: string;
  body: string;
  points: string[];
  image: MediaAsset;
  imagePosition?: string;
  reverse?: boolean;
  theme?: "light" | "shell";
  overlay?: ReactNode;
  action?: ReactNode;
}

/** Photo + copy feature block. Reusable for any benefit that needs a human face. */
export function FeatureSplit({ id, title, body, points, image, imagePosition, reverse, theme = "light", overlay, action }: FeatureSplitProps) {
  return (
    <section data-theme={theme} className={styles.section} aria-labelledby={id}>
      <Container className={cx(styles.inner, reverse && styles.reverse)}>
        <div className={styles.media}>
          <Photo asset={image} sizes="(min-width: 64rem) 50vw, 100vw" className={styles.photo} position={imagePosition} />
          {overlay ? <div className={styles.overlay}>{overlay}</div> : null}
        </div>
        <div className={styles.copy}>
          <h2 id={id} className={styles.title}>{title}</h2>
          <p className={styles.body}>{body}</p>
          <ul className={styles.points}>
            {points.map((p) => (
              <li key={p}><span className={styles.tick}><Icon name="check" size={16} /></span>{p}</li>
            ))}
          </ul>
          {action ? <div className={styles.action}>{action}</div> : null}
        </div>
      </Container>
    </section>
  );
}
