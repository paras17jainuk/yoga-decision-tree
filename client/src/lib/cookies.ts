/**
 * Cookie-based session persistence for yoga sessions.
 * Stores session state, timer, and selected asanas.
 */

const COOKIE_PREFIX = "yoga_session_";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days

export function setCookie(name: string, value: string, maxAge: number = MAX_AGE) {
  document.cookie = `${COOKIE_PREFIX}${name}=${encodeURIComponent(value)}; path=/; max-age=${maxAge}; SameSite=Lax`;
}

export function getCookie(name: string): string | null {
  const fullName = `${COOKIE_PREFIX}${name}`;
  const cookies = document.cookie.split(";");
  for (const cookie of cookies) {
    const [key, ...valParts] = cookie.trim().split("=");
    if (key === fullName) {
      return decodeURIComponent(valParts.join("="));
    }
  }
  return null;
}

export function deleteCookie(name: string) {
  document.cookie = `${COOKIE_PREFIX}${name}=; path=/; max-age=0`;
}

export interface SessionData {
  id: string;
  startedAt: number; // timestamp
  durationMinutes: number;
  asanas: SessionAsana[];
  status: "active" | "paused" | "completed";
  currentAsanaIndex: number;
  elapsedSeconds: number;
}

export interface SessionAsana {
  asanaId: string;
  durationSeconds: number;
  completed: boolean;
}

export function saveSession(session: SessionData) {
  setCookie("active", JSON.stringify(session));
}

export function loadSession(): SessionData | null {
  const raw = getCookie("active");
  if (!raw) return null;
  try {
    return JSON.parse(raw) as SessionData;
  } catch {
    return null;
  }
}

export function clearSession() {
  deleteCookie("active");
}

export function saveSessionHistory(sessions: { completedAt: number; durationMinutes: number; asanaCount: number }[]) {
  setCookie("history", JSON.stringify(sessions.slice(-10))); // keep last 10
}

export function loadSessionHistory(): { completedAt: number; durationMinutes: number; asanaCount: number }[] {
  const raw = getCookie("history");
  if (!raw) return [];
  try {
    return JSON.parse(raw);
  } catch {
    return [];
  }
}
