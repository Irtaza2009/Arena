import React, { useEffect, useState } from "react";
import axios from "axios";
import Login from "./components/Login";
import SubmissionForm from "./components/SubmissionForm";
import Voting from "./components/Voting";
import Submitted from "./components/Submitted";

import "./App.css";

function App() {
  const [user, setUser] = useState(null);
  const [checking, setChecking] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    axios
      .get("https://arena-backend-one.vercel.app/api/me", {
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
        <p className="cottage-text">Loading...</p>
      ) : error ? (
        <p className="cottage-text error">{error}</p>
      ) : !user ? (
        <Login />
      ) : !user.hasSubmitted ? (
        <SubmissionForm />
      ) : (
        <Submitted /> //voting locked
      )}
      <footer className="footer">
        Made with ❤️ by Irtaza —{" "}
        <a
          href="https://github.com/Irtaza2009"
          target="_blank"
          rel="noopener noreferrer"
        >
          GitHub
        </a>
      </footer>
    </div>
  );
}

export default App;
