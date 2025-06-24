import React, { useState, useEffect } from "react";
import axios from "axios";
import SwordLoader from "./SwordLoader";

const Leaderboard = ({ onClose }) => {
  const [leaderboardData, setLeaderboardData] = useState(null);
  const [activeTab, setActiveTab] = useState("average");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

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
                  onError={(e) => (e.target.src = "/default-avatar.png")}
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
              src={item.user?.avatar || "/default-avatar.png"}
              alt={item.user?.name || "Anonymous"}
              className="avatar"
              onError={(e) => (e.target.src = "/default-avatar.png")}
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

        <div className="tabs">
          {["average", "fun", "creativity", "accessibility", "voters"].map(
            (tab) => (
              <button
                key={tab}
                className={activeTab === tab ? "active" : ""}
                onClick={() => setActiveTab(tab)}
                disabled={loading}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            )
          )}
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
