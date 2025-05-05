import React from "react";

export default function Login() {
  const login = () => {
    window.location.href = "https://arena-backend-one.vercel.app/auth/slack"; // for prod:
    //window.location.href = "http://localhost:5000/auth/slack"; // for dev
  };

  return (
    <div className="form-container">
      <div style={{ textAlign: "center", marginTop: "1rem" }}>
        <h2>Welcome to the Arena!</h2>
        <button onClick={login}>Login with Slack</button>
      </div>
    </div>
  );
}
