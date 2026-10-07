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

/**
 * /men funnel page renders (Higgsfield soul_2, 2 Oct 2026). Concept imagery:
 * never presented as real customers or staff. QA each at full size for
 * baked-in text before launch; regenerate any that fail.
 */
const HF2 = `${CDN2}/hf_20261002_020641_`;
const HF3 = `${CDN2}/hf_20261002_02151`;
const HF4 = `${CDN2}/hf_20261002_223925_`;
/** Documentary set (natural light, ordinary people, slight grain). The live set for /men. */
export const menMedia = {
  // Director rejected the coastal-walk-with-dog render (7 Oct). Interim pick below; new candidates in generation.
  hero: { src: `${HF3}9_f3550d8a-e30f-4b60-a920-f1ef23a69559.png`, alt: "A man in his fifties on a back step lacing up running shoes" },
  heroCandidates: {
    coastal: { src: `${HF4}ac7b7aeb-e9bc-48f9-bf0f-15fe6ecd721f.png`, alt: "A man in his early forties on a morning walk along a coastal path with his dog" },
    ute: { src: `${HF4}a48dcfa0-bba8-4677-b013-388097a6a6da.png`, alt: "A man in his mid forties leaning on a ute tailgate after a swim" },
    kitchen: { src: `${HF4}d7e5bde9-8840-4044-abd8-f9012a14f2b5.png`, alt: "A man in his late thirties reading his phone at a kitchen bench with a coffee" },
    bench: { src: `${HF4}118ab605-a04b-42f3-9fd5-29bb91c40e84.png`, alt: "A man around fifty on a park bench after a run" },
    backyard: { src: `${HF3}9_09d761c9-5f96-41ef-bc5d-dca5a18fab8b.png`, alt: "A man in his mid forties in his backyard early in the morning, holding a mug" },
    step: { src: `${HF3}9_f3550d8a-e30f-4b60-a920-f1ef23a69559.png`, alt: "A man in his fifties on a back step lacing up running shoes" },
  },
  // Side photos use the CDN's smaller web renders (_min.webp): the full PNGs are too large for the image optimiser.
  collection: { src: `${HF3}20_3a1f1ee3-5af9-44b7-9433-de57add5f6f2_min.webp`, alt: "A collector's gloved hands placing a small bandage on a man's arm after a blood collection" },
  doctor: { src: `${HF3}20_72f10b4a-3abe-46f1-8744-0a59eb1c1488_min.webp`, alt: "Over the shoulder of a doctor reading a printed results page at a desk" },
  reading: { src: `${HF3}9_a80d67c3-4572-44e8-ba78-a93cbc10789a_min.webp`, alt: "A man at a kitchen table reading a printed report with a cup of tea" },
} as const satisfies Record<string, MediaAsset | Record<string, MediaAsset>>;

/** Earlier polished set, kept for comparison / A-B. */
export const menMediaPolished = {
  hero: { src: `${HF2}855481d0-a7bd-45e5-9556-76d00cf70811.png`, alt: "A man in his forties on a coastal clifftop path at sunrise" },
  heroAlt: {
    kitchen: { src: `${HF2}989e9405-28ca-4ff0-b1cc-da91a59011d7.png`, alt: "A man in his late thirties with a coffee at a bright kitchen bench" },
    swim: { src: `${HF2}daf320d4-529f-41bf-8739-759682526350.png`, alt: "A man around fifty with a towel over his shoulder after an ocean swim" },
  },
  results: { src: `${HF2}8e3cc2b6-0dd8-41e7-935a-c319be0b153a.png`, alt: "A man reading results on his phone on a balcony in morning light" },
  steps: {
    order: { src: `${HF2}51911b51-706a-4d22-9a09-d3b69ccae3ec.png`, alt: "A printed health report and a glass of water on a timber table" },
    draw: { src: `${HF2}1b19a77f-3908-42ae-9fbc-e3b93164c69b.png`, alt: "A collector chatting with a seated man before a blood collection" },
    review: { src: `${HF2}d3cc5d3c-64c9-45cf-bd79-427ffbc4ec87.png`, alt: "A doctor reviewing results on a monitor at a tidy desk" },
    nurse: { src: `${HF2}e5864b89-5609-44f7-b9b8-3c6f523b4684.png`, alt: "A mobile nurse arriving at the front door of a suburban home" },
  },
  close: { src: `${HF2}943ef0dd-448a-4564-a8d6-b50e83f3d27a.png`, alt: "A lone runner at a coastal lookout at dawn above an empty road" },
} as const satisfies Record<string, MediaAsset | Record<string, MediaAsset>>;
