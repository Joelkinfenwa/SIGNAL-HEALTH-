"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import { captureAttribution } from "@/lib/analytics/attribution";
import { track } from "@/lib/analytics/track";

/** Mounted once in the root layout: records UTMs/click ids and page views. */
export function AttributionCapture() {
  const pathname = usePathname();
  useEffect(() => {
    captureAttribution(new URL(window.location.href), document.referrer);
    track({ name: "page_viewed", props: { path: pathname } });
  }, [pathname]);
  return null;
}
