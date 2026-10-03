"use client";

import { useId, useState, type FormEvent } from "react";
import { Button } from "@/components/ui/Button";
import { Icon } from "@/components/ui/Icon";
import { checkPostcode, type CoverageResult } from "@/config/coverage";
import { track } from "@/lib/analytics/track";
import { cx } from "@/lib/cx";
import styles from "./PostcodeChecker.module.css";

/**
 * "Can a nurse come to you?" — postcode lookup.
 * Client component: the only interaction on the page besides the sticky bar.
 * The postcode never leaves the browser; analytics receive serviceable true/false only.
 * TODO(integration): `checkPostcode` will call the Express booking platform API.
 */
export function PostcodeChecker() {
  const inputId = useId();
  const [value, setValue] = useState("");
  const [result, setResult] = useState<(CoverageResult & { postcode: string }) | null>(null);

  function onSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const r = checkPostcode(value);
    setResult({ ...r, postcode: value.trim() });
    if (r.valid) track({ name: "postcode_checked", props: { serviceable: r.mobile } });
  }

  return (
    <div className={styles.wrap}>
      <form className={styles.form} onSubmit={onSubmit} noValidate>
        <label htmlFor={inputId} className={styles.label}>Your postcode</label>
        <div className={styles.row}>
          <input
            id={inputId}
            className={styles.input}
            name="postcode"
            inputMode="numeric"
            autoComplete="postal-code"
            pattern="[0-9]{4}"
            maxLength={4}
            placeholder="e.g. 2000"
            value={value}
            onChange={(e) => setValue(e.target.value.replace(/\D/g, "").slice(0, 4))}
            aria-describedby={result ? `${inputId}-result` : undefined}
            aria-invalid={result ? !result.valid : undefined}
          />
          <button type="submit" className={styles.submit}>
            Check <Icon name="arrow" size={18} />
          </button>
        </div>
      </form>

      <div id={`${inputId}-result`} className={styles.result} aria-live="polite">
        {result ? <Result {...result} /> : null}
      </div>
    </div>
  );
}

function Result({ valid, mobile, centres, postcode }: CoverageResult & { postcode: string }) {
  if (!valid) {
    return <p className={cx(styles.card, styles.invalid)}>Please enter a 4-digit Australian postcode.</p>;
  }
  if (mobile) {
    return (
      <div className={cx(styles.card, styles.yes)}>
        <span className={styles.badge}><Icon name="check" size={16} /> Mobile collection available</span>
        <p className={styles.headline}>Good news: a collector can come to you in {postcode}.</p>
        <p className={styles.body}>Choose a home or workplace visit when you book. Collection centres are also available if you prefer.</p>
        <Button href="/find-my-test" size="sm" ctaId="postcode_find_my_test" location="postcode_checker">Find my test</Button>
      </div>
    );
  }
  return (
    <div className={cx(styles.card, styles.centre)}>
      <span className={styles.badge}><Icon name="pin" size={16} /> Collection centre options</span>
      <p className={styles.headline}>Mobile collection isn&apos;t available in {postcode} yet.</p>
      <p className={styles.body}>
        You can still get tested at a collection centre.
        {centres.length > 0 ? " Nearby options include:" : " Centre options are shown when you book."}
      </p>
      {centres.length > 0 ? (
        <ul className={styles.centres}>
          {centres.map((c) => (
            <li key={c.id}><Icon name="pin" size={14} /> {c.name}, {c.suburb} {c.postcode}</li>
          ))}
        </ul>
      ) : null}
      <Button href="/find-my-test" size="sm" variant="outline" ctaId="postcode_find_my_test" location="postcode_checker">Find my test</Button>
    </div>
  );
}
