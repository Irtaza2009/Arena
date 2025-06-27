import React, { useState, useEffect } from "react";
import axios from "axios";
import SwordLoader from "./SwordLoader";

const Leaderboard = ({ onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("average");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [votingStats, setVotingStats] = useState([]);
  const [expandedStats, setExpandedStats] = useState({}); // Track which stats are expanded

  const defaultAvatar =
    "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAAM1BMVEX4+PiGhoaUlJTq6uq/v7+NjY3x8fHb29uxsbHNzc2jo6PGxsbi4uKbm5u3t7fU1NSpqalb9J8wAAAERklEQVR4nO2cDZarIAyFq6go/tT9r/bJME61VgsSknBevhXcQAIkBB4PQRAEQRAEQRAEQRAEQRAEQRAEGFRXtaasi4W6NHP1HKgVBaD6+Uf5nnruFLUyH5rKHMWvjOxt0BfqHa2m1njBd/mWsqPWeYKffIvh6EjN5Cv/x5HYmaDLEP2LHz2pFe8JGn5HRa15g/L2/i0jGzdSge6zUjKxYPiw7XpawOJ8cV//crxgYIGK0M/Bgrv+v0IdB02k/sWChtSAOVZ/UcyU+qt4/UXR0+lXEPqLgi6QowPAMVLpB3EgC9GxKG4H2FLTrEQtlP4lPaDQDxTBDortDHACSKYAdAIoogBsCXLgL0RAe8BKja1fw+ovCux6F2gIWyZkA4A9CN2HBmj92Ee6Ht4A3FM1QCLzDm5iAx4CS26Jqb+B118UmJsx+C5gwYziZwoDMO89gA9CDsxl6EY1/TuYezH4QcKCmROIAWLA/25A9qtQkn0AMy3uUhiAuRMnOUpgZsWwRaFfUFMysLruC9yk+NbV/DUG1YAE6yhuXSVBRoNb2WrggwBVf4IgwL5tBd/KsBvpwH0I/YIAeB3Cv6IBXocIuklBwxh3F3OATgFJLyzgFKDWRf8AnAKifmqwGjvJRf0DrlmCru0M6J6GsJsdJI6pHMgS3/NH3bcY0/X6C3HfZfSplLDlzxFZ42LQhB9lAQP9URaw0B9hAbn/rzxvrUU1o2c0d3rYqfvW94Q9wrJMtF3rR7qgSSgZPkhs/GO5rrgNv0N5Xp3xe8b3h4cJ9cRXvkV145V80/N0nh2qP0kTTMV78Dc0upp3M1HOvc5g7N9Qg9Zd99RDNgMvCIIgCAIlSnfV1M6mLD+kZ3VZGtNOVafJn6EfaYZumgNyytFMfA53Q9/erFGPc089GUNvIsvTtSEzotET1BVTi1/ianQL2ixR49oANvZbSqzPq5rqMm2PsgHhDzGVYvA3JK4Z+X+jxdIEDPkWk2ZhHZDkWxLMQnj9nJcJVdrQ/UAJeX+mky2clyZATQK297yAucUJ/QIPEohfxMiG3xEbCfe+wIMk7js9SvdZibkPTPBy/g633YjY/V/cexvRkLv/i/nGeqpINq8zwkM59gc/aEK3ZW76Qy3gpz/MAohuSngCfmVkFb8vRl8L2Kz/73j2+CZ5LAyD156c5K0wFB71O7gPCFNQf1+KWC5AL74GMuMAcHw52CX5dweWy/SA5w6253I/Y+9AlgsnSvLWH57zUgWjFOaK03eLrLewLWdxnEEEO06+Sc5mAs5enmUzASdRkOS/lFR8ioJMliDHhynIZA9YOe4FSX6dSscxtckohC2Hv3AyOIbueQ/jzDzoeKTLzIMO/whktgZZ9tlxRseIlf1xIrsQeK9yMS0mXrEPAmo1d9jmxgk+8k7PNoqzOomubMuMTO5Tw9g+p86inPLO9jyX4Sq6X0fFAAqcAf8AkU5HyWczqdIAAAAASUVORK5CYII="; // Default avatar path

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setError(null);
      try {
        const adminSecret = localStorage.getItem("adminSecret");
        const response = await axios.get(
          "https://arena-backend.irtaza.xyz/admin/leaderboard",
          {
            headers: {
              "x-admin-secret": adminSecret,
            },
            withCredentials: true,
          }
        );

        // Transform data to match expected format
        const transformedData = {
          submissionCount: response.data.submissionCount,
          topVoters: response.data.topVoters,
          leaderboardAverage: response.data.leaderboards.average,
          leaderboardFun: response.data.leaderboards.fun,
          leaderboardCreativity: response.data.leaderboards.creativity,
          leaderboardAccessibility: response.data.leaderboards.accessibility,
        };

        setVotingStats(response.data.votingStats || []);
        setLeaderboardData(transformedData);
      } catch (err) {
        console.error("Leaderboard fetch error:", err);
        setError(
          err.response?.data?.message || "Failed to fetch leaderboard data"
        );
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [activeTab]);

  const renderLeaderboard = () => {
    if (!leaderboardData)
      return <p className="cottage-text">No data available</p>;

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
              <div key={`voter-${index}`} className="leaderboard-item">
                <span className="rank">{index + 1}</span>
                <img
                  src={voter.avatar}
                  alt={voter.name}
                  className="avatar"
                  onError={(e) => (e.target.src = defaultAvatar)}
                />
                <span className="name">{voter.name}</span>
                <span className="score">{voter.votes} votes</span>
              </div>
            ))}
          </div>
        );
      default:
        data = leaderboardData.leaderboardAverage;
    }

    if (!data || data.length === 0) {
      return <p className="cottage-text">No entries yet</p>;
    }

    return (
      <div className="leaderboard-list">
        {data.map((item, index) => (
          <div key={`${activeTab}-${index}`} className="leaderboard-item">
            <span className="rank">{index + 1}</span>
            <img
              src={item.user?.avatar || defaultAvatar}
              alt={item.user?.name || "Anonymous"}
              className="avatar"
              onError={(e) => (e.target.src = defaultAvatar)}
            />
            <span className="name">{item.user?.name || "Anonymous"}</span>
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

  const renderVotingStats = () => {
    if (!votingStats || votingStats.length === 0)
      return <p className="cottage-text">No voting stats yet</p>;

    return (
      <div className="leaderboard-list">
        {votingStats.map((stat, idx) => {
          const isExpanded = expandedStats[stat.submission._id];
          return (
            <div key={stat.submission._id} className="leaderboard-item">
              <span className="rank">{idx + 1}</span>
              <img
                src={stat.submission.user?.avatar || defaultAvatar}
                alt={stat.submission.user?.name || "Anonymous"}
                className="avatar"
                onError={(e) => (e.target.src = defaultAvatar)}
              />
              <span className="name">
                {stat.submission.user?.name || "Anonymous"}
              </span>
              <span className="score">
                Showdowns: <b>{stat.showdowns}</b>
                <button
                  style={{
                    marginLeft: "0.7em",
                    fontSize: "0.9em",
                    padding: "0.1em 0.7em",
                    borderRadius: "12px",
                    border: "1px solid #ccc",
                    background: "#fafafa",
                    cursor: "pointer",
                  }}
                  onClick={() =>
                    setExpandedStats((prev) => ({
                      ...prev,
                      [stat.submission._id]: !isExpanded,
                    }))
                  }
                  aria-expanded={isExpanded}
                  aria-controls={`voting-stats-details-${stat.submission._id}`}
                >
                  {isExpanded ? "Hide" : "Details"}
                </button>
                {isExpanded && (
                  <div
                    id={`voting-stats-details-${stat.submission._id}`}
                    style={{
                      marginTop: "0.5em",
                      fontSize: "0.95em",
                      background: "#f8f8f8",
                      borderRadius: "8px",
                      padding: "0.5em 0.8em",
                      boxShadow: "0 1px 4px rgba(0,0,0,0.03)",
                    }}
                  >
                    Fun: <b>{stat.fun.won} won</b>, <b>{stat.fun.lost} lost</b>
                    <br />
                    Creativity: <b>{stat.creativity.won} won</b>,{" "}
                    <b>{stat.creativity.lost} lost</b>
                    <br />
                    Accessibility: <b>{stat.accessibility.won} won</b>,{" "}
                    <b>{stat.accessibility.lost} lost</b>
                  </div>
                )}
              </span>
            </div>
          );
        })}
      </div>
    );
  };

  const [showResetModal, setShowResetModal] = useState(false);

  const handleResetConfirm = async (secret) => {
    try {
      const res = await axios.post(
        "https://arena-backend.irtaza.xyz/admin/reset",
        {},
        {
          headers: {
            "x-admin-secret": secret,
          },
        }
      );
      alert("Reset successful!");
      setShowResetModal(false);
      window.location.reload();
    } catch (err) {
      alert(err.response?.data?.message || "Reset failed. Check your secret.");
    }
  };

  return (
    <div className="leaderboard-modal">
      <div className="leaderboard-content">
        <button
          className="close-button"
          onClick={onClose}
          aria-label="Close leaderboard"
        >
          ×
        </button>
        <h2>Leaderboard</h2>

        <div className="l-tabs">
          {[
            "average",
            "fun",
            "creativity",
            "accessibility",
            "voters",
            "voting-stats",
          ].map((tab) => (
            <button
              key={tab}
              className={activeTab === tab ? "active" : ""}
              onClick={() => setActiveTab(tab)}
              disabled={loading}
            >
              {tab === "voting-stats"
                ? "Voting Stats"
                : tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="loading-state">
            <SwordLoader />
            <p className="cottage-text">Loading...</p>
          </div>
        ) : error ? (
          <div className="error-state">
            <p className="cottage-text error">{error}</p>
            <button onClick={() => window.location.reload()}>Retry</button>
          </div>
        ) : activeTab === "voting-stats" ? (
          renderVotingStats()
        ) : (
          renderLeaderboard()
        )}

        <div className="stats">
          <p>Total Submissions: {leaderboardData?.submissionCount || 0}</p>
        </div>
        <div className="reset-section">
          <button
            className="reset-button"
            onClick={() => setShowResetModal(true)}
          >
            Reset All Data
          </button>
          {showResetModal && (
            <ResetConfirmationModal
              onConfirm={handleResetConfirm}
              onCancel={() => setShowResetModal(false)}
            />
          )}
        </div>
      </div>
    </div>
  );
};

const AdminGate = ({ onSuccess }) => {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setError("");

    try {
      const isValid = await verifyAdminSecret(secret);
      if (isValid) {
        localStorage.setItem("adminSecret", secret);
        onSuccess();
      } else {
        setError("Incorrect secret");
      }
    } catch (err) {
      setError("Verification failed");
    } finally {
      setSubmitting(false);
    }
  };

  const verifyAdminSecret = async (secret) => {
    try {
      const response = await axios.get(
        "https://arena-backend.irtaza.xyz/admin/leaderboard",
        {
          headers: { "x-admin-secret": secret },
          validateStatus: () => true, // Don't throw on 403
        }
      );
      return response.status === 200;
    } catch (err) {
      return false;
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
          autoComplete="off"
          required
        />
        {error && <p className="error">{error}</p>}
        <button type="submit" disabled={submitting}>
          {submitting ? "Verifying..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export const LeaderboardManager = () => {
  const [showLeaderboard, setShowLeaderboard] = useState(false);
  const [showAdminGate, setShowAdminGate] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Verify the stored secret on mount
    const verifyStoredSecret = async () => {
      const storedSecret = localStorage.getItem("adminSecret");
      if (storedSecret) {
        try {
          const isValid = await axios.get(
            "https://arena-backend.irtaza.xyz/admin/leaderboard",
            {
              headers: { "x-admin-secret": storedSecret },
              validateStatus: () => true,
            }
          );
          setIsAuthenticated(isValid.status === 200);
        } catch {
          setIsAuthenticated(false);
        }
      }
    };
    verifyStoredSecret();
  }, []);

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
        <span
          className="heart"
          onClick={handleHeartClick}
          role="button"
          tabIndex={0}
        >
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

const ResetConfirmationModal = ({ onConfirm, onCancel }) => {
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");

  const handleConfirm = () => {
    if (!secret.trim()) {
      setError("Secret is required.");
      return;
    }
    onConfirm(secret);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>Reset Warning</h3>
        <p>
          This will permanently:
          <ul>
            <li>Delete all submissions</li>
            <li>Delete all votes</li>
            <li>Reset all users’ vote counts and submission status</li>
          </ul>
        </p>
        <label>Re-enter Admin Secret to Confirm:</label>
        <input
          type="password"
          value={secret}
          onChange={(e) => setSecret(e.target.value)}
          placeholder="Secret key..."
        />
        {error && <p className="error">{error}</p>}
        <div className="modal-actions">
          <button onClick={handleConfirm} className="confirm-btn">
            Confirm Reset
          </button>
          <button onClick={onCancel} className="cancel-btn">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
