import React, { useEffect, useState } from "react";
import axios from "axios";
import "./Voting.css"; // Reuse voting card styles

const defaultAvatar =
  "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAMAAAADACAMAAABlApw1AAAAM1BMVEX4+PiGhoaUlJTq6uq/v7+NjY3x8fHb29uxsbHNzc2jo6PGxsbi4uKbm5u3t7fU1NSpqalb9J8wAAAERklEQVR4nO2cDZarIAyFq6go/tT9r/bJME61VgsSknBevhXcQAIkBB4PQRAEQRAEQRAEQRAEQRAEQRAEGFRXtaasi4W6NHP1HKgVBaD6+Uf5nnruFLUyH5rKHMWvjOxt0BfqHa2m1njBd/mWsqPWeYKffIvh6EjN5Cv/x5HYmaDLEP2LHz2pFe8JGn5HRa15g/L2/i0jGzdSge6zUjKxYPiw7XpawOJ8cV//crxgYIGK0M/Bgrv+v0IdB02k/sWChtSAOVZ/UcyU+qt4/UXR0+lXEPqLgi6QowPAMVLpB3EgC9GxKG4H2FLTrEQtlP4lPaDQDxTBDortDHACSKYAdAIoogBsCXLgL0RAe8BKja1fw+ovCux6F2gIWyZkA4A9CN2HBmj92Ee6Ht4A3FM1QCLzDm5iAx4CS26Jqb+B118UmJsx+C5gwYziZwoDMO89gA9CDsxl6EY1/TuYezH4QcKCmROIAWLA/25A9qtQkn0AMy3uUhiAuRMnOUpgZsWwRaFfUFMysLruC9yk+NbV/DUG1YAE6yhuXSVBRoNb2WrggwBVf4IgwL5tBd/KsBvpwH0I/YIAeB3Cv6IBXocIuklBwxh3F3OATgFJLyzgFKDWRf8AnAKifmqwGjvJRf0DrlmCru0M6J6GsJsdJI6pHMgS3/NH3bcY0/X6C3HfZfSplLDlzxFZ42LQhB9lAQP9URaw0B9hAbn/rzxvrUU1o2c0d3rYqfvW94Q9wrJMtF3rR7qgSSgZPkhs/GO5rrgNv0N5Xp3xe8b3h4cJ9cRXvkV145V80/N0nh2qP0kTTMV78Dc0upp3M1HOvc5g7N9Qg9Zd99RDNgMvCIIgCAIlSnfV1M6mLD+kZ3VZGtNOVafJn6EfaYZumgNyytFMfA53Q9/erFGPc089GUNvIsvTtSEzotET1BVTi1/ianQL2ixR49oANvZbSqzPq5rqMm2PsgHhDzGVYvA3JK4Z+X+jxdIEDPkWk2ZhHZDkWxLMQnj9nJcJVdrQ/UAJeX+mky2clyZATQK297yAucUJ/QIPEohfxMiG3xEbCfe+wIMk7js9SvdZibkPTPBy/g633YjY/V/cexvRkLv/i/nGeqpINq8zwkM59gc/aEK3ZW76Qy3gpz/MAohuSngCfmVkFb8vRl8L2Kz/73j2+CZ5LAyD156c5K0wFB71O7gPCFNQf1+KWC5AL74GMuMAcHw52CX5dweWy/SA5w6253I/Y+9AlgsnSvLWH57zUgWjFOaK03eLrLewLWdxnEEEO06+Sc5mAs5enmUzASdRkOS/lFR8ioJMliDHhynIZA9YOe4FSX6dSscxtckohC2Hv3AyOIbueQ/jzDzoeKTLzIMO/whktgZZ9tlxRseIlf1xIrsQeK9yMS0mXrEPAmo1d9jmxgk+8k7PNoqzOomubMuMTO5Tw9g+p86inPLO9jyX4Sq6X0fFAAqcAf8AkU5HyWczqdIAAAAASUVORK5CYII=";

export default function Gallery({
  submissionsApi = "https://backend.arena.hackclub.com/api/submissions",
}) {
  const [submissions, setSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(submissionsApi, { withCredentials: true })
      .then((res) => setSubmissions(res.data))
      .finally(() => setLoading(false));
  }, [submissionsApi]);

  if (loading) {
    return (
      <div style={{ textAlign: "center", marginTop: "2rem" }}>
        <h2>Loading Gallery...</h2>
      </div>
    );
  }

  return (
    <div style={{ padding: "1rem" }}>
      <h2 style={{ textAlign: "center", marginBottom: "2rem" }}>
        Project Gallery
      </h2>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "2rem",
          justifyContent: "center",
        }}
      >
        {submissions.map((s) => (
          <div key={s._id} className="vote-card" style={{ width: 280 }}>
            <img src={s.imageUrl} alt="preview" className="vote-image" />
            <div
              style={{
                fontWeight: "bold",
                fontSize: "1.35em",
                margin: "0.7rem 0 0 0",
                color: "#2d1c0b",
                letterSpacing: "0.01em",
              }}
            >
              {s.projectName}
            </div>
            <div
              className="vote-user"
              style={{
                fontWeight: "normal",
                fontSize: "0.95em",
                color: "#7d6b5a",
                marginTop: "0.1rem",
                marginBottom: "0.2rem",
                justifyContent: "flex-start",
                gap: "0.3rem",
              }}
            >
              <img
                src={s.user?.avatar}
                alt={s.user?.name || "Anonymous"}
                className="user-avatar"
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  objectFit: "cover",
                  border: "1px solid #ccc",
                }}
                onError={(e) => (e.target.src = defaultAvatar)}
              />
              <span>{s.user?.name || "Anonymous"}</span>
            </div>
            <div style={{ margin: "0.5rem 0" }}>
              <a
                href={s.siteUrl}
                target="_blank"
                rel="noreferrer"
                className="vote-link"
              >
                Visit Site
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
            </div>
            {s.description && (
              <div
                style={{
                  margin: "0.5rem 0",
                  fontSize: "1em",
                  color: "#3b2e24",
                  background: "#f8f4ee",
                  borderRadius: "8px",
                  padding: "0.5em",
                  minHeight: "2.5em",
                  wordBreak: "break-word",
                  textAlign: "left",
                }}
              >
                <b>Description:</b> {s.description}
              </div>
            )}
            {s.hackatime?.totalTime && (
              <div style={{ fontSize: "0.95em", marginTop: "0.5em" }}>
                <b>HackaTime:</b> {s.hackatime.totalTime}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
