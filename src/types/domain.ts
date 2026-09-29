/**
 * Commerce domain types. These mirror the planned database tables
 * (docs/ARCHITECTURE.md §5). Deliberately contains NO clinical data:
 * no results, symptoms, quiz answers, diagnoses or medications.
 */
import type { CollectionMethod, ProductTier } from "@/config/products";
import type { Attribution } from "@/lib/analytics/attribution";

export type ID = string;
export type ISODate = string;

export interface Customer {
  id: ID;
  email: string;
  phone?: string;
  firstName?: string;
  lastName?: string;
  stripeCustomerId?: string;
  createdAt: ISODate;
}

export type OrderStatus = "pending_payment" | "paid" | "partially_refunded" | "refunded" | "cancelled";
export type OrderSource = "initial" | "retest";
export type BookingStatus = "not_started" | "booked" | "collected" | "cancelled" | "no_show";

export interface Order {
  id: ID;
  customerId: ID;
  productId: string;
  productTier: ProductTier;
  amountCents: number;
  currency: "AUD";
  status: OrderStatus;
  source: OrderSource;
  collectionMethod?: CollectionMethod;
  bookingStatus: BookingStatus;
  /** Reference in the external booking system — the booking itself lives there. */
  bookingRef?: string;
  stripePaymentIntentId?: string;
  retestEnrolmentId?: ID;
  attribution?: Attribution;
  createdAt: ISODate;
}

export type RetestStatus = "pending" | "active" | "paused" | "past_due" | "cancelled";
export type RefundStatus = "not_applicable" | "pending" | "succeeded" | "failed";

export interface RetestEnrolment {
  id: ID;
  customerId: ID;
  originOrderId: ID; // unique — one enrolment per originating order
  productId: string;
  offerId: string;
  offerVersion: number;
  recurringAmountCents: number;
  intervalMonths: number;
  status: RetestStatus;
  stripeSubscriptionId?: string;
  refundAmountCents: number;
  refundStatus: RefundStatus;
  stripeRefundId?: string;
  nextTestDate?: ISODate;
  createdAt: ISODate;
  cancelledAt?: ISODate;
}

export type ConsentType =
  | "retest_billing"
  | "card_storage"
  | "marketing_email"
  | "marketing_sms"
  | "privacy_collection_notice";

/** Append-only. Never updated — a withdrawal is a new row with granted=false. */
export interface ConsentRecord {
  id: ID;
  customerId: ID;
  type: ConsentType;
  granted: boolean;
  /** Version id of the exact wording shown, plus a hash of that wording. */
  textVersion: string;
  textHash: string;
  /** For retest_billing: the offer id/version and quoted amounts shown. */
  context?: Record<string, string | number>;
  ipAddress?: string;
  userAgent?: string;
  createdAt: ISODate;
}

export interface OfferExposure {
  id: ID;
  orderId: ID;
  offerId: string;
  offerVersion: number;
  variant?: string;
  shownAt: ISODate;
  outcome: "accepted" | "declined" | "no_action";
}
