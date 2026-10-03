/**
 * Collection booking. The booking system lives outside this site (Express
 * Pathology). NEXT_PUBLIC_BOOKING_URL is the base link customers use; the
 * order reference is appended as ?ref= so bookings reconcile to orders.
 * Until it is set, the order page and email say the link is coming.
 */
export const bookingBaseUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? null;
export const bookingUrlFor = (orderId: string): string | null =>
  bookingBaseUrl ? `${bookingBaseUrl}${bookingBaseUrl.includes("?") ? "&" : "?"}ref=${encodeURIComponent(orderId)}` : null;
