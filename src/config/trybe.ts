/**
 * Trybe creator-attribution pixel. These values are public (they ship in the
 * page), so they live here; the pixel only loads when
 * NEXT_PUBLIC_TRYBE_PIXEL_CODE is set, which keeps previews quiet.
 */
export const trybe = {
  pixelCode: process.env.NEXT_PUBLIC_TRYBE_PIXEL_CODE,
  storeId: "00fa0499-92ec-469f-8470-4d55e30d8004",
  /** First-party tracking host (CNAME to proxy.jointrybe.com), bypasses ad blockers. */
  trackDomain: "track.signaltest.com.au",
  serviceUrl: "https://prod-trybe-platform-6mi3j.ondigitalocean.app/attribution",
  platform: "CUSTOM",
  autoTracking: "false",
};
