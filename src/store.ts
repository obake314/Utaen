import { sampleUsers } from "./data/sampleUsers";
import type {
  UserProfile,
  DailyState,
  DailyCandidate,
  SearchFilter,
} from "./types";
import { MAX_DAILY_TANKAS } from "./types";

const STORAGE_KEY_PROFILE = "utaen_profile";
const STORAGE_KEY_DAILY = "utaen_daily";
const STORAGE_KEY_FILTER = "utaen_filter";
const STORAGE_KEY_LIKES = "utaen_liked_ids";

// --- Profile ---

export function loadProfile(): UserProfile | null {
  const raw = localStorage.getItem(STORAGE_KEY_PROFILE);
  if (!raw) return null;
  return JSON.parse(raw) as UserProfile;
}

export function saveProfile(profile: UserProfile): void {
  localStorage.setItem(STORAGE_KEY_PROFILE, JSON.stringify(profile));
}

// --- Filter ---

export function loadFilter(): SearchFilter {
  const raw = localStorage.getItem(STORAGE_KEY_FILTER);
  if (!raw) return { ageMin: 18, ageMax: 99, region: "" };
  return JSON.parse(raw) as SearchFilter;
}

export function saveFilter(filter: SearchFilter): void {
  localStorage.setItem(STORAGE_KEY_FILTER, JSON.stringify(filter));
}

// --- Liked user IDs (persistent across days) ---

function loadLikedIds(): string[] {
  const raw = localStorage.getItem(STORAGE_KEY_LIKES);
  if (!raw) return [];
  return JSON.parse(raw) as string[];
}

function saveLikedIds(ids: string[]): void {
  localStorage.setItem(STORAGE_KEY_LIKES, JSON.stringify(ids));
}

export function addLikedId(id: string): void {
  const ids = loadLikedIds();
  if (!ids.includes(id)) {
    ids.push(id);
    saveLikedIds(ids);
  }
}

export function getLikedProfiles(): UserProfile[] {
  const ids = loadLikedIds();
  return sampleUsers.filter((u) => ids.includes(u.id));
}

// --- Daily State ---

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function pickCandidates(
  filter: SearchFilter,
  myId: string | undefined,
): DailyCandidate[] {
  let pool = sampleUsers.filter((u) => u.id !== myId);
  if (filter.region) {
    pool = pool.filter((u) => u.region === filter.region);
  }
  pool = pool.filter((u) => u.age >= filter.ageMin && u.age <= filter.ageMax);

  // shuffle
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return pool.slice(0, MAX_DAILY_TANKAS).map((profile) => ({
    profile,
    status: "pending" as const,
  }));
}

export function loadDailyState(
  filter: SearchFilter,
  myId: string | undefined,
): DailyState {
  const raw = localStorage.getItem(STORAGE_KEY_DAILY);
  if (raw) {
    const state = JSON.parse(raw) as DailyState;
    if (state.date === todayStr()) {
      return state;
    }
  }
  // 新しい日 → 新しい候補を生成
  const candidates = pickCandidates(filter, myId);
  const state: DailyState = {
    date: todayStr(),
    candidates,
    likeCount: 0,
    reviewed: 0,
    selectionPhase: false,
  };
  saveDailyState(state);
  return state;
}

export function saveDailyState(state: DailyState): void {
  localStorage.setItem(STORAGE_KEY_DAILY, JSON.stringify(state));
}

export function resetDailyState(): void {
  localStorage.removeItem(STORAGE_KEY_DAILY);
}
