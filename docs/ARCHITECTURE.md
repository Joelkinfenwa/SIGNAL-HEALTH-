# SIGNAL by Express Pathology — Architecture

Status: v0.1 foundation. Homepage shell built; everything else is specified here and stubbed in code.
Items marked **DECISION** need sign-off from the business. Items marked **VERIFY** need legal, clinical or platform confirmation.

---

## 1. Application architecture

| Concern | Choice | Why |
|---|---|---|
| Framework | **Next.js (App Router), React, TypeScript (strict)** | Server rendering and static generation for SEO and Core Web Vitals; server actions and route handlers keep payment logic server-side in the same codebase. |
| Hosting | **Vercel**, functions pinned to `syd1` | Lowest latency for Australian users; keeps compute in-country alongside the database. |
| Styling | **CSS Modules + CSS custom-property tokens** | Zero runtime cost, no UI kit to fight, trivially readable by other engineers and coding agents. |
| Database (phase 2) | **Postgres in a Sydney region** (Neon or Supabase) with **Drizzle ORM** | Relational order/billing state with transactions and unique constraints; Drizzle is typed and thin. |
| Payments | **Stripe** (Payment Element, Express Checkout Element, Billing) | See §6. |
| Auth (phase 3) | Passwordless email (magic link or one-time code) | No passwords to manage; suits an occasional-use account. |
| Analytics | Typed event catalogue → dataLayer (GA4, Meta Pixel) + server mirror (Meta CAPI, GA4 Measurement Protocol, Klaviyo) | See §8. |
| Booking | Integrate with the existing Express booking platform (Doorstep) via API; store only the booking reference | **VERIFY** Doorstep exposes availability + booking creation endpoints suitable for this flow. |
| Clinical results | Out of scope for this app. The dashboard will link to, or fetch through a separate authenticated service from, the clinical system | Keeps this database free of clinical data (§9). |

Rendering strategy:

- Marketing, product, biomarker and SEO pages: **static** (SSG/ISR). The homepage ships only ~2.6 kB of page JS (analytics).
- Quiz: client component; answers never leave the browser.
- Checkout and post-purchase: **dynamic**, server-rendered, no caching.
- Account: dynamic, authenticated.

Configuration over code: products, the retest offer, trust claims and brand endorsement live in `src/config/`. In phase 2, products and offers move to the database (offers must be versioned — see §7) and marketing copy can move to a CMS if the team needs to edit without deploys.

---

## 2. Route structure

```
/                               Home (built)
/tests                          Compare the three tests
/tests/[slug]                   Product page (core | complete | performance)
/find-my-test                   Recommendation quiz
/checkout/[slug]                Collection method → details → clinical requirements → payment
/order/[orderId]                Confirmation → Automatic Retesting offer → booking next steps
/book/[orderId]                 Booking (or embedded in /order if Doorstep allows)
/retesting                      How Automatic Retesting works
/account                        Your SIGNAL (dashboard)
/account/retesting              Manage, reschedule or cancel Automatic Retesting
/account/tests/[orderId]        A single test / booking
/biomarkers                     SEO hub: what blood tests measure
/biomarkers/[slug]              e.g. /biomarkers/ferritin
/blood-tests/[topic]            e.g. /blood-tests/hormone, /blood-tests/at-home
/locations, /locations/[city]   Collection coverage pages
/faq, /about
/legal/privacy | terms | retesting-terms | collection-notice
/api/stripe/webhook             Stripe events (stubbed)
/api/events                     Server-side analytics mirror (stubbed)
```

SEO note: the commercial architecture is three products, but the content architecture is open-ended. `/biomarkers/*`, `/blood-tests/*` and `/locations/*` are independent static collections that each link into the relevant product. Adding a fourth product or a new topic never requires restructuring URLs.

Checkout and order routes are `noindex` and disallowed in `robots.txt`.

---

## 3. Design system

> **v0.2 update:** the design moved to a photography-led, warmer direction. Base is now warm paper (`#FBF9F6`) and shell (`#F3EEE7`); Oxblood (`#7A1B2B`) and Plasma (`#F2C14E`) are accents; typeface is Figtree; radii are larger (20/32px); the "Your signal" readout is now a floating card over photography. The principles below still apply.

**Concept.** A collected blood sample separates into red cells and straw-coloured plasma. The palette is taken directly from that: Oxblood and Plasma, on a neutral lab-glass base. It avoids medical blue and "biohacker" neon, and reads as premium rather than clinical.

| Token | Hex | Role |
|---|---|---|
| Oxblood | `#6B1422` | Brand, dark sections, featured product |
| Oxblood deep | `#4C0D18` | Panels on dark |
| Plasma | `#F2C14E` | Accent on dark: primary buttons, data highlights |
| Porcelain | `#F1F2EE` | Default light background |
| Surface | `#FFFFFF` | Alternate light background, cards |
| Graphite | `#1D211F` | Text |
| Slate | `#5B625E` | Secondary text |
| Rule | `#D7DAD4` | Lines and borders |

**Theming.** Sections set `data-theme="light" | "surface" | "dark"`. Components only use semantic tokens (`--bg`, `--fg`, `--muted`, `--line`, `--accent`, `--on-accent`, `--panel`), so any component works on any section without variants.

**Type.** One family: Schibsted Grotesk (400–700). Major-third scale (`--fs-sm` → `--fs-display`, fluid at the top). Display set tight (-0.038em, line-height 1.04). Numbers use tabular figures (`.num`) rather than a monospace face.

**Shape.** Radius carries hierarchy: controls are pills, cards 16px, the hero readout and featured product 28px.

**Motion.** One orchestrated moment only: the hero readout lines draw in on load. Everything else is still. `prefers-reduced-motion` is respected globally.

**Signature element.** The "Your signal" readout: markers tracked across three tests. It explains Test → Retest visually, and the same idea is reused in the logo mark (three connected readings) and the retesting timeline.

**Quality floor.** 52px minimum touch targets, visible focus rings, skip link, semantic landmarks, a real `<table>` for the biomarker comparison, AA contrast on all text tokens.

---

## 4. Reusable components

```
components/
  ui/          Container, Section, SectionHeader, Button
  brand/       Logo (+ SignalMark) — endorsement level driven by config
  layout/      SiteHeader, SiteFooter, PlannedPage (temporary)
  analytics/   TrackedLink, AttributionCapture
  product/     ProductCard
  home/        Hero, SignalReadout, TrustBar, HowItWorks, FlagshipTests,
               BiomarkerMatrix, WhySignal, Retesting, FinalCta
```

Planned next: `PriceTag`, `CollectionMethodPicker`, `ProductHero`, `BiomarkerAccordion`, `FAQ` (with FAQPage schema), `QuizStep`, `RetestOfferPanel`, `ConsentCheckbox` (records text version), `OrderSummary`, `StepIndicator`, `Field`/`Input` primitives, `Toast`.

Conventions: server components by default; `"use client"` only where interaction requires it. Every primary CTA passes a `ctaId` so clicks are measurable without extra code.

---

## 5. Data model (high level)

Types are in `src/types/domain.ts`. No clinical data anywhere.

```
customer            id, email, phone, first_name, last_name, stripe_customer_id, created_at
order               id, customer_id, product_id, product_tier, amount_cents, currency, status,
                    source (initial|retest), collection_method, booking_status, booking_ref,
                    stripe_payment_intent_id, retest_enrolment_id, attribution (jsonb), created_at
retest_offer        id, version, discount_bps, interval_months, eligible_tiers, refund_on_conversion,
                    copy (jsonb), experiment_key, active            -- immutable once shown; new version to change
offer_exposure      id, order_id, offer_id, offer_version, variant, shown_at, outcome
retest_enrolment    id, customer_id, origin_order_id (UNIQUE), product_id, offer_id, offer_version,
                    recurring_amount_cents, interval_months, status, stripe_subscription_id,
                    refund_amount_cents, refund_status, stripe_refund_id, next_test_date, cancelled_at
consent_record      id, customer_id, type, granted, text_version, text_hash, context (jsonb),
                    ip_address, user_agent, created_at               -- append-only
stripe_event        id (Stripe event id, PK), type, processed_at     -- webhook idempotency
```

Deliberately absent: quiz answers, symptoms, results, reference ranges, medications, Medicare numbers. Identity details needed for the pathology request (e.g. date of birth) should be collected into, and stay in, the clinical/booking system. **DECISION** confirm where those fields live.

---

## 6. Stripe and payment architecture

**One-time purchase**

1. Server creates the `order` (status `pending_payment`) with price read from the server-side product record — the client never supplies an amount.
2. Server creates a PaymentIntent (AUD) with `customer`, `metadata {order_id, product_id, utm_campaign}` and **`setup_future_usage: "off_session"`** so the card can later fund Automatic Retesting without re-entry.
   - This requires clear disclosure at checkout that the card is stored securely with Stripe for future bookings. A `card_storage` consent record is written. **VERIFY** wording with legal.
3. Client confirms with the **Payment Element**, plus the **Express Checkout Element** for Apple Pay / Google Pay (important for mobile paid traffic).
4. The **webhook** (`payment_intent.succeeded`) is the source of truth: it marks the order `paid` and emits the server-side `purchase_completed` event. The confirmation page reads order state from the database, never from query parameters.

Why the Payment Element rather than hosted Checkout: the post-purchase offer must appear immediately inside our own flow, and a custom, branded checkout converts better on mobile for a premium brand. Hosted/embedded Checkout remains a valid fallback if speed to launch matters more. **DECISION**

**Recurring (Automatic Retesting)** uses Stripe Billing subscriptions created with inline `price_data` (currency, product, unit_amount, `recurring: {interval: "month", interval_count}`) computed from the offer config. This means discounts and intervals are pure configuration — no hand-maintained price objects per variant.

**Never**: store card data, accept amounts from the client, act on unverified webhooks, or retry a Stripe write without an idempotency key. Use a restricted API key scoped to the resources this app needs.

---

## 7. Post-purchase retest conversion

Shown on `/order/[orderId]` after the webhook has confirmed payment.

**Display**
- Load the active, eligible offer for the product; compute the quote with `quoteRetest()` (`src/lib/retest/offer.ts`) — the same function the server uses when charging, so displayed and charged amounts cannot diverge.
- Record an `offer_exposure` row and emit `retest_offer_viewed` with offer id, version and variant.
- Required disclosure next to the button (not behind a link): the recurring amount, the interval, when the first recurring charge happens, that it continues until cancelled, and how to cancel. The consumer experience says "Automatic Retesting", but the terms must still make plain that this is recurring billing. **VERIFY** with legal (Australian Consumer Law, unfair contract terms).
- An explicit, unticked consent checkbox.

**Accept — server action `acceptRetestOffer(orderToken, offerId, offerVersion, consentTextVersion)`**

1. Verify the signed order token, that the order is `paid`, belongs to the customer, is eligible, and has no enrolment (unique constraint on `origin_order_id` makes double-submits safe).
2. In one DB transaction: insert `retest_enrolment` (status `pending`) and an append-only `consent_record` (type `retest_billing`, text version + hash, offer id/version, quoted amounts, IP, user agent).
3. Create the **subscription first** — `default_payment_method` from the original PaymentIntent, first charge deferred by one interval (`trial_end` or a future `billing_cycle_anchor` with `proration_behavior: "none"`; **VERIFY** which presents best in Stripe receipts and the customer portal), metadata linking enrolment/order/offer. Idempotency key `retest-sub-{enrolmentId}`.
4. Then issue the **partial refund** on the original PaymentIntent for `refundTodayCents`. Idempotency key `retest-refund-{enrolmentId}`.
5. Mark enrolment `active`, set `next_test_date`, update order to `partially_refunded`, emit `retest_offer_accepted` (server-authoritative) and sync to Klaviyo.

Ordering rule: never refund unless the subscription exists. If step 3 fails, nothing is refunded and the customer sees a clear error. If step 4 fails, the enrolment stays `refund_status = pending` and a retry job completes it; the customer is told the refund is processing.

**Decline** records the exposure outcome and emits `retest_offer_declined`. No further prompts on that page.

**Lifecycle (webhooks)**
- `invoice.upcoming` → reminder email with date, amount and a one-click manage link, sent well ahead of the charge. **DECISION** reminder lead time.
- `invoice.paid` → create a new `order` (source `retest`), prompt the customer to book, emit `purchase_completed` with `source=retest`.
- `invoice.payment_failed` → dunning sequence; enrolment `past_due`.
- `customer.subscription.updated/deleted` → mirror status.

**Customer controls**: reschedule (move the next billing date), pause, cancel — from `/account/retesting`, implemented on the Stripe subscription. Stripe's Customer Portal is an acceptable interim.

**Experimentation**: offers are immutable per version. Variant assignment happens server-side and is stored on `offer_exposure`, so acceptance rate can be measured per discount, interval and message.

Note for offer design: when a partial refund is issued, Stripe's processing fee on the original charge is generally not returned. Worth factoring into which offer mechanics you test (refund vs. credit against the next test).

---

## 8. Analytics and event tracking

`src/lib/analytics/events.ts` is the single typed catalogue. An event cannot be emitted unless it exists there with the correct properties.

Events: `page_viewed`, `cta_clicked`, `product_viewed`, `quiz_started`, `quiz_completed`, `product_recommended`, `checkout_started`, `collection_method_selected`, `purchase_completed`, `retest_offer_viewed`, `retest_offer_accepted`, `retest_offer_declined`, `booking_started`, `booking_completed`.

**Flow**
```
browser track()  ──► dataLayer ──► GA4 / Meta Pixel (via GTM or direct tags)
      │
      └─(beacon, same event_id)──► /api/events ──► Meta CAPI · GA4 Measurement Protocol · Klaviyo
Stripe webhooks / server actions ──(authoritative events)──────────┘
```

- `EVENT_POLICY` maps each event to GA4, Meta and Klaviyo names and flags server-authoritative events (purchase, retest accepted, booking completed). The browser and server share one `event_id` (the order id for purchases) so platforms de-duplicate.
- **Attribution**: `AttributionCapture` stores first- and last-touch UTMs and click ids (`gclid`, `gbraid`, `wbraid`, `fbclid`) in a first-party cookie. At checkout they are written to `order.attribution` and summarised into Stripe metadata. Meta's `_fbp`/`_fbc` cookies are read server-side for CAPI matching.
- **Health-data minimisation**: ad platforms receive only `value`, `currency` and `order_id` (`AD_PLATFORM_PROP_ALLOWLIST`). Product names, tiers and categories can reveal health information (e.g. a hormone panel) and are not sent to Meta or Google Ads. Quiz answers are not part of any event type. **VERIFY** current Meta policy on health and wellness advertisers' lower-funnel events in Australia, as it affects whether `Purchase` optimisation is available.
- Performance: analytics tags load after interaction/idle; they must not affect LCP.

---

## 9. Security and privacy

**Regulatory context (VERIFY with your legal adviser)**
- Privacy Act 1988 / Australian Privacy Principles: health information is *sensitive information*. Even "customer bought a hormone test" is health information. Requires a collection notice, consent for collection, purpose limitation, and the Notifiable Data Breaches scheme applies.
- Health advertising: restrictions on testimonials and claims for regulated health services; Australian Consumer Law substantiation for every claim (see README claims register). Avoid "most popular" until data supports it.
- Spam Act 2003: marketing consent recorded separately from transactional messaging.
- **Clinical pathway**: pathology testing in Australia requires a request from a practitioner. The checkout must accommodate however Express currently handles requesting (e.g. a requesting-practitioner review step). **DECISION** this shapes the checkout and may add a clinical-eligibility step and age gate (18+).

**Controls**
- Data residency: database and functions in Sydney; review sub-processors (Vercel, Stripe, Klaviyo, Google, Meta) in the privacy policy.
- Separation: no results or clinical data in this database. The future dashboard obtains results from the clinical system through a separate authenticated service.
- PCI: Stripe Elements keeps card data off our servers (SAQ A scope).
- Webhooks: signature verification on raw body; idempotent processing via `stripe_event`.
- Order access before login: signed, short-lived tokens; order ids alone grant nothing.
- Secrets in Vercel environment variables; restricted Stripe keys; separate test/live environments.
- Headers: HSTS, nosniff, frame-deny and referrer policy set in `next.config.ts`; a strict Content-Security-Policy to be added once script origins (Stripe, GTM, Meta) are final.
- Abuse: rate limits and bot protection on quiz, checkout and API routes.
- Logging: no PII or health information in application logs; structured logs with order ids only.
- Consent records are append-only and retained per legal advice.
