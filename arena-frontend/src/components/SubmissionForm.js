import React, { useState, useEffect } from "react";
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

// Helper to convert seconds to "Xh Ym" format
function secondsToHuman(secs) {
  const h = Math.floor(secs / 3600);
  const m = Math.floor((secs % 3600) / 60);
  let str = "";
  if (h > 0) str += `${h}h `;
  if (m > 0) str += `${m}m`;
  if (!str) str = "0m";
  return str.trim();
}

export default function SubmissionForm({ user }) {
  const [siteUrl, setSiteUrl] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [sourceUrl, setSourceUrl] = useState("");
  const [projectName, setProjectName] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [imagePreview, setImagePreview] = useState("");
  const [projects, setProjects] = useState([]);
  const [selectedProjects, setSelectedProjects] = useState([]);
  const [description, setDescription] = useState("");
  const DESCRIPTION_LIMIT = 100;

  useEffect(() => {
    if (!user?.slackId) return;
    const fetchProjects = async () => {
      try {
        const res = await axios.get(
          `https://hackatime.hackclub.com/api/v1/users/${user.slackId}/stats?start_date=2024-6-24&features=projects`
        );
        setProjects(res.data.data.projects || []);
      } catch (e) {
        setProjects([]);
      }
    };
    fetchProjects();
  }, [user?.slackId]);

  const sanitizeUrl = (url) => {
    // If the URL does not start with 'http://' or 'https://', add 'https://'
    if (!url.startsWith("http://") && !url.startsWith("https://")) {
      return "https://" + url;
    }
    return url;
  };

  const handleProjectChange = (e) => {
    const options = Array.from(e.target.selectedOptions).map((o) => ({
      name: o.value,
      text: o.getAttribute("data-time"),
    }));
    setSelectedProjects(options);
  };

  const submit = async () => {
    if (
      !siteUrl ||
      !imageUrl ||
      !sourceUrl ||
      !description.trim() ||
      !projectName.trim()
    ) {
      setMessage("Please fill in all fields!");
      return;
    }
    if (description.length > DESCRIPTION_LIMIT) {
      setMessage(
        `Description can not be greater than ${DESCRIPTION_LIMIT} characters.`
      );
      return;
    }

    if (!isValidUrl(siteUrl)) {
      setMessage(
        "Invalid demo URL. Please provide a valid URL. (URL should start with http:// or https://)"
      );
      return;
    }

    if (!isValidUrl(imageUrl)) {
      setMessage("Invalid image URL. Please provide a valid image URL.");
      return;
    }

    if (!isValidUrl(sourceUrl)) {
      setMessage("Invalid source code URL. Please provide a valid URL.");
      return;
    }

    setLoading(true);
    setMessage("");
    try {
      const sanitizedSiteUrl = sanitizeUrl(siteUrl);

      await axios.post(
        "https://arena-backend.irtaza.xyz/api/submit",
        {
          siteUrl: sanitizedSiteUrl,
          imageUrl,
          sourceUrl,
          projectName,
          description,
          hackatime: {
            totalTime: selectedTotalTime,
            projects: selectedProjects.map((p) => ({
              name: p.name,
              text: p.text,
              total_seconds: p.total_seconds,
            })),
          },
        },
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

  // Calculate total time from selected projects
  const selectedTotalSeconds = selectedProjects.reduce(
    (sum, p) => sum + (p.total_seconds || 0),
    0
  );
  const selectedTotalTime = secondsToHuman(selectedTotalSeconds);

  return (
    <div style={{ padding: "2rem", maxWidth: "500px", margin: "0 auto" }}>
      <h2>Submit Your Project</h2>

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="siteUrl"
          style={{ display: "block", fontWeight: "bold" }}
        >
          Demo URL
        </label>
        <input
          id="siteUrl"
          placeholder="(starting with https:// or http://)"
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
          htmlFor="sourceUrl"
          style={{ display: "block", fontWeight: "bold" }}
        >
          Source Code URL
        </label>
        <input
          id="sourceUrl"
          placeholder="e.g GitHub Repo link"
          value={sourceUrl}
          onChange={(e) => setSourceUrl(e.target.value)}
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
          placeholder="(you can use #cdn)"
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
              height: "180px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
        </div>
      )}

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="description"
          style={{ display: "block", fontWeight: "bold" }}
        >
          Project Description
        </label>
        <textarea
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          required
          maxLength={DESCRIPTION_LIMIT}
          rows={4}
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "0.3rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
            fontFamily: "inherit",
            fontSize: "1rem",
            resize: "vertical",
          }}
        />
        <div
          style={{
            fontSize: "0.95em",
            color:
              description.length > DESCRIPTION_LIMIT - 20 ? "#c4453e" : "#888",
          }}
        >
          {description.length}/{DESCRIPTION_LIMIT} characters
        </div>
      </div>

      <div style={{ marginBottom: "1rem" }}>
        <label
          htmlFor="projectName"
          style={{ display: "block", fontWeight: "bold" }}
        >
          Project Name
        </label>
        <input
          id="projectName"
          value={projectName}
          onChange={(e) => setProjectName(e.target.value)}
          required
          maxLength={60}
          placeholder="Enter your project name"
          style={{
            width: "100%",
            padding: "0.5rem",
            marginBottom: "1rem",
            border: "1px solid #ccc",
            borderRadius: "4px",
          }}
        />
      </div>

      {projects.length > 0 && (
        <div style={{ marginBottom: "1rem" }}>
          <label htmlFor="hackatime-projects" style={{ fontWeight: "bold" }}>
            Link Hackatime Projects (optional)
          </label>
          <select
            id="hackatime-projects"
            onChange={(e) => {
              const selectedName = e.target.value;
              const project = projects.find((p) => p.name === selectedName);
              if (
                project &&
                !selectedProjects.find((p) => p.name === project.name)
              ) {
                setSelectedProjects([...selectedProjects, project]);
              }
              e.target.value = ""; // Reset dropdown
            }}
            style={{
              width: "100%",
              padding: "0.5rem",
              marginBottom: "0.5rem",
              border: "1px solid #ccc",
              borderRadius: "4px",
            }}
          >
            <option value="">-- Select a project --</option>
            {projects.map((proj) => (
              <option key={proj.name} value={proj.name}>
                {proj.name} ({proj.text})
              </option>
            ))}
          </select>

          {/* Show selected project "pills" */}
          {selectedProjects.length > 0 && (
            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: "0.5rem",
                marginBottom: "0.5rem",
              }}
            >
              {selectedProjects.map((proj) => (
                <div
                  key={proj.name}
                  style={{
                    padding: "0.4rem 0.8rem",
                    backgroundColor: "#f0f0f0",
                    borderRadius: "20px",
                    display: "flex",
                    alignItems: "center",
                    fontSize: "0.9rem",
                  }}
                >
                  {proj.name} ({proj.text})
                  <span
                    onClick={() =>
                      setSelectedProjects(
                        selectedProjects.filter((p) => p.name !== proj.name)
                      )
                    }
                    style={{
                      marginLeft: "0.5rem",
                      cursor: "pointer",
                      color: "red",
                      fontWeight: "bold",
                    }}
                  >
                    ✖️
                  </span>
                </div>
              ))}
            </div>
          )}

          {selectedTotalTime && (
            <div style={{ fontSize: "0.95em" }}>
              <b>Total Hackatime:</b> {selectedTotalTime}
            </div>
          )}
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
