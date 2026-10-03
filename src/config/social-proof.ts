/**
 * Social proof. The section renders ONLY when approved content exists here.
 *
 * COMPLIANCE (Australia):
 *  - No testimonials about health outcomes.
 *  - No invented statistics, ratings, member counts or "most popular" labels.
 *  - Press logos require permission to use the publication's mark.
 *  - Every review must be a real, approved quote about the service experience
 *    (booking, collection, clarity of results), never about health outcomes.
 */
export interface PressLogo {
  id: string;
  name: string;
  /** SVG or PNG path in /public. */
  src: string;
  /** Link to the article, if any. */
  href?: string;
  /** Set to true only once permission to use the mark is on file. */
  approved: boolean;
}

export interface ApprovedReview {
  id: string;
  quote: string;
  /** First name and initial, or "Verified customer". */
  attribution: string;
  /** Who approved this for publication and when. */
  approvedBy: string;
  approvedOn: string;
}

export interface UgcVideo {
  id: string;
  /** Creator handle, with permission on file. */
  creator: string;
  /** Hosted video URL and poster; both self-hosted before launch. */
  src: string;
  poster: string;
  /** One line of what the creator says, quoted exactly. */
  quote: string;
  approvedBy: string;
  approvedOn: string;
}

export interface CreatorQuote {
  id: string;
  creator: string;
  quote: string;
  approvedBy: string;
  approvedOn: string;
}

export interface FeaturedTestimonial extends ApprovedReview {
  /** First name only. */
  name: string;
  age?: number;
  location?: string;
  /** Path in /public, with the person's written permission on file. */
  photo?: string;
}

/** Empty by default. Add real, approved content only. */
export const pressLogos: PressLogo[] = [];
export const approvedReviews: ApprovedReview[] = [];
export const featuredTestimonials: FeaturedTestimonial[] = [];

/**
 * PREVIEW-ONLY layout placeholders for the funnel proof section. Clearly
 * labelled, never rendered in production, never to be mistaken for real
 * customers. Replace by filling featuredTestimonials / approvedReviews.
 */
export const placeholderTestimonials: FeaturedTestimonial[] = [
  // Tile template: short, raw, specific win. e.g. "I finally understood which numbers were fine and what I actually needed to work on. The written plan made it simple." — James, 42, Brisbane
  { id: "ph-1", name: "[First name]", age: 42, location: "[City]", quote: "[PLACEHOLDER. Real quote about clarity: which numbers were fine, what to work on, how simple the plan was.]", attribution: "[First name], 42, [City]", approvedBy: "PLACEHOLDER", approvedOn: "" },
  { id: "ph-2", name: "[First name]", age: 36, location: "[City]", quote: "[PLACEHOLDER. Real quote about speed: how quickly results and the review came back.]", attribution: "[First name], 36, [City]", approvedBy: "PLACEHOLDER", approvedOn: "" },
  { id: "ph-3", name: "[First name]", age: 51, location: "[City]", quote: "[PLACEHOLDER. Real quote about ease: ordering, booking and the blood draw.]", attribution: "[First name], 51, [City]", approvedBy: "PLACEHOLDER", approvedOn: "" },
];
export const placeholderReviews: ApprovedReview[] = Array.from({ length: 6 }, (_, i) => ({ id: `phr-${i}`, quote: "[Placeholder short quote about the service experience.]", attribution: "[Name], [City]", approvedBy: "PLACEHOLDER", approvedOn: "" }));
export const ugcVideos: UgcVideo[] = [];
export const creatorQuotes: CreatorQuote[] = [];

export const hasSocialProof = () =>
  pressLogos.some((l) => l.approved) || approvedReviews.length > 0 || ugcVideos.length > 0 || creatorQuotes.length > 0;
