import React, { useState } from "react";
import axios from "axios";

// Helper function to check if the string is a valid URL
const isValidUrl = (url) => {
  try {
    new URL(url);
    return true;
  } catch (e) {
    return false;
  }
};

export default function SubmissionForm() {
  const [siteUrl, setSiteUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");

  const sanitizeUrl = (url) => {
    // If the URL does not start with 'http://' or 'https://', add 'https://'
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  };

  const submit = async () => {
    if (!siteUrl || !imageUrl) {
      setMessage("Please fill in both fields.");
      return;
    }

    if (!isValidUrl(siteUrl)) {
      setMessage(
        "Invalid site URL. Please provide a valid URL. (URL should start with http:// or https://)"
      );
      return;
    }

    if (!isValidUrl(imageUrl)) {
      setMessage("Invalid image URL. Please provide a valid image URL.");
      return;
    }

    setLoading(true);
    setMessage("");

    try {
      const sanitizedSiteUrl = sanitizeUrl(siteUrl);

      await axios.post(
        "https://arena-backend-one.vercel.app/api/submit",
        { siteUrl: sanitizedSiteUrl, imageUrl },
        { withCredentials: true }
      );

      setMessage("Submission successful! Reloading...");
      setTimeout(() => window.location.reload(), 1000);
    } catch (err) {
      setMessage(err.response?.data?.message || "Submission failed.");
    } finally {
      setLoading(false);
    }
  };

  const handleImageChange = (e) => {
    const url = e.target.value;
    setImageUrl(url);

    // Preview the image if it's a valid URL
    if (isValidUrl(url)) {
      setImagePreview(url);
    } else {
      setImagePreview("");
    }
  };

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Submit Your Project</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="siteUrl"
          style={{ display: "block", fontWeight: "bold" }}
        >
          Site URL
        </label>
        <input
          id="siteUrl"
          placeholder="Site URL (starting with http:// or https://)"
          value={siteUrl}
          onChange={(e) => setSiteUrl(e.target.value)}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="imageUrl"
          style={{ display: "block", fontWeight: "bold" }}
        >
          Image URL
        </label>
        <input
          id="imageUrl"
          placeholder="Image URL (you can use #cdn)"
          value={imageUrl}
          onChange={handleImageChange}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {imagePreview && (
        <div style={{ marginBottom: "1rem" }}>
          <h4>Image Preview</h4>
          <img
            src={imagePreview}
            alt="Image Preview"
            style={{
              width: "100%",
              height: "auto",
              borderRadius: "4px",
            }}
          />
        </div>
      )}

      <button
        onClick={submit}
        disabled={loading}
        style={{ padding: "0.5rem 1rem", cursor: "pointer" }}
      >
        {loading ? "Submitting..." : "Submit"}
      </button>

      {message && <p style={{ marginTop: "1rem", color: "red" }}>{message}</p>}
    </div>
  );
}
