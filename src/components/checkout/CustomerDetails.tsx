"use client";

import Link from "next/link";
import { useId } from "react";
import { australianStates, detailsCopy as copy, genderOptions, sexOptions } from "@/config/checkout-fields";
import { cx } from "@/lib/cx";
import type { CustomerDetails as Details, CustomerErrors, CustomerField } from "@/lib/checkout/customer";
import styles from "./CustomerDetails.module.css";

interface Props {
  value: Details;
  errors: CustomerErrors;
  /** Fields the visitor has left, or the whole form after a pay attempt. Errors show only for these. */
  touched: Partial<Record<CustomerField, boolean>>;
  requiresAddress: boolean;
  onChange: (patch: Partial<Details>) => void;
  onBlur: (field: CustomerField) => void;
}

/**
 * "Your details": the personal information the laboratory and collection
 * team need. Copy and options come from config/checkout-fields.ts. Errors
 * appear per field after blur, or all at once when Pay is attempted.
 * Nothing typed here is ever sent to analytics.
 */
export function CustomerDetails({ value, errors, touched, requiresAddress, onChange, onBlur }: Props) {
  const uid = useId();
  const id = (f: string) => `${uid}-${f}`;
  const show = (f: CustomerField) => (touched[f] ? errors[f] : undefined);
  const text = (field: CustomerField, label: string, extra: React.InputHTMLAttributes<HTMLInputElement> = {}, help?: string) => {
    const err = show(field);
    return (
      <div className={cx(styles.field, err && styles.fieldError)}>
        <label htmlFor={id(field)} className={styles.label}>{label}</label>
        <input
          id={id(field)}
          className={styles.input}
          value={String(value[field] ?? "")}
          onChange={(e) => onChange({ [field]: e.target.value } as Partial<Details>)}
          onBlur={() => onBlur(field)}
          aria-invalid={err ? true : undefined}
          aria-describedby={cx(help && id(`${field}-help`), err && id(`${field}-err`)) || undefined}
          {...extra}
        />
        {help ? <p id={id(`${field}-help`)} className={styles.help}>{help}</p> : null}
        {err ? <p id={id(`${field}-err`)} className={styles.error} role="alert">{err}</p> : null}
      </div>
    );
  };

  const dobErr = show("dobDay");
  const sexErr = show("sex");
  const termsErr = show("acceptsTerms");

  return (
    <div className={styles.form}>
      <p className={styles.intro}>{copy.intro}</p>

      <fieldset className={styles.group}>
        <legend className={styles.legend}>{copy.name.legend}</legend>
        <div className={styles.row2}>
          {text("firstName", copy.name.first, { autoComplete: "given-name", autoCapitalize: "words" })}
          {text("lastName", copy.name.last, { autoComplete: "family-name", autoCapitalize: "words" })}
        </div>
        <p className={styles.help}>{copy.name.help}</p>
      </fieldset>

      <fieldset className={cx(styles.group, dobErr && styles.fieldError)} aria-describedby={cx(id("dob-help"), dobErr && id("dob-err")) || undefined}>
        <legend className={styles.legend}>{copy.dob.legend}</legend>
        <div className={styles.dob}>
          {(["dobDay", "dobMonth", "dobYear"] as const).map((f) => {
            const label = f === "dobDay" ? copy.dob.day : f === "dobMonth" ? copy.dob.month : copy.dob.year;
            const max = f === "dobYear" ? 4 : 2;
            return (
              <div key={f} className={styles.dobPart}>
                <label htmlFor={id(f)} className={styles.subLabel}>{label}</label>
                <input
                  id={id(f)}
                  className={cx(styles.input, "num")}
                  inputMode="numeric"
                  pattern="[0-9]*"
                  maxLength={max}
                  placeholder={f === "dobDay" ? "DD" : f === "dobMonth" ? "MM" : "YYYY"}
                  autoComplete={f === "dobDay" ? "bday-day" : f === "dobMonth" ? "bday-month" : "bday-year"}
                  value={value[f]}
                  onChange={(e) => onChange({ [f]: e.target.value.replace(/\D/g, "").slice(0, max) } as Partial<Details>)}
                  onBlur={() => onBlur("dobDay")}
                  aria-invalid={dobErr ? true : undefined}
                />
              </div>
            );
          })}
        </div>
        <p id={id("dob-help")} className={styles.help}>{copy.dob.help}</p>
        {dobErr ? <p id={id("dob-err")} className={styles.error} role="alert">{dobErr}</p> : null}
      </fieldset>

      <fieldset className={cx(styles.group, sexErr && styles.fieldError)} aria-describedby={cx(id("sex-help"), sexErr && id("sex-err")) || undefined}>
        <legend className={styles.legend}>{copy.sex.legend}</legend>
        <div className={styles.choices} role="radiogroup" aria-label={copy.sex.legend}>
          {sexOptions.map((o) => {
            const on = value.sex === o.id;
            return (
              <button key={o.id} type="button" role="radio" aria-checked={on} className={cx(styles.choice, on && styles.choiceOn)} onClick={() => { onChange({ sex: o.id }); onBlur("sex"); }}>
                <span className={styles.radio} aria-hidden="true" />{o.label}
              </button>
            );
          })}
        </div>
        <p id={id("sex-help")} className={styles.help}>{copy.sex.help}</p>
        {sexErr ? <p id={id("sex-err")} className={styles.error} role="alert">{sexErr}</p> : null}
      </fieldset>

      <div className={styles.field}>
        <label htmlFor={id("gender")} className={styles.label}>{copy.gender.label} <span className={styles.optional}>{copy.gender.optional}</span></label>
        <select id={id("gender")} className={styles.select} value={value.gender} onChange={(e) => onChange({ gender: e.target.value as Details["gender"] })} aria-describedby={id("gender-help")}>
          <option value="">Choose, or leave blank</option>
          {genderOptions.map((o) => <option key={o.id} value={o.id}>{o.label}</option>)}
        </select>
        <p id={id("gender-help")} className={styles.help}>{copy.gender.help}</p>
      </div>

      <div className={styles.row2}>
        {text("email", copy.email.label, { type: "email", autoComplete: "email", inputMode: "email", autoCapitalize: "none", spellCheck: false }, copy.email.help)}
        {text("phone", copy.phone.label, { type: "tel", autoComplete: "tel", inputMode: "tel", placeholder: "04xx xxx xxx" }, copy.phone.help)}
      </div>

      {requiresAddress ? (
        <fieldset className={styles.group}>
          <legend className={styles.legend}>{copy.address.legend}</legend>
          <p className={styles.help}>{copy.address.help}</p>
          {text("addressLine1", copy.address.line1, { autoComplete: "address-line1" })}
          {text("addressLine2", `${copy.address.line2}`, { autoComplete: "address-line2" })}
          <div className={styles.row3}>
            {text("suburb", copy.address.suburb, { autoComplete: "address-level2", autoCapitalize: "words" })}
            <div className={cx(styles.field, show("state") && styles.fieldError)}>
              <label htmlFor={id("state")} className={styles.label}>{copy.address.state}</label>
              <select id={id("state")} className={styles.select} value={value.state} autoComplete="address-level1" onChange={(e) => onChange({ state: e.target.value as Details["state"] })} onBlur={() => onBlur("state")} aria-invalid={show("state") ? true : undefined} aria-describedby={show("state") ? id("state-err") : undefined}>
                <option value="">State</option>
                {australianStates.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
              {show("state") ? <p id={id("state-err")} className={styles.error} role="alert">{show("state")}</p> : null}
            </div>
            {text("postcode", copy.address.postcode, { inputMode: "numeric", pattern: "[0-9]*", maxLength: 4, autoComplete: "postal-code" })}
          </div>
        </fieldset>
      ) : (
        <div className={styles.row2}>
          {text("postcode", copy.postcodeOnly.label, { inputMode: "numeric", pattern: "[0-9]*", maxLength: 4, autoComplete: "postal-code" }, copy.postcodeOnly.help)}
        </div>
      )}

      <div className={styles.consents}>
        <label className={cx(styles.checkbox, termsErr && styles.fieldError)}>
          <input type="checkbox" checked={value.acceptsTerms} onChange={(e) => { onChange({ acceptsTerms: e.target.checked }); onBlur("acceptsTerms"); }} aria-invalid={termsErr ? true : undefined} aria-describedby={termsErr ? id("terms-err") : undefined} />
          <span>
            I agree to the <Link href="/legal/terms">Terms of Service</Link> and <Link href="/legal/privacy">Privacy Policy</Link>, and to my details being shared with the laboratory and collection team to carry out my test.
          </span>
        </label>
        {termsErr ? <p id={id("terms-err")} className={styles.error} role="alert">{termsErr}</p> : null}
        <label className={styles.checkbox}>
          <input type="checkbox" checked={value.marketingOptIn} onChange={(e) => onChange({ marketingOptIn: e.target.checked })} />
          <span>{copy.consent.marketing}</span>
        </label>
      </div>
    </div>
  );
}
