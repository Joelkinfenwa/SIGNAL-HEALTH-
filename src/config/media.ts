/**
 * Campaign imagery.
 *
 * CONCEPT IMAGERY: these are AI-generated concept images for design review.
 * Before launch, replace with licensed photography (or confirm usage rights),
 * host them in /public or an asset CDN, and never present them as real customers.
 */
const CDN = "https://d8j0ntlcm91z4.cloudfront.net/user_3DvAn6uMIdEntCnt7P71oSjYfdu";

export interface MediaAsset {
  src: string;
  alt: string;
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
} satisfies Record<string, MediaAsset>;
