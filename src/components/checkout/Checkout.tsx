"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CheckoutHeader } from "@/components/checkout/CheckoutHeader";
import { CustomerDetails } from "@/components/checkout/CustomerDetails";
import { PaymentPanel } from "@/components/checkout/PaymentPanel";
import { Steps } from "@/components/checkout/Steps";
import { Icon } from "@/components/ui/Icon";
import { detailsCopy, MIN_AGE_YEARS } from "@/config/checkout-fields";
import { getCollectionMethod } from "@/config/collection";
import { guarantee, included } from "@/config/panel";
import { getProduct, signalTest } from "@/config/products";
import { retestOffers, formatDiscount, type RetestOffer } from "@/config/retest-offer";
import { track } from "@/lib/analytics/track";
import { createOrder } from "@/lib/checkout/create-order";
import { emptyCustomer, validateCustomer, type CustomerDetails as Details, type CustomerField } from "@/lib/checkout/customer";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { defaultConfiguration, displayTotal, parseConfiguration, quoteConfiguration, serializeConfiguration, type Configuration } from "@/lib/pricing";
import { quoteRetestForOrder } from "@/lib/retest/offer";
import styles from "./Checkout.module.css";

const CUSTOMER_KEY = "sig_checkout_customer";
const LEGACY_EMAIL_KEY = "sig_checkout_email";
const ALL_FIELDS = Object.keys(emptyCustomer()) as CustomerField[];

/**
 * Checkout stage, steps two and three on one screen: the details the
 * laboratory needs, then payment. Everything is collected before the card so
 * the request form is issued the moment payment succeeds. The configuration
 * (product, add-ons, collection) arrives in the URL from the build step.
 *
 * What is typed persists in sessionStorage only (tab-scoped), so a reload or
 * a trip back to the build step keeps it. It never enters an analytics event.
 */
export function Checkout() {
  const [cfg, setCfg] = useState<Configuration>(() => ({ ...defaultConfiguration(signalTest), collectionMethodId: "centre" }));
  const [plan, setPlan] = useState<RetestOffer | null>(null);
  const [hydrated, setHydrated] = useState(false);
  const [customer, setCustomer] = useState<Details>(() => ({ ...emptyCustomer(), acceptsTerms: true }));
  const [touched, setTouched] = useState<Partial<Record<CustomerField, boolean>>>({});
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ orderId: string; clientSecret: string; amountCents: number; token: string } | null>(null);
  const [starting, setStarting] = useState(false);
  const formRef = useRef<HTMLElement>(null);
  const router = useRouter();
  const product = getProduct(cfg.productId) ?? signalTest;
  const quote = useMemo(() => quoteConfiguration(cfg), [cfg]);
  const planQuote = useMemo(() => (plan && quote.pricingComplete ? quoteRetestForOrder(quote.lines, plan) : null), [plan, quote]);
  const errors = useMemo(() => validateCustomer(customer, { requiresAddress: true }, detailsCopy.errors), [customer]);
  const errorCount = Object.keys(errors).length;
  const paymentsLive = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const total = displayTotal(quote, formatAUD, "Pricing coming soon");
  const method = cfg.collectionMethodId ? getCollectionMethod(cfg.collectionMethodId) : null;
  const buildHref = `/checkout${serializeConfiguration(cfg)}${plan ? `${serializeConfiguration(cfg) ? "&" : "?"}plan=${plan.id}` : ""}`;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseConfiguration(params, signalTest);
    setCfg({ ...parsed, collectionMethodId: parsed.collectionMethodId ?? "centre" });
    setPlan(retestOffers.find((o) => o.active && o.id === params.get("plan")) ?? null);
    try {
      const saved = sessionStorage.getItem(CUSTOMER_KEY);
      if (saved) setCustomer((c) => ({ ...c, ...(JSON.parse(saved) as Partial<Details>), acceptsTerms: true }));
      else { const email = sessionStorage.getItem(LEGACY_EMAIL_KEY); if (email) setCustomer((c) => ({ ...c, email })); }
    } catch { /* blocked storage: the form still works */ }
    setHydrated(true);
    track({ name: "payment_step_viewed", props: { product_id: parsed.productId, addon_ids: parsed.addonIds } });
  }, []);

  useEffect(() => { if (hydrated) { try { sessionStorage.setItem(CUSTOMER_KEY, JSON.stringify(customer)); } catch { /* ignore */ } } }, [customer, hydrated]);

  // Any change to who is paying invalidates a started payment.
  useEffect(() => { setPayment(null); }, [customer]);

  function focusFirstError() {
    requestAnimationFrame(() => {
      const first = formRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [role='alert']");
      first?.scrollIntoView({ behavior: "smooth", block: "center" });
      (formRef.current?.querySelector<HTMLElement>("[aria-invalid='true']") ?? first)?.focus?.();
    });
  }

  async function attemptPay() {
    if (payment) return;
    if (errorCount) {
      setTouched(Object.fromEntries(ALL_FIELDS.map((f) => [f, true])));
      setPayMessage(detailsCopy.summaryError(errorCount));
      track({ name: "checkout_details_invalid", props: { field_count: errorCount } });
      focusFirstError();
      return;
    }
    if (!paymentsLive) { setPayMessage("Payments open at launch."); return; }
    if (!quote.pricingComplete) { setPayMessage(quote.unpricedCount ? "An add-on in your order isn't priced yet, so payment can't start." : "Pricing isn't set yet, so payment can't start."); return; }
    setStarting(true); setPayMessage(null);
    try {
      const res = await createOrder(cfg, { ...customer, acceptsTerms: true });
      if (res.status === "ready") {
        setPayment({ orderId: res.orderId, clientSecret: res.clientSecret, amountCents: res.amountCents, token: res.token });
        track({ name: "checkout_details_completed", props: { product_id: cfg.productId } });
        requestAnimationFrame(() => document.getElementById("pay-form")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      } else if (res.status === "invalid") {
        setTouched(Object.fromEntries(ALL_FIELDS.map((f) => [f, true])));
        setPayMessage(Object.values(res.errors)[0] ?? "Check your details.");
        focusFirstError();
      } else {
        setPayMessage(res.reason);
      }
    } catch {
      setPayMessage("We couldn't start the payment. Please try again.");
    } finally {
      setStarting(false);
    }
  }

  function onPaid(paymentIntentId: string) {
    if (!payment) return;
    track(
      { name: "purchase_completed", props: { order_id: paymentIntentId, product_id: cfg.productId, addon_ids: cfg.addonIds, value: payment.amountCents / 100, currency: "AUD" } },
      { eventId: paymentIntentId },
    );
    try { sessionStorage.removeItem(CUSTOMER_KEY); sessionStorage.removeItem(LEGACY_EMAIL_KEY); } catch { /* ignore */ }
    router.push(`/order/${paymentIntentId}?t=${encodeURIComponent(payment.token)}${plan ? `&plan=${plan.id}` : ""}`);
  }

  const summary = (
    <aside className={styles.order} data-theme="light" aria-labelledby="order-title">
      <div className={styles.orderHead}>
        <p id="order-title" className={styles.orderTag}>Your order</p>
        <Link href={buildHref} className={styles.change}>Change</Link>
      </div>
      <p className={styles.orderTitle}>The SIGNAL Test</p>
      <ul className={styles.orderLines}>
        {quote.lines.map((l) => (
          <li key={l.id}><span>{l.label}</span><span className="num">{l.priceCents === null ? "TBC" : l.priceCents === 0 ? "Included" : formatAUD(l.priceCents)}</span></li>
        ))}
      </ul>
      {method ? <p className={styles.orderMethod}><Icon name={method.id === "mobile" ? "home" : "pin"} size={14} /> {method.name}: {method.description}</p> : null}
      <div className={styles.total}><span>Total</span><span className={cx(styles.totalValue, "num")}>{total}</span></div>
      <ul className={styles.orderIncluded}>
        {included.slice(0, 3).map((i) => <li key={i.text}><Icon name={i.icon} size={14} /> {i.text}</li>)}
      </ul>
      <p className={styles.orderGuarantee}><Icon name="check" size={14} /> {guarantee.title}</p>
    </aside>
  );

  return (
    <>
      <CheckoutHeader backHref={buildHref} backLabel="Back to your test" />
      <div className={styles.wrap}>
        <header className={styles.header}>
          <Steps current={payment ? 3 : 2} />
          <h1 className={styles.title}>{payment ? "Pay." : "Your details."}</h1>
          <p className={styles.intro}>{payment ? "Card, Apple Pay or Google Pay. Secured by Stripe." : "What the laboratory needs to issue your request form. Use the name on your photo ID: the collector checks it."}</p>
        </header>

        <div className={styles.main}>
          <section ref={formRef} className={styles.card} data-theme="light" aria-labelledby="details-title">
            <h2 id="details-title" className={styles.cardTitle}><span className={styles.n}>2</span> Your details</h2>
            <CustomerDetails
              value={customer}
              errors={errors}
              touched={touched}
              requiresAddress
              hideTerms
              onChange={(patch) => { setCustomer((c) => ({ ...c, ...patch, acceptsTerms: true })); setPayMessage(null); }}
              onBlur={(f) => setTouched((t) => (t[f] ? t : { ...t, [f]: true }))}
            />
            <p className={styles.privacy}><Icon name="shield" size={14} /> Shared with the laboratory and collection team only. Never with advertisers.</p>
          </section>

          <section id="pay-form" className={styles.card} data-theme="light" aria-labelledby="pay-title">
            <h2 id="pay-title" className={styles.cardTitle}><span className={styles.n}>3</span> Pay {quote.pricingComplete ? <span className="num">{total}</span> : null}</h2>
            {plan ? (
              <div className={styles.plan}>
                <p className={styles.planTitle}><Icon name="refresh" size={16} /> Automatic Retesting · {plan.cadence.toLowerCase()}</p>
                <p className={styles.planBody}>
                  Pay for today&apos;s test now. Straight after payment you confirm the plan and we refund {formatDiscount(plan.discountBps)}{planQuote ? ` (${formatAUD(planQuote.refundTodayCents)})` : ""} of today&apos;s order to your card, then every retest is {formatDiscount(plan.discountBps)} off. Recurring billing, cancel any time.
                </p>
                <button type="button" className={styles.remove} onClick={() => setPlan(null)}>Remove plan</button>
              </div>
            ) : null}
            {payment ? (
              <PaymentPanel
                key={payment.clientSecret}
                clientSecret={payment.clientSecret}
                amountCents={payment.amountCents}
                billing={{ email: customer.email.trim(), name: `${customer.firstName.trim()} ${customer.lastName.trim()}`.trim() }}
                returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/order/${payment.orderId}?t=${encodeURIComponent(payment.token)}${plan ? `&plan=${plan.id}` : ""}`}
                onSuccess={onPaid}
              />
            ) : (
              <div className={styles.primaryRow}>
                <button type="button" className={styles.payButton} data-ready={errorCount === 0 ? "true" : "false"} onClick={attemptPay} disabled={starting}>
                  {starting ? "Starting payment…" : paymentsLive ? `Continue to payment${quote.pricingComplete ? ` · ${total}` : ""}` : "Payments open at launch"} <Icon name="arrow" size={18} />
                </button>
                <p className={styles.payNote} aria-live="polite">{payMessage ?? (paymentsLive ? "Card, Apple Pay or Google Pay. Secured by Stripe." : "Card, Apple Pay and Google Pay will be available here.")}</p>
              </div>
            )}
            <p className={styles.legal}>
              By paying you agree to the <Link href="/legal/terms">Terms of Service</Link> and <Link href="/legal/privacy">Privacy Policy</Link>, and to your details being shared with the laboratory and collection team to carry out your test. You need to be {MIN_AGE_YEARS} or over to order.
            </p>
            <p className={styles.afterPay}><Icon name="check" size={14} /> Your pathology request form is emailed the moment payment goes through.</p>
            <p className={styles.guarantee}><b>{guarantee.title}</b> {guarantee.body}</p>
          </section>
        </div>

        {summary}

        {!payment ? (
          <div className={styles.bar} data-theme="light">
            <div className={styles.barInner}>
              <span className={styles.barText}>
                <span className={styles.barLabel}>Total</span>
                <span className={cx(styles.barPrice, "num")}>{total}</span>
              </span>
              <a className={cx(styles.payButton, styles.barButton)} data-ready={errorCount === 0 ? "true" : "false"} href="#pay-form">Pay</a>
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}
