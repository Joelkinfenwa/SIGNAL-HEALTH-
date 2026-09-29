/**
 * One pricing function for the configurator, sticky bar, checkout summary and,
 * later, the server. Integer cents throughout. Any line without a price makes
 * the quote incomplete (totalCents null) rather than pretending.
 *
 * Relative imports on purpose so this file runs under `node --test` without a bundler.
 */
import { addonNewMarkers, getAddon, type Addon } from "../config/addons";
import { getCollectionMethod, type CollectionMethodId } from "../config/collection";
import { groupByCategory } from "../config/biomarkers";
import { getProduct, signalTest, type Product } from "../config/products";

export interface Configuration {
  productId: string;
  addonIds: string[];
  collectionMethodId?: CollectionMethodId;
}

export interface QuoteLine {
  kind: "product" | "addon" | "collection";
  id: string;
  label: string;
  priceCents: number | null;
}

export interface Quote {
  lines: QuoteLine[];
  subtotalCents: number | null;
  totalCents: number | null;
  /** False while any line has no price yet. */
  pricingComplete: boolean;
  markerIds: string[];
  markerCount: number;
  categoryCount: number;
  addons: Addon[];
}

export function defaultConfiguration(product: Product = signalTest): Configuration {
  return { productId: product.id, addonIds: [] };
}

export function quoteConfiguration(cfg: Configuration): Quote {
  const product = getProduct(cfg.productId) ?? signalTest;
  const chosen = cfg.addonIds
    .map(getAddon)
    .filter((a): a is Addon => Boolean(a) && product.addonIds.includes(a!.id) && a!.status !== "under-review");
  const lines: QuoteLine[] = [{ kind: "product", id: product.id, label: product.name, priceCents: product.priceCents }];
  for (const a of chosen) lines.push({ kind: "addon", id: a.id, label: a.name, priceCents: a.priceCents });
  if (cfg.collectionMethodId) {
    const c = getCollectionMethod(cfg.collectionMethodId);
    lines.push({ kind: "collection", id: c.id, label: c.name, priceCents: c.priceDeltaCents });
  }
  const pricingComplete = lines.every((l) => l.priceCents !== null);
  const sum = pricingComplete ? lines.reduce((n, l) => n + (l.priceCents ?? 0), 0) : null;
  const markerIds = Array.from(new Set([...product.markerIds, ...chosen.flatMap((a) => addonNewMarkers(a, product))]));
  return {
    lines,
    subtotalCents: sum,
    totalCents: sum,
    pricingComplete,
    markerIds,
    markerCount: markerIds.length,
    categoryCount: groupByCategory(markerIds).length,
    addons: chosen,
  };
}

/** URL form: ?addons=a,b&collection=mobile — short, shareable, no health words. */
export function serializeConfiguration(cfg: Configuration): string {
  const p = new URLSearchParams();
  if (cfg.addonIds.length) p.set("addons", cfg.addonIds.join(","));
  if (cfg.collectionMethodId) p.set("collection", cfg.collectionMethodId);
  const s = p.toString();
  return s ? `?${s}` : "";
}

export function parseConfiguration(params: URLSearchParams | Record<string, string | string[] | undefined>, product: Product = signalTest): Configuration {
  const get = (k: string) => (params instanceof URLSearchParams ? params.get(k) : (Array.isArray(params[k]) ? params[k]![0] : params[k])) ?? "";
  const addonIds = get("addons").split(",").map((s) => s.trim()).filter((id) => product.addonIds.includes(id));
  const collection = get("collection");
  return {
    productId: product.id,
    addonIds: Array.from(new Set(addonIds)),
    collectionMethodId: collection === "centre" || collection === "mobile" ? collection : undefined,
  };
}

export function toggleAddon(cfg: Configuration, addonId: string): Configuration {
  const has = cfg.addonIds.includes(addonId);
  return { ...cfg, addonIds: has ? cfg.addonIds.filter((a) => a !== addonId) : [...cfg.addonIds, addonId] };
}
