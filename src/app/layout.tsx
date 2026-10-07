import type { Metadata, Viewport } from "next";
import localFont from "next/font/local";
import type { ReactNode } from "react";
import { Analytics } from "@/components/analytics/Analytics";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import { PreviewPricingBanner } from "@/components/layout/PreviewPricingBanner";
import "./globals.css";

/**
 * Figtree, bundled with the site (variable font, latin subset, OFL licence).
 * Served from our own domain and preloaded by Next. Bundling it, rather than
 * fetching from Google at build time, means a build can never fail or stall
 * on Google Fonts being unreachable.
 */
const figtree = localFont({
  src: [
    { path: "./fonts/figtree-latin.woff2", weight: "300 900", style: "normal" },
    { path: "./fonts/figtree-latin-italic.woff2", weight: "300 900", style: "italic" },
  ],
  display: "swap",
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
  // Meta Business domain verification for signaltest.com.au (Business Settings → Domains).
  verification: { other: { "facebook-domain-verification": "24c1jmeubq5g5mra1cv3xhpeel6ub1" } },
  title: {
    default: "SIGNAL by Express Pathology | Advanced blood testing, made simple",
    template: "%s | SIGNAL by Express Pathology",
  },
  description:
    "Choose a blood test, have your blood collected at home or at a collection centre, and understand the biomarkers that matter.",
  openGraph: { type: "website", locale: "en_AU", siteName: "SIGNAL by Express Pathology" },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f5f1",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU" className={figtree.variable}>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <AttributionCapture />
        <Analytics />
        <PreviewPricingBanner />
        {children}
      </body>
    </html>
  );
}
