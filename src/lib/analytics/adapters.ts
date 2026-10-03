/**
 * Browser adapters: GA4 (gtag) and Meta Pixel (fbq). Loaded only when their
 * ids are set. track() calls dispatch() after pushing to the dataLayer.
 *
 * Privacy: Meta receives only the allowlisted props (value, currency,
 * order_id) via redactForAdPlatforms(). GA4 is first-party analytics and
 * receives the full event props, which by type never contain health data.
 * Both receive the same event_id as the server so they de-duplicate.
 */
import { EVENT_POLICY, redactForAdPlatforms, type AnalyticsEvent } from "./events";

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    fbq?: (...args: unknown[]) => void;
  }
}

export const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
export const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;

const META_STANDARD = new Set(["PageView", "ViewContent", "InitiateCheckout", "Purchase", "Subscribe", "Schedule", "Lead", "AddToCart"]);

export function dispatch(event: AnalyticsEvent, eventId: string, context: Record<string, unknown>): void {
  const policy = EVENT_POLICY[event.name];
  if (window.gtag && policy.ga4 && policy.ga4 !== "page_view") {
    window.gtag("event", policy.ga4, { ...context, ...event.props, event_id: eventId, transaction_id: (event.props as { order_id?: string }).order_id });
  }
  if (window.fbq && policy.meta && policy.meta !== "PageView") {
    const props = redactForAdPlatforms(event.props as Record<string, unknown>);
    window.fbq(META_STANDARD.has(policy.meta) ? "track" : "trackCustom", policy.meta, props, { eventID: eventId });
  }
}
