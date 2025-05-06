import React, { useState, useEffect } from "react";
import axios from "axios";

const Leaderboard = ({ onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("average");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        const adminSecret = localStorage.getItem("adminSecret");
        const response = await axios.get(
          "https://arena-backend.irtaza.xyz/admin/leaderboard",
          {
            headers: {
              "x-admin-secret": adminSecret,
            },
          }
        );
        setLeaderboardData(response.data);
      } catch (err) {
        setError("Failed to fetch leaderboard data");
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const renderLeaderboard = () => {
    if (!leaderboardData) return null;

    let data;
    switch (activeTab) {
      case "fun":
        data = leaderboardData.leaderboardFun;
        break;
      case "creativity":
        data = leaderboardData.leaderboardCreativity;
        break;
      case "accessibility":
        data = leaderboardData.leaderboardAccessibility;
        break;
      case "voters":
        return (
          <div className="leaderboard-list">
            {leaderboardData.topVoters.map((voter, index) => (
              <div key={index} className="leaderboard-item">
                <span className="rank">{index + 1}</span>
                <img src={voter.avatar} alt={voter.name} className="avatar" />
                <span className="name">{voter.name}</span>
                <span className="score">{voter.votes} votes</span>
              </div>
            ))}
          </div>
        );
      default:
        data = leaderboardData.leaderboardAverage;
    }

    return (
      <div className="leaderboard-list">
        {data.map((item, index) => (
          <div key={index} className="leaderboard-item">
            <span className="rank">{index + 1}</span>
            <img
              src={item.user.avatar}
              alt={item.user.name}
              className="avatar"
            />
            <span className="name">{item.user.name}</span>
            <span className="score">
              {activeTab === "average"
                ? Math.round(item.eloAverage)
                : Math.round(
                    item[
                      `elo${
                        activeTab.charAt(0).toUpperCase() + activeTab.slice(1)
                      }`
                    ]
                  )}
            </span>
          </div>
        ))}
      </div>
    );
  };

  return (
    <div className="leaderboard-modal">
      <div className="leaderboard-content">
        <button className="close-button" onClick={onClose}>
          ×
        </button>
        <h2>Leaderboard</h2>
        <div className="tabs">
          <button
            className={activeTab === "average" ? "active" : ""}
            onClick={() => setActiveTab("average")}
          >
            Average
          </button>
          <button
            className={activeTab === "fun" ? "active" : ""}
            onClick={() => setActiveTab("fun")}
          >
            Fun
          </button>
          <button
            className={activeTab === "creativity" ? "active" : ""}
            onClick={() => setActiveTab("creativity")}
          >
            Creativity
          </button>
          <button
            className={activeTab === "accessibility" ? "active" : ""}
            onClick={() => setActiveTab("accessibility")}
          >
            Accessibility
          </button>
          <button
            className={activeTab === "voters" ? "active" : ""}
            onClick={() => setActiveTab("voters")}
          >
            Top Voters
          </button>
        </div>
        {loading ? (
          <p className="cottage-text">Loading...</p>
        ) : error ? (
          <p className="cottage-text error">{error}</p>
        ) : (
          renderLeaderboard()
        )}
        <div className="stats">
          <p>Total Submissions: {leaderboardData?.submissionCount || 0}</p>
        </div>
      </div>
    </div>
  );
};

const AdminGate = ({ onSuccess }) => {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (secret === process.env.REACT_APP_ADMIN_SECRET) {
      localStorage.setItem("adminSecret", secret);
      onSuccess();
    } else {
      setError("Incorrect secret");
    }
  };

  return (
    <div className="admin-gate">
      <form onSubmit={handleSubmit}>
        <label htmlFor="secret">Enter Admin Secret:</label>
        <input
          id="secret"
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Secret key..."
        />
        {error && <p className="error">{error}</p>}
        <button type="submit">Submit</button>
      </form>
    </div>
  );
};

export const LeaderboardManager = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(
    localStorage.getItem("adminSecret") === process.env.REACT_APP_ADMIN_SECRET
  );

  const handleHeartClick = () => {
    if (isAuthenticated) {
      setShowLeaderboard(true);
    } else {
      setShowAdminGate(true);
    }
  };

  const handleAdminSuccess = () => {
    setIsAuthenticated(true);
    setShowAdminGate(false);
    setShowLeaderboard(true);
  };

  return (
    <>
      <footer className="footer">
        Made with{" "}
        <span className="heart" onClick={handleHeartClick}>
          ❤️
        </span>{" "}
        by Irtaza —{" "}
        <a
          href="https://github.com/Irtaza2009"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </footer>
      {showAdminGate && <AdminGate onSuccess={handleAdminSuccess} />}
      {showLeaderboard && (
        <Leaderboard onClose={() => setShowLeaderboard(false)} />
      )}
    </>
  );
};
