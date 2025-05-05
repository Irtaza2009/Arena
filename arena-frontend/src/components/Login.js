import React from "react";

export default function Login() {
  const login = () => {
    window.location.href = "http://localhost:5000/auth/slack";
  };

  return (
    <div style={{ textAlign: "center", marginTop: "5rem" }}>
      <h2>Welcome to Site Jam!</h2>
      <button onClick={login}>Login with Slack</button>
    </div>
  );
}
