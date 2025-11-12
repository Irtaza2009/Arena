import React, { useEffect, useState } from "react";
import axios from "axios";
import Login from "./components/Login";
import SubmissionForm from "./components/SubmissionForm";
// import Voting from "./components/Voting";
import Submitted from "./components/Submitted";
import { LeaderboardManager } from "./components/Leaderboard";
import SwordLoader from "./components/SwordLoader";
import Gallery from "./components/Gallery";
import ColorWheel from "./components/ColorWheel";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home");
  const [showColorWheel, setShowColorWheel] = useState(false);

  useEffect(() => {
    axios
      .get("https://backend.arena.hackclub.com/api/me", {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
        // Don't auto-show color wheel if user already has a color
        setShowColorWheel(!res.data.color);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          setUser(null);
        } else {
          console.error("Error fetching user:", err);
          setError("Something went wrong. Please try again later.");
        }
      })
      .finally(() => {
        setChecking(false);
      });
  }, []);

  // Sign out handler
  const handleSignOut = () => {
    axios
      .post(
        "https://backend.arena.hackclub.com/auth/logout",
        {},
        { withCredentials: true }
      )
      .finally(() => {
        window.location.reload();
      });
  };

  // callback for color assigned by ColorWheel
  const handleColorAssigned = (colorHex) => {
    setUser((u) => (u ? { ...u, color: colorHex } : u));
    setShowColorWheel(false);
  };

  const handleOpenColorWheel = () => {
    setShowColorWheel(true);
  };

  return (
    <div className="App">
      {/* Color badge with reload button */}
      {user && user.color && (
        <div
          style={{
            position: "fixed",
            top: 8,
            left: 8,
            display: "flex",
            alignItems: "center",
            gap: "8px",
            zIndex: 9998,
          }}
        >
          <div
            title={`Your color: ${user.color}`}
            style={{
              width: 22,
              height: 22,
              borderRadius: "50%",
              background: user.color,
              border: "2px solid #fff",
              boxShadow: "0 1px 4px rgba(0,0,0,0.3)",
            }}
          />
          <button
            onClick={handleOpenColorWheel}
            title="Change color"
            style={{
              width: "20px",
              height: "20px",
              borderRadius: "50%",
              background: "#666",
              color: "white",
              border: "none",
              cursor: "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "12px",
              fontWeight: "bold",
            }}
          >
            ↻
          </button>
        </div>
      )}

      {/* Show color wheel when needed */}
      {user && showColorWheel && (
        <ColorWheel 
          onAssign={handleColorAssigned} 
          onClose={() => setShowColorWheel(false)}
        />
      )}

      {/* Rest of your existing JSX remains the same */}
      {/* Tabs - only show if signed in */}
      {user && (
        <div
          className="tabs"
          style={{ marginTop: "1rem", marginBottom: "0rem" }}
        >
          <button
            className={activeTab === "home" ? "active" : ""}
            onClick={() => setActiveTab("home")}
          >
            Home
          </button>
          <button
            className={activeTab === "gallery" ? "active" : ""}
            onClick={() => setActiveTab("gallery")}
          >
            Gallery
          </button>
        </div>
      )}

      {/* Tab Content */}
      {activeTab === "gallery" ? (
        <Gallery />
      ) : checking ? (
        <>
          <SwordLoader />
          <p className="cottage-text">Loading...</p>
        </>
      ) : error ? (
        <p className="cottage-text error">{error}</p>
      ) : !user ? (
        <Login />
      ) : !user.hasSubmitted ? (
        <SubmissionForm user={user} />
        //<Submitted lockedType="submission" />
      ) : (
        //<Voting user={user} />
        <Submitted lockedType="voting" />
      )}
      <LeaderboardManager />
      <footer className="footer-signout">
        <span onClick={handleSignOut}>Sign out</span>
      </footer>
    </div>
  );
}

export default App;

/* To Do:
- Export data
*/
