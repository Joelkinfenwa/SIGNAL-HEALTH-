import type { MetadataRoute } from "next";
import { products } from "@/config/products";
export default function sitemap(): MetadataRoute.Sitemap {
  const base = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";
  return [
    { url: base, priority: 1 },
    { url: `${base}/tests`, priority: 0.9 },
    ...products.map((p) => ({ url: `${base}/tests/${p.slug}`, priority: 0.9 })),
    { url: `${base}/find-my-test`, priority: 0.8 },
    { url: `${base}/retesting`, priority: 0.6 },
  ];
}
