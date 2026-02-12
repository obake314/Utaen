import { useState } from "react";
import { tankaList } from "./data/tanka";
import type { Tanka } from "./data/tanka";
import { TankaCard } from "./components/TankaCard";
import { MatchList } from "./components/MatchList";
import "./App.css";

type Page = "swipe" | "matches";

function App() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [matches, setMatches] = useState<Tanka[]>([]);
  const [page, setPage] = useState<Page>("swipe");

  const currentTanka = tankaList[currentIndex];
  const isFinished = currentIndex >= tankaList.length;

  const advance = () => {
    setCurrentIndex((i) => i + 1);
  };

  const handleLike = (tanka: Tanka) => {
    setMatches((prev) => [...prev, tanka]);
    advance();
  };

  const handleSkip = () => {
    advance();
  };

  const handleReset = () => {
    setCurrentIndex(0);
  };

  if (page === "matches") {
    return (
      <div className="app">
        <MatchList matches={matches} onBack={() => setPage("swipe")} />
      </div>
    );
  }

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-title">歌縁</h1>
        <p className="app-subtitle">Utaen - 短歌マッチング</p>
        <button className="btn-matches" onClick={() => setPage("matches")}>
          ♥ {matches.length}
        </button>
      </header>

      <main className="app-main">
        {isFinished ? (
          <div className="finished">
            <p className="finished-message">
              すべての歌を見ました
            </p>
            <p className="finished-count">
              {matches.length} 首の歌とマッチしました
            </p>
            <div className="finished-actions">
              <button className="btn-primary" onClick={() => setPage("matches")}>
                お気に入りを見る
              </button>
              <button className="btn-secondary" onClick={handleReset}>
                もう一度
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="progress">
              {currentIndex + 1} / {tankaList.length}
            </div>
            <TankaCard
              key={currentTanka.id}
              tanka={currentTanka}
              onLike={handleLike}
              onSkip={handleSkip}
            />
          </>
        )}
      </main>
    </div>
  );
}

export default App;
