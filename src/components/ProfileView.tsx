import type { UserProfile } from "../types";
import { GENDER_LABELS, SEARCH_TARGET_LABELS } from "../types";
import { calcAge } from "../store";
import { TankaText } from "./TankaText";

interface ProfileViewProps {
  profile: UserProfile;
  onBack: () => void;
}

export function ProfileView({ profile, onBack }: ProfileViewProps) {
  const age = calcAge(profile.birthDate);

  return (
    <div className="profile-view">
      <button className="btn-back" onClick={onBack}>
        戻る
      </button>

      <h2 className="pv-name">{profile.displayName}</h2>
      <div className="pv-meta">
        <span>{GENDER_LABELS[profile.gender]}</span>
        <span>{age}歳</span>
        <span>{profile.prefecture}</span>
        {profile.areaDetail && <span>{profile.areaDetail}</span>}
      </div>
      <p className="pv-target">
        検索対象: {SEARCH_TARGET_LABELS[profile.searchTarget]}
      </p>

      {profile.tanka1 && (
        <div className="pv-tanka">
          <p className="tanka-vertical"><TankaText text={profile.tanka1} /></p>
        </div>
      )}
      {profile.tanka2 && (
        <div className="pv-tanka">
          <p className="tanka-vertical"><TankaText text={profile.tanka2} /></p>
        </div>
      )}
      {profile.tankaTheme && (
        <div className="pv-tanka pv-tanka-theme">
          <span className="theme-badge">月間テーマ</span>
          <p className="tanka-vertical"><TankaText text={profile.tankaTheme} /></p>
        </div>
      )}
    </div>
  );
}
