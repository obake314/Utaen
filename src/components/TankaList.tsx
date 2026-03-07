import { useState, useMemo } from "react";
import type { TankaEntry, SearchFilter as FilterT, Gender, SearchTarget } from "../types";
import { PREFECTURES, GENDER_LABELS, SEARCH_TARGET_LABELS } from "../types";
import {
  getAllTankaEntries,
  getProfileForTanka,
  hasLiked,
  addLike,
  consumeLike,
  getQuota,
  loadFilter,
  saveFilter,
  calcAge,
} from "../store";

interface TankaListProps {
  myId: string;
  onViewProfile: (userId: string) => void;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TankaList({ myId, onViewProfile }: TankaListProps) {
  const [filter, setFilter] = useState<FilterT>(loadFilter);
  const [showFilter, setShowFilter] = useState(false);
  const [likedSet, setLikedSet] = useState<Set<string>>(() => new Set());
  const [quota, setQuota] = useState(() => getQuota(myId));

  const entries = useMemo(() => {
    let all = getAllTankaEntries().filter((e) => e.userId !== myId);

    // apply filter
    all = all.filter((e) => {
      const p = getProfileForTanka(e.userId);
      if (!p) return false;
      const age = calcAge(p.birthDate);
      if (filter.prefecture && p.prefecture !== filter.prefecture) return false;
      if (age < filter.ageMin || age > filter.ageMax) return false;
      if (filter.gender && p.gender !== filter.gender) return false;
      if (filter.searchTarget && p.searchTarget !== filter.searchTarget) return false;
      return true;
    });

    return shuffle(all);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [myId, filter]);

  const handleLike = (entry: TankaEntry) => {
    if (hasLiked(myId, entry.id)) return;
    if (!consumeLike(myId)) return;
    addLike(myId, entry.userId, entry.id);
    setLikedSet((prev) => new Set(prev).add(entry.id));
    setQuota(getQuota(myId));
  };

  const handleFilterChange = (next: FilterT) => {
    setFilter(next);
    saveFilter(next);
  };

  return (
    <div className="tanka-list-page">
      <div className="list-header">
        <h2 className="page-title">短歌を探す</h2>
        <span className="quota-badge">いいね残り {quota.remaining}</span>
        <button
          className="btn-secondary btn-small"
          onClick={() => setShowFilter(!showFilter)}
        >
          {showFilter ? "閉じる" : "絞り込み"}
        </button>
      </div>

      {showFilter && (
        <div className="filter-panel">
          <label className="field-label">
            都道府県
            <select
              className="field-input"
              value={filter.prefecture}
              onChange={(e) =>
                handleFilterChange({ ...filter, prefecture: e.target.value })
              }
            >
              <option value="">全て</option>
              {PREFECTURES.map((p) => (
                <option key={p} value={p}>{p}</option>
              ))}
            </select>
          </label>
          <div className="filter-row">
            <label className="field-label">
              年齢
              <div className="age-range">
                <input
                  className="field-input field-narrow"
                  type="number"
                  min={18}
                  max={99}
                  value={filter.ageMin}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filter,
                      ageMin: parseInt(e.target.value, 10) || 18,
                    })
                  }
                />
                <span className="range-sep">-</span>
                <input
                  className="field-input field-narrow"
                  type="number"
                  min={18}
                  max={99}
                  value={filter.ageMax}
                  onChange={(e) =>
                    handleFilterChange({
                      ...filter,
                      ageMax: parseInt(e.target.value, 10) || 99,
                    })
                  }
                />
              </div>
            </label>
          </div>
          <label className="field-label">
            性別
            <select
              className="field-input"
              value={filter.gender}
              onChange={(e) =>
                handleFilterChange({ ...filter, gender: e.target.value as Gender | "" })
              }
            >
              <option value="">全て</option>
              {(Object.entries(GENDER_LABELS) as [Gender, string][]).map(([v, l]) => (
                <option key={v} value={v}>{l}</option>
              ))}
            </select>
          </label>
          <label className="field-label">
            検索対象
            <select
              className="field-input"
              value={filter.searchTarget}
              onChange={(e) =>
                handleFilterChange({
                  ...filter,
                  searchTarget: e.target.value as SearchTarget | "",
                })
              }
            >
              <option value="">全て</option>
              {(Object.entries(SEARCH_TARGET_LABELS) as [SearchTarget, string][]).map(
                ([v, l]) => (
                  <option key={v} value={v}>{l}</option>
                ),
              )}
            </select>
          </label>
        </div>
      )}

      {entries.length === 0 ? (
        <p className="empty-message">条件に合う短歌がありません</p>
      ) : (
        <ul className="tanka-entries">
          {entries.map((entry) => {
            const author = getProfileForTanka(entry.userId);
            if (!author) return null;
            const age = calcAge(author.birthDate);
            const alreadyLiked = hasLiked(myId, entry.id) || likedSet.has(entry.id);

            return (
              <li key={entry.id} className="tanka-entry">
                <div className="tanka-display">
                  <p className="tanka-vertical">{entry.text}</p>
                </div>
                {entry.type === "theme" && (
                  <span className="theme-badge">月間テーマ</span>
                )}
                <div className="entry-footer">
                  <button
                    className="author-link"
                    onClick={() => onViewProfile(entry.userId)}
                  >
                    {author.displayName}
                    <span className="author-meta">
                      {GENDER_LABELS[author.gender]} / {age}歳 / {author.prefecture}
                    </span>
                  </button>
                  <button
                    className={`btn-like ${alreadyLiked ? "liked" : ""}`}
                    disabled={alreadyLiked || quota.remaining <= 0}
                    onClick={() => handleLike(entry)}
                  >
                    {alreadyLiked ? "いいね済" : "いいね"}
                  </button>
                </div>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
