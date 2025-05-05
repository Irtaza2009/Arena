import React, { useEffect, useState } from "react";
import axios from "axios";

export default function Voting({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [pair, setPair] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({
    fun: null,
    creativity: null,
    accessibility: null,
  });

  useEffect(() => {
    axios
      .get("/api/submissions", { withCredentials: true })
      .then((res) => setSubmissions(res.data));
  }, []);

  useEffect(() => {
    if (submissions.length >= 2) {
      const shuffled = [...submissions].sort(() => 0.5 - Math.random());
      setPair([shuffled[0], shuffled[1]]);
      setSelectedVotes({ fun: null, creativity: null, accessibility: null });
    }
  }, [submissions]);

  const handleSelect = (category, winnerId) => {
    const loserId = pair.find((p) => p._id !== winnerId)._id;
    setSelectedVotes((prev) => ({
      ...prev,
      [category]: { winnerId, loserId },
    }));
  };

  const confirmVote = async () => {
    await axios.post(
      "/api/vote",
      {
        funWinnerId: selectedVotes.fun?.winnerId,
        funLoserId: selectedVotes.fun?.loserId,
        creativityWinnerId: selectedVotes.creativity?.winnerId,
        creativityLoserId: selectedVotes.creativity?.loserId,
        accessibilityWinnerId: selectedVotes.accessibility?.winnerId,
        accessibilityLoserId: selectedVotes.accessibility?.loserId,
      },
      { withCredentials: true }
    );

    const shuffled = [...submissions].sort(() => 0.5 - Math.random());
    setPair([shuffled[0], shuffled[1]]);
    setSelectedVotes({ fun: null, creativity: null, accessibility: null });
  };

  if (pair.length < 2) return <p>Loading matchups...</p>;

  const isSelected = (category, id) => selectedVotes[category]?.winnerId === id;

  return (
    <div style={{ padding: "2rem", fontFamily: "sans-serif" }}>
      <div
        style={{
          display: "flex",
          gap: "2rem",
          justifyContent: "center",
          flexWrap: "wrap",
        }}
      >
        {pair.map((s) => (
          <div
            key={s._id}
            style={{
              width: "320px",
              background: "#fff",
              borderRadius: "12px",
              boxShadow: "0 4px 12px rgba(0, 0, 0, 0.1)",
              padding: "1rem",
              transition: "transform 0.2s",
            }}
          >
            <img
              src={s.imageUrl}
              alt="preview"
              style={{
                width: "100%",
                borderRadius: "8px",
                marginBottom: "0.5rem",
              }}
            />
            <p style={{ fontWeight: "bold", fontSize: "1.1rem" }}>
              {s.user.name}
            </p>
            <p>
              <a
                href={s.siteUrl}
                target="_blank"
                rel="noreferrer"
                style={{
                  color: "#2196F3",
                  textDecoration: "none",
                  fontWeight: "bold",
                }}
              >
                🔗 Visit Site
              </a>
            </p>

            <p style={{ margin: "0.5rem 0", fontWeight: "600" }}>Vote for:</p>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "0.5rem" }}>
              {["creativity", "fun", "accessibility"].map((category) => (
                <button
                  key={category}
                  onClick={() => handleSelect(category, s._id)}
                  style={{
                    flex: "1 1 45%",
                    padding: "0.5rem 0.75rem",
                    borderRadius: "6px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: isSelected(category, s._id)
                      ? "#4CAF50"
                      : "#f0f0f0",
                    color: isSelected(category, s._id) ? "white" : "#333",
                    fontWeight: "500",
                    transition: "all 0.2s ease-in-out",
                    boxShadow: isSelected(category, s._id)
                      ? "0 2px 6px rgba(76, 175, 80, 0.3)"
                      : "none",
                  }}
                >
                  {`More ${
                    category.charAt(0).toUpperCase() + category.slice(1)
                  }`}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <button
          onClick={confirmVote}
          style={{
            padding: "1rem 2rem",
            fontSize: "1.1rem",
            backgroundColor: "#2196F3",
            color: "white",
            border: "none",
            borderRadius: "8px",
            cursor: "pointer",
            fontWeight: "bold",
            boxShadow: "0 4px 10px rgba(33, 150, 243, 0.3)",
            transition: "background 0.2s",
          }}
        >
          ✅ Confirm Vote
        </button>
      </div>
    </div>
  );
}
