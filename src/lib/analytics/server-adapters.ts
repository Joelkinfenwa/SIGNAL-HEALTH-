import "server-only";
import { createHash } from "node:crypto";
import { EVENT_POLICY, redactForAdPlatforms, type EventName } from "./events";

/**
 * Server-side forwarding to Meta Conversions API and GA4 Measurement
 * Protocol. Fire-and-forget: a failure is logged, never thrown into a
 * request. Same event_id as the browser so each platform de-duplicates.
 */
const META_PIXEL_ID = process.env.NEXT_PUBLIC_META_PIXEL_ID;
const META_TOKEN = process.env.META_CAPI_ACCESS_TOKEN;
const META_TEST = process.env.META_TEST_EVENT_CODE;
const GA4_ID = process.env.NEXT_PUBLIC_GA4_ID;
const GA4_SECRET = process.env.GA4_API_SECRET;

export interface ServerEventInput {
  name: EventName;
  eventId: string;
  props: Record<string, unknown>;
  /** Hashed server-side before it leaves. */
  email?: string | null;
  clientIp?: string | null;
  userAgent?: string | null;
  fbp?: string | null;
  fbc?: string | null;
  gaClientId?: string | null;
  sourceUrl?: string | null;
}

const sha256 = (v: string) => createHash("sha256").update(v.trim().toLowerCase()).digest("hex");

export async function forwardToPlatforms(e: ServerEventInput): Promise<void> {
  const policy = EVENT_POLICY[e.name];
  const jobs: Promise<unknown>[] = [];
  if (META_PIXEL_ID && META_TOKEN && policy.meta) {
    const data = redactForAdPlatforms(e.props);
    const body = {
      data: [{
        event_name: policy.meta,
        event_time: Math.floor(Date.now() / 1000),
        event_id: e.eventId,
        action_source: "website",
        event_source_url: e.sourceUrl ?? undefined,
        user_data: {
          em: e.email ? [sha256(e.email)] : undefined,
          client_ip_address: e.clientIp ?? undefined,
          client_user_agent: e.userAgent ?? undefined,
          fbp: e.fbp ?? undefined,
          fbc: e.fbc ?? undefined,
        },
        custom_data: { value: data.value, currency: data.currency, order_id: data.order_id },
      }],
      ...(META_TEST ? { test_event_code: META_TEST } : {}),
    };
    jobs.push(fetch(`https://graph.facebook.com/v21.0/${META_PIXEL_ID}/events?access_token=${META_TOKEN}`, { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(body) }));
  }
  if (GA4_ID && GA4_SECRET && policy.ga4 && e.gaClientId) {
    const params: Record<string, unknown> = { ...e.props, event_id: e.eventId };
    if (typeof e.props.order_id === "string") params.transaction_id = e.props.order_id;
    jobs.push(fetch(`https://www.google-analytics.com/mp/collect?measurement_id=${GA4_ID}&api_secret=${GA4_SECRET}`, { method: "POST", body: JSON.stringify({ client_id: e.gaClientId, events: [{ name: policy.ga4, params }] }) }));
  }
  const results = await Promise.allSettled(jobs);
  for (const r of results) if (r.status === "rejected") console.warn("[analytics] forward failed", r.reason);
}

/** GA4 client id from the _ga cookie ("GA1.1.123.456" → "123.456"). */
export const gaClientIdFromCookie = (ga?: string | null) => (ga ? ga.split(".").slice(-2).join(".") : null);
