/**
 * VoxAgent Auth Utilities
 * Stores user session in localStorage so it survives page refreshes.
 */

const KEY = "voxagent_user";

export interface AuthUser {
  token: string;
  user_id: number;
  name: string;
  email: string;
  company?: string | null;
}

export function saveUser(user: AuthUser) {
  if (typeof window !== "undefined") {
    localStorage.setItem(KEY, JSON.stringify(user));
  }
}

export function getUser(): AuthUser | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(KEY);
    return raw ? (JSON.parse(raw) as AuthUser) : null;
  } catch {
    return null;
  }
}

export function clearUser() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(KEY);
  }
}

/** Returns initials from a full name — "Pranav Kumar" → "PK" */
export function getInitials(name: string): string {
  return name
    .trim()
    .split(" ")
    .filter(Boolean)
    .map((w) => w[0].toUpperCase())
    .slice(0, 2)
    .join("");
}
