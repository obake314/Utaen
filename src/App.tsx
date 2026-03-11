import { useState } from "react";
import {
  getCurrentAccount,
  getCurrentProfile,
  saveProfile,
  getProfile,
  getCurrentTheme,
  logout,
} from "./store";
import type { UserProfile } from "./types";
import { AuthForm } from "./components/AuthForm";
import { ProfileEdit } from "./components/ProfileEdit";
import { TankaEdit } from "./components/TankaEdit";
import { TankaList } from "./components/TankaList";
import { ProfileView } from "./components/ProfileView";
import { DmView } from "./components/DmView";
import { HistoryView } from "./components/HistoryView";
import "./App.css";

type Page =
  | { type: "auth" }
  | { type: "profile-setup" }
  | { type: "tanka-setup" }
  | { type: "explore" }
  | { type: "history" }
  | { type: "dm" }
  | { type: "my-profile" }
  | { type: "my-tanka" }
  | { type: "view-profile"; userId: string; from: Page["type"] }
  | { type: "my-profile-preview" };

function App() {
  const [page, setPage] = useState<Page>(() => {
    const account = getCurrentAccount();
    if (!account) return { type: "auth" };
    const profile = getCurrentProfile();
    if (!profile) return { type: "profile-setup" };
    if (!profile.tanka1) return { type: "tanka-setup" };
    return { type: "explore" };
  });
  const [, setTick] = useState(0);
  const refresh = () => setTick((t) => t + 1);

  const account = getCurrentAccount();
  const profile = getCurrentProfile();
  const theme = getCurrentTheme();

  const handleAuth = () => {
    const acc = getCurrentAccount();
    if (!acc) return;
    const prof = getCurrentProfile();
    if (!prof) {
      setPage({ type: "profile-setup" });
    } else if (!prof.tanka1) {
      setPage({ type: "tanka-setup" });
    } else {
      setPage({ type: "explore" });
    }
    refresh();
  };

  const handleProfileSave = (p: UserProfile) => {
    saveProfile(p);
    if (!p.tanka1) {
      setPage({ type: "tanka-setup" });
    } else {
      setPage({ type: "explore" });
    }
    refresh();
  };

  const handleTankaSave = (p: UserProfile) => {
    saveProfile(p);
    setPage({ type: "explore" });
    refresh();
  };

  const handleLogout = () => {
    logout();
    setPage({ type: "auth" });
    refresh();
  };

  if (page.type === "auth") {
    return <AuthForm onAuth={handleAuth} />;
  }

  if (page.type === "profile-setup") {
    return (
      <div className="app">
        <ProfileEdit
          profile={profile}
          profileId={account!.profileId}
          email={account!.email}
          onSave={handleProfileSave}
        />
      </div>
    );
  }

  if (page.type === "tanka-setup") {
    return (
      <div className="app">
        <TankaEdit
          profile={profile!}
          theme={theme}
          onSave={handleTankaSave}
        />
      </div>
    );
  }

  if (page.type === "view-profile") {
    const target = getProfile(page.userId);
    const from = page.from;
    if (!target) {
      setPage({ type: "explore" });
      return null;
    }
    return (
      <div className="app">
        <ProfileView
          profile={target}
          onBack={() => setPage({ type: from } as Page)}
        />
      </div>
    );
  }

  if (page.type === "my-profile-preview") {
    return (
      <div className="app">
        <ProfileView
          profile={profile!}
          onBack={() => setPage({ type: "my-profile" })}
        />
      </div>
    );
  }

  const activeTab = page.type;

  return (
    <div className="app">
      <header className="app-header">
        <h1 className="app-logo">歌縁</h1>
      </header>

      <nav className="nav-bar">
        <button
          className={`nav-btn ${activeTab === "explore" ? "active" : ""}`}
          onClick={() => setPage({ type: "explore" })}
        >
          探す
        </button>
        <button
          className={`nav-btn ${activeTab === "history" ? "active" : ""}`}
          onClick={() => setPage({ type: "history" })}
        >
          履歴
        </button>
        <button
          className={`nav-btn ${activeTab === "dm" ? "active" : ""}`}
          onClick={() => setPage({ type: "dm" })}
        >
          DM
        </button>
        <button
          className={`nav-btn ${activeTab === "my-tanka" ? "active" : ""}`}
          onClick={() => setPage({ type: "my-tanka" })}
        >
          短歌
        </button>
        <button
          className={`nav-btn ${activeTab === "my-profile" ? "active" : ""}`}
          onClick={() => setPage({ type: "my-profile" })}
        >
          設定
        </button>
      </nav>

      <main className="app-main">
        {activeTab === "explore" && (
          <TankaList myId={profile!.id} />
        )}

        {activeTab === "history" && <HistoryView myId={profile!.id} />}

        {activeTab === "dm" && (
          <DmView
            myId={profile!.id}
            onViewProfile={(userId) =>
              setPage({ type: "view-profile", userId, from: "dm" })
            }
          />
        )}

        {activeTab === "my-tanka" && (
          <TankaEdit
            profile={profile!}
            theme={theme}
            onSave={handleTankaSave}
          />
        )}

        {activeTab === "my-profile" && (
          <>
            <ProfileEdit
              profile={profile}
              profileId={account!.profileId}
              email={account!.email}
              onSave={handleProfileSave}
            />
            <div className="settings-actions">
              <button
                className="btn-secondary"
                onClick={() => setPage({ type: "my-profile-preview" })}
                style={{ width: "100%" }}
              >
                プロフィールプレビュー
              </button>
              <button className="btn-logout" onClick={handleLogout}>
                ログアウト
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
