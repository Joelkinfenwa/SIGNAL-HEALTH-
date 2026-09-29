# SIGNAL by Express Pathology

Consumer web application for SIGNAL: premium blood testing built on Express Pathology's collection infrastructure.

**Test → Understand → Improve → Retest**

This is v0.1: the architectural foundation and the homepage shell with placeholder product data. Full specification is in [`docs/ARCHITECTURE.md`](docs/ARCHITECTURE.md).

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
```

Requires Node 20+.

## Stack

Next.js (App Router) · React · TypeScript (strict) · CSS Modules with design tokens · Vercel (`syd1`).
Phase 2 adds Postgres (Sydney region) with Drizzle, Stripe, and the server-side analytics mirror.

No UI framework and no CSS-in-JS: the homepage ships about 2.6 kB of page-specific JavaScript, all of it analytics.

## Project structure

```
src/
  app/                 Routes. Only / is built; other routes are placeholders from the route map.
  config/              Business data — edit here, not in components
    products.ts        The three tests (placeholder data)
    retest-offer.ts    Automatic Retesting offer: discount, interval, eligibility, copy
    brand.ts           Brand lockup, endorsement prominence, trust claims
    biomarkers.ts      Biomarker categories shown in marketing
  lib/
    analytics/         Typed event catalogue, tracking, attribution capture
    retest/offer.ts    Pure offer calculation shared by UI and (later) payment code
    money.ts           AUD formatting (all amounts are integer cents)
  components/          ui/, brand/, layout/, analytics/, product/, home/
  types/domain.ts      Commerce data model (no clinical data)
docs/ARCHITECTURE.md   Architecture, routes, design system, data model, Stripe, retesting, analytics, security
```

## Major decisions

1. **Custom Next.js app, not Shopify.** The funnel (quiz → collection method → payment → post-purchase retest conversion with partial refund) doesn't fit a standard ecommerce checkout, and the brand shouldn't look like a store.
2. **Configuration over code.** Products, the retest offer, trust claims and the "by Express Pathology" prominence are data. Changing the discount, interval or product lineup never means hunting through components.
3. **Offers are versioned and immutable.** Each consent record stores the exact offer id and version the customer saw, which is also what makes offer experiments measurable.
4. **Integer cents everywhere; one quote function.** `quoteRetest()` is used to display and to charge/refund, so the numbers can't diverge. $319 at 15% → $47.85 refund today, $271.15 per retest.
5. **Subscription before refund.** A partial refund is only issued once the recurring arrangement exists. All Stripe writes use idempotency keys; webhooks are the source of truth.
6. **This app is not a clinical system.** No results, quiz answers or clinical details in this database.
7. **Analytics are typed and health-data-safe.** Ad platforms receive value, currency and order id only — never product names or categories, which can reveal health information. Browser and server events share an `event_id` for de-duplication.
8. **Theme by section, not by component.** Sections set `data-theme`; components read semantic tokens. Any component works on light or dark sections.
9. **Brand architecture is a setting.** `brand.endorsementLevel` (`prominent` | `subtle` | `hidden`) controls the endorsement site-wide.

## Imagery

`src/config/media.ts` holds the campaign imagery. The current images are **AI-generated concept images** for design review, served from the Higgsfield CDN. Before launch: replace them with licensed photography or confirm usage rights, move them into `/public` (or the final CDN), remove the temporary host from `next.config.ts`, and never present them as real customers.

## Claims register (must be cleared before launch)

Every public claim needs substantiation under Australian Consumer Law. `trustPoints` in `config/brand.ts` carry a `substantiated` flag.

| Claim | Location | Status |
|---|---|---|
| "Australia's largest mobile blood collection network" | Trust bar | Needs evidence on file |
| "Samples are analysed by accredited Australian pathology laboratories" | Trust bar | Confirm laboratory partner(s) and accreditation |
| "The price you see includes the test. Collection options are shown before you pay." | Trust bar | Confirm pricing and collection-fee model |
| "Receive your results with appropriate clinical review" | How it works, Why SIGNAL | Confirm with clinical lead |
| "You can change or cancel it from your account" | Retesting | True once account/retesting management ships |
| "Recommended" / "recommended starting point" (not "most popular") | Tests section | Change only when sales data supports it |
| "Nurse visit booked, at home" illustration | Hero | Illustrative UI; confirm home visits are offered in launch areas |
| Footer disclaimer | Footer | Clinical and legal review |

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
- Fonts are loaded via a Google Fonts `<link>` for this shell; switch to `next/font/google` for production (self-hosted, preloaded).
