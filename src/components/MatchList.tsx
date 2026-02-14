import type { UserProfile } from "../types";
import "./MatchList.css";

interface MatchListProps {
  matches: UserProfile[];
}

export function MatchList({ matches }: MatchListProps) {
  if (matches.length === 0) {
    return (
      <div className="match-list">
        <p className="match-empty">
          まだLIKEした相手がいません。
          <br />
          気になる歌人に LIKE を送りましょう。
        </p>
      </div>
    );
  }

  return (
    <div className="match-list">
      <ul className="match-items">
        {matches.map((u) => (
          <li key={u.id} className="match-item">
            <div className="match-item-header">
              <span className="match-name">{u.displayName}</span>
              <span className="match-meta">
                {u.age}歳 / {u.region}
              </span>
            </div>
            <p className="match-bio">{u.bio}</p>
            <div className="match-poems">
              <p className="match-poem">{u.tanka1}</p>
              {u.tanka2 && <p className="match-poem poem2">{u.tanka2}</p>}
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
