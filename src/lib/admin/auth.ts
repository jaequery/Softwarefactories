import { getCloudflareContext } from "@opennextjs/cloudflare";
import { cookies, headers } from "next/headers";
import { redirect, unauthorized } from "next/navigation";
import { getDB } from "@/lib/db";
import { SESSION_COOKIE, verifySessionToken } from "./session";

export const MIN_SECRET_LENGTH = 32;
export const MAX_FAILURES = 5;
export const FAILURE_WINDOW_MS = 15 * 60 * 1000;
export const ATTEMPT_DELAY_MS = 400;

type AdminEnv = { ADMIN_PASSWORD?: string; ADMIN_SESSION_SECRET?: string };

export type AdminConfig =
  | { enabled: true; password: string; secret: string }
  | { enabled: false; reason: string };

/**
 * Read the admin secrets at request time: Worker env vars/secrets (Fredrin hosting, or `.dev.vars` in
 * `npm run dev`), falling back to `process.env`. Login stays disabled unless both are set.
 */
export async function getAdminConfig(): Promise<AdminConfig> {
  let env: AdminEnv = {};
  try {
    env = (await getCloudflareContext({ async: true })).env as unknown as AdminEnv;
  } catch {
    // No Cloudflare context (e.g. a plain `next start`): fall back to process.env below.
  }
  const password = env.ADMIN_PASSWORD || process.env.ADMIN_PASSWORD || "";
  const secret = env.ADMIN_SESSION_SECRET || process.env.ADMIN_SESSION_SECRET || "";
  if (!password) return { enabled: false, reason: "ADMIN_PASSWORD is not set, so admin login is disabled." };
  if (secret.length < MIN_SECRET_LENGTH) {
    return {
      enabled: false,
      reason: `ADMIN_SESSION_SECRET is ${secret ? `shorter than ${MIN_SECRET_LENGTH} characters` : "not set"}, so admin login is disabled.`,
    };
  }
  return { enabled: true, password, secret };
}

/** True when the request carries a valid, unexpired admin session cookie. */
export async function isAdmin(): Promise<boolean> {
  const config = await getAdminConfig();
  if (!config.enabled) return false;
  const token = (await cookies()).get(SESSION_COOKIE)?.value;
  return verifySessionToken(token, config.secret);
}

/** For admin pages: redirect to the login page without a valid session. */
export async function requireAdminPage(): Promise<void> {
  if (!(await isAdmin())) redirect("/admin/login");
}

/** For every server action that writes: answer 401 without a valid session. */
export async function requireAdminAction(): Promise<void> {
  if (!(await isAdmin())) unauthorized();
}

export async function getClientIp(): Promise<string> {
  const h = await headers();
  const ip = h.get("cf-connecting-ip") ?? h.get("x-real-ip") ?? h.get("x-forwarded-for")?.split(",")[0];
  return ip?.trim() || "unknown";
}

/** Milliseconds until `ip` may try again, or 0 if it is not locked out. */
export async function lockoutRemainingMs(ip: string, now = Date.now()): Promise<number> {
  const row = await (await getDB())
    .prepare("SELECT failures, window_start FROM admin_login_attempts WHERE ip = ?1")
    .bind(ip)
    .first<{ failures: number; window_start: number }>();
  if (!row || row.failures < MAX_FAILURES) return 0;
  return Math.max(0, row.window_start + FAILURE_WINDOW_MS - now);
}

/** Count a failed attempt for `ip`, starting a new window when the previous one has expired. */
export async function recordFailedLogin(ip: string, now = Date.now()): Promise<void> {
  const db = await getDB();
  await db.batch([
    db
      .prepare(
        `INSERT INTO admin_login_attempts (ip, failures, window_start) VALUES (?1, 1, ?2)
         ON CONFLICT(ip) DO UPDATE SET
           failures     = CASE WHEN ?2 - window_start >= ?3 THEN 1  ELSE failures + 1 END,
           window_start = CASE WHEN ?2 - window_start >= ?3 THEN ?2 ELSE window_start END,
           updated_at   = strftime('%Y-%m-%dT%H:%M:%fZ', 'now')`,
      )
      .bind(ip, now, FAILURE_WINDOW_MS),
    // Housekeeping: drop other IPs whose window has long expired.
    db.prepare("DELETE FROM admin_login_attempts WHERE window_start < ?1 AND ip <> ?2").bind(now - 2 * FAILURE_WINDOW_MS, ip),
  ]);
}

export async function clearFailedLogins(ip: string): Promise<void> {
  await (await getDB()).prepare("DELETE FROM admin_login_attempts WHERE ip = ?1").bind(ip).run();
}
