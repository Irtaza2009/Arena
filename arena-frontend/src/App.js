import React, { useEffect, useState } from "react";
import axios from "axios";
import Login from "./components/Login";
import SubmissionForm from "./components/SubmissionForm";
import Voting from "./components/Voting";
import Submitted from "./components/Submitted";
import { LeaderboardManager } from "./components/Leaderboard";
import SwordLoader from "./components/SwordLoader";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://arena-backend.irtaza.xyz/api/me", {
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

  return (
    <div className="App">
      {checking ? (
        <>
          <SwordLoader />
          <p className="cottage-text">Loading...</p>{" "}
        </>
      ) : error ? (
        <p className="cottage-text error">{error}</p>
      ) : !user ? (
        <Login />
      ) : !user.hasSubmitted ? (
        <SubmissionForm user={user} />
      ) : (
        // Voting started
        // <Submitted />
        <Voting user={user} />
      )}
      <LeaderboardManager />
    </div>
  );
}

export default App;

/* To Do:
- Export data
- Add projects gallery
*/
