# Image briefs — palette v0.4 (evergreen)

Prompts for the Higgsfield `soul_2` model (quality 2k), one per slot in `src/config/media.ts`. Style rules for every shot: editorial lifestyle, natural light, cool bone and evergreen tones, a single muted coral detail at most, Australian settings, candid and premium, no text, no logos, no visible needles, never presented as real customers. Concept imagery only until licensed photography exists.

| # | Slot | Ratio | Prompt |
|---|---|---|---|
| 0 | `heroSwim` (re-shoot) | 3:4 | Editorial lifestyle photograph, Sydney ocean pool at sunrise. A woman in her mid-thirties laughing, wrapped in an oatmeal linen towel after a swim, wet hair, sea and pale rock behind her. Cool natural light, soft greens and bone tones, muted coral swimsuit strap. Candid, warm, premium health brand, shallow depth of field, no text, no logos. |
| 1 | `homeVisit` (re-shoot) | 3:4 | Editorial lifestyle photograph inside a bright Australian kitchen. A friendly blood collector in a dark green polo shirt sits at a timber table with a smiling man in his forties, small collection kit beside them, calm and relaxed, morning window light, potted plants, bone and sage tones. Candid, reassuring, premium health brand, no text, no logos, no visible needles. |
| 2 | `couple` (re-shoot) | 16:9 | Editorial lifestyle photograph, coastal bushwalk in Australia. A couple in their sixties laughing together on a track between eucalyptus trees with the sea behind, late afternoon light, muted greens and bone tones, linen clothing. Candid, warm, vitality, premium health brand, no text, no logos. |
| 3 | `tubes` (re-shoot) | 3:4 | Minimal still life photograph: three small glass sample tubes standing on pale bone linen, one with a small coral cap, soft morning window light casting long shadows, a sprig of eucalyptus out of focus. Clean, calm, premium, no text, no labels, no logos. |
| 4 | `phone` (re-shoot) | 3:4 | Editorial lifestyle photograph. A woman in her late twenties sitting on a sunlit window seat reading something on her phone, small smile, indoor plants and green foliage outside the window, bone and sage tones, cool natural light. Candid, calm, premium health brand, phone screen not visible, no text, no logos. |
| 5 | `nurseArrival` | 3:4 | Editorial lifestyle photograph at a suburban Australian front door in the morning. A blood collector in a dark green polo with a small kit bag is greeted with a smile by a woman in her forties, native garden with greenery around the porch, soft daylight, bone and evergreen tones. Candid, welcoming, premium health brand, no text, no logos. |
| 6 | `collectionCentre` | 3:2 | Architectural interior photograph of a calm, bright pathology collection centre reception. Pale timber counter, bone walls, sage green accent wall, indoor plants, comfortable chairs, soft daylight, uncluttered and premium. No people, no text, no signage, no logos. |
| 7 | `chooseTest` | 1:1 | Editorial lifestyle photograph, close crop. Hands holding a phone over a kitchen bench beside a flat white coffee, morning light, bone linen sleeve, a sprig of greenery, relaxed decisive moment. Phone screen out of focus, no visible text, no logos, premium health brand. |
| 8 | `hormonesHero` | 3:4 | Editorial lifestyle photograph. A man in his mid-forties at the end of a morning run beside Sydney harbour water, catching his breath with a calm confident smile, hands on hips, muted green running top, cool early light, harbour and foliage behind. Candid, not gym-bro, premium health brand, no text, no logos. |
| 9 | `performanceHero` | 3:4 | Editorial sports photograph. A road cyclist mid-climb on a winding forest road in early light, effort and focus, muted evergreen and bone kit, mist between tall trees, coral detail on the helmet. Real athlete feel, not stock, premium health brand, no text, no logos. |
| 10 | `longevityHero` | 3:4 | Editorial lifestyle photograph. A woman in her mid-fifties tending a lush vegetable garden in late afternoon light, linen shirt, gentle contented expression, greens and bone tones, long shadows. Calm, long-view, warmth, premium health brand, no text, no logos. |
| 11 | hero alternative | 3:4 | Editorial lifestyle photograph. A man in his early thirties on an apartment balcony at sunrise holding a coffee, relaxed genuine smile, city greenery and morning haze behind, bone linen shirt, cool light. Candid, aspirational, premium health brand, no text, no logos. |

## After generating
1. Pick the keepers; note the Higgsfield job ids.
2. Paste each CDN `src` into the matching slot in `src/config/media.ts` (slots with `src: ""` stop rendering the colour panel automatically).
3. Before launch: move files to `/public` or the final CDN, remove the temporary host from `next.config.ts`, confirm usage rights.

Status 2026-09-29: batch submission blocked by the account's daily generation limit (grace period). Re-run when it resets.
