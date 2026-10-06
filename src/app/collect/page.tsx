import type { Metadata } from "next";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { confirmationEmail } from "@/config/email";
import { pathologyConfig } from "@/config/pathology";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "Where to get your blood drawn",
  description: "SIGNAL request forms are accepted at 4Cyte Pathology and Australian Clinical Labs collection centres only. No appointment needed. Find your nearest centre.",
};

const OTHER_LABS = ["Laverty", "Douglass Hanly Moir", "QML", "Dorevitch", "Sullivan Nicolaides", "Western Diagnostic", "PathWest", "public hospital collection rooms"];

/** The only two laboratories whose centres accept a SIGNAL request form, with their own centre finders, and what to do on the day. */
export default function CollectPage() {
  const labs = pathologyConfig.labs;
  const prep = confirmationEmail.prepare.items;
  const day = confirmationEmail.onTheDay.centre.items;
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section data-theme="light" className={styles.hero} aria-labelledby="collect-title">
          <Container>
            <p className={styles.eyebrow}>Collection centres</p>
            <h1 id="collect-title" className={styles.title}>Where to get your blood drawn.</h1>
            <p className={styles.lede}>
              Your SIGNAL request form is accepted at <strong>{labs.map((l) => l.name).join(" and ")}</strong> collection centres only.
              Walk in with your form and photo ID. No appointment, no referral, nothing to pay on the day.
            </p>
            <div className={styles.warning} role="note">
              <Icon name="shield" size={20} />
              <p><strong>Only these two laboratories.</strong> Any other collection centre, including {OTHER_LABS.slice(0, -1).join(", ")} and {OTHER_LABS.at(-1)}, will not accept your form and may bill you for the test.</p>
            </div>
          </Container>
        </section>

        <Section id="labs" theme="shell" labelledBy="labs-title">
          <SectionHeader id="labs-title" eyebrow="Participating laboratories" title="Find your nearest centre." intro="Each laboratory has its own centre finder. Enter your suburb or postcode, check the opening hours, and walk in." />
          <ul className={styles.labs}>
            {labs.map((l) => (
              <li key={l.name} className={styles.lab}>
                <p className={styles.labName}>{l.name}</p>
                <p className={styles.labCoverage}>Collection centres in {l.coverage}</p>
                <p className={styles.labNote}>{l.note}</p>
                <Button href={l.finderUrl} ctaId={`collect_finder_${l.drCode.toLowerCase()}`} location="collect">{l.finderLabel} <Icon name="arrow" size={18} /></Button>
                <p className={styles.labFine}>Opens the laboratory&apos;s website. Your form shows the account codes they need.</p>
              </li>
            ))}
          </ul>
        </Section>

        <Section id="prepare" theme="light" labelledBy="prepare-title">
          <div className={styles.cols}>
            <div>
              <SectionHeader id="prepare-title" eyebrow="Before you go" title={confirmationEmail.prepare.title} />
              <ul className={styles.checks}>{prep.map((s) => <li key={s}><Icon name="check" size={16} /> {s}</li>)}</ul>
            </div>
            <div>
              <SectionHeader id="day-title" eyebrow="On the day" title={confirmationEmail.onTheDay.centre.title} />
              <ul className={styles.checks}>{day.map((s) => <li key={s}><Icon name="check" size={16} /> {s}</li>)}</ul>
            </div>
          </div>
        </Section>

        <Section id="home" theme="shell" labelledBy="home-title">
          <SectionHeader id="home-title" eyebrow="Prefer not to travel?" title="A collector can come to you." intro="Home or workplace collection is available in selected areas. Choose it at checkout and we call you within one business day to arrange a time. If we can't reach your address, the visit fee is refunded and any centre above will take your form." />
          <p className={styles.help}>Lost your form or not sure where to go? Reply to your confirmation email or call <a href={`tel:${pathologyConfig.referrer.phone.replace(/\s/g, "")}`}>{pathologyConfig.referrer.phone}</a>, Monday to Friday.</p>
        </Section>
      </main>
      <SiteFooter />
    </>
  );
}
