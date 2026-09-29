/**
 * First-party attribution capture. Stores first-touch and last-touch marketing
 * parameters in a first-party cookie so they survive navigation and can be
 * attached to the order at checkout (and passed to Stripe metadata + CAPI).
 */
const KEYS = [
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_term",
  "utm_content",
  "gclid",
  "gbraid",
  "wbraid",
  "fbclid",
] as const;

type Key = (typeof KEYS)[number];
export type Touch = Partial<Record<Key, string>> & { landing_path: string; referrer?: string; ts: string };
export interface Attribution {
  first?: Touch;
  last?: Touch;
}

const COOKIE = "sig_attr";
const MAX_AGE_DAYS = 90;

function readCookie(): Attribution | null {
  if (typeof document === "undefined") return null;
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return null;
  try {
    return JSON.parse(decodeURIComponent(raw.slice(COOKIE.length + 1))) as Attribution;
  } catch {
    return null;
  }
}

function writeCookie(value: Attribution) {
  const v = encodeURIComponent(JSON.stringify(value));
  document.cookie = `${COOKIE}=${v}; Max-Age=${MAX_AGE_DAYS * 86400}; Path=/; SameSite=Lax; Secure`;
}

export function captureAttribution(url: URL, referrer: string): void {
  const params: Partial<Record<Key, string>> = {};
  for (const k of KEYS) {
    const v = url.searchParams.get(k);
    if (v) params[k] = v.slice(0, 200);
  }
  const hasCampaign = Object.keys(params).length > 0;
  const existing = readCookie() ?? {};
  const externalReferrer = referrer && !referrer.startsWith(url.origin) ? referrer : undefined;

  // Only record a touch when there is campaign data or an external referrer.
  if (!hasCampaign && !externalReferrer && existing.first) return;

  const touch: Touch = { ...params, landing_path: url.pathname, referrer: externalReferrer, ts: new Date().toISOString() };
  writeCookie({ first: existing.first ?? touch, last: touch });
}

export const readAttribution = readCookie;
