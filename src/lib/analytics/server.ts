import "server-only";
import { EVENT_POLICY, type EventName } from "./events";
import { forwardToPlatforms, type ServerEventInput } from "./server-adapters";

/**
 * Server-authoritative analytics. Called from the Stripe webhook and server
 * actions with the same event_id the browser used so Meta CAPI / GA4
 * de-duplicate. Logs, then forwards to the platforms when configured.
 */
export async function recordServerEvent(name: string, eventId: string, props: Record<string, unknown>, who: Partial<ServerEventInput> = {}): Promise<void> {
  console.info("[server-event]", name, eventId, JSON.stringify(props));
  if (!(name in EVENT_POLICY)) return;
  await forwardToPlatforms({ name: name as EventName, eventId, props, ...who });
}
