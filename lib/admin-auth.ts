import { createHmac } from "node:crypto";
import { cookies } from "next/headers";
import { secretMatches } from "./http";

export const ADMIN_COOKIE = "tuma_admin";
export const ADMIN_SESSION_MS = 8 * 60 * 60 * 1000;

function sign(expires: string, secret: string): string {
  return createHmac("sha256", secret).update(`tuma-admin:${expires}`).digest("hex");
}

/// Creates a signed, expiring token. The raw ADMIN_SECRET is never stored in a cookie.
export function createAdminSession(secret: string): string {
  const expires = String(Date.now() + ADMIN_SESSION_MS);
  return `${expires}.${sign(expires, secret)}`;
}

export function verifyAdminSession(token: string | null | undefined): boolean {
  const secret = process.env.ADMIN_SECRET;
  if (!secret || !token) return false;
  const [expires, signature] = token.split(".");
  if (!expires || !signature || !/^\d+$/.test(expires)) return false;
  if (Number(expires) < Date.now()) return false;
  return secretMatches(signature, sign(expires, secret));
}

/// Accepts the admin secret from a header (scripts/APIs) or the signed console cookie.
export async function isAdminRequest(request?: Request): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  const headerSecret =
    request?.headers.get("x-admin-secret") ??
    request?.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;
  if (secretMatches(headerSecret, secret)) return true;

  return verifyAdminSession((await cookies()).get(ADMIN_COOKIE)?.value);
}
