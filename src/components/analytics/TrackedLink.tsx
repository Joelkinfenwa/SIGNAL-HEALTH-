"use client";

import Link from "next/link";
import type { ComponentProps } from "react";
import type { AnalyticsEvent } from "@/lib/analytics/events";
import { track } from "@/lib/analytics/track";

type Props = ComponentProps<typeof Link> & { event?: AnalyticsEvent };

/** next/link that emits a typed analytics event on click. */
export function TrackedLink({ event, onClick, ...props }: Props) {
  return (
    <Link
      {...props}
      onClick={(e) => {
        if (event) track(event);
        onClick?.(e);
      }}
    />
  );
}
