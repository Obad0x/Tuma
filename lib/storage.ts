import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/// Storage adapter. Today it writes to the local server disk; swap this module
/// for Google Drive (or S3) later without touching callers.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");

export async function saveProfileImage(
  key: string,
  data: Buffer,
  extension: string,
): Promise<string> {
  await mkdir(UPLOAD_DIR, { recursive: true });
  const safeKey = key.replace(/[^a-z0-9_-]/gi, "");
  const filename = `${safeKey}-${Date.now()}.${extension}`;
  await writeFile(path.join(UPLOAD_DIR, filename), data);
  return `/uploads/${filename}`;
}
