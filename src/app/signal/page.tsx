import type { Metadata } from "next";
import { SignalConfigurator } from "@/components/configurator/SignalConfigurator";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Photo } from "@/components/home/Photo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Included } from "@/components/product/Included";
import { PanelLearn } from "@/components/product/PanelLearn";
import { ProductSteps } from "@/components/product/ProductSteps";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
import { derivedMarkers } from "@/config/biomarkers";
import { signalMedia } from "@/config/media";
import { productCategoryCount, productMarkerCount, signalTest } from "@/config/products";
import styles from "./page.module.css";

export const metadata: Metadata = {
  title: "The SIGNAL Test",
  description: `${signalTest.tagline} ${productMarkerCount()} markers across ${productCategoryCount()} areas of health. Add depth with optional add-ons.`,
  alternates: { canonical: "/signal" },
};

/**
 * Product page + configurator. Static. The configurator is the client island
 * and reads ?addons= on the client (deep links from the quiz and landing pages).
 */
export default function SignalPage() {
  const derived = derivedMarkers(signalTest.markerIds);
  return (
    <>
      <SiteHeader />
      <main id="main">
        <section className={styles.top} aria-labelledby="signal-title">
          <Container className={styles.topInner}>
            <div className={styles.intro}>
              <p className={styles.eyebrow}>The product</p>
              <h1 id="signal-title" className={styles.title}>{signalTest.name}</h1>
              <p className={styles.tagline}>{signalTest.tagline}</p>
              <ul className={styles.facts}>
                <li><Icon name="chart" size={16} /> <span className="num">{productCategoryCount()}</span> areas of health, <span className="num">{productMarkerCount()}</span> markers</li>
                <li><Icon name="home" size={16} /> Collected at a centre or at home, where available</li>
                <li><Icon name="chat" size={16} /> Reviewed, returned digitally, explained in plain language</li>
              </ul>
            </div>
            <Photo asset={signalMedia.hero} priority sizes="(min-width: 64rem) 40vw, 100vw" className={styles.photo} position="60% 40%" />
          </Container>
        </section>

        <section id="configure" className={styles.configure} aria-label="Build your SIGNAL">
          <Container>
            <SignalConfigurator />
          </Container>
        </section>

        <Section id="what-is-tested" theme="shell" labelledBy="tested-title">
          <SectionHeader id="tested-title" eyebrow="What's tested" title="Every marker in the SIGNAL Test." intro="Grouped by the area of health it describes. Each one comes explained in plain language with your results." />
          <PanelLearn markers={signalTest.markerIds} variant="full" />
          {derived.length ? (
            <p className={styles.derivedNote}>
              <Icon name="sparkle" size={16} /> Markers tagged <em>calculated</em> ({derived.map((m) => m.short ?? m.name).join(", ")}) are worked out from results already in the panel, at no extra cost.
            </p>
          ) : null}
        </Section>

        <Included theme="light" />
        <ProductSteps />
        <Faq />
        <FinalCta title="Ready to know your numbers?" body={signalTest.tagline} cta={{ label: "Build my SIGNAL", href: "/signal#configure" }} ctaId="signal_final_build" />
      </main>
      <SiteFooter />
    </>
  );
}
