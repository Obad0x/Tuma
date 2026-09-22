import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

/// Storage adapter. Uses Supabase Storage when configured (works on Vercel),
/// otherwise falls back to the local server disk for offline development.
const UPLOAD_DIR = path.join(process.cwd(), "public", "uploads");
const BUCKET = process.env.SUPABASE_AVATAR_BUCKET ?? "avatars";

const CONTENT_TYPES: Record<string, string> = {
  png: "image/png",
  jpg: "image/jpeg",
  webp: "image/webp",
};

function supabase(): SupabaseClient | null {
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SECRET_KEY;
  if (!url || !key) return null;
  return createClient(url, key, { auth: { persistSession: false } });
}

export async function saveProfileImage(
  key: string,
  data: Buffer,
  extension: string,
): Promise<string> {
  const safeKey = key.replace(/[^a-z0-9_-]/gi, "");
  const filename = `${safeKey}-${Date.now()}.${extension}`;
  const contentType = CONTENT_TYPES[extension] ?? "application/octet-stream";

  const client = supabase();
  if (client) {
    // Ensure a public bucket exists (no-op if it already does).
    await client.storage.createBucket(BUCKET, { public: true }).catch(() => undefined);

    const { error } = await client.storage
      .from(BUCKET)
      .upload(filename, data, { contentType, upsert: true });
    if (error) throw new Error(error.message);

    return client.storage.from(BUCKET).getPublicUrl(filename).data.publicUrl;
  }

  await mkdir(UPLOAD_DIR, { recursive: true });
  await writeFile(path.join(UPLOAD_DIR, filename), data);
  return `/uploads/${filename}`;
}
