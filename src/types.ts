export interface UserAccount {
  email: string;
  passwordHash: string; // デモ用: 平文ハッシュ代用
  profileId: string;
}

export type Gender = "male" | "female";
export type SearchTarget = "male" | "female" | "any";

export interface UserProfile {
  id: string;
  email: string;
  displayName: string;
  gender: Gender;
  birthDate: string; // YYYY-MM-DD
  prefecture: string;
  areaDetail: string;
  searchTarget: SearchTarget;
  tanka1: string;
  tanka2: string;
  tankaTheme?: string; // 月間テーマ作品
}

export interface TankaEntry {
  id: string;
  userId: string;
  text: string;
  type: "regular1" | "regular2" | "theme";
  version: number; // 更新検知用
}

export type TankaAction = "like" | "keep" | "sorehodo";

export interface LikeRecord {
  fromUserId: string;
  toUserId: string;
  tankaId: string;
  timestamp: number;
}

export interface DmMessage {
  id: string;
  fromUserId: string;
  toUserId: string;
  text: string;
  timestamp: number;
}

export interface LikeQuota {
  remaining: number;
  lastRecovery: string; // YYYY-MM-DD
  monthStart: string; // YYYY-MM
}

export interface SearchFilter {
  prefecture: string;
  ageMin: number;
  ageMax: number;
  gender: Gender | "";
  searchTarget: SearchTarget | "";
}

export interface MonthlyTheme {
  month: string; // YYYY-MM
  title: string;
}

export const PREFECTURES = [
  "北海道",
  "青森県", "岩手県", "宮城県", "秋田県", "山形県", "福島県",
  "茨城県", "栃木県", "群馬県", "埼玉県", "千葉県", "東京都", "神奈川県",
  "新潟県", "富山県", "石川県", "福井県", "山梨県", "長野県", "岐阜県", "静岡県", "愛知県",
  "三重県", "滋賀県", "京都府", "大阪府", "兵庫県", "奈良県", "和歌山県",
  "鳥取県", "島根県", "岡山県", "広島県", "山口県",
  "徳島県", "香川県", "愛媛県", "高知県",
  "福岡県", "佐賀県", "長崎県", "熊本県", "大分県", "宮崎県", "鹿児島県", "沖縄県",
] as const;

export const GENDER_LABELS: Record<Gender, string> = {
  male: "男性",
  female: "女性",
};

export const SEARCH_TARGET_LABELS: Record<SearchTarget, string> = {
  male: "男性",
  female: "女性",
  any: "問わない",
};

export const MONTHLY_LIKE_BASE = 30;
