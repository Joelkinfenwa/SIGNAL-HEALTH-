"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { PaymentPanel } from "@/components/checkout/PaymentPanel";
import { Icon } from "@/components/ui/Icon";
import { addonNewMarkers, sellableAddonsFor } from "@/config/addons";
import { getBiomarker } from "@/config/biomarkers";
import { MIN_AGE_YEARS } from "@/config/checkout-fields";
import { collectionMethods, type CollectionMethodId } from "@/config/collection";
import { signalTest } from "@/config/products";
import { retestOffers, formatDiscount, type RetestOffer } from "@/config/retest-offer";
import { quoteRetestForOrder } from "@/lib/retest/offer";
import { visibleTrustClaims } from "@/config/trust";
import { track } from "@/lib/analytics/track";
import { startPayment } from "@/lib/checkout/create-order";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { defaultConfiguration, displayTotal, parseConfiguration, quoteConfiguration, serializeConfiguration, toggleAddon, type Configuration } from "@/lib/pricing";
import styles from "./Checkout.module.css";

const EMAIL_KEY = "sig_checkout_email";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/**
 * Pay-first checkout, one screen: what you're buying (summary, add-ons,
 * collection), then an email address and the card form. Nothing else before
 * payment. The laboratory details (name, date of birth, sex, address) are
 * collected on the order page straight after payment, because the request
 * form is issued then, not before.
 *
 * The email persists in sessionStorage only (tab-scoped). It never enters an
 * analytics event.
 */
export function Checkout() {
  const [cfg, setCfg] = useState<Configuration>(() => defaultConfiguration(signalTest));
  const [hydrated, setHydrated] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [emailTouched, setEmailTouched] = useState(false);
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ orderId: string; clientSecret: string; amountCents: number; token: string } | null>(null);
  const [plan, setPlan] = useState<RetestOffer | null>(null);
  const [starting, setStarting] = useState(false);
  const router = useRouter();
  const quote = useMemo(() => quoteConfiguration(cfg), [cfg]);
  const planQuote = useMemo(() => (plan && quote.pricingComplete ? quoteRetestForOrder(quote.lines, plan) : null), [plan, quote]);
  const methods = collectionMethods.filter((m) => signalTest.collectionMethodIds.includes(m.id));
  const options = sellableAddonsFor(signalTest);
  const trust = visibleTrustClaims().filter((c) => c.status === "verified").slice(0, 3);
  const paymentsLive = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);
  const emailValid = EMAIL.test(email.trim());

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseConfiguration(params, signalTest);
    setCfg(parsed);
    setPlan(retestOffers.find((o) => o.active && o.id === params.get("plan")) ?? null);
    setAddonsOpen(parsed.addonIds.length === 0);
    try { const saved = sessionStorage.getItem(EMAIL_KEY); if (saved) setEmail(saved); } catch { /* blocked storage: the field still works */ }
    setHydrated(true);
    track({ name: "checkout_started", props: { product_id: signalTest.id, addon_ids: parsed.addonIds } });
  }, []);

  useEffect(() => { if (hydrated) { try { sessionStorage.setItem(EMAIL_KEY, email); } catch { /* ignore */ } } }, [email, hydrated]);

  // Any change to what's being bought or who's paying invalidates a started payment.
  useEffect(() => { setPayment(null); }, [cfg, email]);

  useEffect(() => {
    if (!hydrated) return;
    const base = serializeConfiguration(cfg);
    window.history.replaceState(window.history.state, "", `${window.location.pathname}${base}${plan ? `${base ? "&" : "?"}plan=${plan.id}` : ""}`);
  }, [cfg, plan, hydrated]);

  function toggle(id: string) {
    const has = cfg.addonIds.includes(id);
    track({ name: has ? "addon_removed" : "addon_selected", props: { addon_id: id } });
    setCfg(toggleAddon(cfg, id));
  }
  function chooseCollection(id: CollectionMethodId) {
    setCfg({ ...cfg, collectionMethodId: id });
    track({ name: "collection_method_selected", props: { product_id: signalTest.id, method: id } });
  }

  async function attemptPay() {
    if (payment) return;
    setEmailTouched(true);
    if (!cfg.collectionMethodId) { setPayMessage("Choose a collection option first."); document.getElementById("collection-title")?.scrollIntoView({ behavior: "smooth", block: "center" }); return; }
    if (!emailValid) { setPayMessage("Enter a valid email address so we can send your confirmation and request form."); document.getElementById("pay-email")?.focus(); return; }
    if (!paymentsLive) { setPayMessage("Payments open at launch."); return; }
    if (!quote.pricingComplete) { setPayMessage(quote.unpricedCount ? "An add-on in your order isn't priced yet, so payment can't start." : "Pricing isn't set yet, so payment can't start."); return; }
    setStarting(true); setPayMessage(null);
    try {
      const res = await startPayment(cfg, email.trim());
      if (res.status === "ready") {
        setPayment({ orderId: res.orderId, clientSecret: res.clientSecret, amountCents: res.amountCents, token: res.token });
        track({ name: "payment_step_viewed", props: { product_id: signalTest.id, addon_ids: cfg.addonIds } });
        requestAnimationFrame(() => document.getElementById("pay-form")?.scrollIntoView({ behavior: "smooth", block: "start" }));
      } else if (res.status === "invalid") {
        setPayMessage(Object.values(res.errors)[0] ?? "Check your details.");
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
      { name: "purchase_completed", props: { order_id: paymentIntentId, product_id: signalTest.id, addon_ids: cfg.addonIds, value: payment.amountCents / 100, currency: "AUD" } },
      { eventId: paymentIntentId },
    );
    try { sessionStorage.removeItem(EMAIL_KEY); } catch { /* ignore */ }
    router.push(`/order/${paymentIntentId}?t=${encodeURIComponent(payment.token)}${plan ? `&plan=${plan.id}` : ""}`);
  }

  const canPay = paymentsLive && quote.pricingComplete && Boolean(cfg.collectionMethodId) && emailValid;
  const total = displayTotal(quote, formatAUD, "Pricing coming soon");

  const payBlock = (
    <section id="pay-form" className={cx(styles.block, styles.payBlock)} aria-labelledby="pay-block-title">
      <h2 id="pay-block-title" className={styles.blockTitle}><span className={styles.n}>3</span> Pay {quote.pricingComplete ? <span className="num">{total}</span> : null}</h2>
      <div className={styles.emailRow}>
        <label htmlFor="pay-email" className={styles.label}>Email</label>
        <input
          id="pay-email" type="email" inputMode="email" autoComplete="email" autoCapitalize="none" spellCheck={false}
          className={cx(styles.input, emailTouched && !emailValid && styles.inputError)}
          value={email} onChange={(e) => { setEmail(e.target.value); setPayMessage(null); }} onBlur={() => setEmailTouched(true)}
          aria-invalid={emailTouched && !emailValid ? true : undefined} aria-describedby="pay-email-help" placeholder="you@example.com" disabled={Boolean(payment)}
        />
        <p id="pay-email-help" className={styles.help}>Your receipt, confirmation and pathology request form go here.</p>
      </div>
      {payment ? (
        <PaymentPanel
          key={payment.clientSecret}
          clientSecret={payment.clientSecret}
          amountCents={payment.amountCents}
          billing={{ email: email.trim() }}
          returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/order/${payment.orderId}?t=${encodeURIComponent(payment.token)}${plan ? `&plan=${plan.id}` : ""}`}
          onSuccess={onPaid}
        />
      ) : (
        <div className={styles.primaryRow} style={{ display: "grid" }}>
          <button type="button" className={styles.payButton} data-ready={canPay ? "true" : "false"} onClick={attemptPay} disabled={starting}>
            {starting ? "Starting payment…" : paymentsLive ? "Continue to payment" : "Payments open at launch"} <Icon name="arrow" size={18} />
          </button>
          <p className={styles.payNote} aria-live="polite">{payMessage ?? (paymentsLive ? "Card, Apple Pay or Google Pay. Secured by Stripe." : "Card, Apple Pay and Google Pay will be available here.")}</p>
        </div>
      )}
      <p className={styles.legal}>
        By paying you agree to the <Link href="/legal/terms">Terms of Service</Link> and <Link href="/legal/privacy">Privacy Policy</Link>, and to your details being shared with the laboratory and collection team to carry out your test. You need to be {MIN_AGE_YEARS} or over to order.
      </p>
      <p className={styles.afterPay}><Icon name="check" size={14} /> After payment we ask for the details the laboratory needs (name, date of birth, sex, address), then email your request form.</p>
    </section>
  );

  const summary = (
    <aside className={styles.pay} aria-labelledby="pay-title">
      <p id="pay-title" className={styles.payTitle}>Order total</p>
      <ul className={styles.payLines}>
        {quote.lines.map((l) => (
          <li key={l.id}><span>{l.label}</span><span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span></li>
        ))}
      </ul>
      <div className={styles.total}><span>Total</span><span className={cx(styles.totalValue, "num")}>{total}</span></div>
      <div className={styles.payAction}>
        <a className={styles.payButton} data-ready={cfg.collectionMethodId ? "true" : "false"} href="#pay-form">Pay now <Icon name="arrow" size={18} /></a>
        <p className={styles.payNote}>Email, then card. Two minutes.</p>
      </div>
      {trust.length ? (
        <ul className={styles.trust}>
          {trust.map((c) => <li key={c.id}><Icon name={c.icon} size={14} /> {c.text}</li>)}
        </ul>
      ) : null}
      <p className={styles.fine}>Your confirmation and pathology request form are emailed once your details are in. Prices in AUD.</p>
    </aside>
  );

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        <h1 className={styles.title}>Your SIGNAL Test.</h1>
        <p className={styles.intro}>Check what&apos;s included, choose how you&apos;d like to be collected, and pay. The laboratory details come after.</p>
      </header>

      <div className={styles.main}>
        <section className={styles.block} aria-labelledby="summary-title">
          <h2 id="summary-title" className={styles.blockTitle}><span className={styles.n}>1</span> What&apos;s in your test</h2>
          <ul className={styles.lines}>
            {quote.lines.filter((l) => l.kind !== "collection").map((l) => (
              <li key={l.id} className={styles.line}>
                <span className={styles.lineText}>
                  <span className={styles.lineLabel}>{l.label}</span>
                  {l.kind === "product" ? <span className={styles.lineSub}><span className="num">{quote.markerCount}</span> markers across the major areas of health, every one explained</span> : null}
                </span>
                <span className={styles.lineRight}>
                  <span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span>
                  {l.kind === "addon" ? <button type="button" className={styles.remove} onClick={() => toggle(l.id)}>Remove</button> : null}
                </span>
              </li>
            ))}
          </ul>
          <details className={styles.addons} open={addonsOpen} onToggle={(e) => setAddonsOpen((e.currentTarget as HTMLDetailsElement).open)}>
            <summary className={styles.addonsSummary}>
              <span>{cfg.addonIds.length ? "Add more depth" : "Go deeper where it matters to you"} <span className={styles.optional}>optional</span></span>
              <span className={styles.toggle} aria-hidden="true"><Icon name="plus" size={16} className={styles.plus} /><Icon name="minus" size={16} className={styles.minus} /></span>
            </summary>
            <ul className={styles.addonList}>
              {options.map((a) => {
                const on = cfg.addonIds.includes(a.id);
                return (
                  <li key={a.id} className={cx(styles.addonRow, on && styles.addonRowOn)}>
                    <span className={styles.addonText}>
                      <span className={styles.addonName}>{a.name} <span className={styles.addonPrice}>{a.priceCents !== null ? `+${formatAUD(a.priceCents)}` : "Price TBC"}</span></span>
                      <span className={styles.addonFor}>{a.shortDescription}</span>
                      <span className={styles.addonMarkers}><span className="num">+{addonNewMarkers(a, signalTest).length}</span> · {addonNewMarkers(a, signalTest).map((id) => getBiomarker(id).short ?? getBiomarker(id).name).join(" · ")}</span>
                    </span>
                    <button type="button" className={cx(styles.addBtn, on && styles.addBtnOn)} aria-pressed={on} onClick={() => toggle(a.id)}>
                      {on ? <><Icon name="check" size={16} /> Added</> : <><Icon name="plus" size={16} /> Add</>}
                    </button>
                  </li>
                );
              })}
            </ul>
          </details>
          {plan ? (
            <div className={styles.plan}>
              <p className={styles.planTitle}><Icon name="refresh" size={16} /> Automatic Retesting · {plan.cadence.toLowerCase()}</p>
              <p className={styles.planBody}>
                Pay for today&apos;s test now. Straight after payment you confirm the plan and we refund {formatDiscount(plan.discountBps)}{planQuote ? ` (${formatAUD(planQuote.refundTodayCents)})` : ""} of today&apos;s order to your card, then every retest is {formatDiscount(plan.discountBps)} off. Recurring billing, cancel any time.
              </p>
              <button type="button" className={styles.remove} onClick={() => setPlan(null)}>Remove plan</button>
            </div>
          ) : null}
        </section>

        <section className={styles.block} aria-labelledby="collection-title">
          <h2 id="collection-title" className={styles.blockTitle}><span className={styles.n}>2</span> How would you like to be collected?</h2>
          <div className={styles.methods} role="radiogroup" aria-labelledby="collection-title">
            {methods.map((m) => {
              const on = cfg.collectionMethodId === m.id;
              return (
                <button key={m.id} type="button" role="radio" aria-checked={on} className={cx(styles.method, on && styles.methodOn)} onClick={() => chooseCollection(m.id)}>
                  <span className={styles.radio} aria-hidden="true" />
                  <span className={styles.methodText}>
                    <span className={styles.methodName}>{m.name}</span>
                    <span className={styles.methodBody}>{m.description} {m.availabilityNote}</span>
                  </span>
                  <span className={styles.methodPrice}>{m.priceDeltaCents === null ? "Price TBC" : m.priceDeltaCents === 0 ? "Included" : `+${formatAUD(m.priceDeltaCents)}`}</span>
                </button>
              );
            })}
          </div>
        </section>

        {payBlock}
      </div>

      {summary}

      {!payment ? (
        <div className={styles.bar} data-theme="light">
          <div className={styles.barInner}>
            <span className={styles.barText}>
              <span className={styles.barLabel}>Total</span>
              <span className={cx(styles.barPrice, "num")}>{total}</span>
            </span>
            <a className={cx(styles.payButton, styles.barButton)} data-ready={cfg.collectionMethodId ? "true" : "false"} href="#pay-form">Pay now</a>
          </div>
        </div>
      ) : null}
    </div>
  );
}
