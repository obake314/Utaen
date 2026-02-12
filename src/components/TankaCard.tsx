import { useState } from "react";
import type { Tanka } from "../data/tanka";
import "./TankaCard.css";

interface TankaCardProps {
  tanka: Tanka;
  onLike: (tanka: Tanka) => void;
  onSkip: (tanka: Tanka) => void;
}

export function TankaCard({ tanka, onLike, onSkip }: TankaCardProps) {
  const [direction, setDirection] = useState<"" | "left" | "right">("");
  const [showDetail, setShowDetail] = useState(false);

  const handleLike = () => {
    setDirection("right");
    setTimeout(() => onLike(tanka), 300);
  };

  const handleSkip = () => {
    setDirection("left");
    setTimeout(() => onSkip(tanka), 300);
  };

  return (
    <div className={`tanka-card ${direction ? `swipe-${direction}` : ""}`}>
      <div className="tanka-theme-badge">{tanka.theme}</div>
      <div className="tanka-poem" onClick={() => setShowDetail(!showDetail)}>
        <p className="tanka-kami">{tanka.kami}</p>
        <p className="tanka-shimo">{tanka.shimo}</p>
      </div>
      {showDetail && (
        <div className="tanka-detail">
          <p className="tanka-author">{tanka.author}</p>
          <p className="tanka-era">{tanka.era}</p>
        </div>
      )}
      {!showDetail && (
        <p className="tanka-tap-hint">タップで詳細を見る</p>
      )}
      <div className="tanka-actions">
        <button className="btn-skip" onClick={handleSkip} aria-label="スキップ">
          ✕
        </button>
        <button className="btn-like" onClick={handleLike} aria-label="いいね">
          ♥
        </button>
      </div>
    </div>
  );
}
