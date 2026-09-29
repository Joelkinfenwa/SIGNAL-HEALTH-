import { NextResponse } from "next/server";

/**
 * Server-side event mirror (phase 2).
 * Will: validate against the typed catalogue, apply EVENT_POLICY, redact via
 * redactForAdPlatforms(), then forward to Meta CAPI, GA4 Measurement Protocol
 * and Klaviyo with the browser's event_id for de-duplication.
 * Purchase / retest / booking events are NOT accepted from the browser — they
 * are emitted from Stripe webhooks and server actions only.
 */
export async function POST() {
  return new NextResponse(null, { status: 204 });
}
