/**
 * Campaign imagery.
 *
 * CONCEPT IMAGERY: these are AI-generated concept images for design review.
 * Before launch, replace with licensed photography (or confirm usage rights),
 * host them in /public or an asset CDN, and never present them as real customers.
 *
 * Slots with an empty `src` are PLACEHOLDERS: photography is still needed.
 * `brief` describes the shot to commission. The Photo component renders a warm
 * colour panel in place of the image until a `src` is supplied.
 */
import type { ProductTier } from "./products";

const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3DvAn6uMIdEntCnt7P71oSjYfdu";

export interface MediaAsset {
  /** Image URL. Empty string = placeholder (no photography yet). */
  src: string;
  alt: string;
  /** Shot brief for photography still to be produced. */
  brief?: string;
}

export const media = {
  heroSwim: {
    src: `${CDN}/hf_20260929_053507_8607325b-c3af-4c42-907e-61534a225f19.png`,
    alt: "A woman laughing after an early morning swim at an ocean pool, wrapped in a towel",
  },
  homeVisit: {
    src: `${CDN}/hf_20260929_053507_3c45dfb1-d16f-41cb-b436-019594094b2f.png`,
    alt: "A collector visiting a smiling man at his kitchen table for a blood test",
  },
  couple: {
    src: `${CDN}/hf_20260929_053507_54153659-6e62-4ef0-9464-e83c2573f010.png`,
    alt: "A couple in their sixties laughing together on a bushwalk",
  },
  tubes: {
    src: `${CDN}/hf_20260929_053507_fbdf36dd-62e5-4b3d-b17e-24b3e886b05b.png`,
    alt: "Three glass sample tubes glowing in morning sunlight",
  },
  phone: {
    src: `${CDN}/hf_20260929_053507_43837262-2473-4190-a796-69e08a913b34.png`,
    alt: "A woman on a sunlit window seat reading her results on her phone",
  },

  /* ---- Placeholder slots: photography still needed ---- */
  nurseArrival: {
    src: "",
    alt: "A collector arriving at a front door with a small collection kit, morning light",
    brief:
      "Postcode checker section. A collector in Express Pathology uniform greeted at a suburban front door. Warm, candid, morning light. Portrait 4:5.",
  },
  collectionCentre: {
    src: "",
    alt: "A bright, calm collection centre reception",
    brief: "Alternative for the postcode checker when mobile collection is unavailable. Bright, uncluttered reception. Landscape 3:2.",
  },
  chooseTest: {
    src: "",
    alt: "Someone at a kitchen bench choosing a test on their phone over coffee",
    brief: "How it works, step 1. Relaxed, decisive moment. Hands, phone, coffee. Square 1:1.",
  },
  hormonesHero: {
    src: "",
    alt: "A man in his forties at the end of a morning run, catching his breath by the water",
    brief: "Hormones product page. Candid, confident, not gym-bro. Portrait 4:5.",
  },
  performanceHero: {
    src: "",
    alt: "A cyclist mid-climb in early light",
    brief: "Performance product page. Effort and focus, real athlete, not stock. Portrait 4:5.",
  },
  longevityHero: {
    src: "",
    alt: "A woman in her fifties tending a garden in the late afternoon",
    brief: "Longevity product page. Calm, long-view, warm light. Portrait 4:5.",
  },
} satisfies Record<string, MediaAsset>;

/** Product page hero image per tier. Placeholders render as colour panels until photography exists. */
export const productHeroMedia: Record<ProductTier, MediaAsset> = {
  core: media.tubes,
  complete: media.heroSwim,
  hormones: media.hormonesHero,
  performance: media.performanceHero,
  longevity: media.longevityHero,
};
