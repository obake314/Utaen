export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  age: number;
  region: string;
  bio: string; // ~50文字
  tanka1: string;
  tanka2: string;
}

export interface DailyCandidate {
  profile: UserProfile;
  status: "pending" | "like" | "unlike";
}

export interface DailyState {
  date: string; // YYYY-MM-DD
  candidates: DailyCandidate[];
  likeCount: number;
  reviewed: number; // 何首目まで閲覧済みか
  selectionPhase: boolean; // PENDING選定フェーズか
}

export interface SearchFilter {
  ageMin: number;
  ageMax: number;
  region: string; // "" = 全地域
}

export const REGIONS = [
  "北海道",
  "東北",
  "関東",
  "中部",
  "近畿",
  "中国",
  "四国",
  "九州・沖縄",
] as const;

export const MAX_DAILY_TANKAS = 10;
export const MAX_LIKES = 3;
