/// Lightweight client-side profile/settings store (no database yet).
/// Backed by localStorage and exposed through useSyncExternalStore so it is
/// SSR-safe.

export type ProfileSettings = {
  displayName: string;
  bio: string;
  currency: string;
  avatar: string;
  notifications: boolean;
  companion: boolean;
  notifySecurity: boolean;
  visibility: "public" | "contacts" | "private";
  discoverable: boolean;
  directorySearch: boolean;
};

export const DEFAULT_PROFILE: ProfileSettings = {
  displayName: "",
  bio: "",
  currency: "NGN",
  avatar: "",
  notifications: true,
  companion: true,
  notifySecurity: true,
  visibility: "public",
  discoverable: true,
  directorySearch: true,
};

const STORAGE_KEY = "tuma.profile.v1";

let cache: ProfileSettings | null = null;
const listeners = new Set<() => void>();

function read(): ProfileSettings {
  if (typeof window === "undefined") return DEFAULT_PROFILE;
  if (cache) return cache;
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    cache = raw ? { ...DEFAULT_PROFILE, ...(JSON.parse(raw) as Partial<ProfileSettings>) } : DEFAULT_PROFILE;
  } catch {
    cache = DEFAULT_PROFILE;
  }
  return cache;
}

export function subscribeProfile(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export function getProfileSnapshot(): ProfileSettings {
  return read();
}

export function getServerProfileSnapshot(): ProfileSettings {
  return DEFAULT_PROFILE;
}

export function updateProfile(patch: Partial<ProfileSettings>): void {
  cache = { ...read(), ...patch };
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache));
  } catch {
    // ignore storage failures (private mode, etc.)
  }
  listeners.forEach((listener) => listener());
}

export function resetProfile(): void {
  cache = DEFAULT_PROFILE;
  try {
    window.localStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener());
}
