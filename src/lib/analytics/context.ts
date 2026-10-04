/**
 * Analytics context: attached to every event by track(). Persisted in a
 * session cookie so the landing page and experiment a visitor arrived on
 * follow them to checkout. First-party only: the ad-platform allowlist in
 * events.ts never includes these keys.
 */
export interface AnalyticsContext {
  lp_slug?: string;
  experiment_id?: string;
  variant?: string;
}

const COOKIE = "sig_ctx";

export function readAnalyticsContext(): AnalyticsContext {
  if (typeof document === "undefined") return {};
  const raw = document.cookie.split("; ").find((c) => c.startsWith(`${COOKIE}=`));
  if (!raw) return {};
  try {
    return JSON.parse(decodeURIComponent(raw.slice(COOKIE.length + 1))) as AnalyticsContext;
  } catch {
    return {};
  }
}

export function setAnalyticsContext(patch: AnalyticsContext): void {
  if (typeof document === "undefined") return;
  const next = { ...readAnalyticsContext(), ...patch };
  for (const k of Object.keys(next) as (keyof AnalyticsContext)[]) if (next[k] === undefined) delete next[k];
  document.cookie = `${COOKIE}=${encodeURIComponent(JSON.stringify(next))}; Max-Age=${30 * 86400}; Path=/; SameSite=Lax; Secure`;
}
