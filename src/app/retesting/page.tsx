import type { Metadata } from "next";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Photo } from "@/components/home/Photo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RetestPlans } from "@/components/retest/RetestPlans";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { media } from "@/config/media";
import { bestDiscountBps, formatDiscount } from "@/config/retest-offer";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Automatic Retesting",
  description: "Retest every three or six months, save on every test, and see how your markers change over time. Change, pause or cancel any time.",
};

const STEPS = [
  { icon: "tube" as const, title: "Take your first test", body: "Choose any SIGNAL test and get collected at home or nearby." },
  { icon: "refresh" as const, title: "Choose a rhythm", body: "After your first test, pick twice a year or four times a year. The discount applies from your first test." },
  { icon: "calendar" as const, title: "We book the next one", body: "Your next collection is scheduled and you're reminded well ahead of time. Move it if you need to." },
  { icon: "chart" as const, title: "Watch the change", body: "Every retest is compared with the last, marker by marker, in plain language." },
];

export default function RetestingPage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section id="hero" data-theme="light" className={styles.hero} aria-labelledby="retest-title">
          <Container className={styles.heroInner}>
            <div>
              <p className={styles.eyebrow}>Automatic Retesting</p>
              <h1 id="retest-title" className={styles.title}>Your health isn&apos;t a snapshot.</h1>
              <p className={styles.lede}>
                One result shows where you are today. Testing again shows which way you&apos;re heading, and whether the changes you make are working.
                Automatic Retesting books it for you and saves you up to {formatDiscount(bestDiscountBps())} on every test.
              </p>
              <div className={styles.actions}>
                <Button href="/find-my-test" ctaId="retesting_find_my_test" location="retesting_hero">Find my test <Icon name="arrow" size={18} /></Button>
                <Button href="/tests" variant="outline" ctaId="retesting_view_tests" location="retesting_hero">View tests</Button>
              </div>
            </div>
            <Photo asset={media.couple} sizes="(min-width: 64rem) 46vw, 100vw" className={styles.photo} position="center 40%" />
          </Container>
        </section>

        <Section id="how" theme="shell" labelledBy="how-title">
          <SectionHeader id="how-title" eyebrow="How it works" title="Simple, and always in your control." />
          <ol className={styles.steps}>
            {STEPS.map((s, i) => (
              <li key={s.title} className={styles.step}>
                <span className={styles.stepIcon}><Icon name={s.icon} size={22} /></span>
                <span className={styles.stepIndex}><span className="num">{String(i + 1).padStart(2, "0")}</span></span>
                <h3 className={styles.stepTitle}>{s.title}</h3>
                <p className={styles.stepBody}>{s.body}</p>
              </li>
            ))}
          </ol>
        </Section>

        <RetestPlans theme="light" />

        <Section id="control" theme="shell" labelledBy="control-title">
          <SectionHeader id="control-title" eyebrow="Billing and control" title="Clear terms, no surprises." />
          <ul className={styles.terms}>
            <li><strong>It&apos;s recurring billing.</strong> You&apos;re charged the discounted price for each test at the start of each interval. It continues until you cancel.</li>
            <li><strong>Reminders first.</strong> We email you before each charge with the date, the amount and a link to manage it.</li>
            <li><strong>Move it, pause it, cancel it.</strong> By email, any time, with no fees.</li>
            <li><strong>Same test, same price logic.</strong> The amount you see is the amount you&apos;re charged. Prices are shown before you choose a plan.</li>
          </ul>
          {/* TODO(legal): confirm wording against Australian Consumer Law and the retesting terms before launch. */}
        </Section>

        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
