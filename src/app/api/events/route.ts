import { NextResponse } from "next/server";
import { EVENT_POLICY, type EventName } from "@/lib/analytics/events";
import { forwardToPlatforms, gaClientIdFromCookie } from "@/lib/analytics/server-adapters";

/**
 * Server-side mirror of browser events (sendBeacon from track()). Validates
 * against the typed catalogue, refuses server-authoritative events (those
 * come from Stripe webhooks only), and forwards to Meta CAPI (redacted) and
 * GA4 MP with the browser's event_id for de-duplication.
 */
export async function POST(req: Request) {
  let body: { name?: string; props?: Record<string, unknown>; event_id?: string; page_url?: string };
  try { body = await req.json(); } catch { return new NextResponse(null, { status: 400 }); }
  const name = body.name as EventName | undefined;
  if (!name || !(name in EVENT_POLICY) || EVENT_POLICY[name].serverAuthoritative || !body.event_id) return new NextResponse(null, { status: 204 });
  const cookie = req.headers.get("cookie") ?? "";
  const get = (k: string) => cookie.split("; ").find((c) => c.startsWith(`${k}=`))?.slice(k.length + 1) ?? null;
  await forwardToPlatforms({
    name, eventId: body.event_id, props: body.props ?? {},
    clientIp: req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? null,
    userAgent: req.headers.get("user-agent"),
    fbp: get("_fbp"), fbc: get("_fbc"), gaClientId: gaClientIdFromCookie(get("_ga")),
    sourceUrl: body.page_url ?? null,
  });
  return new NextResponse(null, { status: 204 });
}
