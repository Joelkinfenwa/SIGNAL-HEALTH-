"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { activeRetestOffers, formatDiscount, postPurchaseOffer as cfg, type RetestOffer as Offer } from "@/config/retest-offer";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import { formatAUD } from "@/lib/money";
import type { QuoteLine } from "@/lib/pricing";
import { acceptRetestOffer, declineRetestOffer } from "@/lib/retest/accept";
import { addMonths, fillOfferTokens, formatDeadline, formatInterval, offerDeadline, quoteRetestForOrder } from "@/lib/retest/offer";
import styles from "./RetestOffer.module.css";

interface OrderLite { id: string; token: string; lines: QuoteLine[]; amountCents: number; paidAt: string }
interface Enrolled { offerId: string; nextTestDate: string; refundCents: number }

/**
 * The post-purchase Automatic Retesting offer. The hook: choose a plan and
 * the plan's discount on today's order is refunded to the card immediately;
 * every future retest is charged at the discounted price.
 *
 * The disclosure sits beside the button, not behind a link, and consent is
 * an explicit unticked checkbox. Amounts come from quoteRetestForOrder(),
 * the same function the server uses, so what is shown is what is refunded.
 */
export function RetestOffer({ order, enrolled, preselectOfferId }: { order: OrderLite; enrolled?: Enrolled; preselectOfferId?: string }) {
  const offers = activeRetestOffers();
  const featured = offers.find((o) => o.featured) ?? offers[0]!;
  const initial = [enrolled?.offerId, preselectOfferId].find((id) => id && offers.some((o) => o.id === id)) ?? featured.id;
  const [selectedId, setSelectedId] = useState(initial);
  const [consent, setConsent] = useState(false);
  const [consentTouched, setConsentTouched] = useState(false);
  const deadline = useMemo(() => offerDeadline(new Date(order.paidAt), cfg.windowHours), [order.paidAt]);
  const expiredOnLoad = !enrolled && Date.now() > deadline.getTime();
  const [state, setState] = useState<"idle" | "submitting" | "accepted" | "declined" | "not_configured" | "expired">(enrolled ? "accepted" : expiredOnLoad ? "expired" : "idle");
  const [message, setMessage] = useState<string | null>(null);
  const [result, setResult] = useState<{ nextTestDate: Date; refundCents: number; refundPending: boolean } | null>(enrolled ? { nextTestDate: new Date(enrolled.nextTestDate), refundCents: enrolled.refundCents, refundPending: false } : null);
  const paidAt = useMemo(() => new Date(order.paidAt), [order.paidAt]);

  const quotes = useMemo(() => Object.fromEntries(offers.map((o) => [o.id, quoteRetestForOrder(order.lines, o)])), [offers, order.lines]);
  const selected = offers.find((o) => o.id === selectedId) ?? featured;
  const q = quotes[selected.id]!;
  const tokensFor = (o: Offer) => {
    const qq = quotes[o.id]!;
    return { refund: qq.refundTodayCents, paid: order.amountCents, price: qq.recurringPriceCents, intervalMonths: o.intervalMonths, discountBps: o.discountBps, nextDate: addMonths(paidAt, o.intervalMonths), reminderDays: cfg.reminderDaysBefore };
  };
  const t = tokensFor(selected);
  const fill = (s: string) => fillOfferTokens(s, t);
  const evProps = (o: Offer) => ({ order_id: order.id, offer_id: o.id, offer_version: o.version });

  useEffect(() => { if (!enrolled && !expiredOnLoad) track({ name: "retest_offer_viewed", props: evProps(featured) }); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function choose(o: Offer) {
    setSelectedId(o.id);
    track({ name: "retest_plan_selected", props: evProps(o) });
  }

  async function accept() {
    setConsentTouched(true);
    if (!consent) { setMessage("Tick the box to confirm you understand the recurring billing."); return; }
    setState("submitting"); setMessage(null);
    let res;
    try {
      res = await acceptRetestOffer({ orderId: order.id, token: order.token, offerId: selected.id, offerVersion: selected.version, consentTextVersion: cfg.consentTextVersion, consentAccepted: consent });
    } catch {
      setState("idle"); setMessage("Something went wrong setting that up. Nothing was charged or refunded. Please try again."); return;
    }
    if (res.status === "accepted") {
      setResult({ nextTestDate: new Date(res.nextTestDate), refundCents: res.refundCents, refundPending: res.refundPending });
      setState("accepted");
      track({ name: "retest_offer_accepted", props: { ...evProps(selected), value: res.recurringCents / 100, currency: "AUD" } }, { eventId: `${order.id}:retest` });
    } else if (res.status === "already_enrolled") { setResult({ nextTestDate: new Date(res.nextTestDate), refundCents: q.refundTodayCents, refundPending: false }); setState("accepted"); }
    else if (res.status === "not_configured") { setState("not_configured"); setMessage(res.reason); }
    else if (res.status === "expired") { setState("expired"); }
    else { setState("idle"); setMessage(res.reason); }
  }

  async function decline() {
    setState("declined");
    track({ name: "retest_offer_declined", props: evProps(selected) });
    try { await declineRetestOffer({ orderId: order.id, token: order.token, offerId: selected.id, offerVersion: selected.version }); } catch { /* best effort */ }
  }

  if (state === "accepted" || state === "not_configured") {
    const done = result ? { ...t, refund: result.refundCents, nextDate: result.nextTestDate } : t;
    const fillDone = (s: string) => fillOfferTokens(s, done);
    return (
      <section className={cx(styles.wrap, styles.done)} aria-live="polite" data-theme="dark">
        <span className={styles.doneTick} aria-hidden="true"><Icon name="check" size={20} /></span>
        <h2 className={styles.doneTitle}>{state === "accepted" ? (result?.refundPending ? "Done. Your retesting is set up and your refund is processing." : fillDone(cfg.accepted.headline)) : "Almost. Retesting enrolment isn't connected yet."}</h2>
        <p className={styles.doneBody}>{state === "accepted" ? fillDone(cfg.accepted.body) : `${message} On launch this refunds ${formatAUD(q.refundTodayCents)} immediately and books your next SIGNAL for around ${fill("{date}")} at ${formatAUD(q.recurringPriceCents)}.`}</p>
        {state === "accepted" ? <p className={styles.doneFine}>{result?.refundPending ? "The refund didn't go through on the first attempt. It will be completed automatically, and we'll email you when it's done." : cfg.refundTiming}</p> : null}
      </section>
    );
  }

  if (state === "declined" || state === "expired") {
    const copy = state === "declined" ? cfg.declined : cfg.expired;
    return (
      <section className={cx(styles.wrap, styles.quiet)} aria-live="polite">
        <h2 className={styles.quietTitle}>{copy.headline}</h2>
        <p className={styles.quietBody}>{copy.body.replace("{hours}", String(cfg.windowHours))}</p>
      </section>
    );
  }

  return (
    <section className={styles.wrap} aria-labelledby="offer-title">
      <p className={styles.eyebrow}><Icon name="sparkle" size={14} /> {cfg.eyebrow.replace("{deadline}", formatDeadline(deadline))}</p>
      <h2 id="offer-title" className={styles.title}>{fill(cfg.headline)}</h2>
      <p className={styles.body}>{fill(cfg.body)}</p>

      <ul className={styles.plans} role="radiogroup" aria-label="Choose a retesting rhythm">
        {offers.map((o) => {
          const on = o.id === selected.id;
          const qq = quotes[o.id]!;
          const tt = tokensFor(o);
          return (
            <li key={o.id}>
              <button type="button" role="radio" aria-checked={on} className={cx(styles.plan, on && styles.planOn)} onClick={() => choose(o)}>
                <span className={styles.planHead}>
                  <span className={styles.radio} aria-hidden="true" />
                  <span className={styles.planName}>{o.name}</span>
                  {o.featured ? <span className={styles.badge}>Biggest refund</span> : null}
                </span>
                <span className={styles.planRefund}>
                  <span className={styles.planRefundLabel}>{cfg.planRefundLabel}</span>
                  <span className={cx(styles.planRefundValue, "num")}>{formatAUD(qq.refundTodayCents)}</span>
                  <span className={styles.planDiscount}>{formatDiscount(o.discountBps)} off, this test and every retest</span>
                </span>
                <span className={styles.planThen}>{fillOfferTokens(cfg.planThenLabel, tt)}</span>
                <ul className={styles.perks}>
                  <li><Icon name="check" size={14} /> Booked for you every {formatInterval(o.intervalMonths)}</li>
                  {o.perks.map((p) => <li key={p}><Icon name="check" size={14} /> {p}</li>)}
                </ul>
              </button>
            </li>
          );
        })}
      </ul>

      <div className={styles.disclosure}>
        <p className={styles.disclosureTitle}>{cfg.disclosureTitle}</p>
        <ul>
          {cfg.disclosure.map((line) => <li key={line}>{fill(line)}</li>)}
          <li>{cfg.cancellationLine[cfg.cancellationPolicy]}</li>
          <li>{cfg.refundTiming}</li>
        </ul>
      </div>

      <label className={cx(styles.consent, consentTouched && !consent && styles.consentError)}>
        <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); setMessage(null); }} aria-invalid={consentTouched && !consent ? true : undefined} />
        <span>{fill(cfg.consentLabel)} <Link href="/legal/retesting-terms">Read the terms</Link>.</span>
      </label>

      <div className={styles.actions}>
        <button type="button" className={styles.accept} onClick={accept} disabled={state === "submitting"}>
          {state === "submitting" ? "Setting up…" : fill(selected.copy.acceptLabel)} <Icon name="arrow" size={18} />
        </button>
        <button type="button" className={styles.decline} onClick={decline}>{selected.copy.declineLabel}</button>
      </div>
      {message ? <p className={styles.message} role="alert">{message}</p> : null}
    </section>
  );
}
