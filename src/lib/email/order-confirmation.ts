import { getCollectionMethod } from "@/config/collection";
import { bookingUrlFor } from "@/config/booking";
import { legalEntity } from "@/config/legal/entity";
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
}

const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]!);

/** Plain, short, no images: what was bought, how to book, the retesting offer link, what happens next. */
export function orderConfirmationEmail(i: ConfirmationInput): { subject: string; html: string; text: string } {
  const booking = bookingUrlFor(i.orderId);
  const collection = i.collectionMethodId ? getCollectionMethod(i.collectionMethodId).name : "Collection";
  const deadline = i.offerDeadline ? new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "numeric", timeZone: "Australia/Sydney" }).format(i.offerDeadline) : null;
  const linesText = i.lines.map((l) => `  ${l.label}  ${formatAUD(l.priceCents)}`).join("\n");
  const subject = `Your SIGNAL order ${i.reference} is confirmed`;
  const greeting = i.firstName ? `Thanks, ${i.firstName}.` : "Thanks.";
  const text = [
    `${greeting} Your SIGNAL Test is ordered.`, "",
    `Order ${i.reference}`, linesText, `  Paid  ${formatAUD(i.amountCents)}`, "",
    `Next: book your ${collection.toLowerCase()}.`, booking ? `Book here: ${booking}` : "We'll email your booking link shortly.", "",
    deadline ? `Automatic Retesting: get the plan discount refunded on this order. Available until ${deadline}: ${i.orderUrl}` : "",
    "", "What happens next: book your collection, get collected at your chosen time, then your results and the doctor's review arrive in your dashboard in around 7 days.",
    "", `Questions? Reply to this email. ${legalEntity.tradingName}`,
  ].filter((l) => l !== undefined).join("\n");
  const html = `
  <div style="font-family:Figtree,Helvetica,Arial,sans-serif;max-width:560px;margin:0 auto;padding:24px;color:#121614;line-height:1.5">
    <p style="font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#1c4a3c;font-weight:700;margin:0 0 8px">SIGNAL by Express Pathology</p>
    <h1 style="font-size:24px;margin:0 0 12px">${esc(greeting)} Your SIGNAL Test is ordered.</h1>
    <p style="margin:0 0 20px;color:#5f6661">Order ${esc(i.reference)}</p>
    <table style="width:100%;border-collapse:collapse;margin:0 0 20px">${i.lines.map((l) => `<tr><td style="padding:6px 0;border-top:1px solid #dedcd5">${esc(l.label)}</td><td style="padding:6px 0;border-top:1px solid #dedcd5;text-align:right">${formatAUD(l.priceCents)}</td></tr>`).join("")}<tr><td style="padding:8px 0;border-top:1px solid #121614;font-weight:700">Paid</td><td style="padding:8px 0;border-top:1px solid #121614;text-align:right;font-weight:700">${formatAUD(i.amountCents)}</td></tr></table>
    <h2 style="font-size:18px;margin:0 0 8px">Next: book your ${esc(collection.toLowerCase())}</h2>
    ${booking ? `<p style="margin:0 0 20px"><a href="${esc(booking)}" style="display:inline-block;background:#1c4a3c;color:#fff;text-decoration:none;padding:12px 20px;border-radius:999px;font-weight:700">Book my collection</a></p>` : `<p style="margin:0 0 20px;color:#5f6661">We'll email your booking link shortly.</p>`}
    ${deadline ? `<div style="border:2px solid #1c4a3c;border-radius:12px;padding:16px;margin:0 0 20px"><p style="margin:0 0 6px;font-weight:700">Automatic Retesting: ${esc(postPurchaseOffer.headline.replace("{refund}", "the plan discount"))}</p><p style="margin:0 0 10px;color:#5f6661">Choose a retesting rhythm and we refund the discount on this order to your card. Available until ${esc(deadline)}.</p><a href="${esc(i.orderUrl)}" style="font-weight:700;color:#1c4a3c">See the offer</a></div>` : ""}
    <p style="margin:0 0 20px;color:#5f6661">What happens next: book your collection, get collected at your chosen time, then your results and the doctor's review arrive in your dashboard in around 7 days.</p>
    <p style="margin:0;color:#5f6661;font-size:13px">Questions? Reply to this email. ${esc(legalEntity.tradingName)}</p>
  </div>`;
  return { subject, html, text };
}
