import { NextResponse } from "next/server";
import { signalTest } from "@/config/products";
import { orderTokenSecret, verifyOrderToken } from "@/lib/orders/token";
import { orderReference, requestFormDemo, requestFormForIntent } from "@/lib/pathology/order-request";
import { parseConfiguration } from "@/lib/pricing";
import { getStripe } from "@/lib/stripe/server";

/**
 * Pathology request form PDF for a paid order. Requires the same signed
 * token as the order page. Generated on demand from Stripe; nothing is
 * stored. Previews can fetch /api/orders/demo/request-form?addons=…
 */
export async function GET(req: Request, { params }: { params: Promise<{ orderId: string }> }) {
  const { orderId } = await params;
  const url = new URL(req.url);
  const pdfResponse = (bytes: Uint8Array, name: string) =>
    new NextResponse(Buffer.from(bytes), { headers: { "content-type": "application/pdf", "content-disposition": `inline; filename="${name}"`, "cache-control": "private, no-store" } });

  if (orderId === "demo" && process.env.VERCEL_ENV !== "production") {
    const cfg = parseConfiguration(url.searchParams, signalTest);
    cfg.collectionMethodId ??= "centre";
    return pdfResponse(await requestFormDemo(cfg), "SIGNAL-request-DEMO.pdf");
  }
  if (!orderId.startsWith("pi_") || !verifyOrderToken(orderId, url.searchParams.get("t") ?? undefined, orderTokenSecret())) return new NextResponse(null, { status: 404 });
  const stripe = getStripe();
  if (!stripe) return new NextResponse(null, { status: 404 });
  let pi;
  try { pi = await stripe.paymentIntents.retrieve(orderId, { expand: ["customer"] }); } catch { return new NextResponse(null, { status: 404 }); }
  if (pi.status !== "succeeded") return new NextResponse(null, { status: 404 });
  const r = await requestFormForIntent(pi);
  if (!r.ok) {
    console.error(`[request-form] ${pi.id} cannot be issued; missing ${r.missing.join(", ")}`);
    return new NextResponse("Your request form is being prepared by our team and will be emailed to you. Reply to your confirmation email if you need it sooner.", { status: 409, headers: { "content-type": "text/plain; charset=utf-8" } });
  }
  return pdfResponse(r.pdf, `SIGNAL-request-${orderReference(pi.id)}.pdf`);
}
