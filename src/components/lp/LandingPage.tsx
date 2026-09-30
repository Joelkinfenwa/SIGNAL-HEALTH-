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
import { serializeConfiguration } from "@/lib/pricing";
import type { LandingPage as LandingPageConfig } from "@/types/marketing";
import { Benefits } from "./Benefits";
import { LandingPageView } from "./LandingPageView";

/**
 * Renders a paid landing page from config. Every section is a shared
 * component; the config decides copy, media, order, recommended add-ons
 * and which FAQs show. A new angle is a new config file, never new JSX.
 */
export function LandingPage({ page }: { page: LandingPageConfig }) {
  // Preselected add-ons land in the basket (?addons=); recommended-only ones are highlighted (?rec=).
  const signalHref = `/signal${serializeConfiguration({ productId: page.productId, addonIds: page.preselectedAddonIds }, { recommendedAddonIds: page.recommendedAddonIds })}`;
  const primary = { label: page.cta.primary.label, href: page.cta.primary.href || signalHref };
  const sections = page.sections.map((s) => {
    switch (s) {
      case "hero":
        return <Hero key={s} eyebrow={page.eyebrow} headline={page.headline} subheadline={page.subheadline} media={page.heroMedia} primaryCta={primary} secondaryCta={page.cta.secondary ?? null} ctaLocation={`lp_${page.slug}`} />;
      case "trust":
        return <TrustBar key={s} />;
      case "insight":
        return <CoreInsight key={s} />;
      case "categories":
        return <Biomarkers key={s} />;
      case "product":
        return <SignalProductCard key={s} href={signalHref} location={`lp_${page.slug}`} />;
      case "addons":
        return <AddOns key={s} theme="light" highlightIds={page.recommendedAddonIds} />;
      case "how":
        return <HowItWorks key={s} />;
      case "results":
        return <ResultsMock key={s} />;
      case "retest":
        return <RetestBand key={s} />;
      case "proof":
        return <SocialProof key={s} />;
      case "faq":
        return <Faq key={s} ids={page.faqIds} />;
      case "close":
        return <FinalCta key={s} cta={primary} ctaId="lp_final" />;
    }
  });
  const benefitsIndex = page.sections.indexOf("hero") + 2; // after hero + trust
  return (
    <>
      <SiteHeader overlay />
      <main id="main">
        {sections.slice(0, benefitsIndex)}
        {page.benefits.length ? <Benefits title={page.benefitsTitle ?? "Why SIGNAL"} items={page.benefits} /> : null}
        {sections.slice(benefitsIndex)}
      </main>
      <SiteFooter />
      <StickyCta priceLine={pickPriced(stickyCta.priceLine, stickyCta.priceLineUnpriced)} href={signalHref} label={primary.label} ctaId="lp_sticky" />
      <LandingPageView slug={page.slug} experimentId={page.experimentId} />
    </>
  );
}
