import type { Metadata, Viewport } from "next";
import { Figtree } from "next/font/google";
import type { ReactNode } from "react";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import "./globals.css";

/** Self-hosted and preloaded by Next; no render-blocking Google Fonts stylesheet. */
const figtree = Figtree({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
  variable: "--font-figtree",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"),
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
        {children}
      </body>
    </html>
  );
}
