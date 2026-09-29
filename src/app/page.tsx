import { Biomarkers } from "@/components/home/Biomarkers";
import { Comparison } from "@/components/home/Comparison";
import { Coverage } from "@/components/home/Coverage";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ResultsMock } from "@/components/home/ResultsMock";
import { RetestBand } from "@/components/home/RetestBand";
import { SocialProof } from "@/components/home/SocialProof";
import { StickyCta } from "@/components/home/StickyCta";
import { Tests } from "@/components/home/Tests";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { stickyCta } from "@/config/home";
import { pickPriced } from "@/lib/home-tokens";

/**
 * Homepage (v3). Statically rendered. Client JS is limited to analytics,
 * the postcode checker and the sticky mobile CTA.
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <main id="main">
        <Hero />
        <Coverage />
        <HowItWorks />
        <Tests />
        <Biomarkers />
        <Comparison />
        <ResultsMock />
        <RetestBand />
        <SocialProof />
        <Faq />
        <FinalCta />
      </main>
      <SiteFooter />
      <StickyCta priceLine={pickPriced(stickyCta.priceLine, stickyCta.priceLineUnpriced)} />
    </>
  );
}
