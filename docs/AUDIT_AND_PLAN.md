# SIGNAL — repository audit and implementation plan

Date: 2026-09-29. Branch: `claude/homepage-v3-rebuild-k2c0mg` (PR #1). Written against the brief "one flagship test + add-ons, landing-page engine, analytics as infrastructure".

---

## 1. What is actually in the repository

**Stack (verified, not assumed):** Next.js 15.5 App Router · React 19 · TypeScript strict · CSS Modules on semantic design tokens · `next/font` (Figtree, self-hosted) · Vercel (branch previews live, `syd1` recommended). No Tailwind, no TanStack Start, no Vite, no Nitro. The brief's "current technical context" is out of date; nothing needs migrating. Build and typecheck are clean. Lighthouse mobile on the built pages: performance 96–99, accessibility 100, SEO 100.

**Routes**

| Route | State | Notes |
|---|---|---|
| `/` | built | v3 homepage: full-bleed video hero, proof strip, how it works, five-test buy box, biomarker cards, results mock, comparison table, postcode checker, retest band, FAQ, close |
| `/tests` | built | compare page for five tests |
| `/tests/[slug]` ×5 | built | classic product page with plan-selecting buy box |
| `/find-my-test` | built | 7-question quiz → one of five tests |
| `/retesting` | built | plans, steps, billing terms |
| `/checkout/[slug]`, `/order/[id]`, `/account` | stubs | `PlannedPage` placeholders |
| `/api/events`, `/api/stripe/webhook` | stubs | return 501-style placeholders |
| `robots.ts`, `sitemap.ts` | built | sitemap lists tests + quiz + retesting |

**Configuration layer (`src/config`)** — this is the strongest asset and maps almost 1:1 onto the brief's data model.

| File | Holds | Keep? |
|---|---|---|
| `biomarkers.ts` | 56-marker catalogue: id, name, short, category, plain-language `about`, `derivedFrom` (calculated markers); 11 categories with `learn` lines; `groupByCategory()` | **keep, extend** |
| `products.ts` | five tests as marker-id lists, `priceCents: number | null`, derived counts, `buildsOn` | **replace** with one `signalTest` |
| `addons.ts` | six planned bundles + PSA under review; `addonsFor(product)` computes what a bundle adds | **keep, rework** to the brief's six |
| `retest-offer.ts` | two Automatic Retesting plans (6-monthly 15%, 3-monthly 20% + perks), versioned | **keep** |
| `quiz.ts` | questions, scoring, overrides, `QUIZ_VERSION` | **rewrite rules** for test + add-ons |
| `faq.ts` | draft non-clinical answers; clinical ones `todo-clinical`, not rendered | **keep, extend** to the brief's 11 objections |
| `home.ts` | headline options, proof strip, steps, results mock, CTAs | **keep, restructure** |
| `offer.ts` | "every test includes" | keep |
| `social-proof.ts` | press + approved reviews, empty by default; renders nothing | keep, extend with UGC/creator types |
| `coverage.ts` | placeholder postcodes + centres; `checkPostcode()` | keep as a component; demote on homepage |
| `comparison.ts` | "SIGNAL vs standard check-up" rows, all TODO-VERIFY | drop from homepage; optional LP section |
| `media.ts` | 20 imagery slots incl. hero video renders; placeholders render colour panels | keep |
| `brand.ts` | endorsement level; `trustPoints` (now unused) | replace `trustPoints` with `TrustBar` config |

**Analytics (`src/lib/analytics`)** — already the right shape, thin on destinations.

- `events.ts`: single typed catalogue (`page_viewed`, `cta_clicked`, `product_viewed`, quiz ×3, `postcode_checked`, checkout/purchase/retest/booking placeholders). `EVENT_POLICY` maps each event to GA4 / Meta / Klaviyo names and flags server-authoritative events. `AD_PLATFORM_PROP_ALLOWLIST = [value, currency, order_id]` with `redactForAdPlatforms()`.
- `track.ts`: pushes to `window.dataLayer` with an `event_id`; optional `sendBeacon` to `/api/events` (stub) carrying the attribution cookie.
- `attribution.ts`: first/last touch of UTMs + `gclid/gbraid/wbraid/fbclid`, landing path, referrer, in a 90-day first-party cookie.
- Gaps: no Meta Pixel/CAPI adapter, no GA4 MP, no experiment or landing-page context on events, no creator/hook taxonomy, no server reconciliation, no configurator events.

**Checkout / commerce assumptions (`docs/ARCHITECTURE.md` §6–7, `types/domain.ts`)**: Stripe Payment Element + Express Checkout Element planned; server is price truth; `quoteRetest(priceCents, offer)` shared by display and (future) charge; subscription-before-refund ordering; webhook is source of truth; consent records append-only; no clinical data in this database. All still correct. Missing: configuration (test + add-ons + collection) as a first-class order line model.

**Reusable components already present** (mapped to the brief's list)

| Brief | Exists as | Fit |
|---|---|---|
| Header, Footer | `SiteHeader` (overlay mode), `SiteFooter` | keep; simplify nav to the brief's four items |
| Hero | `home/Hero` (video, poster, reduced-motion) | keep; copy becomes config/LP-driven |
| TrustBar | `ProofStrip` | rename, drive from a verified-claims config |
| SectionHeading | `ui/Section` + `SectionHeader` | keep |
| HealthCategoryGrid/Card, BiomarkerList | `home/Biomarkers` (details cards), `product/PanelLearn` (full/compact/chips) | keep, rename |
| SignalProductCard | `product/ProductCard`, `FeaturedProductCard`, `ProductHero` | collapse into one |
| AddonCard, SignalConfigurator, StickyPurchaseBar | `product/AddOns` (display only), `product/BuyBox` (plan radios), `home/StickyCta` | new configurator; BuyBox pattern reusable |
| HowItWorks | `home/HowItWorks` + `StepMock`, `product/ProductSteps` | keep |
| ResultsPreview, TrendCard | `home/ResultsMock`, `home/SignalCard` | keep; generalise data props for reuse in the real dashboard |
| UGCCard, TestimonialCard, ReviewSection | `home/SocialProof` (press + reviews) | extend with UGC video + creator quote |
| FAQ | `home/Faq` (details/summary + FAQPage JSON-LD) | keep |
| RetestSection | `home/RetestBand`, `retest/RetestPlans` | keep |
| Quiz, QuizResult | `quiz/Quiz` | keep shell, new rules/result |
| CheckoutSummary, PostPurchaseRetestOffer | none | new |
| Photo, Button, Icon, Container | present | keep |

**Technical debt / problems**

1. Five-SKU product model contradicts the new strategy; compare page, quiz rules and product pages are built around it.
2. Homepage has grown to eleven sections; the brief's five-second test wants fewer, tighter.
3. Some copy is still in components rather than config (`ProductSteps` uses `home.steps`, fine; `Hero` chips in config, fine; `RetestBand` and `FinalCta` defaults in config; `Comparison` in config). Remaining hard-coded copy: `Coverage` intro, `ResultsMock` bullets, `HowItWorks` header.
4. Hero video is the raw 720p Higgsfield render on a temporary CDN (needs re-encode and self-hosting); `next.config.ts` allows that host.
5. No experiment abstraction; no landing-page route.
6. No lint script, no unit tests (pure functions like `quoteRetest`, `recommend`, `groupByCategory` deserve tests).
7. No Content-Security-Policy yet (deliberately deferred until Stripe/GTM/Meta origins are final).
8. `brand.trustPoints` is dead config.

---

## 2. What changes for ONE SIGNAL TEST + ADD-ONS

- `products.ts` becomes a single `signalTest` record (price/compareAt nullable, marker ids, collection options, retest offer ids, add-on ids). The five current panels are deleted; their unique markers move into the six add-ons.
- Provisional base panel per the brief (the catalogue already contains every marker; only the list changes). Open items are flagged in config: hs-CRP vs CRP, calculated free testosterone "where appropriate".
- Add-ons become the brief's six: Hormones+, Heart+, Thyroid+, Performance+, Metabolic+, Nutrients+ (PSA stays under review, unrendered).
- `/tests` and `/tests/[slug]` are retired in favour of `/signal` (product + configurator). Old URLs 301 to `/signal` so nothing shared breaks.
- Quiz result changes from "one of five tests" to "SIGNAL + recommended add-ons", with interests allowing multi-select.
- Homepage restructured to the brief's A–M order.
- New: landing-page engine, configurator with live total and sticky purchase bar, checkout summary and post-purchase offer architecture, analytics context and adapters.

---

## 3. Proposed information architecture

```
/                       Homepage (A–M)
/signal                 THE SIGNAL TEST: product + configurator (base + add-ons), sticky purchase bar
/signal#what-is-tested  Category grid + full list (anchor from nav "What's tested")
/find-my-signal         Quiz → YOUR SIGNAL (test + add-ons) → configurator with preselection
/lp/[slug]              Paid landing pages from config (noindex by default, canonical → /)
/checkout               Order summary (test + add-ons + collection), Stripe boundary; ?config= carries selection
/order/[id]             Confirmation → post-purchase retest offer → booking handoff
/retesting              Longitudinal measurement + plans (kept)
/faq                    All FAQ (config), also rendered inline
/account/*              Phase 2+
/legal/*                Privacy, terms, retesting terms (stubs until legal)
/tests, /tests/*        301 → /signal
```

Nav: How it works · What's tested · Why SIGNAL · FAQ · **Get my SIGNAL**. Mobile: logo + CTA only (as now), plus a compact menu.

---

## 4. Component architecture (target)

```
components/
  ui/        Container, Section, SectionHeader, Button, Icon, Photo, Price
  layout/    SiteHeader (overlay | solid), SiteFooter, StickyPurchaseBar
  brand/     Logo
  marketing/ Hero, TrustBar, CoreInsight, HealthCategoryGrid/Card, BiomarkerList,
             SignalProductCard, AddonCard, HowItWorks, ResultsPreview, TrendCard,
             RetestSection, ReviewSection (TestimonialCard, UGCCard), Faq, FinalCta
  configurator/ SignalConfigurator (client), ConfigSummary, uses lib/pricing
  quiz/      Quiz (client), QuizResult
  checkout/  CheckoutSummary, StripeBoundary (server action + client element shell)
  retest/    PostPurchaseRetestOffer, RetestPlans
  lp/        LandingPage (composes marketing/* from a LandingPageConfig)
  analytics/ AttributionCapture, TrackedLink, ViewTracker
```
Rule: components take data as props; pages and the LP renderer read config. No medical strings inside components.

---

## 5. Product / configuration data model (`src/config`, typed in `src/types`)

```ts
Biomarker          { id, name, short?, categoryId, about, derivedFrom?: id[] }
BiomarkerCategory  { id, name, learn, description, order }
CollectionMethod   { id: "centre" | "mobile", name, availabilityNote, priceDeltaCents: number | null, status }
Addon              { id, sku, name, benefit, markerIds, priceCents: number | null, status: "planned"|"live"|"under-review", recommendedFor: InterestId[] }
Product (signalTest) { id, sku, name, tagline, description, priceCents|null, compareAtPriceCents|null,
                       markerIds, collectionMethodIds, addonIds, retestOfferIds, turnaround: Placeholder }
RetestOffer        (as today) + appliesTo: productId[] | "all"
Configuration      { productId, addonIds: string[], collectionMethodId?, retestOfferId? }
Quote = quoteConfiguration(cfg) → { lines[], subtotalCents, totalCents, markerCount, categoryCount }
```
One pricing function feeds the configurator, sticky bar, checkout summary and, later, the server. Changing `$349` to `$389` is one field.

**Provisional base panel** (from the brief, ids already in the catalogue): fbc · ferritin, iron, transferrin, tsat · tc, ldl, hdl, tg, non_hdl · glucose, hba1c · alt, ast, alp, ggt, bilirubin, albumin, total_protein · creatinine, egfr, urea · sodium, potassium, chloride, bicarbonate · tsh · testosterone, shbg, free_t · vit_d, b12, folate · crp or hscrp · calcium, magnesium, phosphate, uric_acid. Electrolytes become their own category (currently under Kidneys); Minerals join Nutrients or become their own category — config decides, pages don't care.

---

## 6. Landing-page configuration model

```ts
LandingPage {
  slug, experimentId?, index: false, canonical: "/",
  seo: { title, description, ogImage? },
  eyebrow, headline, subheadline, heroMedia: MediaAsset | VideoAsset,
  cta: { primary: { label, href }, secondary? },
  productId: "signal", recommendedAddonIds, preselectedAddonIds,
  benefits: { title, body }[],
  featuredCategoryIds, trustIds, faqIds, socialProofIds, ugcIds,
  sections: ("hero"|"trust"|"insight"|"categories"|"product"|"addons"|"how"|"results"|"retest"|"proof"|"faq"|"close")[]
}
```
`/lp/[slug]` reads `config/landing-pages/*.ts`, renders `sections` in order with shared components, sets `lp_slug` and `experiment_id` in analytics context, and passes preselected add-ons into `/signal?addons=`. A new angle is one file. Message-match examples ("You track everything else", "Your watch can't measure everything", "Stop guessing what your body needs") become the first three configs.

---

## 7. Analytics architecture

- **Catalogue** stays the single typed source. Add: `landing_page_view`, `view_signal`, `view_biomarkers`, `configurator_start`, `addon_select`, `addon_remove`, `initiate_checkout`, `purchase` (server-authoritative), `retest_offer_view/accept/decline`, `booking_start/complete`.
- **Context**, attached by `track()` to every event, never to ad platforms: `lp_slug`, `experiment_id` + `variant`, `utm_*`, `creator`, `hook`, `session_id`. Read from the attribution cookie + a `sig_exp` cookie.
- **Adapters** (`lib/analytics/adapters/`): `dataLayer` (GA4 via GTM), `metaPixel` (browser, `eventID` = our `event_id`), `server` (beacon to `/api/events` → Meta CAPI + GA4 MP, same `event_id`). Purchase is emitted only from the Stripe webhook with `event_id = order_id`; the thank-you page fires the browser twin with the same id. Documented dedup.
- **Allowlist** unchanged: ad platforms get `value`, `currency`, `order_id`, `event_id`. Add-on ids, quiz interests, categories and `lp_slug` never leave first-party.
- **UTM / creator taxonomy** (recommended): `utm_source=meta|google|trybe|tiktok` · `utm_medium=paid_social|cpc|ugc|retarget|organic_social` · `utm_campaign=signal_{angle}_{yyyymm}` · `utm_content={creator}.{hook}.{creative}` · `utm_term=lp_{slug}`; experiment via `sig_exp={id}:{variant}`. Parsed into structured fields (`creator`, `hook`, `creative`) at capture time so reporting doesn't regex strings. Stored on `order.attribution`; Stripe metadata gets `order_id`, `lp_slug`, `utm_campaign`, `creator`.
- **Reconciliation**: our database is financial truth; Meta/GA4 are attribution views; Trybe commission joins on `creator` + `order_id`.

---

## 8. Experimentation

`config/experiments.ts`: `{ id, key, variants: { id, weight }[], active }`. Assignment server-side in middleware (cookie `sig_exp`), variant read by components through a small `useVariant(key)` / server helper; every event carries it. Homepage headline, CTA label, hero media and LP length are the first candidates. No third-party platform.

---

## 9. Implementation phases (each is one PR-sized push to this branch, build green, Lighthouse checked)

| Phase | Scope | Touches |
|---|---|---|
| 1 | Data architecture: `types/`, `signalTest`, six add-ons, collection methods, `quoteConfiguration()`, LP/experiment/creator types, unit tests for pure functions | config, lib, types |
| 2 | Homepage A–M on one product; TrustBar from verified-claims config; Core Insight section; category grid; single product card; add-on teaser; results preview generalised; retest as concept | app/page, marketing/* |
| 3 | `/signal` configurator: base + add-ons with live total, sticky purchase bar, coverage counts; `/tests*` → 301 | configurator/*, app/signal |
| 4 | Landing-page engine `/lp/[slug]` + three message-match configs; noindex/canonical; `lp_slug` in analytics | lp/*, config/landing-pages |
| 5 | Quiz → test + add-ons, multi-select interests, result explains the match, deep-links into configurator | quiz/* |
| 6 | Checkout boundary: `/checkout` summary from `?config`, server action creating the order + PaymentIntent (stubbed provider), Payment/Express Element shells, no fake payments | checkout/*, api |
| 7 | Analytics adapters, context, server event route, Stripe webhook → purchase with shared `event_id`, taxonomy doc | lib/analytics, api |
| 8 | Post-purchase offer: `/order/[id]` state machine, consent copy, quote from `quoteRetest`, Stripe Billing requirements doc | retest/* |
| 9 | Hardening: CSP, self-hosted video, image sizes, sitemap/robots for LPs, product schema (only once price is real), a11y sweep | config, layout |
| 10 | QA: mobile walkthroughs at 390px, Lighthouse on every route, event audit against the allowlist | — |

Phase 1 is non-destructive (adds alongside). Phase 2–3 are the destructive step: five products, compare page and product pages are removed then.

---

## 10. Preserve / remove

**Preserve:** design tokens and theme (evergreen palette, Figtree), all `ui/*`, `Photo`, `SiteHeader/Footer`, `Hero` (video), `Biomarkers` cards, `PanelLearn`, `ResultsMock`, `SignalCard`, `HowItWorks` + `StepMock`, `RetestBand`, `RetestPlans`, `Faq`, `SocialProof`, `StickyCta`, `Quiz` shell, `BuyBox` pattern, analytics catalogue/track/attribution, `quoteRetest`, biomarker catalogue, retest offers, FAQ config, media and video, README claims register, architecture doc.

**Remove (in phase 2–3):** five products, `/tests` compare page, `/tests/[slug]`, `CompareTable`, `TestsGrid`, `FeaturedProductCard`, `ProductHero` gallery page, `Included` (folded into the product card), `Comparison` on the homepage, `brand.trustPoints`, `ProductViewTracker` (replaced by `ViewTracker`), `PlannedPage` as routes ship.

---

## 11. Decisions blocked on business information

1. **Prices**: SIGNAL Test, `compareAt`, each add-on, collection price delta. Until set, UI shows "Pricing coming soon".
2. **Base panel finalisation**: hs-CRP vs CRP; calculated free testosterone; whether calcium/magnesium/phosphate/uric acid sit in "Nutrients" or a "Minerals" category.
3. **Collection model**: which methods exist at launch, regions, whether mobile carries a fee.
4. **Trust facts**: laboratory partner names and accreditation wording, review model ("doctor-reviewed"?), typical turnaround, any customer count. All render as placeholders until supplied.
5. **Clinical FAQ answers**: referral pathway, abnormal results, sharing with GP, "are these diagnostic tests".
6. **Retest cadence per add-on** (keep one cadence set for now).
7. **Trybe**: what identifiers Trybe passes (creator id format) and whether links are creator-unique.
8. **Tag manager**: GTM vs direct tags (affects CSP and adapter design).

None of these block Phase 1–5; they gate copy and prices, which are config.
