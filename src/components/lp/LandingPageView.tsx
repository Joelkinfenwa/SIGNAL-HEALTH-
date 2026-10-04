"use client";

import { useEffect } from "react";
import { track } from "@/lib/analytics/track";
import { setAnalyticsContext } from "@/lib/analytics/context";

/** Sets landing-page context for every later event and emits landing_page_viewed once. */
export function LandingPageView({ slug, experimentId }: { slug: string; experimentId?: string }) {
  useEffect(() => {
    setAnalyticsContext({ lp_slug: slug, experiment_id: experimentId });
    track({ name: "landing_page_viewed", props: { lp_slug: slug } });
  }, [slug, experimentId]);
  return null;
}
