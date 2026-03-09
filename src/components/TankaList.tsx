import { useState, useMemo, useCallback } from "react";
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
  isKept,
  addKeep,
  isSorehodo,
  addSorehodo,
} from "../store";

interface TankaListProps {
  myId: string;
}

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export function TankaList({ myId }: TankaListProps) {
  const [filter, setFilter] = useState<FilterT>(loadFilter);
  const [showFilter, setShowFilter] = useState(false);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [swipeDir, setSwipeDir] = useState<"left" | "right" | "up" | null>(null);
  const [quota, setQuota] = useState(() => getQuota(myId));
  // Track dismissed entries to trigger re-filter
  const [dismissed, setDismissed] = useState<Set<string>>(() => new Set());

  const entries = useMemo(() => {
    let all = getAllTankaEntries().filter((e) => e.userId !== myId);

    // 「それほど」除外（更新された歌は再表示）
    all = all.filter((e) => !isSorehodo(myId, e.id, e.version));

    // already acted
    all = all.filter((e) => !dismissed.has(e.id) && !hasLiked(myId, e.id) && !isKept(myId, e.id));

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
  }, [myId, filter, dismissed]);

  const advanceCard = useCallback(() => {
    setCurrentIndex((prev) => prev + 1);
  }, []);

  const animateAndAct = useCallback(
    (dir: "left" | "right" | "up", action: () => void) => {
      setSwipeDir(dir);
      setTimeout(() => {
        action();
        setSwipeDir(null);
        advanceCard();
      }, 300);
    },
    [advanceCard],
  );

  const entry = entries[currentIndex] as TankaEntry | undefined;

  const handleLike = () => {
    if (!entry) return;
    if (!consumeLike(myId)) return;
    addLike(myId, entry.userId, entry.id);
    setQuota(getQuota(myId));
    animateAndAct("right", () => {
      setDismissed((prev) => new Set(prev).add(entry.id));
    });
  };

  const handleKeep = () => {
    if (!entry) return;
    addKeep(myId, entry.id);
    animateAndAct("up", () => {
      setDismissed((prev) => new Set(prev).add(entry.id));
    });
  };

  const handleSorehodo = () => {
    if (!entry) return;
    addSorehodo(myId, entry.id, entry.version);
    animateAndAct("left", () => {
      setDismissed((prev) => new Set(prev).add(entry.id));
    });
  };

  const handleFilterChange = (next: FilterT) => {
    setFilter(next);
    saveFilter(next);
    setCurrentIndex(0);
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

      <div className="swipe-container">
        {!entry ? (
          <div className="swipe-empty">
            <p className="empty-message">条件に合う短歌がありません</p>
          </div>
        ) : (
          <div
            className={`swipe-card ${swipeDir ? `swipe-${swipeDir}` : ""}`}
            key={entry.id}
          >
            <div className="tanka-display">
              <p className="tanka-vertical">{entry.text}</p>
            </div>
            {entry.type === "theme" && (
              <span className="theme-badge">月間テーマ</span>
            )}
          </div>
        )}
      </div>

      {entry && !swipeDir && (
        <div className="swipe-actions">
          <button
            className="action-btn action-sorehodo"
            onClick={handleSorehodo}
          >
            それほど
          </button>
          <button
            className="action-btn action-keep"
            onClick={handleKeep}
          >
            キープ
          </button>
          <button
            className="action-btn action-like"
            disabled={quota.remaining <= 0}
            onClick={handleLike}
          >
            いいね
          </button>
        </div>
      )}
    </div>
  );
}
