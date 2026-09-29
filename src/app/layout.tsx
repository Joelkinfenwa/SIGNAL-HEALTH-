import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { AttributionCapture } from "@/components/analytics/AttributionCapture";
import "./globals.css";

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
  themeColor: "#fbf9f6",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en-AU">
      <head>
        {/* TODO(production): switch to next/font/google for self-hosted, preloaded fonts. */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="" />
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Figtree:wght@400;500;600;700&display=swap"
        />
      </head>
      <body>
        <a className="skip-link" href="#main">Skip to content</a>
        <AttributionCapture />
        {children}
      </body>
    </html>
  );
}
