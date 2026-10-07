"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CustomerDetails } from "@/components/checkout/CustomerDetails";
import { PaymentPanel } from "@/components/checkout/PaymentPanel";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { addonNewMarkers, sellableAddonsFor } from "@/config/addons";
import { detailsCopy } from "@/config/checkout-fields";
import { getBiomarker } from "@/config/biomarkers";
import { collectionMethods, type CollectionMethodId } from "@/config/collection";
import { signalTest } from "@/config/products";
import { retestOffers, formatDiscount, type RetestOffer } from "@/config/retest-offer";
import { quoteRetestForOrder } from "@/lib/retest/offer";
import { visibleTrustClaims } from "@/config/trust";
import { track } from "@/lib/analytics/track";
import { createOrder } from "@/lib/checkout/create-order";
import { emptyCustomer, validateCustomer, type CustomerDetails as Details, type CustomerField } from "@/lib/checkout/customer";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import { defaultConfiguration, displayTotal, parseConfiguration, quoteConfiguration, serializeConfiguration, toggleAddon, type Configuration } from "@/lib/pricing";
import styles from "./Checkout.module.css";

const DETAILS_KEY = "sig_checkout_details";

/**
 * Checkout in three screens: your test (summary, add-ons, collection), your
 * details, then payment. Each screen is its own history entry so Back works. Payment is a Stripe boundary
 * (lib/checkout/create-order); until it is connected the pay button says so
 * honestly instead of pretending.
 *
 * Details persist in sessionStorage only (tab-scoped, cleared on close) so a
 * reload or a trip back to /signal doesn't lose them. They never enter an
 * analytics event.
 */
export function Checkout() {
  const [cfg, setCfg] = useState<Configuration>(() => defaultConfiguration(signalTest));
  const [hydrated, setHydrated] = useState(false);
  const [addonsOpen, setAddonsOpen] = useState(false);
  const [customer, setCustomer] = useState<Details>(emptyCustomer);
  const [touched, setTouched] = useState<Partial<Record<CustomerField, boolean>>>({});
  const [payMessage, setPayMessage] = useState<string | null>(null);
  const [payment, setPayment] = useState<{ orderId: string; clientSecret: string; amountCents: number; token: string } | null>(null);
  /** Retesting plan chosen before checkout (funnel "Track" cards); confirmed with consent after payment. */
  const [plan, setPlan] = useState<RetestOffer | null>(null);
  const [starting, setStarting] = useState(false);
  /** Three screens: what you're buying, who you are, then payment (payment = an order exists). */
  const [step, setStep] = useState<"order" | "details">("order");
  const [stepMessage, setStepMessage] = useState<string | null>(null);
  const detailsRef = useRef<HTMLElement>(null);
  const detailsDone = useRef(false);
  const router = useRouter();
  const quote = useMemo(() => quoteConfiguration(cfg), [cfg]);
  const planQuote = useMemo(() => (plan && quote.pricingComplete ? quoteRetestForOrder(quote.lines, plan) : null), [plan, quote]);
  const methods = collectionMethods.filter((m) => signalTest.collectionMethodIds.includes(m.id));
  const options = sellableAddonsFor(signalTest);
  const trust = visibleTrustClaims().filter((c) => c.status === "verified").slice(0, 3);
  const paymentsLive = Boolean(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const parsed = parseConfiguration(params, signalTest);
    setCfg(parsed);
    setPlan(retestOffers.find((o) => o.active && o.id === params.get("plan")) ?? null);
    setAddonsOpen(parsed.addonIds.length === 0);
    try {
      const saved = sessionStorage.getItem(DETAILS_KEY);
      if (saved) setCustomer({ ...emptyCustomer(), ...(JSON.parse(saved) as Partial<Details>) });
    } catch { /* private mode or blocked storage: the form still works */ }
    const restored = (window.history.state as { step?: string } | null)?.step;
    if (restored === "details" || restored === "pay") setStep("details");
    setHydrated(true);
    track({ name: "checkout_started", props: { product_id: signalTest.id, addon_ids: parsed.addonIds } });
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try { sessionStorage.setItem(DETAILS_KEY, JSON.stringify(customer)); } catch { /* ignore */ }
  }, [customer, hydrated]);

  // Any change to what's being bought or who's buying invalidates a started payment.
  useEffect(() => { setPayment(null); }, [cfg, customer]);

  // Each screen is a history entry, so the browser's Back button (and our own) walks back
  // through payment → details → order without losing anything typed.
  useEffect(() => {
    const onPop = (e: PopStateEvent) => {
      const s = (e.state as { step?: string } | null)?.step;
      if (s !== "pay") setPayment(null);
      setStep(s === "details" || s === "pay" ? "details" : "order");
      window.scrollTo({ top: 0 });
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);
  const go = (next: "order" | "details") => {
    window.history.pushState({ step: next }, "");
    setStep(next); setStepMessage(null); setPayMessage(null);
    window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
  };
  function leavePayment() {
    if (window.history.state?.step === "pay") window.history.back(); else setPayment(null);
  }
  function goBack() {
    if (window.history.state?.step === "details") window.history.back(); else { setStep("order"); window.scrollTo({ top: 0 }); }
  }
  function goDetails() {
    if (!cfg.collectionMethodId) { setStepMessage("Choose a collection option to continue."); return; }
    go("details");
  }

  // Always: the laboratory prints the address on the request form as an identifier, whichever way the sample is collected.
  const requiresAddress = true;
  const errors = useMemo(() => validateCustomer(customer, { requiresAddress }, detailsCopy.errors), [customer, requiresAddress]);
  const errorCount = Object.keys(errors).length;
  const detailsValid = errorCount === 0;

  useEffect(() => {
    if (detailsValid && hydrated && !detailsDone.current) {
      detailsDone.current = true;
      track({ name: "checkout_details_completed", props: { product_id: signalTest.id } });
    }
  }, [detailsValid, hydrated]);

  const ALL_FIELDS = Object.keys(emptyCustomer()) as CustomerField[];
  async function attemptPay() {
    if (payment) return;
    if (!cfg.collectionMethodId) { setPayMessage("Choose a collection option first."); return; }
    if (!detailsValid) {
      setTouched(Object.fromEntries(ALL_FIELDS.map((f) => [f, true])));
      setPayMessage(detailsCopy.summaryError(errorCount));
      track({ name: "checkout_details_invalid", props: { field_count: errorCount } });
      requestAnimationFrame(() => {
        const first = detailsRef.current?.querySelector<HTMLElement>("[aria-invalid='true'], [role='alert']");
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        (detailsRef.current?.querySelector<HTMLElement>("[aria-invalid='true']") ?? first)?.focus?.();
      });
      return;
    }
    if (!paymentsLive) { setPayMessage("Your details are complete. Payments open at launch."); return; }
    if (!quote.pricingComplete) { setPayMessage(quote.unpricedCount ? "An add-on in your order isn't priced yet, so payment can't start." : "Pricing isn't set yet, so payment can't start."); return; }
    setStarting(true); setPayMessage(null);
    try {
      const res = await createOrder(cfg, customer);
      if (res.status === "ready") {
        setPayment({ orderId: res.orderId, clientSecret: res.clientSecret, amountCents: res.amountCents, token: res.token });
        window.history.pushState({ step: "pay" }, "");
        window.scrollTo({ top: 0, behavior: "instant" as ScrollBehavior });
        track({ name: "payment_step_viewed", props: { product_id: signalTest.id, addon_ids: cfg.addonIds } });
      } else if (res.status === "invalid") {
        setTouched(Object.fromEntries(ALL_FIELDS.map((f) => [f, true])));
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
    try { sessionStorage.removeItem(DETAILS_KEY); } catch { /* ignore */ }
    router.push(`/order/${paymentIntentId}?t=${encodeURIComponent(payment.token)}${plan ? `&plan=${plan.id}` : ""}`);
  }

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

  const canPay = paymentsLive && quote.pricingComplete && Boolean(cfg.collectionMethodId) && detailsValid;
  const collection = cfg.collectionMethodId ? collectionMethods.find((m) => m.id === cfg.collectionMethodId) : undefined;

  if (payment) {
    return (
      <div className={styles.payStep}>
        <header className={styles.header}>
          <button type="button" className={styles.back} onClick={leavePayment}><Icon name="arrow" size={16} className={styles.backIcon} /> Back to your details</button>
          <h1 className={styles.title}>Pay <span className="num">{formatAUD(payment.amountCents)}</span></h1>
          <p className={styles.intro}>Card, Apple Pay or Google Pay. Secured by Stripe.</p>
        </header>
        <div className={styles.payGrid}>
          <section className={styles.payCard} aria-label="Payment">
            <PaymentPanel
              key={payment.clientSecret}
              clientSecret={payment.clientSecret}
              amountCents={payment.amountCents}
              billing={{ name: `${customer.firstName.trim()} ${customer.lastName.trim()}`, email: customer.email.trim(), phone: customer.phone.trim() }}
              returnUrl={`${typeof window !== "undefined" ? window.location.origin : ""}/order/${payment.orderId}?t=${encodeURIComponent(payment.token)}${plan ? `&plan=${plan.id}` : ""}`}
              onSuccess={onPaid}
            />
          </section>
          <aside className={styles.paySummary} aria-labelledby="pay-summary-title">
            <p id="pay-summary-title" className={styles.payTitle}>Your order</p>
            <ul className={styles.payLines}>
              {quote.lines.map((l) => (
                <li key={l.id}><span>{l.label}</span><span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span></li>
              ))}
            </ul>
            <div className={styles.total}><span>Total</span><span className={cx(styles.totalValue, "num")}>{formatAUD(payment.amountCents)}</span></div>
            <dl className={styles.payWho}>
              <div><dt>Name</dt><dd>{customer.firstName.trim()} {customer.lastName.trim()}</dd></div>
              <div><dt>Email</dt><dd>{customer.email.trim()}</dd></div>
              <div><dt>Collection</dt><dd>{collection?.name ?? "-"}</dd></div>
            </dl>
            <button type="button" className={styles.remove} onClick={leavePayment}>Edit order or details</button>
            {trust.length ? (
              <ul className={styles.trust}>
                {trust.map((c) => <li key={c.id}><Icon name={c.icon} size={14} /> {c.text}</li>)}
              </ul>
            ) : null}
            <p className={styles.fine}>Your confirmation and pathology request form are emailed straight after payment. Prices in AUD.</p>
          </aside>
        </div>
      </div>
    );
  }

  const stepper = (
    <ol className={styles.stepper} aria-label="Checkout steps">
      {[["Your test", "order"], ["Your details", "details"], ["Payment", "pay"]].map(([label, id], i) => {
        const state = id === step ? "current" : (step === "details" && id === "order") ? "done" : "next";
        return <li key={id} className={cx(styles.stepperItem, state === "current" && styles.stepperCurrent, state === "done" && styles.stepperDone)} aria-current={state === "current" ? "step" : undefined}><span className={styles.stepperNum}>{state === "done" ? <Icon name="check" size={12} /> : i + 1}</span><span className={styles.stepperLabel}>{label}</span></li>;
      })}
    </ol>
  );

  const summary = (
    <aside className={styles.pay} aria-labelledby="pay-title">
      <p id="pay-title" className={styles.payTitle}>Order total</p>
      <ul className={styles.payLines}>
        {quote.lines.map((l) => (
          <li key={l.id}><span>{l.label}</span><span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span></li>
        ))}
      </ul>
      <div className={styles.total}><span>Total</span><span className={cx(styles.totalValue, "num")}>{displayTotal(quote, formatAUD, "Pricing coming soon")}</span></div>
      <div className={styles.payAction}>
        {step === "order" ? (
          <>
            <button type="button" className={styles.payButton} data-ready={cfg.collectionMethodId ? "true" : "false"} onClick={goDetails}>Continue <Icon name="arrow" size={18} /></button>
            <p className={styles.payNote} aria-live="polite">{stepMessage ?? "Next: your details. Then payment."}</p>
          </>
        ) : (
          <>
            <button type="button" className={styles.payButton} data-ready={canPay ? "true" : "false"} onClick={attemptPay} disabled={starting}>
              {starting ? "Starting payment…" : paymentsLive ? "Continue to payment" : "Payments open at launch"} <Icon name="arrow" size={18} />
            </button>
            <p className={styles.payNote} aria-live="polite">{payMessage ?? (paymentsLive ? "Card, Apple Pay and Google Pay on the next screen. Secured by Stripe." : "Card, Apple Pay and Google Pay will be available here.")}</p>
          </>
        )}
      </div>
      {trust.length ? (
        <ul className={styles.trust}>
          {trust.map((c) => <li key={c.id}><Icon name={c.icon} size={14} /> {c.text}</li>)}
        </ul>
      ) : null}
      <p className={styles.fine}>Your confirmation and pathology request form are emailed straight after payment. Prices in AUD.</p>
    </aside>
  );

  return (
    <div className={styles.wrap}>
      <header className={styles.header}>
        {stepper}
        {step === "order" ? (
          <>
            <h1 className={styles.title}>Your SIGNAL Test.</h1>
            <p className={styles.intro}>Check what&apos;s included, add depth if you want it, and choose how you&apos;d like to be collected.</p>
          </>
        ) : (
          <>
            <button type="button" className={styles.back} onClick={goBack}><Icon name="arrow" size={16} className={styles.backIcon} /> Your test</button>
            <h1 className={styles.title}>{detailsCopy.title}</h1>
            <p className={styles.intro}>{detailsCopy.intro}</p>
          </>
        )}
      </header>

      <div className={styles.main}>
        {step === "order" ? (
          <>
            <section className={styles.block} aria-labelledby="summary-title">
              <h2 id="summary-title" className={styles.blockTitle}>What&apos;s in your test</h2>
              <ul className={styles.lines}>
                {quote.lines.filter((l) => l.kind !== "collection").map((l) => (
                  <li key={l.id} className={styles.line}>
                    <span className={styles.lineText}>
                      <span className={styles.lineLabel}>{l.label}</span>
                      {l.kind === "product" ? <span className={styles.lineSub}><span className="num">{quote.categoryCount}</span> areas of health · <span className="num">{quote.markerCount}</span> markers, every one explained</span> : null}
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
                <p className={styles.hint}>Not sure? <Link href="/find-my-signal">Answer four quick questions</Link> and we&apos;ll suggest the add-ons that fit.</p>
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
              <h2 id="collection-title" className={styles.blockTitle}>How would you like to be collected?</h2>
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
              <div className={styles.primaryRow}>
                <button type="button" className={styles.payButton} data-ready={cfg.collectionMethodId ? "true" : "false"} onClick={goDetails}>Continue <Icon name="arrow" size={18} /></button>
                <p className={styles.payNote} aria-live="polite">{stepMessage ?? "Next: your details. Then payment."}</p>
              </div>
            </section>
          </>
        ) : (
          <section ref={detailsRef} className={styles.block} aria-labelledby="details-title">
            <h2 id="details-title" className={styles.srOnly}>{detailsCopy.title}</h2>
            <CustomerDetails
              value={customer}
              errors={errors}
              touched={touched}
              requiresAddress={requiresAddress}
              onChange={(patch) => { setCustomer((c) => ({ ...c, ...patch })); setPayMessage(null); }}
              onBlur={(f) => setTouched((t) => (t[f] ? t : { ...t, [f]: true }))}
            />
            <div className={styles.primaryRow}>
              <button type="button" className={styles.payButton} data-ready={canPay ? "true" : "false"} onClick={attemptPay} disabled={starting}>
                {starting ? "Starting payment…" : paymentsLive ? "Continue to payment" : "Payments open at launch"} <Icon name="arrow" size={18} />
              </button>
              <p className={styles.payNote} aria-live="polite">{payMessage ?? (paymentsLive ? "Card, Apple Pay and Google Pay on the next screen. Secured by Stripe." : "Payments open at launch.")}</p>
            </div>
          </section>
        )}
      </div>

      {summary}

      <div className={styles.bar} data-theme="light">
        <div className={styles.barInner}>
          <span className={styles.barText}>
            <span className={styles.barLabel}>Total</span>
            <span className={cx(styles.barPrice, "num")}>{displayTotal(quote, formatAUD, "Pricing coming soon")}</span>
          </span>
          {step === "order"
            ? <button type="button" className={cx(styles.payButton, styles.barButton)} data-ready={cfg.collectionMethodId ? "true" : "false"} onClick={goDetails}>Continue</button>
            : <button type="button" className={cx(styles.payButton, styles.barButton)} data-ready={canPay ? "true" : "false"} onClick={attemptPay} disabled={starting}>{paymentsLive ? "Continue to payment" : "Opens at launch"}</button>}
        </div>
      </div>
    </div>
  );
}
