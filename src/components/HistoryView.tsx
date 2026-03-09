import { useState } from "react";
import type { TankaEntry } from "../types";
import {
  getKeptEntries,
  getLikedEntries,
  removeKeep,
  addLike,
  addSorehodo,
  consumeLike,
  getQuota,
  hasLiked,
  checkNewMatch,
  getProfileForTanka,
  sendDm,
} from "../store";

interface HistoryViewProps {
  myId: string;
}

export function HistoryView({ myId }: HistoryViewProps) {
  const [tab, setTab] = useState<"keep" | "like">("keep");
  const [refreshKey, setRefreshKey] = useState(0);
  const [quota, setQuota] = useState(() => getQuota(myId));
  const [matchModal, setMatchModal] = useState<{ partnerName: string; thanksMessage: string } | null>(null);

  const refresh = () => setRefreshKey((k) => k + 1);

  const keptEntries = getKeptEntries(myId);
  const likedEntries = getLikedEntries(myId);

  const handleLikeFromKeep = (entry: TankaEntry) => {
    if (hasLiked(myId, entry.id)) return;
    if (!consumeLike(myId)) return;
    addLike(myId, entry.userId, entry.id);
    removeKeep(myId, entry.id);
    setQuota(getQuota(myId));

    const matched = checkNewMatch(myId, entry.userId);
    if (matched) {
      const partner = getProfileForTanka(entry.userId);
      const thanksMsg = partner?.thanksMessage ?? "";
      if (thanksMsg) sendDm(entry.userId, myId, thanksMsg);
      setMatchModal({
        partnerName: partner?.displayName ?? "相手",
        thanksMessage: thanksMsg,
      });
    }
    refresh();
  };

  const handleSorehodFromKeep = (entry: TankaEntry) => {
    addSorehodo(myId, entry.id, entry.version);
    removeKeep(myId, entry.id);
    refresh();
  };

  const handleRemoveKeep = (entry: TankaEntry) => {
    removeKeep(myId, entry.id);
    refresh();
  };

  // suppress lint for refreshKey used to trigger re-render
  void refreshKey;

  return (
    <div className="history-page">
      <h2 className="page-title">履歴</h2>
      <div className="history-tabs">
        <button
          className={`history-tab ${tab === "keep" ? "active" : ""}`}
          onClick={() => setTab("keep")}
        >
          キープ ({keptEntries.length})
        </button>
        <button
          className={`history-tab ${tab === "like" ? "active" : ""}`}
          onClick={() => setTab("like")}
        >
          いいね済 ({likedEntries.length})
        </button>
      </div>

      <div className="quota-badge" style={{ marginBottom: 8 }}>
        いいね残り {quota.remaining}
      </div>

      {tab === "keep" && (
        <ul className="history-list">
          {keptEntries.length === 0 && (
            <p className="empty-message">キープした短歌はありません</p>
          )}
          {keptEntries.map((entry) => (
            <li key={entry.id} className="history-item">
              <div className="tanka-display">
                <p className="tanka-vertical tanka-vertical-small">{entry.text}</p>
              </div>
              {entry.type === "theme" && (
                <span className="theme-badge">月間テーマ</span>
              )}
              <div className="history-actions">
                <button
                  className="action-btn action-sorehodo"
                  onClick={() => handleSorehodFromKeep(entry)}
                >
                  それほど
                </button>
                <button
                  className="action-btn action-like"
                  disabled={quota.remaining <= 0}
                  onClick={() => handleLikeFromKeep(entry)}
                >
                  いいね
                </button>
                <button
                  className="btn-text"
                  onClick={() => handleRemoveKeep(entry)}
                >
                  キープ解除
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}

      {tab === "like" && (
        <ul className="history-list">
          {likedEntries.length === 0 && (
            <p className="empty-message">いいねした短歌はありません</p>
          )}
          {likedEntries.map((entry) => (
            <li key={entry.id} className="history-item">
              <div className="tanka-display">
                <p className="tanka-vertical tanka-vertical-small">{entry.text}</p>
              </div>
              {entry.type === "theme" && (
                <span className="theme-badge">月間テーマ</span>
              )}
              <div className="history-actions">
                <span className="liked-label">いいね済</span>
              </div>
            </li>
          ))}
        </ul>
      )}

      {/* マッチモーダル */}
      {matchModal && (
        <div className="modal-overlay" onClick={() => setMatchModal(null)}>
          <div className="modal-content modal-match" onClick={(e) => e.stopPropagation()}>
            <h3 className="match-title">マッチしました！</h3>
            <p className="match-partner">{matchModal.partnerName} さんと相互いいねが成立しました</p>
            {matchModal.thanksMessage && (
              <div className="match-thanks">
                <p className="match-thanks-label">サンクス文</p>
                <p className="match-thanks-text">{matchModal.thanksMessage}</p>
              </div>
            )}
            <p className="match-info">DMでメッセージを送れるようになりました</p>
            <button
              className="btn-primary"
              onClick={() => setMatchModal(null)}
              style={{ width: "100%", marginTop: 12 }}
            >
              OK
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
