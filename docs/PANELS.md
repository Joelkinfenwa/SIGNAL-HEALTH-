# SIGNAL panels — product brief (working spec)

Source of truth for what each test measures is `src/config/products.ts` (marker ids) and `src/config/biomarkers.ts` (the catalogue). This document records the intent and open decisions behind those lists.

**Principle: sell what they're learning, not "47 biomarkers".** Every presentation groups markers under the area of health they describe (Heart, Hormones, Metabolic, Thyroid, Nutrients, Iron, Liver, Kidneys, Inflammation, Blood, Recovery).

**Principle: derived insights are free.** Where the inputs are already measured, we calculate: non-HDL-C, eGFR, transferrin saturation, calculated free testosterone, HOMA-IR, ApoB:ApoA1, TG:HDL. They are tagged "calculated" in the UI and never sold as extra assays.

**Pricing:** not set. All `priceCents` are `null`; the UI renders "Pricing coming soon" until they are.

## 1. Core — a genuinely useful baseline, not a crippled upsell
FBC · fasting glucose, HbA1c · total cholesterol, LDL-C, HDL-C, triglycerides, non-HDL-C (calc) · ALT, AST, ALP, GGT, bilirubin, albumin, total protein · creatinine, eGFR, urea, sodium, potassium, chloride, bicarbonate · ferritin, iron, transferrin, TSAT (calc) · TSH · B12, folate, vitamin D · CRP.
- **Under consideration:** hs-CRP instead of CRP if commercially sensible.

## 2. Complete — the hero
Everything in Core, plus: ApoB, ApoA1, Lp(a), ApoB:ApoA1 (calc), TG:HDL (calc) · FT4, FT3 · testosterone, SHBG, free testosterone (calc), LH, FSH, oestradiol, prolactin · fasting insulin, HOMA-IR (calc) · magnesium, calcium, phosphate, zinc · hs-CRP (replaces CRP).
- **Under consideration:** DHEA-S (cost / clinical rationale).
- Must feel materially better than Core, not "Core + four random tests".

## 3. Hormones — acquisition panel
Initial version is male-oriented; **DECISION:** sex-specific variants later rather than one panel for everyone.
Testosterone, SHBG, free testosterone (calc), LH, FSH, oestradiol, prolactin, DHEA-S · TSH, FT4 · FBC, ferritin, vitamin D, HbA1c · liver panel.
- **Under consideration:** PSA, only where age / use case supports it. Never by default.
- **Marketing guardrail:** measure and understand hormone markers. Never "find out if you need TRT" or any treatment framing.

## 4. Performance — for people who train
FBC · full iron studies · CK · glucose, HbA1c, fasting insulin, HOMA-IR (calc) · kidney/electrolytes · liver · hs-CRP · testosterone, SHBG, free testosterone (calc), cortisol · TSH, FT4, FT3 · vitamin D, B12, folate, magnesium, zinc.
- **Under consideration:** oestradiol (economics), IGF-1 (premium differentiator if cost/value stacks up).
- Answers: "Is there anything measurable holding back my performance, energy or recovery?"

## 5. Longevity — the expensive, differentiated cardiometabolic markers
Core foundation (with hs-CRP), plus: ApoB, ApoA1, Lp(a), ApoB:ApoA1 (calc), TG:HDL (calc) · fasting insulin, HOMA-IR (calc) · uric acid.

## Add-ons (`src/config/addons.ts`)
Keep niche/expensive assays out of base-panel COGS; let customers customise. An add-on is offered on a product only when it adds at least one new marker.

| Add-on | Markers | Status |
|---|---|---|
| Advanced Heart | ApoB, ApoA1, Lp(a) | planned |
| Advanced Hormones | testosterone, SHBG, free T (calc), LH, FSH, oestradiol, prolactin, DHEA-S | planned |
| Thyroid+ | FT3, FT4, thyroid antibodies | planned |
| Nutrients+ | zinc, magnesium, vitamin D, B12, folate | planned |
| Iron+ | ferritin, iron, transferrin, TSAT | planned |
| Performance+ | CK, cortisol, IGF-1 | planned |
| PSA | PSA | under review (age / use case) |

Premium individual markers may follow if 4Cyte / ACL pricing supports them.

## Open items
- **TODO(pricing):** all five panels and all add-ons.
- **TODO-VERIFY:** assay availability and naming with the lab partner; which "calculated" markers the lab reports vs. we compute.
- **DECISION:** hs-CRP in Core; DHEA-S in Complete; oestradiol and IGF-1 in Performance; PSA add-on rules; female hormone variant.
- **Clinical review:** every marker `about` line in `src/config/biomarkers.ts` (measurement language only, no conditions).
