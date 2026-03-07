import { useState } from "react";
import { register, login } from "../store";

interface AuthFormProps {
  onAuth: () => void;
}

export function AuthForm({ onAuth }: AuthFormProps) {
  const [mode, setMode] = useState<"login" | "register">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!email || !password) {
      setError("メールアドレスとパスワードを入力してください");
      return;
    }

    if (mode === "register") {
      if (password.length < 6) {
        setError("パスワードは6文字以上で入力してください");
        return;
      }
      if (password !== passwordConfirm) {
        setError("パスワードが一致しません");
        return;
      }
      const result = register(email, password);
      if (!result.ok) {
        setError(result.error!);
        return;
      }
    } else {
      const result = login(email, password);
      if (!result.ok) {
        setError(result.error!);
        return;
      }
    }
    onAuth();
  };

  return (
    <div className="auth-page">
      <h1 className="auth-logo">歌縁</h1>
      <p className="auth-tagline">Utaen</p>

      <form className="auth-form" onSubmit={handleSubmit}>
        <h2 className="auth-title">
          {mode === "login" ? "ログイン" : "アカウント登録"}
        </h2>

        {error && <p className="auth-error">{error}</p>}

        <label className="field-label">
          メールアドレス
          <input
            className="field-input"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="example@mail.com"
          />
        </label>

        <label className="field-label">
          パスワード
          <input
            className="field-input"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder={mode === "register" ? "6文字以上" : ""}
          />
        </label>

        {mode === "register" && (
          <label className="field-label">
            パスワード（確認）
            <input
              className="field-input"
              type="password"
              value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
            />
          </label>
        )}

        <button className="btn-primary" type="submit">
          {mode === "login" ? "ログイン" : "登録"}
        </button>

        <button
          className="btn-text"
          type="button"
          onClick={() => {
            setError("");
            setMode(mode === "login" ? "register" : "login");
          }}
        >
          {mode === "login"
            ? "アカウントをお持ちでない方"
            : "すでにアカウントをお持ちの方"}
        </button>
      </form>
    </div>
  );
}
