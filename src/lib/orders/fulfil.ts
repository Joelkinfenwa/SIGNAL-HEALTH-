import "server-only";
import type Stripe from "stripe";
import { getAddon } from "@/config/addons";
import { getCollectionMethod } from "@/config/collection";
import { pathologyConfig } from "@/config/pathology";
import { getProduct } from "@/config/products";
import { postPurchaseOffer } from "@/config/retest-offer";
import { completeDetailsEmail } from "@/lib/email/complete-details";
import { opsAlert } from "@/lib/email/ops-alert";
import { orderConfirmationEmail } from "@/lib/email/order-confirmation";
import { sendOrderNotification } from "@/lib/email/order-notification";
import { sendEmail } from "@/lib/email/send";
import { decodeOrderMetadata, detailsComplete } from "@/lib/orders/metadata";
import { ensureOrderReference } from "@/lib/orders/number";
import { orderTokenSecret, signOrderToken } from "@/lib/orders/token";
import { dobForForm, phoneForForm, SEX_LABEL } from "@/lib/pathology/intent-input";
import { orderReferenceSlug, requestFormForIntent } from "@/lib/pathology/order-request";
import { offerDeadline } from "@/lib/retest/offer";

/**
 * Everything that happens once an order is paid AND the laboratory details
 * exist: issue the request form, email the confirmation, notify operations.
 * Called from the Stripe webhook (details given before payment, or an order
 * that already had them) and from the details step after payment (pay-first
 * checkout). Idempotent through PaymentIntent metadata flags, so both callers
 * can run and the customer still gets one confirmation.
 *
 * When details are missing, the customer gets the "complete your details"
 * email instead and the form is held (request_form = held:details_pending).
 */
export async function fulfilOrder(stripe: Stripe, pi: Stripe.PaymentIntent, customer: Stripe.Customer | null): Promise<void> {
  const order = decodeOrderMetadata(pi.metadata);
  if (!order) return;
  const reference = await ensureOrderReference(stripe, pi);
  const to = customer?.email ?? pi.receipt_email;
  if (!to) return;
  const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
  const token = encodeURIComponent(signOrderToken(pi.id, orderTokenSecret()));
  const orderUrl = `${site}/order/${pi.id}?t=${token}`;

  if (!detailsComplete(customer)) {
    if (!pi.metadata.details_email_sent) {
      const mail = completeDetailsEmail({ reference, orderUrl, amountCents: pi.amount_received || pi.amount, reminder: false });
      const sent = await sendEmail({ to, ...mail });
      await stripe.paymentIntents.update(pi.id, { metadata: { request_form: "held:details_pending", details_email_sent: sent.sent ? (sent.id ?? "1") : "skipped" } }).catch(() => undefined);
    }
    return;
  }
  if (pi.metadata.confirmation_sent) return;

  const formUrl = `${site}/api/orders/${pi.id}/request-form?t=${token}`;
  let form: Uint8Array | null = null;
  let formStatus = "held:review_mode";
  if (pathologyConfig.issue === "auto") {
    try {
      const r = await requestFormForIntent({ ...pi, customer });
      if (r.ok) { form = r.pdf; formStatus = "attached"; }
      else { formStatus = `held:${r.missing.join("+")}`; await opsAlert(`Request form held for ${reference}`, `Order ${pi.id} paid but the pathology request form could not be generated. Missing or invalid: ${r.missing.join(", ")}. Fix the Stripe Customer (${customer?.id ?? "unknown"}) and the customer can download the form from their order page, or send it manually.`); }
    } catch (err) {
      formStatus = "held:error";
      console.warn("[request-form] generation failed", err);
      await opsAlert(`Request form failed for ${reference}`, `Order ${pi.id}: ${(err as Error).message}`);
    }
  }
  await stripe.paymentIntents.update(pi.id, { metadata: { request_form: formStatus.slice(0, 120) } }).catch(() => undefined);

  const label = (kind: string, id: string) => kind === "product" ? getProduct(id)?.name ?? "The SIGNAL Test" : kind === "addon" ? getAddon(id)?.name ?? id : id === "centre" || id === "mobile" ? getCollectionMethod(id).name : id;
  const cm = customer?.metadata ?? {};
  const addr = customer?.address ? [customer.address.line1, customer.address.line2, customer.address.city, customer.address.state, customer.address.postal_code].filter(Boolean).join(", ") : undefined;
  const mail = orderConfirmationEmail({
    firstName: cm.first_name || undefined,
    reference, orderUrl, orderId: pi.id, formAttached: Boolean(form), formUrl: form ? formUrl : undefined,
    lines: order.lines.map((l) => ({ label: label(l.kind, l.id), priceCents: l.priceCents })),
    amountCents: pi.amount_received || pi.amount,
    collectionMethodId: order.configuration.collectionMethodId,
    offerDeadline: offerDeadline(new Date(pi.created * 1000), postPurchaseOffer.windowHours),
    phone: phoneForForm(customer?.phone) || undefined,
    address: addr,
  });
  const sent = await sendEmail({ to, ...mail, attachments: form ? [{ filename: `SIGNAL-request-${orderReferenceSlug(pi)}.pdf`, content: form }] : undefined });
  if (sent.sent) await stripe.paymentIntents.update(pi.id, { metadata: { confirmation_sent: sent.id ?? "1" } }).catch(() => undefined);

  await sendOrderNotification({
    reference, orderId: pi.id,
    stripeUrl: `https://dashboard.stripe.com/${pi.livemode ? "" : "test/"}payments/${pi.id}`,
    paidAt: new Date(pi.created * 1000), amountCents: pi.amount_received || pi.amount,
    lines: order.lines.map((l) => ({ label: label(l.kind, l.id), priceCents: l.priceCents })),
    collectionLabel: order.configuration.collectionMethodId ? getCollectionMethod(order.configuration.collectionMethodId).name : "-",
    isMobile: order.configuration.collectionMethodId === "mobile",
    patient: { name: customer?.name ?? "-", email: to, phone: phoneForForm(customer?.phone) || "-", dob: dobForForm(cm.dob) ?? cm.dob ?? "-", sex: SEX_LABEL[cm.sex ?? ""] ?? cm.sex ?? "-", address: addr ?? "-" },
    formStatus, form,
  });
}
