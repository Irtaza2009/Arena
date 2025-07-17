import React, { useEffect, useState } from "react";
import axios from "axios";
import Login from "./components/Login";
import SubmissionForm from "./components/SubmissionForm";
import Voting from "./components/Voting";
import Submitted from "./components/Submitted";
import { LeaderboardManager } from "./components/Leaderboard";
import SwordLoader from "./components/SwordLoader";
import Gallery from "./components/Gallery";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("home");

  useEffect(() => {
    axios
      .get("https://backend.arena.hackclub.com/api/me", {
        withCredentials: true,
      })
      .then((res) => {
        setUser(res.data);
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

  return (
    <div className="App">
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
      ) : //<Submitted lockedType="gallery" />
      checking ? (
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
      ) : (
        //<Submitted lockedType="submission" />
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
