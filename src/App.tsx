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
import "./App.css";

type Page =
  | { type: "auth" }
  | { type: "profile-setup" }
  | { type: "tanka-setup" }
  | { type: "explore" }
  | { type: "dm" }
  | { type: "my-profile" }
  | { type: "my-tanka" }
  | { type: "view-profile"; userId: string };

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
    if (!target) {
      setPage({ type: "explore" });
      return null;
    }
    return (
      <div className="app">
        <ProfileView profile={target} onBack={() => setPage({ type: "explore" })} />
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

        {activeTab === "dm" && <DmView myId={profile!.id} />}

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
            <button className="btn-logout" onClick={handleLogout}>
              ログアウト
            </button>
          </>
        )}
      </main>
    </div>
  );
}

export default App;
