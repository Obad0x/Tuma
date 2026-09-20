/// Handles are compared to the X username in lowercase, without the leading "@".

export function normalizeHandle(input: string): string {
  return input.trim().replace(/^@+/, "").toLowerCase();
}

export function isValidHandle(handle: string): boolean {
  return /^[a-z0-9_]{1,15}$/.test(handle);
}
