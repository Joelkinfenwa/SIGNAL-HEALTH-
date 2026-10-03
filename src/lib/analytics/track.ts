import { dispatch } from "./adapters";
import type { AnalyticsEvent } from "./events";
import { readAttribution } from "./attribution";
import { readAnalyticsContext } from "./context";

declare global {
  interface Window {
    dataLayer?: Record<string, unknown>[];
  }
}

/**
 * Client-side event dispatch.
 *
 * 1. Pushes to window.dataLayer (GTM / gtag / Meta Pixel read from here).
 * 2. Optionally mirrors to /api/events, which forwards server-side to
 *    Meta Conversions API, GA4 Measurement Protocol and Klaviyo using the
 *    same event_id so platforms de-duplicate browser and server events.
 *
 * Pass `eventId` for events that are also emitted by the server (e.g. use the
 * order id for purchase_completed) so both sides share one id.
 */
export function track(event: AnalyticsEvent, opts: { eventId?: string } = {}): void {
  if (typeof window === "undefined") return;
  const event_id = opts.eventId ?? crypto.randomUUID();

  const context = readAnalyticsContext();
  window.dataLayer = window.dataLayer ?? [];
  window.dataLayer.push({ event: event.name, event_id, ...context, ...event.props });
  try { dispatch(event, event_id, { ...context }); } catch { /* an ad script failing never breaks the page */ }

  if (process.env.NEXT_PUBLIC_SERVER_EVENTS !== "0" && "sendBeacon" in navigator) {
    const body = JSON.stringify({
      name: event.name,
      props: event.props,
      context,
      event_id,
      page_url: window.location.href,
      attribution: readAttribution(),
    });
    navigator.sendBeacon("/api/events", new Blob([body], { type: "application/json" }));
  }

  if (process.env.NODE_ENV !== "production") {
    console.debug("[analytics]", event.name, event.props, event_id);
  }
}
