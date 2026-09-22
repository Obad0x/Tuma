import { NextResponse } from "next/server";
import { auth } from "@/auth";
import { dbEnabled } from "@/lib/db";
import { isSameOrigin } from "@/lib/http";
import { upsertSettings, upsertUser } from "@/lib/ledger";
import { saveProfileImage } from "@/lib/storage";

export const runtime = "nodejs";

const TYPES: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};
const MAX_BYTES = 5 * 1024 * 1024;

/// Upload a profile picture; stored on the server disk (swap lib/storage for Drive later).
export async function POST(request: Request) {
  if (!isSameOrigin(request)) {
    return NextResponse.json({ error: "Cross-origin request rejected." }, { status: 403 });
  }
  const session = await auth();
  const user = session?.user;
  if (!user?.xUserId || !user.username) {
    return NextResponse.json({ error: "Sign in with X first." }, { status: 401 });
  }

  let form: FormData;
  try {
    form = await request.formData();
  } catch {
    return NextResponse.json({ error: "Invalid upload." }, { status: 400 });
  }
  const file = form.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file provided." }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return NextResponse.json({ error: "Image must be under 5 MB." }, { status: 413 });
  }
  const extension = TYPES[file.type];
  if (!extension) {
    return NextResponse.json({ error: "Use a PNG, JPEG or WebP image." }, { status: 415 });
  }

  const url = await saveProfileImage(user.xUserId, Buffer.from(await file.arrayBuffer()), extension);

  if (dbEnabled) {
    const userId = await upsertUser({
      xUserId: user.xUserId,
      username: user.username,
      name: user.name ?? null,
      image: user.image ?? null,
    });
    if (userId) await upsertSettings(userId, { avatar: url }).catch(() => undefined);
  }

  return NextResponse.json({ url });
}
