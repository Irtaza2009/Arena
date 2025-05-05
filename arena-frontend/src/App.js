import React, { useEffect, useState } from "react";
import axios from "axios";
import Login from "./components/Login";
import SubmissionForm from "./components/SubmissionForm";
import Voting from "./components/Voting";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("/api/me", { withCredentials: true })
      .then((res) => {
        setUser(res.data);
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          // Not logged in, no need to set an error
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

  if (checking) return <p>Loading...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;
  if (!user) return <Login />;
  if (!user.hasSubmitted) return <SubmissionForm />;

  return <Voting user={user} />;
}

export default App;
