import { getCloudflareContext } from "@opennextjs/cloudflare";

/** The D1 database bound as `DB` in wrangler.jsonc (local .wrangler/state in dev, hosted D1 on Fredrin hosting). */
export async function getDB(): Promise<D1Database> {
  const { env } = await getCloudflareContext({ async: true });
  return env.DB;
}
