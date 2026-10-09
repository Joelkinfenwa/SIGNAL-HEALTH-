"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { CustomerDetails } from "@/components/checkout/CustomerDetails";
import { Icon } from "@/components/ui/Icon";
import { detailsCopy } from "@/config/checkout-fields";
import { track } from "@/lib/analytics/track";
import { completeDetails } from "@/lib/checkout/complete-details";
import { emptyCustomer, validateCustomer, type CustomerDetails as Details, type CustomerField } from "@/lib/checkout/customer";
import { cx } from "@/lib/cx";
import styles from "./OrderDetailsStep.module.css";

const KEY = "sig_order_details";
const ALL_FIELDS = Object.keys(emptyCustomer()) as CustomerField[];

/**
 * Pay-first checkout, after payment: the details the laboratory needs to issue
 * the request form. Same form and validation as before, now with the payment
 * already made. Persists in sessionStorage so a reload keeps what was typed.
 * On success the page re-renders as the normal confirmation.
 */
export function OrderDetailsStep({ orderId, token, email, reference }: { orderId: string; token: string; email?: string; reference: string }) {
  const [customer, setCustomer] = useState<Details>(() => ({ ...emptyCustomer(), email: email ?? "", acceptsTerms: true }));
  const [touched, setTouched] = useState<Partial<Record<CustomerField, boolean>>>({});
  const [message, setMessage] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [hydrated, setHydrated] = useState(false);
  const ref = useRef<HTMLElement>(null);
  const router = useRouter();
  const errors = useMemo(() => validateCustomer(customer, { requiresAddress: true }, detailsCopy.errors), [customer]);
  const errorCount = Object.keys(errors).length;

  useEffect(() => {
    try { const saved = sessionStorage.getItem(KEY); if (saved) setCustomer((c) => ({ ...c, ...(JSON.parse(saved) as Partial<Details>), acceptsTerms: true })); } catch { /* ignore */ }
    setHydrated(true);
  }, []);
  useEffect(() => { if (hydrated) { try { sessionStorage.setItem(KEY, JSON.stringify(customer)); } catch { /* ignore */ } } }, [customer, hydrated]);

  async function submit() {
    if (errorCount) {
      setTouched(Object.fromEntries(ALL_FIELDS.map((f) => [f, true])));
      setMessage(detailsCopy.summaryError(errorCount));
      track({ name: "checkout_details_invalid", props: { field_count: errorCount } });
      requestAnimationFrame(() => {
        const first = ref.current?.querySelector<HTMLElement>("[aria-invalid='true'], [role='alert']");
        first?.scrollIntoView({ behavior: "smooth", block: "center" });
        (ref.current?.querySelector<HTMLElement>("[aria-invalid='true']") ?? first)?.focus?.();
      });
      return;
    }
    setBusy(true); setMessage(null);
    try {
      const r = await completeDetails({ orderId, token, customer });
      if (r.status === "ok") {
        track({ name: "checkout_details_completed", props: { product_id: "signal" } });
        try { sessionStorage.removeItem(KEY); } catch { /* ignore */ }
        router.refresh();
        return;
      }
      if (r.status === "invalid") { setTouched(Object.fromEntries(ALL_FIELDS.map((f) => [f, true]))); setMessage(Object.values(r.errors)[0] ?? "Check your details."); }
      else if (r.status === "denied") setMessage("This link isn't valid for this order. Use the link in your email.");
      else setMessage(r.reason);
    } catch {
      setMessage("We couldn't save your details. Please try again.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <section ref={ref} className={styles.wrap} aria-labelledby="details-title">
      <div className={styles.head}>
        <p className={styles.eyebrow}><Icon name="check" size={14} /> Paid · {reference}</p>
        <h2 id="details-title" className={styles.title}>Now, the details the laboratory needs.</h2>
        <p className={styles.intro}>Two minutes. Your pathology request form is issued and emailed the moment these are in. Use the name on your photo ID: the collector checks it.</p>
      </div>
      <CustomerDetails
        value={customer}
        errors={errors}
        touched={touched}
        requiresAddress
        hideTerms
        onChange={(patch) => { setCustomer((c) => ({ ...c, ...patch, acceptsTerms: true })); setMessage(null); }}
        onBlur={(f) => setTouched((t) => (t[f] ? t : { ...t, [f]: true }))}
      />
      <div className={styles.actions}>
        <button type="button" className={cx(styles.button)} onClick={submit} disabled={busy}>{busy ? "Saving…" : "Save and issue my request form"} <Icon name="arrow" size={18} /></button>
        <p className={styles.note} aria-live="polite">{message ?? "Nothing typed here is shared with advertisers. It goes to the laboratory and collection team only."}</p>
      </div>
    </section>
  );
}
