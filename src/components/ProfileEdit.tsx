import { useState } from "react";
import type { UserProfile, Gender, SearchTarget } from "../types";
import { PREFECTURES, GENDER_LABELS, SEARCH_TARGET_LABELS } from "../types";
import { calcAge } from "../store";

interface ProfileEditProps {
  profile: UserProfile | null;
  profileId: string;
  email: string;
  onSave: (profile: UserProfile) => void;
}

export function ProfileEdit({ profile, profileId, email, onSave }: ProfileEditProps) {
  const [displayName, setDisplayName] = useState(profile?.displayName ?? "");
  const [gender, setGender] = useState<Gender | "">(profile?.gender ?? "");
  const [birthDate, setBirthDate] = useState(profile?.birthDate ?? "");
  const [prefecture, setPrefecture] = useState(profile?.prefecture ?? "");
  const [areaDetail, setAreaDetail] = useState(profile?.areaDetail ?? "");
  const [searchTarget, setSearchTarget] = useState<SearchTarget | "">(profile?.searchTarget ?? "");
  const [thanksMessage, setThanksMessage] = useState(profile?.thanksMessage ?? "");
  const [notifyMatch, setNotifyMatch] = useState(profile?.notifyMatch !== false);
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!displayName.trim()) errs.push("HNを入力してください");
    if (!gender) errs.push("性別を選択してください");
    if (!birthDate) errs.push("生年月日を入力してください");
    if (birthDate && calcAge(birthDate) < 18) errs.push("18歳未満の方はご利用いただけません");
    if (!prefecture) errs.push("都道府県を選択してください");
    if (!searchTarget) errs.push("検索対象を選択してください");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    if (thanksMessage.length > 200) {
      setErrors(["サンクス文は200文字以内にしてください"]);
      return;
    }

    onSave({
      id: profileId,
      email,
      displayName: displayName.trim(),
      gender: gender as Gender,
      birthDate,
      prefecture,
      areaDetail: areaDetail.trim(),
      searchTarget: searchTarget as SearchTarget,
      tanka1: profile?.tanka1 ?? "",
      tanka2: profile?.tanka2 ?? "",
      tankaTheme: profile?.tankaTheme,
      thanksMessage: thanksMessage.trim() || undefined,
      notifyMatch,
      tankaCollection: profile?.tankaCollection,
      displayTankaIds: profile?.displayTankaIds,
    });
  };

  // 18歳以上の日付上限（今日から18年前）
  const today = new Date();
  const minAge18 = new Date(today.getFullYear() - 18, today.getMonth(), today.getDate())
    .toISOString()
    .slice(0, 10);

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h2 className="page-title">
        {profile ? "プロフィール編集" : "プロフィール登録"}
      </h2>

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <label className="field-label">
        HN（ハンドルネーム）
        <input
          className="field-input"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          maxLength={20}
        />
      </label>

      <label className="field-label">
        性別
        <div className="radio-group">
          {(Object.entries(GENDER_LABELS) as [Gender, string][]).map(([val, label]) => (
            <label key={val} className="radio-label">
              <input
                type="radio"
                name="gender"
                value={val}
                checked={gender === val}
                onChange={() => setGender(val)}
              />
              {label}
            </label>
          ))}
        </div>
      </label>

      <label className="field-label">
        生年月日
        <input
          className="field-input"
          type="date"
          value={birthDate}
          onChange={(e) => setBirthDate(e.target.value)}
          max={minAge18}
        />
        <span className="field-hint">18歳以上の方のみご利用いただけます</span>
      </label>

      <label className="field-label">
        都道府県
        <select
          className="field-input"
          value={prefecture}
          onChange={(e) => setPrefecture(e.target.value)}
        >
          <option value="">選択してください</option>
          {PREFECTURES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </label>

      <label className="field-label">
        地域詳細（任意）
        <input
          className="field-input"
          type="text"
          value={areaDetail}
          onChange={(e) => setAreaDetail(e.target.value)}
          placeholder="例: 渋谷区"
        />
      </label>

      <label className="field-label">
        検索対象
        <div className="radio-group">
          {(Object.entries(SEARCH_TARGET_LABELS) as [SearchTarget, string][]).map(
            ([val, label]) => (
              <label key={val} className="radio-label">
                <input
                  type="radio"
                  name="searchTarget"
                  value={val}
                  checked={searchTarget === val}
                  onChange={() => setSearchTarget(val)}
                />
                {label}
              </label>
            ),
          )}
        </div>
      </label>

      <label className="field-label">
        サンクス文（マッチ時に相手に表示）
        <textarea
          className="field-textarea"
          value={thanksMessage}
          onChange={(e) => setThanksMessage(e.target.value)}
          rows={3}
          maxLength={200}
          placeholder="マッチングありがとうございます！よろしくお願いします。"
        />
        <span className="char-count">{thanksMessage.length}/200</span>
      </label>

      <label className="field-label">
        メール通知
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={notifyMatch}
            onChange={(e) => setNotifyMatch(e.target.checked)}
          />
          マッチ成立時にメール通知を受け取る
        </label>
      </label>

      <button className="btn-primary" type="submit">
        {profile ? "保存" : "次へ -- 短歌を登録"}
      </button>
    </form>
  );
}
