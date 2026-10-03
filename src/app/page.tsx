import { Biomarkers } from "@/components/home/Biomarkers";
import { CoreInsight } from "@/components/home/CoreInsight";
import { Faq } from "@/components/home/Faq";
import { FinalCta } from "@/components/home/FinalCta";
import { Hero } from "@/components/home/Hero";
import { HowItWorks } from "@/components/home/HowItWorks";
import { ResultsMock } from "@/components/home/ResultsMock";
import { RetestBand } from "@/components/home/RetestBand";
import { SocialProof } from "@/components/home/SocialProof";
import { StickyCta } from "@/components/home/StickyCta";
import { TrustBar } from "@/components/home/TrustBar";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AddOns } from "@/components/product/AddOns";
import { SignalProductCard } from "@/components/product/SignalProductCard";
import { stickyCta } from "@/config/home";
import { pickPriced } from "@/lib/home-tokens";

/**
 * Homepage, structured A–M around one product. Static. Client JS is limited to
 * analytics and the sticky mobile CTA.
 */
export default function HomePage() {
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        <Hero />
        <TrustBar />
        <CoreInsight />
        <Biomarkers />
        <SignalProductCard />
        <AddOns theme="light" />
        <HowItWorks />
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
