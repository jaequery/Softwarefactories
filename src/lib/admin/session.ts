/**
 * Admin session tokens, built only on Web Crypto so they run unchanged on Cloudflare Workers and in Node.
 * A token is `v1.<expiresAtMs>.<base64url HMAC-SHA-256 of "v1.<expiresAtMs>">`.
 * This module has no Next.js imports; `auth.ts` wires it to cookies and env.
 */

export const SESSION_COOKIE = "sf_admin_session";
export const SESSION_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

const encoder = new TextEncoder();

function toBase64Url(bytes: ArrayBuffer): string {
  let bin = "";
  for (const b of new Uint8Array(bytes)) bin += String.fromCharCode(b);
  return btoa(bin).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}

async function hmacKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
}

async function hmac(secret: string, message: string): Promise<ArrayBuffer> {
  return crypto.subtle.sign("HMAC", await hmacKey(secret), encoder.encode(message));
}

/** Compare two byte buffers without an early exit on the first difference. */
function equalBytes(a: ArrayBuffer, b: ArrayBuffer): boolean {
  const x = new Uint8Array(a);
  const y = new Uint8Array(b);
  let diff = x.length ^ y.length;
  for (let i = 0; i < Math.max(x.length, y.length); i++) diff |= (x[i] ?? 0) ^ (y[i] ?? 0);
  return diff === 0;
}

/**
 * Constant-time string comparison: both inputs are HMAC'd with a one-off random key first, so the
 * comparison always runs over two 32-byte digests and leaks neither the length nor a matching prefix.
 */
export async function timingSafeEqualStrings(a: string, b: string): Promise<boolean> {
  const key = await crypto.subtle.generateKey({ name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const [da, db] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);
  return equalBytes(da, db);
}

export async function createSessionToken(secret: string, now = Date.now()): Promise<string> {
  const payload = `v1.${now + SESSION_TTL_SECONDS * 1000}`;
  return `${payload}.${toBase64Url(await hmac(secret, payload))}`;
}

/** True only for a well-formed, unexpired token whose signature matches `secret`. */
export async function verifySessionToken(token: string | undefined, secret: string, now = Date.now()): Promise<boolean> {
  if (!token) return false;
  const m = /^(v1\.(\d{1,15}))\.([A-Za-z0-9_-]{43})$/.exec(token);
  if (!m) return false;
  const [, payload, exp, sig] = m;
  const expected = toBase64Url(await hmac(secret, payload));
  if (!(await timingSafeEqualStrings(sig, expected))) return false;
  return Number(exp) > now;
}
