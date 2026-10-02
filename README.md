# SIGNAL by Express Pathology

Consumer web application for SIGNAL: premium blood testing built on Express Pathology's collection infrastructure.

**Test → Understand → Improve → Retest**

This is v0.3: the architectural foundation and the rebuilt homepage (v3) with placeholder product data. Full specification is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md); the homepage plan is in [`docs/HOMEPAGE_V3_PLAN.md`](docs/HOMEPAGE_V3_PLAN.md); the panel brief and open decisions are in [`docs/PANELS.md`](docs/PANELS.md).

## Deploy to Vercel

1. Upload this folder to a GitHub repository (private recommended).
2. In Vercel: **Add New → Project**, import the repository, click **Deploy**. Framework (Next.js) is detected automatically; no environment variables are needed for this version.
3. Set the region to Sydney (`syd1`) under Project Settings → Functions.
4. Every commit to the main branch redeploys automatically.

## Getting started

```bash
npm install
cp .env.example .env.local
npm run dev        # http://localhost:3000
npm run build      # production build + type check
npm test           # unit tests: pricing, catalogue integrity, quiz rules, copy guard
```

Requires Node 20+.

## Stack

Next.js (App Router) · React · TypeScript (strict) · CSS Modules with design tokens · Vercel (`syd1`).
Phase 2 adds Postgres (Sydney region) with Drizzle, Stripe, and the server-side analytics mirror.

No UI framework and no CSS-in-JS. The homepage's client JavaScript is limited to analytics, the postcode checker form and the sticky mobile CTA; every other section is a server component. Accordions use native `<details>`.

## Project structure

```
src/
  app/                 Routes. Built: / (home), /signal (product + configurator), /find-my-signal (quiz), /retesting. Others are placeholders.
  config/              Business data — edit here, not in components
    products.ts        THE SIGNAL TEST: marker ids, price/compare-at (null until set), collection and add-on ids
    addons.ts          Six add-ons (depth): markers, benefit, price (null), interest mapping
    collection.ts      Collection methods, availability notes, price delta
    interests.ts       Customer interests used by the quiz and add-on recommendations
    trust.ts           Trust-bar claims: verified vs placeholder (placeholders never render in production)
    configurator.ts    Configurator copy, heading variants and microcopy (CRO knobs)
    checkout-fields.ts Checkout "Your details" copy, options, minimum age (lib/checkout/customer.ts validates)
    retest-offer.ts    Retesting plans + the post-purchase instant-refund offer copy, disclosure and policy knobs
    internal/costs.ts  Pathology COGS — server-only; never imported by UI (test-enforced)
    experiments.ts     CRO experiments (assignment + analytics context)
    retest-offer.ts    Automatic Retesting plans (6-monthly 15%, 3-monthly 20% + perks): discount, interval, perks, copy
    brand.ts           Brand lockup, endorsement prominence, trust claims
    biomarkers.ts      Biomarker catalogue: every marker, its area of health, plain-language "about", derived-from
    home.ts            Homepage copy: headline options, proof strip, steps, results mock, CTAs
    coverage.ts        Placeholder serviced postcodes + collection centres; checkPostcode()
    comparison.ts      "SIGNAL vs a standard check-up" rows (all TODO-VERIFY)
    social-proof.ts    Press logos and approved reviews (empty by default)
    faq.ts             FAQ items; clinical questions are TODO and not rendered
    quiz.ts            "Find my SIGNAL": interests → SIGNAL + add-ons (QUIZ_VERSION)
    offer.ts           What every test includes (the offer itself)
    media.ts           Imagery, including placeholder slots with photography briefs
  lib/
    analytics/         Typed event catalogue, tracking, attribution capture
    retest/offer.ts    Pure offer calculation shared by UI and (later) payment code
    money.ts           AUD formatting (all amounts are integer cents)
    home-tokens.ts     Fills {fromPrice} {areas} {markers} {interval} in marketing copy
    pricing.ts         quoteConfiguration(): the one pricing function (configurator, sticky bar, checkout, server)
  components/          ui/, brand/, layout/, analytics/, product/, home/
  types/domain.ts      Commerce data model (no clinical data)
docs/ARCHITECTURE.md   Architecture, routes, design system, data model, Stripe, retesting, analytics, security
```

## Major decisions

1. **Custom Next.js app, not Shopify.** The funnel (quiz → collection method → payment → post-purchase retest conversion with partial refund) doesn't fit a standard ecommerce checkout, and the brand shouldn't look like a store.
2. **Configuration over code.** Products, the retest offer, trust claims and the "by Express Pathology" prominence are data. Changing the discount, interval or product lineup never means hunting through components.
3. **Offers are versioned and immutable.** Each consent record stores the exact offer id and version the customer saw, which is also what makes offer experiments measurable.
4. **Integer cents everywhere; one quote function.** `quoteRetest(priceCents, offer)` is used to display and to charge/refund, so the numbers can't diverge. Two plans in `config/retest-offer.ts`: every 6 months at 15% off, every 3 months at 20% off with priority booking and one at-home visit included per year.
5. **Subscription before refund.** A partial refund is only issued once the recurring arrangement exists. All Stripe writes use idempotency keys; webhooks are the source of truth.
6. **This app is not a clinical system.** No results, quiz answers or clinical details in this database.
7. **Analytics are typed and health-data-safe.** Ad platforms receive value, currency and order id only — never product names or categories, which can reveal health information. Browser and server events share an `event_id` for de-duplication.
8. **Theme by section, not by component.** Sections set `data-theme`; components read semantic tokens. Any component works on light or dark sections. Palette v0.4: evergreen brand, bone base, coral "signal" accent (see `docs/ARCHITECTURE.md` §3).
9. **Brand architecture is a setting.** `brand.endorsementLevel` (`prominent` | `subtle` | `hidden`) controls the endorsement site-wide.

## Imagery

`src/config/media.ts` holds the campaign imagery. The current images are **AI-generated concept images** for design review, served from the Higgsfield CDN. Before launch: replace them with licensed photography or confirm usage rights, move them into `/public` (or the final CDN), remove the temporary host from `next.config.ts`, and never present them as real customers.

Slots with an empty `src` are placeholders with a shot `brief`; the `Photo` component renders a warm colour panel until photography exists. Currently: `nurseArrival` (postcode checker), `collectionCentre`, `chooseTest`.

## Connecting Stripe

Stripe is the order store until a database exists: the PaymentIntent carries the configuration, snapshotted line prices and attribution; the Customer carries contact and identity details. Confirmation links are `/order/<payment_intent_id>?t=<signed token>`; the id alone never opens an order.

1. **Keys.** In the Stripe dashboard (test mode first): Developers → API keys. In Vercel → Settings → Environment Variables, add to **Preview**: `STRIPE_SECRET_KEY` (sk_test_…), `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (pk_test_…), `ORDER_TOKEN_SECRET` (any long random string), and `NEXT_PUBLIC_PREVIEW_PRICING=1` (placeholder prices so you can pay before pricing is set; never set this on Production).
2. **Webhook.** Developers → Webhooks → Add endpoint: `https://<your preview or production domain>/api/stripe/webhook`. Select events `payment_intent.succeeded`, `payment_intent.payment_failed`, `charge.refunded`, `invoice.upcoming`, `invoice.paid`, `invoice.payment_failed`, `customer.subscription.updated`, `customer.subscription.deleted`. Copy the signing secret into `STRIPE_WEBHOOK_SECRET`. Preview deployments get a new URL per branch, so point the test webhook at the branch alias (the `…-git-<branch>-…vercel.app` URL) rather than a single deployment.
3. **Apple Pay.** Settings → Payment methods → Apple Pay → add the domain. Google Pay needs nothing.
4. **Redeploy** so the public key is baked into the build, then pay on `/checkout` with test card `4242 4242 4242 4242`. The confirmation page shows the refund offer; accepting it creates the subscription (first charge deferred one interval) and then the partial refund, in that order.
5. **Go live.** Repeat with live keys on **Production** only, leave `NEXT_PUBLIC_PREVIEW_PRICING` unset there, and set real prices in `config/products.ts`, `config/addons.ts` and `config/collection.ts`.

What Stripe holds and why: name, email, phone and address on the Customer (receipts, booking); date of birth and sex in Customer metadata because the pathology request needs them and there is no database yet (TODO: move to the clinical system / database before launch; Stripe is a processor under its DPA). Consent to retesting billing is recorded on the subscription metadata with the wording version and hash.

## Claims register (must be cleared before launch)

Every public claim needs substantiation under Australian Consumer Law. `trustPoints` in `config/brand.ts` carry a `substantiated` flag.

| Claim | Location | Status |
|---|---|---|
| "Australia's largest mobile blood collection network" | `config/brand.ts` trustPoints (not rendered on the v3 homepage) | Needs evidence on file |
| "Samples are analysed by accredited Australian pathology laboratories" | `config/brand.ts` trustPoints (not rendered on the v3 homepage) | Confirm laboratory partner(s) and accreditation |
| "The price you see includes the test… collection options shown before you pay" | Buy box price note; FAQ "What's included" | TODO-VERIFY: confirm pricing and collection-fee model |
| "Clinical review included" / "reviewed and explained in plain language" | Proof strip, How it works, Results section | TODO-VERIFY with clinical lead |
| "from $299" (hero subheadline, sticky bar "From $299") | Hero, sticky bar, /signal, checkout, retesting quotes | Price set in `config/products.ts` (29900) on 2 Oct 2026; add-on and home-visit prices still TBC |
| "{n} areas of health" / "{n} markers" | Proof strip, buy box, product pages, compare table | Derived from `config/products.ts` marker lists — TODO-VERIFY analyte availability with the lab |
| Every marker "about" line (what it measures) | Product pages, biomarker cards | Measurement language only; clinical lead to review `config/biomarkers.ts` |
| "Calculated for you, at no extra cost" (non-HDL-C, eGFR, TSAT, free T, HOMA-IR, ratios) | Product pages | TODO-VERIFY which the lab reports vs. we compute; no extra assay is charged |
| "Everything in Core, plus N more" | Product pages | Derived from marker lists |
| Add-ons "coming; availability and pricing confirmed at launch" | Product and compare pages | TODO(pricing) and TODO-VERIFY assay availability |
| "Price TBC" on add-ons and the home visit | /signal configurator, checkout | TODO(pricing): set `priceCents` in `config/addons.ts` and `priceDeltaCents` in `config/collection.ts` |
| Add-on badges ("Advanced", "For performance"; "Popular" reserved) | /signal configurator (`config/addons.ts` `badge`) | Descriptive only; "Popular" must not be set until sales data supports it |
| Add-on long descriptions ("a marker set largely by your genes", "the three nutrients people most often supplement") | /signal configurator "What you get" (`config/addons.ts`) | Measurement/preference framing; clinical and legal to confirm wording |
| Homepage areas tagged "add-on" (Hormones, Nutrients, Recovery) | Homepage "What SIGNAL measures" | Derived from add-on config; makes clear these are not in the base test |
| "You can change the date or cancel from your account at any time" | FAQ (Automatic Retesting) | True once account/retesting management ships |
| "Recommended" / "recommended starting point" (not "most popular") | Tests section | Change only when sales data supports it |
| "Collector visit booked, at home" pill | Hero | Illustrative UI; TODO-VERIFY home visits are offered in launch areas |
| Postcode checker results ("a collector can come to you in …") | Postcode checker | PLACEHOLDER lists in `config/coverage.ts`; connect to the Express booking API before launch |
| Every row of "SIGNAL vs a standard check-up" | `config/comparison.ts` | TODO-VERIFY (each row has `verified: false`) |
| "Mobile collection is available in many metropolitan areas and is expanding" | FAQ | TODO-VERIFY against launch coverage |
| "Most results are ready within a few business days of collection" | FAQ | TODO-VERIFY turnaround with the laboratory |
| "Qualified collectors from Express Pathology" | FAQ, proof strip | Confirm collector qualifications wording |
| "Your results are held in a separate clinical system… never shared with advertising platforms" | FAQ (privacy) | True by architecture; legal to confirm wording |
| Results mock (LDL 2.9 mmol/L, ferritin, HbA1c, "Lower than last time") | Results section, How it works step 3 | Illustrative, labelled "Example", base-test markers only; clinical lead to confirm the plain-language wording |
| Quiz result copy ("You train seriously…", "You're thinking long term…") | `config/quiz.ts` | Recommendation framing only, not health advice; marketing/legal to confirm |
| "Every test can be collected either way. You choose when you book." | Quiz, collection question | TODO-VERIFY against launch coverage |
| Retesting plans: "Save 15% / 20% on every test", "Priority booking", "One at-home collector visit included each year" | Product pages, /retesting | TODO-VERIFY perks are operationally defined; legal to review recurring-billing disclosure |
| "Every test includes" six items (accredited lab, collection, clinical review, explanations, tracking, add-ons) | Product and compare pages | TODO-VERIFY each with operations and the lab (`config/offer.ts`, `verified: false`) |
| Retesting terms ("reminders before each charge", "no fees to change, pause or cancel") | /retesting | TODO(legal) and TODO(product): true once account management ships |
| Product "promise", "is this you if…" and "what you walk away with" lines | Product pages (`config/products.ts`) | Understanding-only framing; marketing/legal to confirm none reads as symptom-to-diagnosis |
| "Ten minutes, then get on with your day" (collection duration) | Product page, Why SIGNAL | TODO-VERIFY typical collection time with operations |
| Add-on "For you if…" lines | /signal configurator, homepage add-ons (`config/addons.ts`) | Preference framing only; marketing/legal to confirm none reads as symptom-to-diagnosis |
| Journey timings ("[Right after payment]", "[X business days after collection]") | /signal, /checkout (`config/journey.ts`) | Placeholders; render on previews only until operations confirm |
| "Pay by card, Apple Pay or Google Pay. No account needed first." | Journey step 1, checkout | True once Stripe Payment + Express Checkout Elements ship |
| Checkout details: "Sex … as recorded at birth. Laboratories use it to apply the right reference ranges" | /checkout step 3 (`config/checkout-fields.ts`) | TODO-VERIFY wording with the clinical lead and the laboratory's request requirements |
| Checkout minimum age (18+) | /checkout step 3 (`MIN_AGE_YEARS`) | DECISION: policy on under-18 self-pay testing; legal to confirm |
| Checkout consent text (terms, privacy, sharing with laboratory and collection team; marketing opt-in) | /checkout step 3 | TODO(legal): collection notice under the Privacy Act; opt-in wording for the Spam Act |
| Post-purchase offer: "Get {refund} back right now" / "we refund {refund} to your card immediately" | /order/[orderId] (`postPurchaseOffer` in `config/retest-offer.ts`) | True only once the Stripe refund is issued synchronously on accept (ARCHITECTURE §7 ordering: subscription first, then refund); "5 to 10 business days" bank timing is standard card-network wording, TODO-VERIFY with Stripe |
| "One-time offer · this page only" | /order/[orderId] | Only honest if the refund offer is never repeated at this price; flip `oneTimeOnly` if it is |
| Retesting cancellation: "keep today's refund" | /order/[orderId] | DECISION `cancellationPolicy`: keep_refund vs reverse_refund; TODO(legal) either way |
| "We email you 14 days before each charge" | /order/[orderId] | DECISION `reminderDaysBefore`; must match the invoice.upcoming lead time in Stripe |
| Demo order (`/order/demo`, SIG-DEMO-0001, $349/$59/$49) | Previews only | Illustrative; production returns 404 |
| Preview pricing ($349 / $59 / $49 …) | Everywhere, with a banner, when `NEXT_PUBLIC_PREVIEW_PRICING=1` | Placeholders for test payments only; the server refuses to create an order with them on Production |
| "Your card details never touch our servers" | Checkout payment panel | True by construction (Stripe Payment Element); keep it that way |
| Footer disclaimer | Footer | Clinical and legal review |

Clinical FAQ questions (fasting, referral, minimum age, what happens if a result needs attention) are in `config/faq.ts` with `status: "todo-clinical"` and are **not rendered** until an approved answer is supplied.

## Open decisions

See **DECISION** and **VERIFY** markers in `docs/ARCHITECTURE.md`. The most important:

- How the pathology request (requesting practitioner) is obtained for a direct-to-consumer purchase — this shapes checkout.
- Whether the existing Express booking platform (Doorstep) can provide availability and booking creation by API.
- Payment Element (custom checkout, recommended) vs. Stripe embedded Checkout (faster to ship).
- Final product names, analyte lists and legal entity/ABN for the footer.

## Next steps

1. Product pages and comparison page (`/tests`, `/tests/[slug]`).
2. Recommendation quiz with predefined selection rules.
3. Database, checkout, Stripe webhook, order confirmation.
4. Automatic Retesting offer and conversion flow.
5. Server-side event mirror (Meta CAPI, GA4 MP, Klaviyo).
6. Account and retesting management.

## Notes for engineers and coding agents

- Server components by default. Add `"use client"` only for interaction.
- Never hard-code product details, prices or offer terms in components — import from `src/config`.
- Add new analytics events to `src/lib/analytics/events.ts` first; the types enforce the payload.
- Never add health-related properties to events sent to ad platforms.
- Fonts are self-hosted and preloaded via `next/font/google` (Figtree) — no render-blocking font stylesheet.
- Marketing copy lives in `src/config/home.ts`; use `fillHomeTokens()` / `pickPriced()` for `{fromPrice}` `{areas}` `{markers}` `{tests}` `{interval}` so numbers never go stale and no "from $" line renders without a price.
- Panels reference markers by id from the catalogue. Never type marker counts or lists into components or copy; derive them.
- Sell what people learn: group markers by area of health (`PanelLearn`), tag calculated markers, never lead with a line-item count.
- The postcode checker sends `postcode_checked { serviceable }` only. Never add the postcode to any event.
- The quiz keeps answers in component state. Events carry `quiz_version` and the recommended `product_id` only. Bump `QUIZ_VERSION` when questions or rules change.
- Homepage order is a CRO decision: hero → proof → how it works → tests → what you'll learn → results → comparison → postcode checker → retesting → FAQ → final CTA. At-home collection is a benefit chip in the hero; the postcode checker sits low so it never interrupts the path to "Find my test".
- Social proof renders only when `config/social-proof.ts` has approved content. Never add outcome testimonials or invented ratings.
