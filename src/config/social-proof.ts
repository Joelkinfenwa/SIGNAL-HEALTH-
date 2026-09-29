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

/** Empty by default. Add real, approved content only. */
export const pressLogos: PressLogo[] = [];
export const approvedReviews: ApprovedReview[] = [];
export const ugcVideos: UgcVideo[] = [];
export const creatorQuotes: CreatorQuote[] = [];

export const hasSocialProof = () =>
  pressLogos.some((l) => l.approved) || approvedReviews.length > 0 || ugcVideos.length > 0 || creatorQuotes.length > 0;
