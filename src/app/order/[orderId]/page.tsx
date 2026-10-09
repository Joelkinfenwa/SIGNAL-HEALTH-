import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextSteps } from "@/components/journey/NextSteps";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { OrderDetailsStep } from "@/components/order/OrderDetailsStep";
import { RetestOffer } from "@/components/order/RetestOffer";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { bookingUrlFor, walkIn } from "@/config/booking";
import { getCollectionMethod } from "@/config/collection";
import { pathologyConfig } from "@/config/pathology";
import { getOrderForPage } from "@/lib/orders/get-order";
import { postPurchaseOffer } from "@/config/retest-offer";
import { formatAUD } from "@/lib/money";
import { formatDate } from "@/lib/retest/offer";
import styles from "./page.module.css";

export const metadata: Metadata = { title: "Order confirmed", robots: { index: false, follow: false } };

/**
 * Post-payment page: confirmation, then the one-time Automatic Retesting
 * offer (refund the discount on today's order, instantly), then next steps.
 * Access requires a signed order token (phase 6); the id alone never grants
 * access. Payment status comes from our database, never from the URL.
 */
export default async function OrderPage({ params, searchParams }: { params: Promise<{ orderId: string }>; searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const { orderId } = await params;
  const sp = await searchParams;
  const order = await getOrderForPage(orderId, sp);
  const preselectOfferId = typeof sp.plan === "string" ? sp.plan : undefined;
  if (!order) notFound();
  const collection = order.configuration.collectionMethodId ? getCollectionMethod(order.configuration.collectionMethodId) : null;

  // Pay-first checkout: the laboratory details come here, after payment, before anything else on this page.
  if (!order.detailsComplete) {
    return (
      <>
        <SiteHeader />
        <main id="main" className={styles.main}>
          <Container>
            <div className={styles.grid}>
              <div className={styles.primary}>
                <OrderDetailsStep orderId={order.id} token={order.token} email={order.email} reference={order.reference} />
              </div>
              <aside className={styles.summary} aria-labelledby="order-title">
                <p id="order-title" className={styles.summaryTitle}>Your order</p>
                <ul className={styles.lines}>
                  {order.lines.map((l) => (
                    <li key={l.id}><span>{l.label}</span><span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span></li>
                  ))}
                </ul>
                <p className={styles.total}><span>Paid</span><span className="num">{formatAUD(order.amountCents)}</span></p>
                <p className={styles.meta}>{formatDate(order.paidAt)} · {order.reference}</p>
              </aside>
            </div>
          </Container>
        </main>
        <SiteFooter />
      </>
    );
  }

  return (
    <>
      <SiteHeader />
      <main id="main" className={styles.main}>
        <Container>
          {order.demo ? <p className={styles.demo}>Preview only: illustrative order and amounts. Payments aren&apos;t connected yet.</p> : null}
          <header className={styles.header}>
            <span className={styles.tick} aria-hidden="true"><Icon name="check" size={22} /></span>
            <p className={styles.eyebrow}>{order.status === "processing" ? "Payment processing" : "Payment received"} · {order.reference}</p>
            <h1 className={styles.title}>{order.firstName ? `Thanks, ${order.firstName}.` : "Thank you."} Your SIGNAL is ordered.</h1>
            <p className={styles.intro}>
              {order.emailMasked ? <>Your confirmation and request form are on their way to {order.emailMasked}. </> : null}
              Next, take a look at this. It&apos;s open for {postPurchaseOffer.windowHours} hours.
            </p>
          </header>

          <div className={styles.grid}>
            <div className={styles.primary}>
              <RetestOffer
                order={{ id: order.id, token: order.token, lines: order.lines, amountCents: order.amountCents, paidAt: order.paidAt.toISOString() }}
                enrolled={order.retest ? { offerId: order.retest.offerId, nextTestDate: order.retest.nextTestDate.toISOString(), refundCents: order.retest.refundCents } : undefined}
                preselectOfferId={preselectOfferId}
              />

              <section className={styles.block} aria-labelledby="form-title">
                <h2 id="form-title" className={styles.blockTitle}>Your pathology request form</h2>
                <p className={styles.bookNote}>{pathologyConfig.collection.bring}{pathologyConfig.collection.fastingRequired ? ` ${pathologyConfig.collection.fastingInstruction}` : ""}</p>
                <div className={styles.bookRow}>
                  <Button href={`/api/orders/${order.id}/request-form?t=${encodeURIComponent(order.token)}${order.demo ? `&addons=${order.configuration.addonIds.join(",")}&collection=${order.configuration.collectionMethodId ?? "centre"}` : ""}`} variant="outline" ctaId="order_request_form" location="order">Download request form (PDF) <Icon name="arrow" size={18} /></Button>
                  <p className={styles.bookNote}>It&apos;s also attached to your confirmation email.</p>
                </div>
              </section>

              <section className={styles.block} aria-labelledby="next-title">
                <h2 id="next-title" className={styles.blockTitle}>What happens next</h2>
                <NextSteps bare current="book" only={["book", "collect", "results"]} />
                <div className={styles.bookRow}>
                  {bookingUrlFor(order.id) ? (
                    <Button href={bookingUrlFor(order.id)!} ctaId="order_book_collection" location="order">Book my collection <Icon name="arrow" size={18} /></Button>
                  ) : order.configuration.collectionMethodId !== "mobile" ? (
                    <Button href={walkIn.locationsUrl} ctaId="order_find_centre" location="order">{walkIn.centre.cta} <Icon name="arrow" size={18} /></Button>
                  ) : null}
                  <p className={styles.bookNote}>{collection ? `You chose: ${collection.name}. ` : ""}{bookingUrlFor(order.id) ? "Pick the time and place that suit you. The link is also in your email." : order.configuration.collectionMethodId === "mobile" ? walkIn.mobile.note : walkIn.centre.note}</p>
                </div>
              </section>
            </div>

            <aside className={styles.summary} aria-labelledby="order-title">
              <p id="order-title" className={styles.summaryTitle}>Your order</p>
              <ul className={styles.lines}>
                {order.lines.map((l) => (
                  <li key={l.id}><span>{l.label}</span><span className="num">{l.priceCents !== null ? formatAUD(l.priceCents) : "TBC"}</span></li>
                ))}
              </ul>
              <p className={styles.total}><span>Paid</span><span className="num">{formatAUD(order.amountCents)}</span></p>
              <p className={styles.meta}>{formatDate(order.paidAt)} · {order.reference}</p>
            </aside>
          </div>
        </Container>
      </main>
      <SiteFooter />
    </>
  );
}
