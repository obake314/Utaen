import type { UserProfile } from "../types";
import { GENDER_LABELS } from "../types";
import { calcAge, getDisplayTankaTexts } from "../store";
import { TankaText } from "./TankaText";

interface ProfileViewProps {
  profile: UserProfile;
  onBack: () => void;
}

export function ProfileView({ profile, onBack }: ProfileViewProps) {
  const age = calcAge(profile.birthDate);
  const { tanka1, tanka2 } = getDisplayTankaTexts(profile);

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

      {tanka1 && (
        <div className="pv-tanka">
          <p className="tanka-vertical"><TankaText text={tanka1} /></p>
        </div>
      )}
      {tanka2 && (
        <div className="pv-tanka">
          <p className="tanka-vertical"><TankaText text={tanka2} /></p>
        </div>
      )}

      {profile.thanksMessage && (
        <div className="pv-thanks">
          <p className="pv-thanks-label">サンクス文</p>
          <p className="pv-thanks-text">{profile.thanksMessage}</p>
        </div>
      )}
    </div>
  );
}
