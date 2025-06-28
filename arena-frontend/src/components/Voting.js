import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Voting.css";
import SwordLoader from "./SwordLoader";

const defaultAvatar =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAAM1BMVEX4+PiGhoaUlJTq6uq/v7+NjY3x8fHb29uxsbHNzc2jo6PGxsbi4uKbm5u3t7fU1NSpqalb9J8wAAAERklEQVR4nO2cDZarIAyFq6go/tT9r/bJME61VgsSknBevhXcQAIkBB4PQRAEQRAEQRAEQRAEQRAEQRAEGFRXtaasi4W6NHP1HKgVBaD6+Uf5nnruFLUyH5rKHMWvjOxt0BfqHa2m1njBd/mWsqPWeYKffIvh6EjN5Cv/x5HYmaDLEP2LHz2pFe8JGn5HRa15g/L2/i0jGzdSge6zUjKxYPiw7XpawOJ8cV//crxgYIGK0M/Bgrv+v0IdB02k/sWChtSAOVZ/UcyU+qt4/UXR0+lXEPqLgi6QowPAMVLpB3EgC9GxKG4H2FLTrEQtlP4lPaDQDxTBDortDHACSKYAdAIoogBsCXLgL0RAe8BKja1fw+ovCux6F2gIWyZkA4A9CN2HBmj92Ee6Ht4A3FM1QCLzDm5iAx4CS26Jqb+B118UmJsx+C5gwYziZwoDMO89gA9CDsxl6EY1/TuYezH4QcKCmROIAWLA/25A9qtQkn0AMy3uUhiAuRMnOUpgZsWwRaFfUFMysLruC9yk+NbV/DUG1YAE6yhuXSVBRoNb2WrggwBVf4IgwL5tBd/KsBvpwH0I/YIAeB3Cv6IBXocIuklBwxh3F3OATgFJLyzgFKDWRf8AnAKifmqwGjvJRf0DrlmCru0M6J6GsJsdJI6pHMgS3/NH3bcY0/X6C3HfZfSplLDlzxFZ42LQhB9lAQP9URaw0B9hAbn/rzxvrUU1o2c0d3rYqfvW94Q9wrJMtF3rR7qgSSgZPkhs/GO5rrgNv0N5Xp3xe8b3h4cJ9cRXvkV145V80/N0nh2qP0kTTMV78Dc0upp3M1HOvc5g7N9Qg9Zd99RDNgMvCIIgCAIlSnfV1M6mLD+kZ3VZGtNOVafJn6EfaYZumgNyytFMfA53Q9/erFGPc089GUNvIsvTtSEzotET1BVTi1/ianQL2ixR49oANvZbSqzPq5rqMm2PsgHhDzGVYvA3JK4Z+X+jxdIEDPkWk2ZhHZDkWxLMQnj9nJcJVdrQ/UAJeX+mky2clyZATQK297yAucUJ/QIPEohfxMiG3xEbCfe+wIMk7js9SvdZibkPTPBy/g633YjY/V/cexvRkLv/i/nGeqpINq8zwkM59gc/aEK3ZW76Qy3gpz/MAohuSngCfmVkFb8vRl8L2Kz/73j2+CZ5LAyD156c5K0wFB71O7gPCFNQf1+KWC5AL74GMuMAcHw52CX5dweWy/SA5w6253I/Y+9AlgsnSvLWH57zUgWjFOaK03eLrLewLWdxnEEEO06+Sc5mAs5enmUzASdRkOS/lFR8ioJMliDHhynIZA9YOe4FSX6dSscxtckohC2Hv3AyOIbueQ/jzDzoeKTLzIMO/whktgZZ9tlxRseIlf1xIrsQeK9yMS0mXrEPAmo1d9jmxgk+8k7PNoqzOomubMuMTO5Tw9g+p86inPLO9jyX4Sq6X0fFAAqcAf8AkU5HyWczqdIAAAAASUVORK5CYII=";

export default function Voting({ user }) {
  const [submissions, setSubmissions] = useState([]);
  const [pair, setPair] = useState([]);
  const [selectedVotes, setSelectedVotes] = useState({
    fun: null,
    creativity: null,
    accessibility: null,
  });
  const [visitedSites, setVisitedSites] = useState({});
  const [startTime, setStartTime] = useState(Date.now());
  const [voteStatus, setVoteStatus] = useState("idle"); // idle | loading | success
  const [voteCount, setVoteCount] = useState(null);

  useEffect(() => {
    axios
      .get("https://arena-backend.irtaza.xyz/api/submissions", {
        withCredentials: true,
      })
      .then((res) => setSubmissions(res.data));

    axios
      .get("https://arena-backend.irtaza.xyz/api/user-votes", {
        withCredentials: true,
      })
      .then((res) => setVoteCount(res.data.count))
      .catch(() => setVoteCount(0));
  }, []);

  useEffect(() => {
    if (submissions.length >= 2) {
      const shuffled = [...submissions].sort(() => 0.5 - Math.random());
      setPair([shuffled[0], shuffled[1]]);
      setSelectedVotes({ fun: null, creativity: null, accessibility: null });
      setStartTime(Date.now());
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
    setVoteStatus("loading");
    try {
      await axios.post(
        "https://arena-backend.irtaza.xyz/api/vote",
        {
          funWinnerId: selectedVotes.fun?.winnerId,
          funLoserId: selectedVotes.fun?.loserId,
          creativityWinnerId: selectedVotes.creativity?.winnerId,
          creativityLoserId: selectedVotes.creativity?.loserId,
          accessibilityWinnerId: selectedVotes.accessibility?.winnerId,
          accessibilityLoserId: selectedVotes.accessibility?.loserId,
          startTime,
        },
        { withCredentials: true }
      );

      const shuffled = [...submissions].sort(() => 0.5 - Math.random());
      setPair([shuffled[0], shuffled[1]]);
      setSelectedVotes({ fun: null, creativity: null, accessibility: null });
      setVisitedSites({});
      setStartTime(Date.now());
      setVoteStatus("success");
      setVoteCount((prev) => prev + 1);
    } catch (error) {
      console.error("Error submitting vote:", error);
      setVoteStatus("idle");
    }
  };

  const isSelected = (category, id) => selectedVotes[category]?.winnerId === id;
  const allCategoriesVoted =
    selectedVotes.fun &&
    selectedVotes.creativity &&
    selectedVotes.accessibility;
  const bothSitesVisited = pair.every((s) => visitedSites[s._id]);

  if (voteCount >= 3) {
    return (
      <div className="vote-wrapper">
        <h2 className="vote-title">You've used all 3 of your votes 🎉</h2>
        <p className="vote-subheading">Thanks for participating!</p>
      </div>
    );
  }

  if (pair.length < 2)
    return (
      <>
        <SwordLoader />
        <p className="cottage-text">Loading votes...</p>
      </>
    );

  return (
    <div className="vote-wrapper">
      <h2 className="vote-title">Vote for your Favourite Submission</h2>
      {voteCount !== null && (
        <p className="vote-subheading">
          You have <b>{Math.max(3 - voteCount, 0)}</b> votes left.
        </p>
      )}

      <div className="card-pair">
        {pair.map((s) => (
          <div key={s._id} className="vote-card">
            <img src={s.imageUrl} alt="preview" className="vote-image" />
            <div className="vote-user">
              <img
                src={s.user.avatar}
                alt={`${s.user.name}'s avatar`}
                className="user-avatar"
                onError={(e) => (e.target.src = defaultAvatar)}
              />
              <span>{s.user.name}</span>
            </div>
            <p>
              <a
                href={s.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="vote-link"
                onClick={() =>
                  setVisitedSites((prev) => ({ ...prev, [s._id]: true }))
                }
              >
                Visit
              </a>
              {s.sourceUrl && (
                <a
                  href={s.sourceUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="source-link"
                >
                  View Source
                </a>
              )}
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
                  {category.charAt(0).toUpperCase() + category.slice(1)}
                </button>
              ))}
            </div>

            {!bothSitesVisited && (
              <p className="visit-warning">
                ⚠️ You must visit both demoes before voting.
              </p>
            )}
          </div>
        ))}
      </div>

      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <button
          onClick={confirmVote}
          className="confirm-vote-btn"
          disabled={!allCategoriesVoted || voteStatus === "loading"}
        >
          {voteStatus === "loading" ? "Submitting..." : "Confirm Vote"}
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
