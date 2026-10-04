import type { Metadata } from "next";
import { SignalConfigurator } from "@/components/configurator/SignalConfigurator";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Photo } from "@/components/home/Photo";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { Included } from "@/components/product/Included";
import { MarkerAreas } from "@/components/product/MarkerAreas";
import { NextSteps } from "@/components/journey/NextSteps";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { Section, SectionHeader } from "@/components/ui/Section";
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
          <SectionHeader
            id="tested-title"
            eyebrow="What's tested"
            title={`${productCategoryCount()} areas of health. ${productMarkerCount()} markers. Here's what each one tells you.`}
            intro="Every marker comes back explained in plain language, so you never have to decode a lab report. Open any area to see what each marker measures."
          />
          <MarkerAreas markers={signalTest.markerIds} />
        </Section>

        <Included theme="light" />
        <NextSteps title="What happens after you choose." intro="No referral paperwork to organise. Here's the whole path, start to retest." />
        <Faq />
        <FinalCta title="Ready to know your numbers?" body={signalTest.tagline} cta={{ label: "Build my SIGNAL", href: "/signal#configure" }} ctaId="signal_final_build" />
      </main>
      <SiteFooter />
    </>
  );
}
