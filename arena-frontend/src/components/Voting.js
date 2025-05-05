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
      setSelectedVotes({ fun: null, creativity: null, accessibility: null }); // reset selection
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

    // show new pair
    const shuffled = [...submissions].sort(() => 0.5 - Math.random());
    setPair([shuffled[0], shuffled[1]]);
    setSelectedVotes({ fun: null, creativity: null, accessibility: null });
  };

  if (pair.length < 2) return <p>Loading votes...</p>;

  const isSelected = (category, id) => selectedVotes[category]?.winnerId === id;

  return (
    <div style={{ padding: "2rem" }}>
      <div style={{ display: "flex", justifyContent: "space-around" }}>
        {pair.map((s) => (
          <div
            key={s._id}
            style={{ width: "45%", border: "1px solid #ccc", padding: "1rem" }}
          >
            <img src={s.imageUrl} alt="preview" style={{ width: "100%" }} />
            <p>
              <strong>{s.user.name}</strong>
            </p>
            <p>
              <a href={s.siteUrl} target="_blank" rel="noreferrer">
                Visit Site
              </a>
            </p>

            <p>Select this as:</p>
            {["creativity", "fun", "accessibility"].map((category) => (
              <button
                key={category}
                onClick={() => handleSelect(category, s._id)}
                style={{
                  margin: "0.25rem",
                  backgroundColor: isSelected(category, s._id)
                    ? "#4CAF50"
                    : "#e0e0e0",
                }}
              >
                {`More ${category.charAt(0).toUpperCase() + category.slice(1)}`}
              </button>
            ))}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          onClick={confirmVote}
          style={{
            padding: "1rem 2rem",
            fontSize: "1rem",
            backgroundColor: "#2196F3",
            color: "white",
          }}
        >
          ✅ Confirm Vote
        </button>
      </div>
    </div>
  );
}
