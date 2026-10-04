import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { renderableFaqItems } from "@/config/faq";
import { fillHomeTokens } from "@/lib/home-tokens";
import styles from "./Faq.module.css";

/**
 * FAQ accordion using native <details>/<summary> (no JS) with FAQPage JSON-LD.
 * Only items with a drafted answer render; clinical questions stay TODO in config.
 */
export function Faq({ ids }: { ids?: string[] } = {}) {
  const items = renderableFaqItems().filter((f) => !ids || ids.includes(f.id)).map((f) => ({ ...f, answer: fillHomeTokens(f.answer) }));
  if (items.length === 0) return null;
  const schema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: items.map((f) => ({
      "@type": "Question",
      name: f.question,
      acceptedAnswer: { "@type": "Answer", text: f.answer },
    })),
  };
  return (
    <Section id="faq" theme="light" labelledBy="faq-title">
      <div className={styles.inner}>
        <SectionHeader id="faq-title" eyebrow="Questions" title="Good questions, straight answers." />
        <div className={styles.list}>
          {items.map((f) => (
            <details key={f.id} className={styles.item}>
              <summary className={styles.summary}>
                <span>{f.question}</span>
                <span className={styles.toggle} aria-hidden="true">
                  <Icon name="plus" size={18} className={styles.plus} />
                  <Icon name="minus" size={18} className={styles.minus} />
                </span>
              </summary>
              <p className={styles.answer}>{f.answer}</p>
            </details>
          ))}
        </div>
      </div>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
    </Section>
  );
}
