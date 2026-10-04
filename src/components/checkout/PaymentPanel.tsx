"use client";

import { Elements, ExpressCheckoutElement, PaymentElement, useElements, useStripe } from "@stripe/react-stripe-js";
import { loadStripe, type Appearance, type Stripe } from "@stripe/stripe-js";
import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { formatAUD } from "@/lib/money";
import styles from "./PaymentPanel.module.css";

let stripePromise: Promise<Stripe | null> | null = null;
const getStripeJs = () => {
  const key = process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY;
  if (!key) return null;
  stripePromise ??= loadStripe(key);
  return stripePromise;
};

const appearance: Appearance = {
  theme: "flat",
  variables: {
    colorPrimary: "#1c4a3c", colorBackground: "#ecebe5", colorText: "#121614", colorTextSecondary: "#5f6661", colorDanger: "#b23c1b",
    fontFamily: "Figtree, system-ui, sans-serif", fontSizeBase: "16px", borderRadius: "12px", spacingUnit: "4px",
  },
  rules: { ".Input": { padding: "14px 16px", boxShadow: "inset 0 0 0 1px #dedcd5" }, ".Input:focus": { boxShadow: "inset 0 0 0 2px #1c4a3c" }, ".Label": { fontWeight: "700", marginBottom: "6px" } },
};

interface Props {
  clientSecret: string;
  amountCents: number;
  returnUrl: string;
  /** Already collected in "Your details"; passed to Stripe so the card form doesn't ask again. */
  billing: { name: string; email: string; phone: string };
  onSuccess: (paymentIntentId: string) => void;
}

/** Stripe Payment Element plus Apple Pay / Google Pay. Mounted once the order exists. */
export function PaymentPanel(props: Props) {
  const stripe = getStripeJs();
  if (!stripe) return null;
  return (
    <Elements stripe={stripe} options={{ clientSecret: props.clientSecret, appearance, loader: "auto" }}>
      <PaymentForm {...props} />
    </Elements>
  );
}

function PaymentForm({ amountCents, returnUrl, billing, onSuccess }: Props) {
  const stripe = useStripe();
  const elements = useElements();
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  async function confirm() {
    if (!stripe || !elements) return;
    setBusy(true); setError(null);
    const { error: submitError } = await elements.submit();
    if (submitError) { setError(submitError.message ?? "Check your payment details."); setBusy(false); return; }
    const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
      elements,
      confirmParams: { return_url: returnUrl, payment_method_data: { billing_details: { name: billing.name, email: billing.email, phone: billing.phone } } },
      redirect: "if_required",
    });
    if (confirmError) { setError(confirmError.message ?? "Payment didn't go through. Nothing was charged."); setBusy(false); return; }
    if (paymentIntent && (paymentIntent.status === "succeeded" || paymentIntent.status === "processing")) { onSuccess(paymentIntent.id); return; }
    setBusy(false);
  }

  return (
    <div className={styles.panel}>
      <ExpressCheckoutElement onConfirm={confirm} options={{ buttonHeight: 48, layout: { maxColumns: 1, overflow: "never" } }} />
      <p className={styles.or}><span>or pay by card</span></p>
      <PaymentElement onReady={() => setReady(true)} options={{ layout: "tabs", fields: { billingDetails: { email: "never", phone: "never", name: "never" } } }} />
      {error ? <p className={styles.error} role="alert">{error}</p> : null}
      <button type="button" className={styles.pay} onClick={confirm} disabled={!stripe || !elements || !ready || busy}>
        {busy ? "Processing…" : <>Pay <span className="num">{formatAUD(amountCents)}</span></>} <Icon name="arrow" size={18} />
      </button>
      <p className={styles.secure}><Icon name="shield" size={14} /> Secured by Stripe. Your card details never touch our servers.</p>
    </div>
  );
}
