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
/* Palette v0.4 (evergreen) re-shoots. */
const CDN2 = "https://d8j0ntlcm91z4.cloudfront.net/user_3B9OPG5IYGeU6GRFFh6iK7fzCIj";

export interface MediaAsset {
  /** Image URL. Empty string = placeholder (no photography yet). */
  src: string;
  alt: string;
  /** Shot brief for photography still to be produced. */
  brief?: string;
}

export interface VideoAsset {
  /** MP4/WebM URL. Empty string = not yet produced; the poster image renders alone. */
  src: string;
  /** Still frame shown before playback, under reduced-motion, and as the LCP image. */
  poster: MediaAsset;
  brief?: string;
}

export const media = {
  heroSwim: {
    src: `${CDN2}/hf_20260929_072654_f017808e-03d4-48ea-8d35-9a2989284097.png`,
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
    src: `${CDN2}/hf_20260929_072633_237539b8-bf3d-4d92-b047-bf48c46dbe97.png`,
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
    src: `${CDN2}/hf_20260929_072655_e6f5b443-9f39-4774-a156-836b94bbac6a.png`,
    alt: "A man in his forties at the end of a morning run, catching his breath by the water",
  },
  performanceHero: {
    src: `${CDN2}/hf_20260929_072654_16041d5a-47b4-481e-8629-0fe06846ba3a.png`,
    alt: "A cyclist mid-climb in early light",
  },
  /** Alternative hero, palette v0.4. Swap into `heroSwim` to A/B the hero photo. */
  heroBalcony: {
    src: `${CDN2}/hf_20260929_072655_fba4e99e-8beb-436d-86c4-57a7b01fbc75.png`,
    alt: "A man in his early thirties on an apartment balcony at sunrise, holding a coffee",
  },
  longevityHero: {
    src: "",
    alt: "A woman in her fifties tending a garden in the late afternoon",
    brief: "Longevity product page. Calm, long-view, warm light. Portrait 4:5.",
  },
} satisfies Record<string, MediaAsset>;

/**
 * Full-bleed homepage hero. Video is optional: until `src` is set the poster
 * image is the hero. Autoplay is muted, looped and hidden under reduced motion.
 * TODO(media): generate the beach-run video (docs/IMAGE_BRIEFS.md) and set `src`.
 */
export const heroVideo: VideoAsset = {
  src: "",
  poster: media.heroSwim,
  brief:
    "8s loop, 16:9, aerial drone footage. A lone runner on an empty winding coastal road, cliffs and open ocean right beside the road, early light, slow forward tracking from behind and above. Muted bone and evergreen tones. No text. The poster image is the same frame as a still.",
};

/** Product page hero image per tier. Placeholders render as colour panels until photography exists. */
export const productHeroMedia: Record<ProductTier, MediaAsset> = {
  core: media.tubes,
  complete: media.heroSwim,
  hormones: media.hormonesHero,
  performance: media.performanceHero,
  longevity: media.longevityHero,
};
