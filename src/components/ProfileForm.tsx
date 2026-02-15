import { useState } from "react";
import type { UserProfile } from "../types";
import { REGIONS } from "../types";
import "./ProfileForm.css";

interface ProfileFormProps {
  initial?: UserProfile | null;
  onSave: (profile: UserProfile) => void;
}

type Mode = "login" | "register" | "edit";

export function ProfileForm({ initial, onSave }: ProfileFormProps) {
  const [mode, setMode] = useState<Mode>(initial ? "edit" : "login");
  const [email, setEmail] = useState(initial?.email ?? "");
  const [displayName, setDisplayName] = useState(initial?.displayName ?? "");
  const [age, setAge] = useState(initial?.age?.toString() ?? "");
  const [region, setRegion] = useState(initial?.region ?? "");
  const [bio, setBio] = useState(initial?.bio ?? "");
  const [tanka1, setTanka1] = useState(initial?.tanka1 ?? "");
  const [tanka2, setTanka2] = useState(initial?.tanka2 ?? "");
  const [errors, setErrors] = useState<string[]>([]);

  const validateEmail = (v: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateEmail(email)) {
      setErrors(["有効なメールアドレスを入力してください"]);
      return;
    }
    setErrors([]);
    setMode("register");
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (!validateEmail(email)) errs.push("有効なメールアドレスを入力してください");
    if (!displayName.trim()) errs.push("表示名を入力してください");
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 18 || ageNum > 99)
      errs.push("年齢は18〜99で入力してください");
    if (!region) errs.push("地域を選択してください");
    if (bio.length > 50) errs.push("プロフィール文は50文字以内です");
    if (!tanka1.trim()) errs.push("短歌を少なくとも1首入力してください");

    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    onSave({
      id: initial?.id ?? crypto.randomUUID(),
      email: email.trim(),
      displayName: displayName.trim(),
      age: ageNum,
      region,
      bio: bio.trim(),
      tanka1: tanka1.trim(),
      tanka2: tanka2.trim(),
    });
  };

  if (mode === "login") {
    return (
      <form className="profile-form" onSubmit={handleLogin}>
        <h2 className="form-title">歌縁にログイン</h2>
        <p className="form-desc">メールアドレスで始めましょう</p>

        {errors.length > 0 && (
          <div className="form-errors">
            {errors.map((err, i) => (
              <p key={i}>{err}</p>
            ))}
          </div>
        )}

        <label className="form-label">
          メールアドレス
          <input
            className="form-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
            autoFocus
          />
        </label>

        <button className="btn-submit" type="submit">
          次へ
        </button>

        <button
          className="btn-text-link"
          type="button"
          onClick={() => { setErrors([]); setMode("register"); }}
        >
          アカウントをお持ちでない方はこちら
        </button>
      </form>
    );
  }

  return (
    <form className="profile-form" onSubmit={handleSubmit}>
      <h2 className="form-title">
        {mode === "edit" ? "プロフィール編集" : "アカウント登録"}
      </h2>

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      <label className="form-label">
        メールアドレス
        <input
          className="form-input"
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="example@mail.com"
          disabled={mode === "edit"}
        />
      </label>

      <label className="form-label">
        表示名
        <input
          className="form-input"
          type="text"
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
          placeholder="例：花月"
          maxLength={20}
        />
      </label>

      <label className="form-label">
        年齢
        <input
          className="form-input"
          type="number"
          value={age}
          onChange={(e) => setAge(e.target.value)}
          min={18}
          max={99}
          placeholder="18"
        />
      </label>

      <label className="form-label">
        地域
        <select
          className="form-input"
          value={region}
          onChange={(e) => setRegion(e.target.value)}
        >
          <option value="">選択してください</option>
          {REGIONS.map((r) => (
            <option key={r} value={r}>
              {r}
            </option>
          ))}
        </select>
      </label>

      <label className="form-label">
        プロフィール文（{bio.length}/50文字）
        <textarea
          className="form-textarea"
          value={bio}
          onChange={(e) => setBio(e.target.value)}
          maxLength={50}
          rows={2}
          placeholder="自己紹介を書きましょう"
        />
      </label>

      <label className="form-label">
        短歌 一首目
        <textarea
          className="form-textarea"
          value={tanka1}
          onChange={(e) => setTanka1(e.target.value)}
          rows={2}
          placeholder="例：花の色は 移りにけりな いたづらに わが身世にふる ながめせしまに"
        />
      </label>

      <label className="form-label">
        短歌 二首目（任意）
        <textarea
          className="form-textarea"
          value={tanka2}
          onChange={(e) => setTanka2(e.target.value)}
          rows={2}
          placeholder="任意"
        />
      </label>

      <button className="btn-submit" type="submit">
        {mode === "edit" ? "保存する" : "登録する"}
      </button>

      {mode === "register" && (
        <button
          className="btn-text-link"
          type="button"
          onClick={() => { setErrors([]); setMode("login"); }}
        >
          すでにアカウントをお持ちの方
        </button>
      )}
    </form>
  );
}
