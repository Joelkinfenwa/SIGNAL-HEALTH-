/**
 * How a customer gets collected after paying.
 *
 * LAUNCH MODEL: walk-in. Participating collection centres accept the request
 * form without an appointment, so there is no booking system in the loop.
 * Customers are sent to the Express Pathology locations page. Home or
 * workplace visits are arranged by phone: the internal order notification
 * (ORDER_NOTIFY_EMAIL) tells the team to call.
 *
 * If a booking system is introduced later, set NEXT_PUBLIC_BOOKING_URL and
 * the "Book my collection" CTA takes over; the order reference is appended
 * as ?ref= so bookings reconcile to orders.
 */
export const bookingBaseUrl = process.env.NEXT_PUBLIC_BOOKING_URL ?? null;
export const bookingUrlFor = (orderId: string): string | null =>
  bookingBaseUrl ? `${bookingBaseUrl}${bookingBaseUrl.includes("?") ? "&" : "?"}ref=${encodeURIComponent(orderId)}` : null;

/** Absolute URL of the collection page, for emails and the request form. */
export const collectUrl = () => `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://signaltest.com.au"}/collect`;

export const walkIn = {
  /** Our own page: lists the two participating laboratories and nothing else. */
  locationsUrl: "/collect",
  centre: {
    cta: "Find a collection centre",
    note: "No appointment needed. Take your request form and photo ID to any 4Cyte Pathology or Australian Clinical Labs collection centre, at a time that suits you. No other laboratory will accept your form.",
  },
  mobile: {
    note: "We'll call you within one business day to arrange your home or workplace visit at a time that suits you.",
    /** How long the team has to make that call. */
    callWithin: "one business day",
  },
};
