import React from "react";

export default function Submitted() {
  return (
    <div className="submitted-container">
      <h1 className="submitted-title">🎉 Submission Received!</h1>
      <p className="cottage-text">
        Thank you for submitting your project. Your entry has been successfully
        recorded.
      </p>
      <p className="error">
        🕒 Voting is currently locked. Please check back once the voting round
        begins.
      </p>
    </div>
  );
}
