import { Button } from "@/components/ui/Button";
import { Biomarkers } from "@/components/home/Biomarkers";
import { FeatureSplit } from "@/components/home/FeatureSplit";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { RetestBand } from "@/components/home/RetestBand";
import { SignalCard } from "@/components/home/SignalCard";
import { Tests } from "@/components/home/Tests";
import { TrustStrip } from "@/components/home/TrustStrip";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { media } from "@/config/media";

/** Homepage. Statically rendered; the only client JS is analytics. */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <TrustStrip />
        <HowItWorks />
        <FeatureSplit
          id="collection-title"
          theme="shell"
          image={media.homeVisit}
          imagePosition="center 40%"
          title="We come to you."
          body="Book a qualified collector to visit your home or workplace, where available. Prefer to pop in? Choose a collection centre instead."
          points={[
            "Home and workplace visits where available",
            "Collection centre option if you prefer",
            "Collected by Express Pathology's experienced team",
          ]}
          action={<Button href="/find-my-test" ctaId="collection_find_my_test" location="collection">Find my test</Button>}
        />
        <Tests />
        <Biomarkers />
        <FeatureSplit
          id="results-title"
          reverse
          image={media.phone}
          imagePosition="center 35%"
          title="Results that actually make sense."
          body="Your results come with appropriate clinical review and are explained in plain language, so you know what each marker means and what to ask next."
          points={["Every marker explained simply", "See how your results change between tests", "Clinical review included"]}
          overlay={<SignalCard />}
        />
        <RetestBand />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
