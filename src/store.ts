import { sampleUsers } from "./data/sampleUsers";
import type {
  UserAccount,
  UserProfile,
  TankaWork,
  LikeRecord,
  LikeQuota,
  DmMessage,
  SearchFilter,
  MonthlyTheme,
  TankaEntry,
} from "./types";
import { MONTHLY_LIKE_BASE } from "./types";

const K = {
  ACCOUNTS: "utaen_accounts",
  CURRENT: "utaen_current_email",
  PROFILES: "utaen_profiles",
  LIKES: "utaen_likes",
  KEEPS: "utaen_keeps",
  SOREHODO: "utaen_sorehodo",
  QUOTA: "utaen_quota",
  DMS: "utaen_dms",
  FILTER: "utaen_filter",
} as const;

function get<T>(key: string, fallback: T): T {
  const raw = localStorage.getItem(key);
  if (!raw) return fallback;
  return JSON.parse(raw) as T;
}

function set(key: string, value: unknown): void {
  localStorage.setItem(key, JSON.stringify(value));
}

// --- Auth ---

export function getAccounts(): UserAccount[] {
  return get<UserAccount[]>(K.ACCOUNTS, []);
}

function simpleHash(pw: string): string {
  let h = 0;
  for (let i = 0; i < pw.length; i++) {
    h = ((h << 5) - h + pw.charCodeAt(i)) | 0;
  }
  return "h" + Math.abs(h).toString(36);
}

export function register(email: string, password: string): { ok: boolean; error?: string } {
  const accounts = getAccounts();
  if (accounts.find((a) => a.email === email)) {
    return { ok: false, error: "このメールアドレスは既に登録されています" };
  }
  const profileId = crypto.randomUUID();
  accounts.push({ email, passwordHash: simpleHash(password), profileId });
  set(K.ACCOUNTS, accounts);
  set(K.CURRENT, email);
  return { ok: true };
}

export function login(email: string, password: string): { ok: boolean; error?: string } {
  const accounts = getAccounts();
  const account = accounts.find((a) => a.email === email);
  if (!account) return { ok: false, error: "アカウントが見つかりません" };
  if (account.passwordHash !== simpleHash(password)) {
    return { ok: false, error: "パスワードが正しくありません" };
  }
  set(K.CURRENT, email);
  return { ok: true };
}

export function logout(): void {
  localStorage.removeItem(K.CURRENT);
}

export function getCurrentEmail(): string | null {
  return localStorage.getItem(K.CURRENT) ? JSON.parse(localStorage.getItem(K.CURRENT)!) : null;
}

export function getCurrentAccount(): UserAccount | null {
  const email = getCurrentEmail();
  if (!email) return null;
  return getAccounts().find((a) => a.email === email) ?? null;
}

// --- Profile ---

function getAllProfiles(): UserProfile[] {
  return get<UserProfile[]>(K.PROFILES, []);
}

function setAllProfiles(profiles: UserProfile[]): void {
  set(K.PROFILES, profiles);
}

export function getProfile(profileId: string): UserProfile | null {
  // check custom first
  const custom = getAllProfiles().find((p) => p.id === profileId);
  if (custom) return custom;
  return sampleUsers.find((p) => p.id === profileId) ?? null;
}

export function getProfileByEmail(email: string): UserProfile | null {
  const account = getAccounts().find((a) => a.email === email);
  if (!account) return null;
  return getProfile(account.profileId);
}

export function getCurrentProfile(): UserProfile | null {
  const account = getCurrentAccount();
  if (!account) return null;
  return getProfile(account.profileId);
}

export function saveProfile(profile: UserProfile): void {
  const all = getAllProfiles();
  const idx = all.findIndex((p) => p.id === profile.id);
  if (idx >= 0) {
    all[idx] = profile;
  } else {
    all.push(profile);
  }
  setAllProfiles(all);
}

// --- Tanka Collection ---

export function getTankaCollection(profile: UserProfile): TankaWork[] {
  // 後方互換: コレクションが無ければtanka1/tanka2から生成
  if (profile.tankaCollection && profile.tankaCollection.length > 0) {
    return profile.tankaCollection;
  }
  const works: TankaWork[] = [];
  if (profile.tanka1) {
    works.push({ id: `${profile.id}_w1`, text: profile.tanka1, createdAt: Date.now() - 2000 });
  }
  if (profile.tanka2) {
    works.push({ id: `${profile.id}_w2`, text: profile.tanka2, createdAt: Date.now() - 1000 });
  }
  return works;
}

export function getDisplayTankaIds(profile: UserProfile): [string, string] {
  if (profile.displayTankaIds) return profile.displayTankaIds;
  const col = getTankaCollection(profile);
  return [col[0]?.id ?? "", col[1]?.id ?? ""];
}

export function getDisplayTankaTexts(profile: UserProfile): { tanka1: string; tanka2: string } {
  const col = getTankaCollection(profile);
  const ids = getDisplayTankaIds(profile);
  const t1 = col.find((w) => w.id === ids[0])?.text ?? "";
  const t2 = col.find((w) => w.id === ids[1])?.text ?? "";
  return { tanka1: t1, tanka2: t2 };
}

// --- version helper ---

function simpleVersion(s: string): number {
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = ((h << 5) - h + s.charCodeAt(i)) | 0;
  }
  return Math.abs(h);
}

// --- Tanka entries (built from profiles) ---

export function getAllTankaEntries(): TankaEntry[] {
  const allProfiles = [...sampleUsers, ...getAllProfiles()];
  const seen = new Set<string>();
  const entries: TankaEntry[] = [];

  for (const p of allProfiles) {
    if (seen.has(p.id)) continue;
    seen.add(p.id);

    const { tanka1, tanka2 } = getDisplayTankaTexts(p);
    const v = simpleVersion(tanka1 + tanka2 + (p.tankaTheme ?? ""));

    if (tanka1) {
      entries.push({ id: `${p.id}_1`, userId: p.id, text: tanka1, type: "regular1", version: v });
    }
    if (tanka2) {
      entries.push({ id: `${p.id}_2`, userId: p.id, text: tanka2, type: "regular2", version: v });
    }
    if (p.tankaTheme) {
      entries.push({ id: `${p.id}_t`, userId: p.id, text: p.tankaTheme, type: "theme", version: v });
    }
  }
  return entries;
}

export function getProfileForTanka(userId: string): UserProfile | null {
  const custom = getAllProfiles().find((p) => p.id === userId);
  if (custom) return custom;
  return sampleUsers.find((p) => p.id === userId) ?? null;
}

// --- Likes ---

function getLikes(): LikeRecord[] {
  return get<LikeRecord[]>(K.LIKES, []);
}

export function addLike(fromUserId: string, toUserId: string, tankaId: string): void {
  const likes = getLikes();
  likes.push({ fromUserId, toUserId, tankaId, timestamp: Date.now() });
  set(K.LIKES, likes);
}

export function hasLiked(fromUserId: string, tankaId: string): boolean {
  return getLikes().some((l) => l.fromUserId === fromUserId && l.tankaId === tankaId);
}

export function hasLikedUser(fromUserId: string, toUserId: string): boolean {
  return getLikes().some((l) => l.fromUserId === fromUserId && l.toUserId === toUserId);
}

export function isMatched(userA: string, userB: string): boolean {
  const likes = getLikes();
  const aToB = likes.some((l) => l.fromUserId === userA && l.toUserId === userB);
  const bToA = likes.some((l) => l.fromUserId === userB && l.toUserId === userA);
  return aToB && bToA;
}

/** いいね直後にマッチが成立したか判定 */
export function checkNewMatch(fromUserId: string, toUserId: string): boolean {
  return isMatched(fromUserId, toUserId);
}

export function getMatchedUserIds(userId: string): string[] {
  const likes = getLikes();
  const iLiked = new Set(likes.filter((l) => l.fromUserId === userId).map((l) => l.toUserId));
  const likedMe = new Set(likes.filter((l) => l.toUserId === userId).map((l) => l.fromUserId));
  return [...iLiked].filter((id) => likedMe.has(id));
}

export function getLikedTankaIds(userId: string): string[] {
  return getLikes().filter((l) => l.fromUserId === userId).map((l) => l.tankaId);
}

/** 自分がいいねした短歌エントリ一覧 */
export function getLikedEntries(userId: string): TankaEntry[] {
  const likedIds = new Set(getLikedTankaIds(userId));
  return getAllTankaEntries().filter((e) => likedIds.has(e.id));
}

// --- Like Quota ---

function todayStr(): string {
  return new Date().toISOString().slice(0, 10);
}

function thisMonthStr(): string {
  return new Date().toISOString().slice(0, 7);
}

export function getQuota(userId: string): LikeQuota {
  const key = `${K.QUOTA}_${userId}`;
  const stored = get<LikeQuota | null>(key, null);
  const today = todayStr();
  const month = thisMonthStr();

  if (!stored || stored.monthStart !== month) {
    // new month reset
    const q: LikeQuota = { remaining: MONTHLY_LIKE_BASE, lastRecovery: today, monthStart: month };
    set(key, q);
    return q;
  }

  // daily recovery
  if (stored.lastRecovery !== today) {
    const lastDate = new Date(stored.lastRecovery);
    const nowDate = new Date(today);
    const daysDiff = Math.floor((nowDate.getTime() - lastDate.getTime()) / 86400000);
    stored.remaining = Math.min(MONTHLY_LIKE_BASE, stored.remaining + daysDiff);
    stored.lastRecovery = today;
    set(key, stored);
  }

  return stored;
}

export function consumeLike(userId: string): boolean {
  const q = getQuota(userId);
  if (q.remaining <= 0) return false;
  q.remaining -= 1;
  set(`${K.QUOTA}_${userId}`, q);
  return true;
}

// --- DM ---

function getDms(): DmMessage[] {
  return get<DmMessage[]>(K.DMS, []);
}

export function sendDm(fromUserId: string, toUserId: string, text: string): void {
  const dms = getDms();
  dms.push({ id: crypto.randomUUID(), fromUserId, toUserId, text, timestamp: Date.now() });
  set(K.DMS, dms);
}

export function getDmThread(userA: string, userB: string): DmMessage[] {
  return getDms()
    .filter(
      (m) =>
        (m.fromUserId === userA && m.toUserId === userB) ||
        (m.fromUserId === userB && m.toUserId === userA),
    )
    .sort((a, b) => a.timestamp - b.timestamp);
}

// --- Filter ---

export function loadFilter(): SearchFilter {
  return get<SearchFilter>(K.FILTER, { prefecture: "", ageMin: 18, ageMax: 99, gender: "", searchTarget: "" });
}

export function saveFilter(filter: SearchFilter): void {
  set(K.FILTER, filter);
}

// --- Monthly Theme ---

export function getCurrentTheme(): MonthlyTheme {
  return { month: thisMonthStr(), title: "春の訪れ" };
}

// --- Keep ---

interface KeepRecord {
  tankaId: string;
}

export function getKeeps(userId: string): KeepRecord[] {
  return get<KeepRecord[]>(`${K.KEEPS}_${userId}`, []);
}

export function addKeep(userId: string, tankaId: string): void {
  const keeps = getKeeps(userId);
  if (!keeps.some((k) => k.tankaId === tankaId)) {
    keeps.push({ tankaId });
    set(`${K.KEEPS}_${userId}`, keeps);
  }
}

export function removeKeep(userId: string, tankaId: string): void {
  const keeps = getKeeps(userId).filter((k) => k.tankaId !== tankaId);
  set(`${K.KEEPS}_${userId}`, keeps);
}

export function isKept(userId: string, tankaId: string): boolean {
  return getKeeps(userId).some((k) => k.tankaId === tankaId);
}

/** キープした短歌エントリ一覧 */
export function getKeptEntries(userId: string): TankaEntry[] {
  const keptIds = new Set(getKeeps(userId).map((k) => k.tankaId));
  return getAllTankaEntries().filter((e) => keptIds.has(e.id));
}

// --- Sorehodo (dismiss) ---

interface SorehodRecord {
  tankaId: string;
  version: number;
}

export function getSorehodos(userId: string): SorehodRecord[] {
  return get<SorehodRecord[]>(`${K.SOREHODO}_${userId}`, []);
}

export function addSorehodo(userId: string, tankaId: string, version: number): void {
  const list = getSorehodos(userId);
  const idx = list.findIndex((s) => s.tankaId === tankaId);
  if (idx >= 0) {
    list[idx].version = version;
  } else {
    list.push({ tankaId, version });
  }
  set(`${K.SOREHODO}_${userId}`, list);
}

export function isSorehodo(userId: string, tankaId: string, currentVersion: number): boolean {
  const list = getSorehodos(userId);
  const rec = list.find((s) => s.tankaId === tankaId);
  if (!rec) return false;
  // 歌が更新されたら再表示
  return rec.version === currentVersion;
}

// --- age calculation ---

export function calcAge(birthDate: string): number {
  const birth = new Date(birthDate);
  const now = new Date();
  let age = now.getFullYear() - birth.getFullYear();
  const m = now.getMonth() - birth.getMonth();
  if (m < 0 || (m === 0 && now.getDate() < birth.getDate())) age--;
  return age;
}
