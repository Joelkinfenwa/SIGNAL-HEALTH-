import { NextResponse } from "next/server";
import type Stripe from "stripe";
import { getAddon } from "@/config/addons";
import { getCollectionMethod } from "@/config/collection";
import { getProduct } from "@/config/products";
import { postPurchaseOffer } from "@/config/retest-offer";
import { recordServerEvent } from "@/lib/analytics/server";
import { orderConfirmationEmail } from "@/lib/email/order-confirmation";
import { sendEmail } from "@/lib/email/send";
import { decodeOrderMetadata } from "@/lib/orders/metadata";
import { orderTokenSecret, signOrderToken } from "@/lib/orders/token";
import { pathologyConfig } from "@/config/pathology";
import { orderReference, requestFormForIntent } from "@/lib/pathology/order-request";
import { opsAlert } from "@/lib/email/ops-alert";
import { sendOrderNotification } from "@/lib/email/order-notification";
import { dobForForm, phoneForForm, SEX_LABEL } from "@/lib/pathology/intent-input";
import { offerDeadline } from "@/lib/retest/offer";
import { getStripe } from "@/lib/stripe/server";

/**
 * Stripe webhook. Verifies the signature against STRIPE_WEBHOOK_SECRET and
 * emits the server-authoritative analytics events with the same event_id the
 * browser used, so ad platforms de-duplicate. Stripe retries on non-2xx, so
 * handlers must be idempotent (TODO(phase 7): stripe_event table keyed on event.id).
 *
 * Register this endpoint in the Stripe dashboard for:
 *   payment_intent.succeeded, payment_intent.payment_failed, charge.refunded,
 *   invoice.upcoming, invoice.paid, invoice.payment_failed,
 *   customer.subscription.updated, customer.subscription.deleted
 */
export async function POST(req: Request) {
  const stripe = getStripe();
  const secret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!stripe || !secret) return NextResponse.json({ error: "Not configured" }, { status: 501 });

  const sig = req.headers.get("stripe-signature");
  const body = await req.text();
  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(body, sig ?? "", secret);
  } catch (err) {
    return NextResponse.json({ error: `Invalid signature: ${(err as Error).message}` }, { status: 400 });
  }

  switch (event.type) {
    case "payment_intent.succeeded": {
      const pi = event.data.object;
      const order = decodeOrderMetadata(pi.metadata);
      if (!order) break;
      const customer = typeof pi.customer === "string" ? await stripe.customers.retrieve(pi.customer).catch(() => null) : pi.customer;
      const cust = customer && !("deleted" in customer && customer.deleted) ? customer : null;
      // The browser fired purchase_completed with event_id = pi.id; the server sends the same id.
      await recordServerEvent("purchase_completed", pi.id, {
        order_id: pi.id, product_id: order.configuration.productId, addon_ids: order.configuration.addonIds,
        value: pi.amount_received / 100, currency: "AUD", source: pi.metadata.source ?? "initial",
      }, {
        email: cust?.email ?? pi.receipt_email, fbp: pi.metadata.fbp, fbc: pi.metadata.fbc, gaClientId: pi.metadata.ga_cid,
        clientIp: cust?.metadata?.order_ip, userAgent: cust?.metadata?.order_ua,
      });
      // Confirmation email with the request form, where to get collected, and the time-limited retesting offer.
      const to = cust?.email ?? pi.receipt_email;
      if (to && !pi.metadata.confirmation_sent) {
        const site = process.env.NEXT_PUBLIC_SITE_URL ?? "";
        const token = encodeURIComponent(signOrderToken(pi.id, orderTokenSecret()));
        const orderUrl = `${site}/order/${pi.id}?t=${token}`;
        const formUrl = `${site}/api/orders/${pi.id}/request-form?t=${token}`;
        // Request form: issued at payment under the practice protocol ("auto"); in "review" mode it is sent after approval.
        // The form is only attached when every identity field the laboratory needs is present and well formed.
        // Anything else is held, recorded on the order (request_form) and raised with operations: never a blank form.
        let form: Uint8Array | null = null;
        let formStatus = "held:review_mode";
        if (pathologyConfig.issue === "auto") {
          try {
            const r = await requestFormForIntent({ ...pi, customer: cust });
            if (r.ok) { form = r.pdf; formStatus = "attached"; }
            else { formStatus = `held:${r.missing.join("+")}`; await opsAlert(`Request form held for ${orderReference(pi.id)}`, `Order ${pi.id} paid but the pathology request form could not be generated. Missing or invalid: ${r.missing.join(", ")}. Fix the Stripe Customer (${cust?.id ?? "unknown"}) and the customer can download the form from their order page, or send it manually.`); }
          } catch (err) {
            formStatus = "held:error";
            console.warn("[request-form] generation failed", err);
            await opsAlert(`Request form failed for ${orderReference(pi.id)}`, `Order ${pi.id}: ${(err as Error).message}`);
          }
        }
        await stripe.paymentIntents.update(pi.id, { metadata: { request_form: formStatus.slice(0, 120) } }).catch(() => undefined);
        const label = (kind: string, id: string) => kind === "product" ? getProduct(id)?.name ?? "The SIGNAL Test" : kind === "addon" ? getAddon(id)?.name ?? id : id === "centre" || id === "mobile" ? getCollectionMethod(id).name : id;
        const mail = orderConfirmationEmail({
          firstName: cust?.metadata?.first_name || undefined,
          reference: orderReference(pi.id),
          orderUrl, orderId: pi.id, formAttached: Boolean(form), formUrl: form ? formUrl : undefined,
          lines: order.lines.map((l) => ({ label: label(l.kind, l.id), priceCents: l.priceCents })),
          amountCents: pi.amount_received,
          collectionMethodId: order.configuration.collectionMethodId,
          offerDeadline: offerDeadline(new Date(pi.created * 1000), postPurchaseOffer.windowHours),
        });
        const sent = await sendEmail({ to, ...mail, attachments: form ? [{ filename: `SIGNAL-request-${orderReference(pi.id)}.pdf`, content: form }] : undefined });
        if (sent.sent) await stripe.paymentIntents.update(pi.id, { metadata: { confirmation_sent: sent.id ?? "1" } }).catch(() => undefined);
        // Internal copy for the operations inbox: the order record until a dashboard exists.
        const cm = cust?.metadata ?? {};
        const addr = cust?.address ? [cust.address.line1, cust.address.line2, cust.address.city, cust.address.state, cust.address.postal_code].filter(Boolean).join(", ") : "-";
        await sendOrderNotification({
          reference: orderReference(pi.id), orderId: pi.id,
          stripeUrl: `https://dashboard.stripe.com/${pi.livemode ? "" : "test/"}payments/${pi.id}`,
          paidAt: new Date(pi.created * 1000), amountCents: pi.amount_received,
          lines: order.lines.map((l) => ({ label: label(l.kind, l.id), priceCents: l.priceCents })),
          collectionLabel: order.configuration.collectionMethodId ? getCollectionMethod(order.configuration.collectionMethodId).name : "-",
          isMobile: order.configuration.collectionMethodId === "mobile",
          patient: { name: cust?.name ?? "-", email: to, phone: phoneForForm(cust?.phone) || "-", dob: dobForForm(cm.dob) ?? cm.dob ?? "-", sex: SEX_LABEL[cm.sex ?? ""] ?? cm.sex ?? "-", address: addr },
          formStatus, form,
        });
      }
      break;
    }
    case "payment_intent.payment_failed": {
      const pi = event.data.object;
      await recordServerEvent("payment_failed", pi.id, { order_id: pi.id, code: pi.last_payment_error?.code ?? "unknown" });
      break;
    }
    case "charge.refunded": {
      const ch = event.data.object;
      await recordServerEvent("order_refunded", event.id, { order_id: typeof ch.payment_intent === "string" ? ch.payment_intent : ch.payment_intent?.id, amount_refunded: ch.amount_refunded / 100, currency: "AUD" });
      break;
    }
    case "invoice.paid": {
      // A retest charge went through: TODO(phase 8) create the retest order and prompt booking.
      const inv = event.data.object;
      await recordServerEvent("purchase_completed", inv.id ?? event.id, { order_id: inv.id ?? event.id, source: "retest", value: inv.amount_paid / 100, currency: "AUD" });
      break;
    }
    case "invoice.upcoming":
    case "invoice.payment_failed":
    case "customer.subscription.updated":
    case "customer.subscription.deleted": {
      // TODO(phase 8): reminder email, dunning, mirror enrolment status.
      await recordServerEvent(event.type.replace(/\./g, "_"), event.id, {});
      break;
    }
    default:
      break;
  }
  return NextResponse.json({ received: true });
}
