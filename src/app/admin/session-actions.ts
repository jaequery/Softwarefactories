"use server";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import {
  ATTEMPT_DELAY_MS,
  clearFailedLogins,
  getAdminConfig,
  getClientIp,
  reserveLoginAttempt,
  sessionKey,
} from "@/lib/admin/auth";
import { SESSION_COOKIE, SESSION_TTL_SECONDS, createSessionToken, timingSafeEqualStrings } from "@/lib/admin/session";

export type LoginState = { error?: string };

const COOKIE_PATH = "/admin";

export async function login(_prev: LoginState, formData: FormData): Promise<LoginState> {
  const config = await getAdminConfig();
  if (!config.enabled) return { error: config.reason };

  // Every attempt pays a small delay, and an IP with too many recent failures is refused outright.
  await new Promise((r) => setTimeout(r, ATTEMPT_DELAY_MS));
  const ip = await getClientIp();
  const waitMs = await reserveLoginAttempt(ip);
  if (waitMs > 0) {
    return { error: `Too many failed attempts. Try again in ${Math.ceil(waitMs / 60000)} minute(s).` };
  }

  const password = formData.get("password");
  if (typeof password !== "string" || !(await timingSafeEqualStrings(password, config.password))) {
    return { error: "Wrong password." };
  }

  await clearFailedLogins(ip);
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(sessionKey(config)), {
    httpOnly: true,
    secure: true,
    sameSite: "lax",
    path: COOKIE_PATH,
    maxAge: SESSION_TTL_SECONDS,
  });
  redirect("/admin");
}

export async function logout(): Promise<void> {
  (await cookies()).set(SESSION_COOKIE, "", { httpOnly: true, secure: true, sameSite: "lax", path: COOKIE_PATH, maxAge: 0 });
  redirect("/admin/login");
}
