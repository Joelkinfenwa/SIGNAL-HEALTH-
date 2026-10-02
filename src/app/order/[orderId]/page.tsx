import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { NextSteps } from "@/components/journey/NextSteps";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { RetestOffer } from "@/components/order/RetestOffer";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";
import { Icon } from "@/components/ui/Icon";
import { getCollectionMethod } from "@/config/collection";
import { getOrderForPage } from "@/lib/orders/get-order";
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
  const order = await getOrderForPage(orderId, await searchParams);
  if (!order) notFound();
  const collection = order.configuration.collectionMethodId ? getCollectionMethod(order.configuration.collectionMethodId) : null;

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
              {order.emailMasked ? <>A receipt and your booking link are on their way to {order.emailMasked}. </> : null}
              Next, take a look at this. It&apos;s only offered here.
            </p>
          </header>

          <div className={styles.grid}>
            <div className={styles.primary}>
              <RetestOffer
                order={{ id: order.id, token: order.token, lines: order.lines, amountCents: order.amountCents, paidAt: order.paidAt.toISOString() }}
                enrolled={order.retest ? { offerId: order.retest.offerId, nextTestDate: order.retest.nextTestDate.toISOString(), refundCents: order.retest.refundCents } : undefined}
              />

              <section className={styles.block} aria-labelledby="next-title">
                <h2 id="next-title" className={styles.blockTitle}>What happens next</h2>
                <NextSteps bare current="book" only={["book", "collect", "results"]} />
                <div className={styles.bookRow}>
                  <Button href="/account" ctaId="order_book_collection" location="order">Book my collection <Icon name="arrow" size={18} /></Button>
                  <p className={styles.bookNote}>{collection ? `You chose: ${collection.name}. ` : ""}Pick the time and place that suit you. The link is also in your email.</p>
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
