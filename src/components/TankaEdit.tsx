import { useState } from "react";
import type { UserProfile, MonthlyTheme, TankaWork } from "../types";
import { getTankaCollection, getDisplayTankaIds } from "../store";

interface TankaEditProps {
  profile: UserProfile;
  theme: MonthlyTheme;
  onSave: (profile: UserProfile) => void;
}

export function TankaEdit({ profile, theme, onSave }: TankaEditProps) {
  const [collection, setCollection] = useState<TankaWork[]>(() =>
    getTankaCollection(profile),
  );
  const [displayIds, setDisplayIds] = useState<[string, string]>(() =>
    getDisplayTankaIds(profile),
  );
  const [newTanka, setNewTanka] = useState("");
  const [tankaTheme, setTankaTheme] = useState(profile.tankaTheme ?? "");
  const [previewText, setPreviewText] = useState<string | null>(null);
  const [errors, setErrors] = useState<string[]>([]);

  const handleAdd = () => {
    const text = newTanka.trim();
    if (!text) return;
    const work: TankaWork = {
      id: crypto.randomUUID(),
      text,
      createdAt: Date.now(),
    };
    const next = [...collection, work];
    setCollection(next);
    setNewTanka("");
    // 掲示枠が空いていたら自動選択
    if (!displayIds[0]) {
      setDisplayIds([work.id, displayIds[1]]);
    } else if (!displayIds[1]) {
      setDisplayIds([displayIds[0], work.id]);
    }
  };

  const handleRemove = (id: string) => {
    setCollection(collection.filter((w) => w.id !== id));
    const next: [string, string] = [
      displayIds[0] === id ? "" : displayIds[0],
      displayIds[1] === id ? "" : displayIds[1],
    ];
    setDisplayIds(next);
  };

  const toggleDisplay = (id: string, slot: 0 | 1) => {
    const next: [string, string] = [...displayIds];
    if (next[slot] === id) {
      next[slot] = "";
    } else {
      // 既にもう一方のスロットにあれば外す
      const other = slot === 0 ? 1 : 0;
      if (next[other] === id) next[other] = "";
      next[slot] = id;
    }
    setDisplayIds(next);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errs: string[] = [];
    if (collection.length === 0) errs.push("短歌を少なくとも1首登録してください");
    if (!displayIds[0] && !displayIds[1]) errs.push("掲示する短歌を選択してください");
    if (errs.length > 0) {
      setErrors(errs);
      return;
    }

    // displayIds から実テキストを取得
    const t1 = collection.find((w) => w.id === displayIds[0])?.text ?? "";
    const t2 = collection.find((w) => w.id === displayIds[1])?.text ?? "";

    onSave({
      ...profile,
      tanka1: t1,
      tanka2: t2,
      tankaTheme: tankaTheme.trim() || undefined,
      tankaCollection: collection,
      displayTankaIds: displayIds,
    });
  };

  const displaySet = new Set(displayIds.filter(Boolean));

  return (
    <form className="tanka-edit-form" onSubmit={handleSubmit}>
      <h2 className="page-title">短歌を登録</h2>
      <p className="page-desc">作品は無制限に登録できます。掲示は2首まで選べます。</p>

      {errors.length > 0 && (
        <div className="form-errors">
          {errors.map((err, i) => (
            <p key={i}>{err}</p>
          ))}
        </div>
      )}

      {/* 新規追加 */}
      <div className="tanka-add-area">
        <label className="field-label">
          新しい短歌を追加
          <textarea
            className="field-textarea"
            value={newTanka}
            onChange={(e) => setNewTanka(e.target.value)}
            rows={3}
            placeholder="五七五七七"
          />
        </label>
        <button type="button" className="btn-secondary" onClick={handleAdd}>
          追加
        </button>
      </div>

      {/* コレクション一覧 */}
      {collection.length > 0 && (
        <div className="tanka-collection">
          <h3 className="section-title">作品一覧（{collection.length}首）</h3>
          <ul className="collection-list">
            {collection.map((w) => (
              <li key={w.id} className={`collection-item ${displaySet.has(w.id) ? "is-display" : ""}`}>
                <div className="collection-text">{w.text}</div>
                <div className="collection-controls">
                  <button
                    type="button"
                    className={`btn-small ${displayIds[0] === w.id ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => toggleDisplay(w.id, 0)}
                  >
                    一首目
                  </button>
                  <button
                    type="button"
                    className={`btn-small ${displayIds[1] === w.id ? "btn-primary" : "btn-secondary"}`}
                    onClick={() => toggleDisplay(w.id, 1)}
                  >
                    二首目
                  </button>
                  <button
                    type="button"
                    className="btn-text"
                    onClick={() => setPreviewText(w.text)}
                  >
                    プレビュー
                  </button>
                  <button
                    type="button"
                    className="btn-text"
                    style={{ color: "#c33" }}
                    onClick={() => handleRemove(w.id)}
                  >
                    削除
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* プレビューモーダル */}
      {previewText !== null && (
        <div className="modal-overlay" onClick={() => setPreviewText(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="tanka-display">
              <p className="tanka-vertical">{previewText}</p>
            </div>
            <button
              type="button"
              className="btn-secondary"
              onClick={() => setPreviewText(null)}
              style={{ marginTop: 12, width: "100%" }}
            >
              閉じる
            </button>
          </div>
        </div>
      )}

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
