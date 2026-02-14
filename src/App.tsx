import { useState, useEffect, useCallback } from "react";
import type { UserProfile, DailyState, SearchFilter as FilterType } from "./types";
import { MAX_LIKES } from "./types";
import {
  loadProfile,
  saveProfile,
  loadFilter,
  saveFilter,
  loadDailyState,
  saveDailyState,
  resetDailyState,
  addLikedId,
  getLikedProfiles,
} from "./store";
import { ProfileForm } from "./components/ProfileForm";
import { TankaCard } from "./components/TankaCard";
import { MatchList } from "./components/MatchList";
import { SearchFilter } from "./components/SearchFilter";
import "./App.css";

type Page = "match" | "likes" | "profile";

function App() {
  const [profile, setProfile] = useState<UserProfile | null>(loadProfile);
  const [page, setPage] = useState<Page>(loadProfile() ? "match" : "profile");
  const [filter, setFilter] = useState<FilterType>(loadFilter);
  const [showFilter, setShowFilter] = useState(false);
  const [daily, setDaily] = useState<DailyState | null>(null);
  const [likedProfiles, setLikedProfiles] = useState<UserProfile[]>(getLikedProfiles);

  // 日次ステート初期化
  const initDaily = useCallback(() => {
    if (!profile) return;
    const state = loadDailyState(filter, profile.id);
    setDaily(state);
  }, [filter, profile]);

  useEffect(() => {
    if (profile) initDaily();
  }, [profile, initDaily]);

  // --- handlers ---

  const handleSaveProfile = (p: UserProfile) => {
    saveProfile(p);
    setProfile(p);
    setPage("match");
  };

  const handleFilterChange = (f: FilterType) => {
    setFilter(f);
    saveFilter(f);
  };

  const handleFilterClose = () => {
    setShowFilter(false);
    // フィルタ変更時にデイリーをリセットして再生成
    resetDailyState();
    initDaily();
  };

  const updateDaily = (next: DailyState) => {
    saveDailyState(next);
    setDaily(next);
  };

  const handleLike = () => {
    if (!daily) return;
    const idx = getCurrentIdx(daily);
    if (idx === -1) return;

    const next = { ...daily, candidates: [...daily.candidates] };
    next.candidates[idx] = { ...next.candidates[idx], status: "like" as const };
    next.likeCount += 1;
    next.reviewed += daily.selectionPhase ? 0 : 1;

    addLikedId(next.candidates[idx].profile.id);
    setLikedProfiles(getLikedProfiles());
    updateDaily(next);
  };

  const handleUnlike = () => {
    if (!daily) return;
    const idx = getCurrentIdx(daily);
    if (idx === -1) return;

    const next = { ...daily, candidates: [...daily.candidates] };
    next.candidates[idx] = { ...next.candidates[idx], status: "unlike" as const };
    next.reviewed += daily.selectionPhase ? 0 : 1;
    updateDaily(next);
  };

  const handlePending = () => {
    if (!daily) return;
    const idx = getCurrentIdx(daily);
    if (idx === -1) return;

    // PENDING はそのまま保留 → reviewed だけ進める
    const next = { ...daily, candidates: [...daily.candidates] };
    next.reviewed += 1;
    updateDaily(next);
  };

  // --- 現在表示すべきカードのインデックス ---
  function getCurrentIdx(state: DailyState): number {
    if (state.selectionPhase) {
      // PENDING選定フェーズ: まだ pending のものを順に表示
      return state.candidates.findIndex((c) => c.status === "pending");
    }
    // 通常フェーズ: reviewed 番目
    if (state.reviewed < state.candidates.length) {
      return state.reviewed;
    }
    return -1;
  }

  // 全閲覧済みかチェック → PENDING選定フェーズ移行判定
  useEffect(() => {
    if (!daily) return;
    if (daily.selectionPhase) return;

    const allReviewed = daily.reviewed >= daily.candidates.length;
    if (!allReviewed) return;

    const hasPending = daily.candidates.some((c) => c.status === "pending");
    const canStillLike = daily.likeCount < MAX_LIKES;

    if (hasPending && canStillLike) {
      updateDaily({ ...daily, selectionPhase: true });
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [daily?.reviewed, daily?.selectionPhase]);

  // --- render ---

  // プロフィール未登録
  if (!profile || page === "profile") {
    return (
      <div className="app">
        <header className="app-header">
          <h1 className="app-title">歌縁</h1>
          <p className="app-subtitle">Utaen - 短歌マッチング</p>
        </header>
        <main className="app-main">
          <ProfileForm initial={profile} onSave={handleSaveProfile} />
          {profile && (
            <button className="btn-link" onClick={() => setPage("match")}>
              戻る
            </button>
          )}
        </main>
      </div>
    );
  }

  const currentIdx = daily ? getCurrentIdx(daily) : -1;
  const currentCandidate = daily && currentIdx >= 0 ? daily.candidates[currentIdx] : null;
  const canLike = daily ? daily.likeCount < MAX_LIKES : false;
  const isFinished = daily ? currentIdx === -1 : false;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">歌縁</h1>
        <p className="app-subtitle">Utaen - 短歌マッチング</p>
      </header>

      {/* ナビゲーション */}
      <nav className="nav-bar">
        <button
          className={`nav-btn ${page === "match" ? "active" : ""}`}
          onClick={() => setPage("match")}
        >
          探す
        </button>
        <button
          className={`nav-btn ${page === "likes" ? "active" : ""}`}
          onClick={() => {
            setLikedProfiles(getLikedProfiles());
            setPage("likes");
          }}
        >
          LIKE ({likedProfiles.length})
        </button>
        <button
          className="nav-btn"
          onClick={() => setPage("profile")}
        >
          プロフィール
        </button>
      </nav>

      <main className="app-main">
        {page === "likes" && <MatchList matches={likedProfiles} />}

        {page === "match" && daily && (
          <>
            <div className="match-status-bar">
              <span className="status-text">
                {daily.selectionPhase
                  ? "保留した歌人を選定中"
                  : `${Math.min(daily.reviewed + 1, daily.candidates.length)} / ${daily.candidates.length}`}
              </span>
              <span className="status-likes">
                LIKE: {daily.likeCount}/{MAX_LIKES}
              </span>
              <button
                className="btn-filter-toggle"
                onClick={() => setShowFilter(true)}
              >
                絞り込み
              </button>
            </div>

            {isFinished ? (
              <div className="finished">
                <p className="finished-message">本日の歌はすべて見ました</p>
                <p className="finished-count">
                  {daily.likeCount} 人の歌人にLIKEしました
                </p>
              </div>
            ) : (
              currentCandidate && (
                <TankaCard
                  key={currentCandidate.profile.id + (daily.selectionPhase ? "-s" : "")}
                  candidate={currentCandidate}
                  canLike={canLike}
                  onLike={handleLike}
                  onUnlike={handleUnlike}
                  onPending={
                    daily.selectionPhase
                      ? handleUnlike // 選定フェーズではPENDINGの代わりにUNLIKE扱い
                      : handlePending
                  }
                />
              )
            )}
          </>
        )}
      </main>

      {showFilter && (
        <SearchFilter
          filter={filter}
          onChange={handleFilterChange}
          onClose={handleFilterClose}
        />
      )}
    </div>
  );
}

export default App;
