import { useState } from "react";
import type { UserProfile, MonthlyTheme } from "../types";

interface TankaEditProps {
  profile: UserProfile;
  theme: MonthlyTheme;
  onSave: (profile: UserProfile) => void;
}

export function TankaEdit({ profile, theme, onSave }: TankaEditProps) {
  const [tanka1, setTanka1] = useState(profile.tanka1);
  const [tanka2, setTanka2] = useState(profile.tanka2);
  const [tankaTheme, setTankaTheme] = useState(profile.tankaTheme ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!tanka1.trim()) errs.push("短歌を少なくとも1首入力してください");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }
    onSave({
      ...profile,
      tanka1: tanka1.trim(),
      tanka2: tanka2.trim(),
      tankaTheme: tankaTheme.trim() || undefined,
    });
  };

  return (
    <form className="tanka-edit-form" onSubmit={handleSubmit}>
      <h2 className="page-title">短歌を登録</h2>
      <p className="page-desc">あなたの作品を掲示しましょう。</p>

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <label className="field-label">
        一首目
        <textarea
          className="field-textarea"
          value={tanka1}
          onChange={(e) => setTanka1(e.target.value)}
          rows={3}
          placeholder="五七五七七"
        />
      </label>

      <label className="field-label">
        二首目
        <textarea
          className="field-textarea"
          value={tanka2}
          onChange={(e) => setTanka2(e.target.value)}
          rows={3}
          placeholder="五七五七七"
        />
      </label>

      <div className="theme-section">
        <h3 className="theme-title">
          月間テーマ「{theme.title}」
          <span className="theme-month">{theme.month}</span>
        </h3>
        <label className="field-label">
          テーマ作品（任意）
          <textarea
            className="field-textarea"
            value={tankaTheme}
            onChange={(e) => setTankaTheme(e.target.value)}
            rows={3}
            placeholder={`「${theme.title}」をテーマに`}
          />
        </label>
      </div>

      <button className="btn-primary" type="submit">保存</button>
    </form>
  );
}
