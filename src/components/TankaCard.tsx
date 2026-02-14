import { useState } from "react";
import type { DailyCandidate } from "../types";
import "./TankaCard.css";

interface TankaCardProps {
  candidate: DailyCandidate;
  canLike: boolean;
  onLike: () => void;
  onUnlike: () => void;
  onPending: () => void;
}

export function TankaCard({
  candidate,
  canLike,
  onLike,
  onUnlike,
  onPending,
}: TankaCardProps) {
  const { profile } = candidate;
  const [exit, setExit] = useState<"" | "left" | "right" | "down">("");

  const handleLike = () => {
    setExit("right");
    setTimeout(onLike, 280);
  };
  const handleUnlike = () => {
    setExit("left");
    setTimeout(onUnlike, 280);
  };
  const handlePending = () => {
    setExit("down");
    setTimeout(onPending, 280);
  };

  return (
    <div className={`tanka-card ${exit ? `exit-${exit}` : ""}`}>
      <div className="card-profile-header">
        <span className="card-name">{profile.displayName}</span>
        <span className="card-meta">
          {profile.age}歳 / {profile.region}
        </span>
      </div>

      <p className="card-bio">{profile.bio}</p>

      <div className="card-poems">
        <p className="card-poem">{profile.tanka1}</p>
        {profile.tanka2 && <p className="card-poem poem-second">{profile.tanka2}</p>}
      </div>

      <div className="card-actions">
        <button className="btn-action btn-unlike" onClick={handleUnlike}>
          <span className="btn-icon">✕</span>
          <span className="btn-text">UNLIKE</span>
        </button>
        <button className="btn-action btn-pending" onClick={handlePending}>
          <span className="btn-icon">…</span>
          <span className="btn-text">PENDING</span>
        </button>
        <button
          className="btn-action btn-like"
          onClick={handleLike}
          disabled={!canLike}
        >
          <span className="btn-icon">&#9825;</span>
          <span className="btn-text">LIKE</span>
        </button>
      </div>
    </div>
  );
}
