import "server-only";
import { neon, type NeonQueryFunction } from "@neondatabase/serverless";

/**
 * Postgres (Neon via the Vercel Marketplace). Today it holds one thing: the
 * sequential order number assigned to each paid order. The orders table is
 * the seed of the results workflow. Everything degrades gracefully when the
 * database isn't configured (local, previews): callers fall back.
 */
export const dbConfigured = () => Boolean(process.env.DATABASE_URL || process.env.POSTGRES_URL);

let client: NeonQueryFunction<false, false> | null = null;
let schemaReady: Promise<void> | null = null;

export function sql(): NeonQueryFunction<false, false> | null {
  const url = process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) return null;
  if (!client) client = neon(url);
  return client;
}

/** First order number issued. Later numbers follow on from whatever the sequence has reached. */
export const FIRST_ORDER_NUMBER = 2050;

/** Creates the schema once per process; cheap no-ops after the first run. */
export function ensureSchema(): Promise<void> {
  const q = sql();
  if (!q) return Promise.resolve();
  if (!schemaReady) {
    schemaReady = (async () => {
      // DDL can't take bound parameters, so the start value is a literal (a constant from this file).
      await q.query(`CREATE SEQUENCE IF NOT EXISTS order_number START WITH ${FIRST_ORDER_NUMBER}`);
      await q`CREATE TABLE IF NOT EXISTS orders (
        number integer PRIMARY KEY,
        payment_intent text UNIQUE NOT NULL,
        created_at timestamptz NOT NULL DEFAULT now()
      )`;
    })().catch((err) => { schemaReady = null; throw err; });
  }
  return schemaReady;
}
