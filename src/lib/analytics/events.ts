import type { CollectionMethodId } from "@/config/collection";

/**
 * The single, typed catalogue of analytics events.
 *
 * Rules:
 *  - Add an event here before emitting it anywhere. TypeScript enforces the shape.
 *  - Quiz answers, symptoms and any other health information are intentionally
 *    NOT part of any event. They cannot be sent because the types do not allow it.
 *  - `value` is in dollars (GA4/Meta convention); internal amounts stay in cents.
 */
type Money = { value: number; currency: "AUD" };

/**
 * Add-on ids are commerce identifiers (e.g. "heart_plus"). They stay first-party:
 * the ad-platform allowlist below never includes them.
 */
export type AnalyticsEvent =
  | { name: "page_viewed"; props: { path: string } }
  | { name: "landing_page_viewed"; props: { lp_slug: string } }
  | { name: "cta_clicked"; props: { cta_id: string; location: string } }
  | { name: "product_viewed"; props: { product_id: string } & Partial<Money> }
  | { name: "biomarkers_viewed"; props: { category_id: string } }
  | { name: "quiz_started"; props: { quiz_version: string } }
  | { name: "quiz_completed"; props: { quiz_version: string } }
  | { name: "product_recommended"; props: { quiz_version: string; product_id: string; addon_ids: string[] } }
  | { name: "configurator_started"; props: { product_id: string } }
  /** An add-on's details were expanded (interest, not selection). */
  | { name: "addon_viewed"; props: { addon_id: string } }
  | { name: "addon_selected"; props: { addon_id: string } }
  | { name: "addon_removed"; props: { addon_id: string } }
  /** Continue pressed with a configuration; the basket as it leaves the configurator. */
  | { name: "configurator_completed"; props: { product_id: string; addon_ids: string[]; addon_count: number } & Partial<Money> }
  | { name: "checkout_started"; props: { product_id: string; addon_ids: string[] } & Partial<Money> }
  | { name: "collection_method_selected"; props: { product_id: string; method: CollectionMethodId } }
  /** The details form validated for the first time. Carries no detail values by type. */
  | { name: "checkout_details_completed"; props: { product_id: string } }
  /** Pay attempted with invalid details; `field_count` only, never which fields or values. */
  | { name: "checkout_details_invalid"; props: { field_count: number } }
  /** The order exists in Stripe and the payment screen is shown. */
  | { name: "payment_step_viewed"; props: { product_id: string; addon_ids: string[] } }
  | { name: "purchase_completed"; props: { order_id: string; product_id: string; addon_ids: string[] } & Money }
  | { name: "retest_offer_viewed"; props: RetestOfferProps }
  | { name: "retest_plan_selected"; props: RetestOfferProps }
  | { name: "retest_offer_accepted"; props: RetestOfferProps & Money }
  | { name: "retest_offer_declined"; props: RetestOfferProps }
  | { name: "booking_started"; props: { order_id: string; method: CollectionMethodId } }
  | { name: "booking_completed"; props: { order_id: string; method: CollectionMethodId } }
  /** Postcode checker. Only whether the area is serviceable — the postcode itself is never sent. */
  | { name: "postcode_checked"; props: { serviceable: boolean } };

type RetestOfferProps = { order_id: string; offer_id: string; offer_version: number; variant?: string };

export type EventName = AnalyticsEvent["name"];

/**
 * Where each event goes. `null` = never sent to that destination.
 * Server-authoritative events are emitted from Stripe webhooks / server actions;
 * the browser emits the same event_id so platforms can de-duplicate.
 */
export interface DestinationPolicy {
  ga4: string | null;
  meta: string | null; // Meta standard/custom event name
  klaviyo: string | null; // Klaviyo metric name
  serverAuthoritative: boolean;
}

export const EVENT_POLICY: Record<EventName, DestinationPolicy> = {
  page_viewed: { ga4: "page_view", meta: "PageView", klaviyo: null, serverAuthoritative: false },
  landing_page_viewed: { ga4: "landing_page_view", meta: null, klaviyo: null, serverAuthoritative: false },
  biomarkers_viewed: { ga4: "view_biomarkers", meta: null, klaviyo: null, serverAuthoritative: false },
  configurator_started: { ga4: "configurator_start", meta: null, klaviyo: null, serverAuthoritative: false },
  addon_viewed: { ga4: "view_addon", meta: null, klaviyo: null, serverAuthoritative: false },
  addon_selected: { ga4: "addon_select", meta: null, klaviyo: null, serverAuthoritative: false },
  addon_removed: { ga4: "addon_remove", meta: null, klaviyo: null, serverAuthoritative: false },
  configurator_completed: { ga4: "configurator_complete", meta: null, klaviyo: null, serverAuthoritative: false },
  cta_clicked: { ga4: "cta_click", meta: null, klaviyo: null, serverAuthoritative: false },
  product_viewed: { ga4: "view_item", meta: "ViewContent", klaviyo: "Viewed Product", serverAuthoritative: false }, // brief: "view_signal"; GA4 recommended name kept for ecommerce reports
  quiz_started: { ga4: "quiz_start", meta: null, klaviyo: null, serverAuthoritative: false },
  quiz_completed: { ga4: "quiz_complete", meta: null, klaviyo: null, serverAuthoritative: false },
  product_recommended: { ga4: "product_recommended", meta: null, klaviyo: null, serverAuthoritative: false },
  checkout_started: { ga4: "begin_checkout", meta: "InitiateCheckout", klaviyo: "Started Checkout", serverAuthoritative: false },
  collection_method_selected: { ga4: "collection_method_selected", meta: null, klaviyo: null, serverAuthoritative: false },
  checkout_details_completed: { ga4: "add_shipping_info", meta: null, klaviyo: null, serverAuthoritative: false },
  checkout_details_invalid: { ga4: "checkout_details_invalid", meta: null, klaviyo: null, serverAuthoritative: false },
  payment_step_viewed: { ga4: "add_payment_info", meta: "AddPaymentInfo", klaviyo: null, serverAuthoritative: false },
  purchase_completed: { ga4: "purchase", meta: "Purchase", klaviyo: "Placed Order", serverAuthoritative: true },
  retest_offer_viewed: { ga4: "retest_offer_view", meta: null, klaviyo: null, serverAuthoritative: false },
  retest_plan_selected: { ga4: "retest_plan_select", meta: null, klaviyo: null, serverAuthoritative: false },
  retest_offer_accepted: { ga4: "retest_offer_accept", meta: "Subscribe", klaviyo: "Started Automatic Retesting", serverAuthoritative: true },
  retest_offer_declined: { ga4: "retest_offer_decline", meta: null, klaviyo: null, serverAuthoritative: false },
  booking_started: { ga4: "booking_start", meta: null, klaviyo: null, serverAuthoritative: false },
  booking_completed: { ga4: "booking_complete", meta: "Schedule", klaviyo: "Booked Collection", serverAuthoritative: true },
  postcode_checked: { ga4: "postcode_checked", meta: null, klaviyo: null, serverAuthoritative: false },
};

/**
 * Properties allowed to reach advertising platforms (Meta, Google Ads).
 * Product names, tiers and categories can reveal health information
 * (e.g. a hormone panel), so ad platforms receive value/currency/order only.
 */
export const AD_PLATFORM_PROP_ALLOWLIST = ["value", "currency", "order_id"] as const;

export function redactForAdPlatforms(props: Record<string, unknown>): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(props).filter(([k]) => (AD_PLATFORM_PROP_ALLOWLIST as readonly string[]).includes(k)),
  );
}
