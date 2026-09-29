# Homepage v3 — plan

Branch: `claude/homepage-v3-rebuild-k2c0mg` (the session's designated branch; `homepage-v3` was requested but this environment only permits pushing to the designated branch).

References for pacing and polish: Function Health, Superpower. Nothing copied: structure and confidence only.

## Sections (in order)

| # | Section | Component | Rendering | Data source |
|---|---|---|---|---|
| 1 | Hero + proof strip | `Hero`, `ProofStrip`, `SignalCard` | server | `config/home.ts` (headline options, offer line, proof items), `config/products.ts` (from-price), `config/media.ts` |
| 2 | Postcode checker | `PostcodeChecker` | client (form) | `config/coverage.ts` (placeholder postcodes + centres, `checkPostcode()`) |
| 3 | How it works (4 steps, Retest is step 4) | `HowItWorks` + `StepMock` | server | `config/home.ts` steps; `config/retest-offer.ts` interval |
| 4 | Tests buy box | `Tests`, `ProductCard` | server | `config/products.ts` (+ new `helps`, `inclusions`) |
| 5 | What we measure | `Biomarkers` (`<details>` cards) | server | `config/biomarkers.ts` (+ `count`, `examples` — TODO placeholders) |
| 6 | SIGNAL vs standard check-up | `Comparison` (real `<table>`) | server | `config/comparison.ts` (all rows TODO-VERIFY) |
| 7 | Results you understand | `ResultsMock` (phone UI, scroll reveal) | server, CSS scroll-driven animation | `config/home.ts` `resultsMock` (illustrative) |
| 8 | Retesting band | `RetestBand` | server | `config/retest-offer.ts` interval, `config/media.ts` |
| 9 | Social proof | `SocialProof` (renders nothing while empty) | server | `config/social-proof.ts` (empty by default) |
| 10 | FAQ + FAQPage JSON-LD | `Faq` | server | `config/faq.ts` (clinical items marked TODO and not rendered) |
| 11 | Final CTA | `FinalCta` | server | `config/home.ts` |
| — | Sticky mobile CTA | `StickyCta` | client (IntersectionObserver) | `config/products.ts` from-price |

## Config changes
- `config/home.ts` (new): hero headline options + active one, offer line template, proof strip, how-it-works steps, results mock, final CTA copy.
- `config/coverage.ts` (new): placeholder serviced postcodes and collection centres; pure `checkPostcode()` to be swapped for the Express booking platform API.
- `config/comparison.ts`, `config/social-proof.ts`, `config/faq.ts` (new).
- `config/products.ts`: add `helps` and `inclusions` per product.
- `config/biomarkers.ts`: add `count` and `examples` per category (TODO placeholders).
- `config/media.ts`: new slots with descriptive briefs; slots without photography render a warm placeholder panel.

## Analytics
- New event `postcode_checked` with `{ serviceable: boolean }` only. GA4 only; never sent to Meta.
- Existing `cta_clicked` on all CTAs (new ids for sticky bar, buy box, postcode section).

## Design
- Same palette and Figtree. Fonts move to `next/font/google` (self-hosted, preloaded) for LCP.
- New tokens: `--shadow-soft`, `--shadow-card`, larger display scale, fewer borders (cards are panels on shell, not outlined).
- Motion: hero card draw-in (existing) and scroll reveal on the results mock (CSS `animation-timeline: view()` behind `@supports`, no JS). Both respect `prefers-reduced-motion`.

## Compliance
- No disease names, no detection/diagnosis claims, no testimonials, no invented numbers.
- Every new factual claim appended to the README claims register with status.
- Automatic Retesting: "recurring billing" stated plainly in the FAQ; never called a subscription.
