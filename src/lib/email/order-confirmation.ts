import { walkIn } from "@/config/booking";
import { getCollectionMethod } from "@/config/collection";
import { confirmationEmail as c } from "@/config/email";
import { legalEntity } from "@/config/legal/entity";
import { pathologyConfig } from "@/config/pathology";
import { postPurchaseOffer } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";

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
  /** Used by the home-visit variant. */
  phone?: string;
  address?: string;
}

const esc = (s: string) => s.replace(/[&<>"]/g, (ch) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[ch]!);
const INK = "#121614", MUTED = "#5f6661", BRAND = "#1c4a3c", SOFT = "#ecebe5", PAPER = "#f6f5f1", LINE = "#dedcd5", CORAL = "#f06a47";

/**
 * Order confirmation: everything a customer needs to get collected and what
 * happens after. Two variants, chosen by collection method. Table-based HTML
 * with inline styles so it renders in Outlook, Gmail and Apple Mail; a full
 * plain-text twin for text-only clients. All wording lives in config/email.ts.
 */
export function orderConfirmationEmail(i: ConfirmationInput): { subject: string; html: string; text: string } {
  const mobile = i.collectionMethodId === "mobile";
  const method = i.collectionMethodId ? getCollectionMethod(i.collectionMethodId) : undefined;
  const visitFee = method?.priceDeltaCents ? formatAUD(method.priceDeltaCents) : "";
  const deadline = i.offerDeadline ? new Intl.DateTimeFormat("en-AU", { weekday: "long", day: "numeric", month: "long", hour: "numeric", timeZone: "Australia/Sydney" }).format(i.offerDeadline) : "";
  const fill = (s: string) => s
    .replace(/\{firstName\}/g, i.firstName ?? "").replace(/\{reference\}/g, i.reference)
    .replace(/\{phone\}/g, i.phone ?? "the number on your order").replace(/\{address\}/g, i.address ?? "the address on your order")
    .replace(/\{visitFee\}/g, visitFee).replace(/\{callWithin\}/g, walkIn.mobile.callWithin).replace(/\{deadline\}/g, deadline)
    .replace(/\{supportPhone\}/g, pathologyConfig.referrer.phone).replace(/\{supportEmail\}/g, legalEntity.supportEmail)
    .replace(/\{legalName\}/g, legalEntity.legalName).replace(/\{headline\}/g, postPurchaseOffer.headline.replace("{refund}", "the plan discount"));

  const hasForm = i.formAttached || Boolean(i.formUrl);
  const subject = fill(!hasForm ? c.subject.noForm : mobile ? c.subject.mobile : c.subject.centre);
  const headline = fill(i.firstName ? c.headline : c.headlineNoName);
  const lead = fill(mobile ? c.lead.mobile : c.lead.centre);
  const next = mobile ? c.nextStep.mobile : c.nextStep.centre;
  const nextBody = fill(next.body);
  const formLine = hasForm ? fill(next.formLine) : fill(c.nextStep.noForm);
  const siteBase = i.orderUrl.replace(/\/order\/.*$/, "");
  const collectHref = `${siteBase}${walkIn.locationsUrl}`;
  const ctaHref = mobile ? i.orderUrl : collectHref;
  const onlyLabs = mobile ? "" : c.nextStep.centre.onlyLabs;
  const day = mobile ? c.onTheDay.mobile : c.onTheDay.centre;
  const coverage = mobile ? fill(c.nextStep.mobile.coverage) : "";
  const offer = deadline ? { title: fill(c.offer.title), body: fill(c.offer.body) } : null;
  const help = fill(c.help.body);
  const footer = fill(c.footer);

  // ── Plain text ──
  const text = [
    `${c.brand}`, "", headline, "", lead, "",
    next.title.toUpperCase(), nextBody, onlyLabs, coverage, formLine, i.formUrl ? `Download your form: ${i.formUrl}` : "", mobile ? "" : `${next.cta}: ${collectHref}`, mobile ? "" : pathologyConfig.labs.map((l) => `  ${l.name}: ${l.finderUrl}`).join("\n"), "",
    c.prepare.title.toUpperCase(), ...c.prepare.items.map((s) => `- ${s}`), "",
    day.title.toUpperCase(), ...day.items.map((s) => `- ${s}`), "",
    c.results.title.toUpperCase(), c.results.body, "",
    `YOUR ORDER ${i.reference}`, ...i.lines.map((l) => `  ${l.label}  ${formatAUD(l.priceCents)}`), `  Paid  ${formatAUD(i.amountCents)}`, `  Collection: ${method?.name ?? "-"}`, `View your order: ${i.orderUrl}`, "",
    offer ? `${offer.title}\n${offer.body}\n${i.orderUrl}` : "", offer ? "" : "",
    c.help.title.toUpperCase(), help, "", footer,
  ].filter((l, idx, a) => !(l === "" && a[idx - 1] === "")).join("\n");

  // ── HTML ──
  const p = (s: string, extra = "") => `<p style="margin:0 0 12px;font-size:16px;line-height:1.55;color:${INK};${extra}">${esc(s)}</p>`;
  const h2 = (s: string) => `<h2 style="margin:0 0 10px;font-size:18px;line-height:1.3;color:${INK};font-weight:700">${esc(s)}</h2>`;
  const list = (items: string[]) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:0 0 4px">${items.map((s) => `<tr><td valign="top" style="padding:0 10px 10px 0;color:${BRAND};font-weight:700;font-size:16px;line-height:1.55">&#10003;</td><td style="padding:0 0 10px;font-size:16px;line-height:1.55;color:${INK}">${esc(s)}</td></tr>`).join("")}</table>`;
  const button = (label: string, href: string, bg = BRAND) => `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:6px 0 14px"><tr><td style="border-radius:999px;background:${bg}"><a href="${esc(href)}" style="display:inline-block;padding:14px 24px;font-size:16px;font-weight:700;color:#ffffff;text-decoration:none;border-radius:999px">${esc(label)} &rarr;</a></td></tr></table>`;
  const card = (inner: string, bg = "#ffffff", border = LINE) => `<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="margin:0 0 18px"><tr><td style="padding:22px 24px;background:${bg};border:1px solid ${border};border-radius:14px">${inner}</td></tr></table>`;

  const html = `<!doctype html><html lang="en-AU"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(subject)}</title></head>
<body style="margin:0;padding:0;background:${PAPER}">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background:${PAPER}"><tr><td align="center" style="padding:24px 12px">
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:600px;font-family:Figtree,'Helvetica Neue',Helvetica,Arial,sans-serif">
  <tr><td style="padding:0 4px 16px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0"><tr>
    <td style="font-size:13px;letter-spacing:.1em;text-transform:uppercase;color:${BRAND};font-weight:800">${esc(c.brand)}</td>
    <td align="right" style="font-size:13px;color:${MUTED}">Order ${esc(i.reference)}</td></tr></table></td></tr>

  <tr><td style="padding:0 4px 18px">
    <h1 style="margin:0 0 10px;font-size:26px;line-height:1.2;letter-spacing:-.02em;color:${INK}">${esc(headline)}</h1>
    ${p(lead, `color:${MUTED}`)}
  </td></tr>

  <tr><td>${card(`
    <p style="margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${CORAL};font-weight:800">Step 1</p>
    ${h2(next.title)}
    ${p(nextBody)}
    ${onlyLabs ? `<p style="margin:0 0 12px;padding:10px 14px;background:#fff4ef;border-left:4px solid ${CORAL};font-size:15px;line-height:1.5;color:${INK};font-weight:700">${esc(onlyLabs)}</p>` : ""}
    ${coverage ? p(coverage, `color:${MUTED};font-size:14px`) : ""}
    ${button(next.cta, ctaHref)}
    ${p(formLine, `color:${MUTED};font-size:14px;margin:0`)}
    ${i.formUrl ? `<p style="margin:6px 0 0;font-size:14px"><a href="${esc(i.formUrl)}" style="color:${BRAND};font-weight:700">Download your request form (PDF)</a></p>` : ""}
  `, "#ffffff", BRAND)}</td></tr>

  <tr><td>${card(`<p style="margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${CORAL};font-weight:800">Step 2</p>${h2(c.prepare.title)}${list(c.prepare.items)}`)}</td></tr>

  <tr><td>${card(`<p style="margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${CORAL};font-weight:800">Step 3</p>${h2(day.title)}${list(day.items)}`)}</td></tr>

  <tr><td>${card(`<p style="margin:0 0 6px;font-size:12px;letter-spacing:.1em;text-transform:uppercase;color:${CORAL};font-weight:800">Step 4</p>${h2(c.results.title)}${p(c.results.body, "margin:0")}`)}</td></tr>

  ${offer ? `<tr><td>${card(`${h2(offer.title)}${p(offer.body)}${button(c.offer.cta, i.orderUrl, CORAL)}`, "#fff4ef", CORAL)}</td></tr>` : ""}

  <tr><td>${card(`
    ${h2(`Your order`)}
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="font-size:15px;color:${INK}">
      ${i.lines.map((l) => `<tr><td style="padding:7px 0;border-top:1px solid ${LINE}">${esc(l.label)}</td><td align="right" style="padding:7px 0;border-top:1px solid ${LINE}">${formatAUD(l.priceCents)}</td></tr>`).join("")}
      <tr><td style="padding:9px 0;border-top:2px solid ${INK};font-weight:800">Paid</td><td align="right" style="padding:9px 0;border-top:2px solid ${INK};font-weight:800">${formatAUD(i.amountCents)}</td></tr>
      <tr><td colspan="2" style="padding:6px 0 0;color:${MUTED};font-size:14px">Collection: ${esc(method?.name ?? "-")} &middot; Reference ${esc(i.reference)} &middot; <a href="${esc(i.orderUrl)}" style="color:${BRAND};font-weight:700">View your order</a></td></tr>
    </table>
  `, SOFT, SOFT)}</td></tr>

  <tr><td style="padding:4px 4px 0">
    ${h2(c.help.title)}
    ${p(help, `color:${MUTED}`)}
    <p style="margin:18px 0 0;font-size:12px;line-height:1.5;color:${MUTED}">${esc(footer)}</p>
    <p style="margin:10px 0 0;font-size:12px;color:${MUTED}"><a href="${esc(siteBase)}/legal/privacy" style="color:${MUTED}">Privacy</a> &middot; <a href="${esc(siteBase)}/legal/terms" style="color:${MUTED}">Terms</a></p>
  </td></tr>
</table>
</td></tr></table>
</body></html>`;
  return { subject, html, text };
}
