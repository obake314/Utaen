import { useState } from "react";
import type { UserProfile } from "../types";
import { getMatchedUserIds, getProfileForTanka, getDmThread, sendDm } from "../store";

interface DmViewProps {
  myId: string;
}

export function DmView({ myId }: DmViewProps) {
  const [selectedUser, setSelectedUser] = useState<string | null>(null);
  const [text, setText] = useState("");
  const [refreshKey, setRefreshKey] = useState(0);

  const matchedIds = getMatchedUserIds(myId);
  const matchedProfiles = matchedIds
    .map((id) => getProfileForTanka(id))
    .filter((p): p is UserProfile => p !== null);

  if (selectedUser) {
    const partner = getProfileForTanka(selectedUser);
    const messages = getDmThread(myId, selectedUser);

    const handleSend = (e: React.FormEvent) => {
      e.preventDefault();
      if (!text.trim()) return;
      sendDm(myId, selectedUser, text.trim());
      setText("");
      setRefreshKey((k) => k + 1);
    };

    return (
      <div className="dm-thread" key={refreshKey}>
        <button className="btn-back" onClick={() => setSelectedUser(null)}>
          戻る
        </button>
        <h3 className="dm-partner-name">{partner?.displayName ?? "不明"}</h3>

        <div className="dm-messages">
          {messages.length === 0 && (
            <p className="empty-message">メッセージはまだありません</p>
          )}
          {messages.map((m) => (
            <div
              key={m.id}
              className={`dm-bubble ${m.fromUserId === myId ? "dm-mine" : "dm-theirs"}`}
            >
              {m.text}
            </div>
          ))}
        </div>

        <form className="dm-input-area" onSubmit={handleSend}>
          <input
            className="field-input dm-input"
            type="text"
            value={text}
            onChange={(e) => setText(e.target.value)}
            placeholder="メッセージを入力"
          />
          <button className="btn-primary btn-small" type="submit">
            送信
          </button>
        </form>
      </div>
    );
  }

  return (
    <div className="dm-list-page">
      <h2 className="page-title">メッセージ</h2>
      {matchedProfiles.length === 0 ? (
        <p className="empty-message">
          相互いいねが成立するとメッセージが送れます
        </p>
      ) : (
        <ul className="dm-user-list">
          {matchedProfiles.map((p) => (
            <li key={p.id}>
              <button
                className="dm-user-row"
                onClick={() => setSelectedUser(p.id)}
              >
                <span className="dm-user-name">{p.displayName}</span>
                <span className="dm-user-meta">{p.prefecture}</span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
