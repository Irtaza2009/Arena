import React from "react";

export default function Submitted({ lockedType = "voting" }) {
  const isSubmission = lockedType === "submission";
  return (
    <div className="submitted-container">
      {!isSubmission && (
        <>
          <h1 className="submitted-title">🎉 Submission Received!</h1>
          <p className="cottage-text">
            Thank you for submitting your project. Your entry has been
            successfully recorded.
          </p>
        </>
      )}
      <p className="error">
        🕒 {lockedType.charAt(0).toUpperCase() + lockedType.slice(1)} is
        currently locked. Please check back once {lockedType} begins.
      </p>
    </div>
  );
}
