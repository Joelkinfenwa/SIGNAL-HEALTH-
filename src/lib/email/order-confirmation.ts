import { getCollectionMethod } from "@/config/collection";
import { bookingUrlFor, walkIn } from "@/config/booking";
import { legalEntity } from "@/config/legal/entity";
import { pathologyConfig } from "@/config/pathology";
import { postPurchaseOffer } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";
import type { QuoteLine } from "@/lib/pricing";

export interface ConfirmationInput {
  firstName?: string;
  reference: string;
  orderUrl: string;
  lines: { label: string; priceCents: number }[];
  amountCents: number;
  collectionMethodId?: "centre" | "mobile";
  offerDeadline?: Date;
  orderId: string;
  /** Whether the pathology request form is attached to this email. */
  formAttached: boolean;
  formUrl?: string;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Plain, short, no images: what was bought, where to get collected, the retesting offer link, what happens next. */
export function orderConfirmationEmail(i: ConfirmationInput): { subject: string; html: string; text: string } {
  const booking = bookingUrlFor(i.orderId);
  const collection = i.collectionMethodId ? getCollectionMethod(i.collectionMethodId).name : "Collection";
  const deadline = i.offerDeadline ? new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "numeric", timeZone: "Australia/Sydney" }).format(i.offerDeadline) : null;
  const linesText = i.lines.map((l) => `  ${l.label}  ${formatAUD(l.priceCents)}`).join("\n");
  const subject = `Your SIGNAL order ${i.reference} is confirmed`;
  const greeting = i.firstName ? `Thanks, ${i.firstName}.` : "Thanks.";
  const fasting = pathologyConfig.collection.fastingRequired ? pathologyConfig.collection.fastingInstruction : "";
  const steps = [
    i.formAttached || i.formUrl
      ? `1. Your pathology request form is ${i.formAttached ? "attached to this email" : "ready to download"}${i.formUrl ? ` (${i.formUrl})` : ""}. ${pathologyConfig.collection.bring}`
      : "1. Our team is preparing your pathology request form and will email it to you within one business day. You need it before your collection.",
    booking
      ? `2. Book your ${collection.toLowerCase()}. ${booking}`
      : i.collectionMethodId === "mobile"
        ? `2. ${walkIn.mobile.note}`
        : `2. ${walkIn.centre.note} Find your nearest centre: ${walkIn.locationsUrl}`,
    fasting ? `3. Before collection: ${fasting}` : "",
    `${fasting ? 4 : 3}. Your results and the doctor's review arrive in your dashboard in around 7 days.`,
  ].filter(Boolean);
  const text = [
    `${greeting} Your SIGNAL Test is ordered.`, "",
    `Order ${i.reference}`, linesText, `  Paid  ${formatAUD(i.amountCents)}`, "",
    "What happens next", ...steps, "",
    deadline ? `Automatic Retesting: get the plan discount refunded on this order. Available until ${deadline}: ${i.orderUrl}` : "",
    "", `Questions? Reply to this email. ${legalEntity.tradingName}`,
  ].filter((l) => l !== undefined).join("\n");
  const html = `
  <div style="font-family:Figtree,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#121614;line-height:1.5">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1c4a3c;font-weight:700;margin:0 0 8px">SIGNAL by Express Pathology</p>
    <h1 style="font-size:24px;margin:0 0 12px">${esc(greeting)} Your SIGNAL Test is ordered.</h1>
    <p style="margin:0 0 20px;color:#5f6661">Order ${esc(i.reference)}</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px">${i.lines.map((l) => `<tr><td style="padding:6px 0;border-top:1px solid #dedcd5">${esc(l.label)}</td><td style="padding:6px 0;border-top:1px solid #dedcd5;text-align:right">${formatAUD(l.priceCents)}</td></tr>`).join("")}<tr><td style="padding:8px 0;border-top:1px solid #121614;font-weight:700">Paid</td><td style="padding:8px 0;border-top:1px solid #121614;text-align:right;font-weight:700">${formatAUD(i.amountCents)}</td></tr></table>
    <h2 style="font-size:18px;margin:0 0 8px">What happens next</h2>
    <ol style="margin:0 0 20px;padding-left:20px;color:#121614">${steps.map((s) => `<li style="margin:0 0 8px">${esc(s.replace(/^\d+\. /, ""))}</li>`).join("")}</ol>
    ${booking ? `<p style="margin:0 0 20px"><a href="${esc(booking)}" style="display:inline-block;background:#1c4a3c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Book my collection</a></p>` : i.collectionMethodId !== "mobile" ? `<p style="margin:0 0 20px"><a href="${esc(walkIn.locationsUrl)}" style="display:inline-block;background:#1c4a3c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">${esc(walkIn.centre.cta)}</a></p>` : ""}
    ${i.formUrl ? `<p style="margin:0 0 20px"><a href="${esc(i.formUrl)}" style="font-weight:700;color:#1c4a3c">Download your pathology request form (PDF)</a></p>` : ""}
    ${deadline ? `<div style="border:2px solid #1c4a3c;border-radius:12px;padding:16px;margin:0 0 20px"><p style="margin:0 0 6px;font-weight:700">Automatic Retesting: ${esc(postPurchaseOffer.headline.replace("{refund}", "the plan discount"))}</p><p style="margin:0 0 10px;color:#5f6661">Choose a retesting rhythm and we refund the discount on this order to your card. Available until ${esc(deadline)}.</p><a href="${esc(i.orderUrl)}" style="font-weight:700;color:#1c4a3c">See the offer</a></div>` : ""}
    <p style="margin:0;color:#5f6661;font-size:13px">Questions? Reply to this email. ${esc(legalEntity.tradingName)}</p>
  </div>`;
  return { subject, html, text };
}
