import { legalEntity } from "@/config/legal/entity";
import { pathologyConfig } from "@/config/pathology";
import { formatAUD } from "@/lib/money";

export interface CompleteDetailsInput {
  reference: string;
  orderUrl: string;
  amountCents: number;
  /** true for the 24-hour reminder, false for the email sent at payment. */
  reminder: boolean;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
const INK = "#121614", MUTED = "#5f6661", BRAND = "#1c4a3c", PAPER = "#f6f5f1", LINE = "#dedcd5", CORAL = "#f06a47";

/**
 * Sent when an order is paid but the laboratory details (name, date of birth,
 * sex, address) have not been given yet. One job: bring the customer back to
 * the order page to finish them. The request form cannot be issued without
 * them, so this email never attaches one.
 */
export function completeDetailsEmail(i: CompleteDetailsInput): { subject: string; html: string; text: string } {
  const subject = i.reminder ? `Reminder: your SIGNAL request form is waiting on your details (${i.reference})` : `Payment received. One more step for your SIGNAL Test (${i.reference})`;
  const headline = i.reminder ? "Your request form is still waiting." : "Payment received. One more step.";
  const lead = `Thanks for ordering The SIGNAL Test. ${i.reminder ? "You paid but the laboratory details are still missing, so we can't issue your pathology request form yet." : "To issue your pathology request form, the laboratory needs a few details that match your photo ID: your name, date of birth, sex and address."} It takes about two minutes.`;
  const after = "As soon as they're in, your request form is emailed to you and you can walk into any 4Cyte or Australian Clinical Labs centre to be collected.";
  const help = `Questions? Call ${pathologyConfig.referrer.phone} or reply to this email.`;

  const text = [
    "SIGNAL by Express Pathology", "", headline, "", lead, "", `Complete your details: ${i.orderUrl}`, "", after, "",
    `YOUR ORDER ${i.reference}`, `  Paid  ${formatAUD(i.amountCents)}`, "", help, "", `${legalEntity.legalName}. This email was sent because you placed an order.`,
  ].join("\n");

  const p = (s: string, extra = "") => `<p style="margin:0 0 12px;font-size:16px;line-height:1.55;color:${INK};${extra}">${esc(s)}</p>`;
  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${PAPER}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;font-family:Figtree,'Helvetica Neue',Helvetica,Arial,sans-serif">
  <tr><td style="padding:0 4px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:${BRAND};font-weight:800">SIGNAL by Express Pathology</td>
    <td align="right" style="font-size:13px;color:${MUTED}">Order ${esc(i.reference)}</td></tr></table></td></tr>
  <tr><td style="padding:0 4px 18px">
    <h1 style="margin:0 0 10px;font-size:26px;line-height:1.2;letter-spacing:-.02em;color:${INK}">${esc(headline)}</h1>
    ${p(lead, `color:${MUTED}`)}
  </td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px"><tr><td style="padding:22px 24px;background:#ffffff;border:1px solid ${BRAND};border-radius:14px">
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${CORAL};font-weight:800">Next step</p>
    <h2 style="margin:0 0 10px;font-size:18px;line-height:1.3;color:${INK};font-weight:700">Give the laboratory your details</h2>
    ${p("Name as on your photo ID, date of birth, sex, mobile and home address. Nothing else.")}
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 14px"><tr><td style="border-radius:999px;background:${BRAND}"><a href="${esc(i.orderUrl)}" style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">Complete my details &rarr;</a></td></tr></table>
    ${p(after, `color:${MUTED};font-size:14px;margin:0`)}
  </td></tr></table></td></tr>
  <tr><td><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px"><tr><td style="padding:18px 24px;background:#ecebe5;border-radius:14px;font-size:15px;color:${INK}">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr><td style="padding:4px 0;font-weight:800">Paid</td><td align="right" style="padding:4px 0;font-weight:800">${formatAUD(i.amountCents)}</td></tr>
    <tr><td colspan="2" style="padding:6px 0 0;color:${MUTED};font-size:14px;border-top:1px solid ${LINE}">Reference ${esc(i.reference)}</td></tr></table>
  </td></tr></table></td></tr>
  <tr><td style="padding:4px 4px 0">${p(help, `color:${MUTED}`)}<p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:${MUTED}">${esc(legalEntity.legalName)}. This email was sent because you placed an order.</p></td></tr>
</table></td></tr></table></body></html>`;
  return { subject, html, text };
}
