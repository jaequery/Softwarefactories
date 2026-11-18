import { headers } from "next/headers";

export const SITE_NAME = "Software Factories";

/** Absolute origin of the current request (works on any *.fredrin.dev or custom domain, and localhost). */
export async function getSiteUrl(): Promise<string> {
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (/^(localhost|127\.0\.0\.1)(:|$)/.test(host) ? "http" : "https");
  return `${proto.split(",")[0].trim()}://${host}`;
}
