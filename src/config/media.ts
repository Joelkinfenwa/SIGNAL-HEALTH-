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
    src: `${CDN2}/hf_20260929_075332_cd7b768d-acf8-4908-a37e-f7f16dec88d0.png`,
    alt: "A collector visiting a smiling man at his kitchen table for a blood test",
  },
  couple: {
    src: `${CDN2}/hf_20260929_075332_4fa91809-5c02-43c1-8665-d616c07f7b4c.png`,
    alt: "A couple in their sixties laughing together on a bushwalk",
  },
  tubes: {
    src: `${CDN2}/hf_20260929_072633_237539b8-bf3d-4d92-b047-bf48c46dbe97.png`,
    alt: "Three glass sample tubes glowing in morning sunlight",
  },
  phone: {
    src: `${CDN2}/hf_20260929_075331_630dd0a4-779d-423b-87b2-9d9785c691ac.png`,
    alt: "A woman on a sunlit window seat reading her results on her phone",
  },

  /* ---- Placeholder slots: photography still needed ---- */
  nurseArrival: {
    src: `${CDN2}/hf_20260929_075331_cf4fe854-0ec1-4680-a47d-5ce24272847a.png`,
    alt: "A collector arriving at a front door with a small collection kit, morning light",
  },
  collectionCentre: {
    src: `${CDN2}/hf_20260929_075331_38c4c4a0-867e-4d43-adc5-614c912f1068.png`,
    alt: "A bright, calm collection centre reception",
  },
  chooseTest: {
    src: `${CDN2}/hf_20260929_075332_0b72036f-0626-472c-a43e-0c42789b699e.png`,
    alt: "Someone at a kitchen bench choosing a test on their phone over coffee",
  },
  hormonesHero: {
    src: `${CDN2}/hf_20260929_072655_e6f5b443-9f39-4774-a156-836b94bbac6a.png`,
    alt: "A man in his forties at the end of a morning run, catching his breath by the water",
  },
  performanceHero: {
    src: `${CDN2}/hf_20260929_072654_16041d5a-47b4-481e-8629-0fe06846ba3a.png`,
    alt: "A cyclist mid-climb in early light",
  },
  /** Hero poster / LCP still: aerial coastal-road runner (matches the hero video). */
  heroRoad: {
    src: `${CDN2}/hf_20260929_075331_a7165443-2e01-4d96-bc55-29babf7294b3.png`,
    alt: "Aerial view of a lone runner on an empty coastal road beside the ocean at sunrise",
  },
  /** Alternative hero, palette v0.4. */
  heroBalcony: {
    src: `${CDN2}/hf_20260929_072655_fba4e99e-8beb-436d-86c4-57a7b01fbc75.png`,
    alt: "A man in his early thirties on an apartment balcony at sunrise, holding a coffee",
  },
  longevityHero: {
    src: `${CDN2}/hf_20260929_075332_66a73319-6bbf-4e9f-aa34-c3a28323e903.png`,
    alt: "A woman in her fifties tending a garden in the late afternoon",
  },
} satisfies Record<string, MediaAsset>;

/**
 * Full-bleed homepage hero. Video is optional: until `src` is set the poster
 * image is the hero. Autoplay is muted, looped and hidden under reduced motion.
 * TODO(launch): re-encode to 720p H.264 under ~2 MB and self-host; the current file is the raw render.
 */
/** Two renders of the same brief. `heroVideo` is the active one; swap the src to A/B. */
export const heroVideoRenders = {
  /** Wide: runner small in frame, road and ocean dominate. */
  wide: `${CDN2}/hf_20260929_075330_d10281af-cd07-44f4-a2c6-82b1e46c80d1.mp4`,
  /** Tight: drone ~12 m behind, runner mid-sized lower right. */
  tight: `${CDN2}/hf_20260929_081235_fec0a1de-a473-4b47-b04e-82cbf57ec180.mp4`,
} as const;

export const heroVideo: VideoAsset = {
  src: heroVideoRenders.tight,
  poster: media.heroRoad,
  brief:
    "8s loop, 16:9, aerial drone footage. A lone runner on an empty winding coastal road, cliffs and open ocean right beside the road, early light, slow forward tracking from behind and above. Muted bone and evergreen tones. No text. The poster image is the same frame as a still.",
};

/** THE SIGNAL TEST imagery: hero and supporting shots for /signal and the product card. */
export const signalMedia = {
  /** Swapped to the known-clean ocean-pool shot; the previous render carried baked-in text. */
  hero: media.heroSwim,
  kit: media.tubes,
  collection: media.homeVisit,
  results: media.phone,
  /** Replacement candidates for `hero` (generated with an explicit no-text instruction). Swap `hero` to one once approved. */
  heroCandidates: {
    poolEdge: { src: `${CDN2}/hf_20260929_231943_7b649b21-28d3-4e55-a98d-2bb9fe85eed7.png`, alt: "A woman at the edge of a calm ocean pool at sunrise, looking out to sea" },
    towel: { src: `${CDN2}/hf_20260929_231943_ba7ddc31-0839-40c8-9f25-ed3392b4b867.png`, alt: "A man towelling off on the rocks beside an ocean pool after a morning swim" },
    kitStill: { src: `${CDN2}/hf_20260929_231944_c41c4afc-b7fa-4ece-baa5-50397169df8a.png`, alt: "A collection kit box, three sample tubes and a folded linen cloth on pale stone" },
  },
  /** Spare wide shots for landing pages. */
  wide: {
    walk: { src: `${CDN2}/hf_20260929_083019_4d74607b-e127-4874-888c-b2aa0bb32f8c.png`, alt: "A couple walking their dog along a clifftop path above the ocean at sunrise" },
    bench: { src: `${CDN2}/hf_20260929_083020_08354ecb-11ab-4215-8679-183a750d0750.png`, alt: "A man on a harbour bench at dawn after a run" },
    climb: { src: `${CDN2}/hf_20260929_083019_19afa94e-39a5-4ab3-8342-325043fc8c12.png`, alt: "A cyclist cresting a coastal climb in early light" },
    laps: { src: `${CDN2}/hf_20260929_083019_df5afcf9-8a02-4c13-8649-050e275d0940.png`, alt: "A couple swimming slow laps in an ocean pool in late afternoon light" },
  },
} as const;
