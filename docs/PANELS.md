# SIGNAL product architecture — one test, five add-ons (working spec)

Source of truth: `src/config/products.ts` (base marker ids), `src/config/addons.ts` (add-ons), `src/config/biomarkers.ts` (catalogue). This document records the intent and open decisions behind those lists. The earlier five-panel model (Core / Complete / Hormones / …) is retired.

**Principle: SIGNAL = breadth, add-ons = depth.** The base test must feel complete on its own. Add-ons are optional depth, never essentials held back.

**Principle: sell what they're learning, not "N biomarkers".** Every presentation groups markers under the area of health they describe.

**Principle: derived insights are free.** Where the inputs are measured we calculate (non-HDL-C, eGFR, TSAT, free testosterone, ApoB:ApoA1). Tagged "calculated" in the UI, never sold as extra assays.

## The SIGNAL Test (base) — 10 areas, 32 markers
| Area | Markers |
|---|---|
| Heart (5) | Total cholesterol, LDL-C, HDL-C, triglycerides, non-HDL-C (calc) |
| Metabolic (2) | Fasting glucose, HbA1c |
| Thyroid (1) | TSH |
| Iron (4) | Ferritin, iron, transferrin, TSAT (calc) |
| Inflammation (1) | hs-CRP (`BASE_INFLAMMATION_MARKER` flips to CRP) |
| Liver (7) | ALT, AST, ALP, GGT, bilirubin, albumin, total protein |
| Kidneys (3) | Creatinine, eGFR (calc), urea |
| Electrolytes (4) | Sodium, potassium, chloride, bicarbonate |
| Minerals (4) | Calcium, magnesium, phosphate, uric acid |
| Blood (1) | Full blood count |

**DECISION (locked):** hormones (testosterone, SHBG, free T) and vitamins (D, B12, folate) are NOT in the base for COGS reasons. Do not add them back. They are the first two add-ons.

## Add-ons (display order = `signalTest.addonIds`, CRO-testable)
| Add-on | Markers | Future | Flags |
|---|---|---|---|
| Hormones+ | Total testosterone, SHBG, free testosterone (calc), LH, FSH, oestradiol, prolactin | DHEA-S | enabled, launch |
| Nutrients+ | Vitamin D, B12, folate | Zinc | enabled, launch |
| Heart+ | ApoB, ApoA1, Lp(a), ApoB:ApoA1 (calc) | | enabled, launch, badge "Advanced" |
| Thyroid+ | Free T4, free T3, TPO antibodies, thyroglobulin antibodies | | enabled, launch |
| Performance+ | CK, cortisol, IGF-1 | | enabled, launch (**provisional**: set `launchEnabled: false` to withdraw) |
| PSA | PSA | | `enabled: false` — never offered by default |

Metabolic+ (insulin, HOMA-IR) is removed. Insulin and HOMA-IR stay in the catalogue, unsold.

Flags: `enabled: false` = does not exist for customers. `launchEnabled: false` = shown as a disabled "Coming soon" card (`SHOW_UNLAUNCHED_ADDONS`), never selectable, priced, quoted, deep-linked or recommended.

## Internal cost
Pathology COGS lives only in `src/config/internal/costs.ts` (`import "server-only"`); a test fails the build if any component or page imports it, and the add-on records carry no cost field. Never surface it in UI, analytics or API responses.

## Recommended vs preselected
Landing pages carry `recommendedAddonIds` (highlighted "Recommended for you", `?rec=`) and `preselectedAddonIds` (in the basket, `?addons=`). The quiz outputs a configuration (preselected). Current pages: performance → Hormones+ & Nutrients+ (preselected); longevity → Heart+ (recommended); hormones → Hormones+ (preselected); runners → Nutrients+ & Hormones+ (recommended); supplements → Nutrients+ (preselected).

## Pricing
Not set. All `priceCents` are `null`; the UI renders "Pricing coming soon" / "Price TBC" until they are. Set them in `products.ts` and `addons.ts` only.

## Open decisions / TODO-VERIFY
- Assay availability for every marker with the laboratory partner (especially Lp(a), IGF-1, cortisol timing, antibodies).
- Performance+ go / no-go.
- Whether ApoB:ApoA1 is reported by the lab or calculated by us.
- Per-add-on COGS from the lab quote.
