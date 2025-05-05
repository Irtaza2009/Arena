import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Voting.css";

export default function Voting({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [pair, setPair] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({
    fun: null,
    creativity: null,
    accessibility: null,
  });
  const [visitedSites, setVisitedSites] = useState({});

  useEffect(() => {
    axios
      .get("https://arena-backend-one.vercel.app/api/submissions", {
        withCredentials: true,
      })
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
      "https://arena-backend-one.vercel.app/api/vote",
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

  const isSelected = (category, id) => selectedVotes[category]?.winnerId === id;

  if (pair.length < 2) return <p className="cottage-text">Loading votes...</p>;

  const allCategoriesVoted =
    selectedVotes.fun &&
    selectedVotes.creativity &&
    selectedVotes.accessibility;

  const handleVisit = (id) => {
    setVisitedSites((prev) => ({ ...prev, [id]: true }));
  };

  const bothSitesVisited = pair.every((s) => visitedSites[s._id]);

  return (
    <div className="vote-wrapper">
      <h2 className="vote-title">Vote for your Favourite Submission</h2>

      <div className="card-pair">
        {pair.map((s) => (
          <div key={s._id} className="vote-card">
            <img src={s.imageUrl} alt="preview" className="vote-image" />
            <p className="vote-user">{s.user.name}</p>
            <p>
              <a
                href={s.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="vote-link"
                onClick={() => handleVisit(s._id)}
              >
                Visit Site
              </a>
            </p>

            <div className="vote-categories">
              <p>Pick for:</p>
              {["creativity", "fun", "accessibility"].map((category) => (
                <button
                  key={category}
                  onClick={() => handleSelect(category, s._id)}
                  disabled={!bothSitesVisited}
                  className={`vote-button ${
                    isSelected(category, s._id) ? "selected" : ""
                  }`}
                >
                  {` ${category.charAt(0).toUpperCase() + category.slice(1)}`}
                </button>
              ))}
            </div>
            {!bothSitesVisited && (
              <p className="visit-warning">
                ⚠️ You must visit both sites before voting.
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center" }}>
        <button
          onClick={confirmVote}
          className="confirm-vote-btn"
          disabled={!allCategoriesVoted}
        >
          Confirm Vote
        </button>
        {!allCategoriesVoted && (
          <p className="vote-warning">
            Please vote in all categories before confirming.
          </p>
        )}
      </div>
    </div>
  );
}
