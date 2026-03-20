/**
 * Cookie + localStorage-based session persistence for yoga sessions.
 * Uses cookies for active session (small data, 7-day TTL).
 * Uses localStorage for session history (larger data, persistent).
 */

const COOKIE_PREFIX = "yoga_session_";
const MAX_AGE = 60 * 60 * 24 * 7; // 7 days
const LS_HISTORY_KEY = "yoga_session_history_v2";
const LS_STREAK_KEY = "yoga_streak_data";

/* ── Cookie helpers ── */

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

/* ── Active session types ── */

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

/* ── Session history (localStorage for larger storage) ── */

export interface SessionHistoryEntry {
  id: string;
  completedAt: number;       // timestamp
  durationMinutes: number;   // total session duration
  actualMinutes: number;     // actual time practiced
  asanaCount: number;
  asanaIds: string[];         // list of asana IDs practiced
  conditions: string[];       // conditions the session was for
  severity: string | null;
  type: "assessment" | "surya_namaskar" | "vinyasa" | "custom";
}

export function saveSessionHistory(entries: SessionHistoryEntry[]) {
  try {
    localStorage.setItem(LS_HISTORY_KEY, JSON.stringify(entries.slice(-50))); // keep last 50
  } catch {
    // Fallback to cookie (limited to last 10)
    setCookie("history", JSON.stringify(entries.slice(-10)));
  }
}

export function loadSessionHistory(): SessionHistoryEntry[] {
  try {
    // Try localStorage first
    const lsRaw = localStorage.getItem(LS_HISTORY_KEY);
    if (lsRaw) {
      const parsed = JSON.parse(lsRaw);
      return Array.isArray(parsed) ? parsed : [];
    }
    // Fallback: migrate from old cookie format
    const cookieRaw = getCookie("history");
    if (cookieRaw) {
      const oldEntries = JSON.parse(cookieRaw);
      if (Array.isArray(oldEntries)) {
        // Migrate old format to new format
        const migrated: SessionHistoryEntry[] = oldEntries.map((e: any, i: number) => ({
          id: `migrated_${i}_${e.completedAt || Date.now()}`,
          completedAt: e.completedAt || Date.now(),
          durationMinutes: e.durationMinutes || 0,
          actualMinutes: e.durationMinutes || 0,
          asanaCount: e.asanaCount || 0,
          asanaIds: [],
          conditions: [],
          severity: null,
          type: "assessment" as const,
        }));
        saveSessionHistory(migrated);
        return migrated;
      }
    }
  } catch { /* ignore */ }
  return [];
}

export function addSessionToHistory(entry: SessionHistoryEntry) {
  const history = loadSessionHistory();
  history.push(entry);
  saveSessionHistory(history);
}

export function clearSessionHistory() {
  try {
    localStorage.removeItem(LS_HISTORY_KEY);
    localStorage.removeItem(LS_STREAK_KEY);
  } catch { /* ignore */ }
  deleteCookie("history");
}

/* ── Streak tracking ── */

export interface StreakData {
  currentStreak: number;
  longestStreak: number;
  lastPracticeDate: string | null; // YYYY-MM-DD
}

export function calculateStreakData(history: SessionHistoryEntry[]): StreakData {
  if (history.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastPracticeDate: null };
  }

  // Get unique practice dates (YYYY-MM-DD)
  const dates = Array.from(
    new Set(
      history.map((e) => {
        const d = new Date(e.completedAt);
        return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      })
    )
  ).sort();

  if (dates.length === 0) {
    return { currentStreak: 0, longestStreak: 0, lastPracticeDate: null };
  }

  const lastPracticeDate = dates[dates.length - 1];

  // Calculate streaks
  let currentStreak = 1;
  let longestStreak = 1;
  let tempStreak = 1;

  for (let i = dates.length - 1; i > 0; i--) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));

    if (diffDays === 1) {
      tempStreak++;
    } else {
      if (i === dates.length - 1 || tempStreak > 1) {
        // Only set current streak if we're counting from the most recent date
      }
      tempStreak = 1;
    }
    longestStreak = Math.max(longestStreak, tempStreak);
  }

  // Recalculate current streak from the end
  currentStreak = 1;
  for (let i = dates.length - 1; i > 0; i--) {
    const curr = new Date(dates[i]);
    const prev = new Date(dates[i - 1]);
    const diffDays = Math.round((curr.getTime() - prev.getTime()) / (1000 * 60 * 60 * 24));
    if (diffDays === 1) {
      currentStreak++;
    } else {
      break;
    }
  }

  // Check if streak is still active (last practice was today or yesterday)
  const today = new Date();
  const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = `${yesterday.getFullYear()}-${String(yesterday.getMonth() + 1).padStart(2, "0")}-${String(yesterday.getDate()).padStart(2, "0")}`;

  if (lastPracticeDate !== todayStr && lastPracticeDate !== yesterdayStr) {
    currentStreak = 0;
  }

  longestStreak = Math.max(longestStreak, currentStreak);

  return { currentStreak, longestStreak, lastPracticeDate };
}

/* ── Analytics helpers ── */

export function getWeeklyData(history: SessionHistoryEntry[]): { day: string; minutes: number; sessions: number }[] {
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const now = new Date();
  const result: { day: string; date: string; minutes: number; sessions: number }[] = [];

  for (let i = 6; i >= 0; i--) {
    const d = new Date(now);
    d.setDate(d.getDate() - i);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    result.push({
      day: days[d.getDay()],
      date: dateStr,
      minutes: 0,
      sessions: 0,
    });
  }

  for (const entry of history) {
    const d = new Date(entry.completedAt);
    const dateStr = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
    const match = result.find((r) => r.date === dateStr);
    if (match) {
      match.minutes += entry.actualMinutes || entry.durationMinutes;
      match.sessions += 1;
    }
  }

  return result.map(({ day, minutes, sessions }) => ({ day, minutes: Math.round(minutes), sessions }));
}

export function getMonthlyData(history: SessionHistoryEntry[]): { week: string; minutes: number; sessions: number }[] {
  const now = new Date();
  const result: { week: string; startDate: Date; endDate: Date; minutes: number; sessions: number }[] = [];

  for (let i = 3; i >= 0; i--) {
    const start = new Date(now);
    start.setDate(start.getDate() - (i + 1) * 7 + 1);
    const end = new Date(start);
    end.setDate(end.getDate() + 6);
    result.push({
      week: `Week ${4 - i}`,
      startDate: start,
      endDate: end,
      minutes: 0,
      sessions: 0,
    });
  }

  for (const entry of history) {
    const d = new Date(entry.completedAt);
    for (const week of result) {
      if (d >= week.startDate && d <= week.endDate) {
        week.minutes += entry.actualMinutes || entry.durationMinutes;
        week.sessions += 1;
        break;
      }
    }
  }

  return result.map(({ week, minutes, sessions }) => ({ week, minutes: Math.round(minutes), sessions }));
}

export function getMostPracticedAsanas(history: SessionHistoryEntry[]): { asanaId: string; count: number }[] {
  const counts: Record<string, number> = {};
  for (const entry of history) {
    for (const id of entry.asanaIds) {
      counts[id] = (counts[id] || 0) + 1;
    }
  }
  return Object.entries(counts)
    .map(([asanaId, count]) => ({ asanaId, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);
}
