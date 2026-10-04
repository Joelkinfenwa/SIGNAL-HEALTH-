import type { NextConfig } from "next";

const securityHeaders = [
  { key: "Strict-Transport-Security", value: "max-age=63072000; includeSubDomains; preload" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "Permissions-Policy", value: "camera=(), microphone=(), geolocation=(self)" },
];

const nextConfig: NextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ["image/avif", "image/webp"],
    // Concept imagery host. Remove once images move to /public or the final CDN.
    remotePatterns: [{ protocol: "https", hostname: "d8j0ntlcm91z4.cloudfront.net" }],
    unoptimized: process.env.IMAGES_UNOPTIMIZED === "1",
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
  async redirects() {
    return [
      { source: "/tests", destination: "/signal", permanent: true },
      { source: "/tests/:slug", destination: "/signal", permanent: true },
      { source: "/find-my-test", destination: "/find-my-signal", permanent: true },
      { source: "/checkout/:slug", destination: "/checkout", permanent: false },
    ];
  },
};

export default nextConfig;
