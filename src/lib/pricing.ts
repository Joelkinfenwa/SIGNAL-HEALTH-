/**
 * One pricing function for the configurator, sticky bar, checkout summary and,
 * later, the server. Integer cents throughout. Any line without a price makes
 * the quote incomplete (totalCents null) rather than pretending.
 *
 * Relative imports on purpose so this file runs under `node --test` without a bundler.
 */
import { addonNewMarkers, getAddon, isSellable, type Addon } from "../config/addons";
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
  /** Sum of the lines that do have a price (the base test, once set). */
  pricedSubtotalCents: number;
  unpricedCount: number;
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
    .filter((a): a is Addon => Boolean(a) && product.addonIds.includes(a!.id) && isSellable(a!));
  const lines: QuoteLine[] = [{ kind: "product", id: product.id, label: product.name, priceCents: product.priceCents }];
  for (const a of chosen) lines.push({ kind: "addon", id: a.id, label: a.name, priceCents: a.priceCents });
  if (cfg.collectionMethodId) {
    const c = getCollectionMethod(cfg.collectionMethodId);
    lines.push({ kind: "collection", id: c.id, label: c.name, priceCents: c.priceDeltaCents });
  }
  const pricingComplete = lines.every((l) => l.priceCents !== null);
  const pricedSubtotalCents = lines.reduce((n, l) => n + (l.priceCents ?? 0), 0);
  const sum = pricingComplete ? pricedSubtotalCents : null;
  const markerIds = Array.from(new Set([...product.markerIds, ...chosen.flatMap((a) => addonNewMarkers(a, product))]));
  return {
    lines,
    subtotalCents: sum,
    totalCents: sum,
    pricingComplete,
    pricedSubtotalCents,
    unpricedCount: lines.filter((l) => l.priceCents === null).length,
    markerIds,
    markerCount: markerIds.length,
    categoryCount: groupByCategory(markerIds).length,
    addons: chosen,
  };
}

/**
 * URL form: ?addons=a,b&collection=mobile&rec=c — short, shareable, no health words.
 * `addons` = preselected (in the basket). `rec` = recommended only (highlighted,
 * not in the basket). A landing page decides which it uses; both are architected.
 */
export function serializeConfiguration(cfg: Configuration, opts: { recommendedAddonIds?: string[] } = {}): string {
  const p = new URLSearchParams();
  if (cfg.addonIds.length) p.set("addons", cfg.addonIds.join(","));
  if (cfg.collectionMethodId) p.set("collection", cfg.collectionMethodId);
  const rec = (opts.recommendedAddonIds ?? []).filter((id) => !cfg.addonIds.includes(id));
  if (rec.length) p.set("rec", rec.join(","));
  const s = p.toString();
  return s ? `?${s}` : "";
}

const sellableFor = (product: Product) => (id: string) => {
  const a = getAddon(id);
  return product.addonIds.includes(id) && Boolean(a) && isSellable(a!);
};

/** Recommended-only add-on ids from the URL (?rec=), limited to sellable add-ons of the product. */
export function parseRecommended(params: URLSearchParams, product: Product = signalTest): string[] {
  const ids = (params.get("rec") ?? "").split(",").map((s) => s.trim()).filter(sellableFor(product));
  return Array.from(new Set(ids));
}

export function parseConfiguration(params: URLSearchParams | Record<string, string | string[] | undefined>, product: Product = signalTest): Configuration {
  const get = (k: string) => (params instanceof URLSearchParams ? params.get(k) : (Array.isArray(params[k]) ? params[k]![0] : params[k])) ?? "";
  const addonIds = get("addons").split(",").map((s) => s.trim()).filter(sellableFor(product));
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

/** Total for display: the real total, else "$299 + TBC" while some lines are unpriced, else the fallback. */
export function displayTotal(q: Quote, format: (cents: number) => string, fallback: string): string {
  if (q.totalCents !== null) return format(q.totalCents);
  return q.pricedSubtotalCents > 0 ? `${format(q.pricedSubtotalCents)} + TBC` : fallback;
}
