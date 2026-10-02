import "server-only";

/**
 * Server-authoritative analytics (phase 7 wires the adapters). Called from
 * the Stripe webhook and server actions with the same event_id the browser
 * used so Meta CAPI / GA4 de-duplicate. Until adapters exist this logs only.
 */
export async function recordServerEvent(name: string, eventId: string, props: Record<string, unknown>): Promise<void> {
  // TODO(phase 7): persist to the events table; forward to Meta CAPI (redacted), GA4 MP, Klaviyo.
  console.info("[server-event]", name, eventId, JSON.stringify(props));
}
