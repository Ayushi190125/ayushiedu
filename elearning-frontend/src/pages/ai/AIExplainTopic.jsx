import React, { useState } from "react";
import "./ai.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import ReactMarkdown from "react-markdown";

const AIExplainTopic = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [explanation, setExplanation] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    try {
      const { data } = await axios.post(
        `${server}/api/ai/explain`,
        { topic },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setExplanation(data.explanation);
    } catch (error) {
      setExplanation("Failed to generate explanation. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-workspace-container">
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "800px", alignItems: "center" }}>
        <h2>AI Topic Explainer</h2>
        <button className="common-btn" onClick={() => navigate("/ai")}>
          All AI Tools
        </button>
      </div>

      <div className="ai-glass-card">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
            Enter any topic you want to understand in detail:
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="e.g. Redux Toolkit vs Context API"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              style={{
                flex: 1,
                background: "rgba(0,0,0,0.2)",
                border: "1px solid rgba(255,255,255,0.1)",
                padding: "14px",
                borderRadius: "12px",
                color: "#fff",
                fontSize: "1rem",
              }}
              required
            />
            <button type="submit" className="common-btn" style={{ margin: 0 }} disabled={loading}>
              {loading ? "Explaining..." : "Explain"}
            </button>
          </div>
        </form>

        {explanation && (
          <div className="ai-output-display">
            <ReactMarkdown>{explanation}</ReactMarkdown>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIExplainTopic;
