import type { Tanka } from "../data/tanka";
import "./MatchList.css";

interface MatchListProps {
  matches: Tanka[];
  onBack: () => void;
}

export function MatchList({ matches, onBack }: MatchListProps) {
  return (
    <div className="match-list">
      <div className="match-header">
        <button className="btn-back" onClick={onBack}>
          &larr; 戻る
        </button>
        <h2>お気に入りの歌 ({matches.length})</h2>
      </div>
      {matches.length === 0 ? (
        <p className="match-empty">
          まだお気に入りの歌がありません。
          <br />
          気になる歌に ♥ を押してみましょう。
        </p>
      ) : (
        <ul className="match-items">
          {matches.map((tanka) => (
            <li key={tanka.id} className="match-item">
              <div className="match-poem">
                <span className="match-kami">{tanka.kami.replace(/\n/g, " ")}</span>
                <span className="match-shimo">{tanka.shimo.replace(/\n/g, " ")}</span>
              </div>
              <div className="match-meta">
                <span className="match-author">{tanka.author}</span>
                <span className="match-theme-badge">{tanka.theme}</span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
