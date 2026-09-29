import { Photo } from "@/components/home/Photo";
import { Section, SectionHeader } from "@/components/ui/Section";
import { media } from "@/config/media";
import styles from "./WhySignal.module.css";

const POINTS = [
  { image: media.homeVisit, position: "center 40%", title: "Collected at home or nearby", body: "A qualified collector comes to you where available, or you drop into a centre. Ten minutes, then get on with your day." },
  { image: media.phone, position: "center 35%", title: "Explained like a person would", body: "Every marker in plain language, with clinical review, in your own dashboard. No decoding a lab report." },
  { image: media.couple, position: "center 40%", title: "Retest and see the change", body: "Your next test is compared with the last, marker by marker, so you know whether what you're doing is working." },
];

/** Why it's good: three photo-led reasons, in the order a buyer cares about them. */
export function WhySignal() {
  return (
    <Section id="why-signal" theme="shell" labelledBy="whysignal-title">
      <SectionHeader id="whysignal-title" eyebrow="Why SIGNAL" title="Advanced testing, without the hassle." />
      <ul className={styles.grid}>
        {POINTS.map((p) => (
          <li key={p.title} className={styles.card}>
            <Photo asset={p.image} sizes="(min-width: 64rem) 33vw, 100vw" className={styles.photo} position={p.position} />
            <h3 className={styles.title}>{p.title}</h3>
            <p className={styles.body}>{p.body}</p>
          </li>
        ))}
      </ul>
    </Section>
  );
}
