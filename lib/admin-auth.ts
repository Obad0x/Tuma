import { cookies } from "next/headers";
import { secretMatches } from "./http";

export const ADMIN_COOKIE = "tuma_admin";

/// Accepts the admin secret from a header (scripts/APIs) or the console cookie.
export async function isAdminRequest(request?: Request): Promise<boolean> {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) return false;

  const headerSecret =
    request?.headers.get("x-admin-secret") ??
    request?.headers.get("authorization")?.replace(/^Bearer\s+/i, "") ??
    null;
  if (secretMatches(headerSecret, secret)) return true;

  const cookieValue = (await cookies()).get(ADMIN_COOKIE)?.value ?? null;
  return secretMatches(cookieValue, secret);
}
