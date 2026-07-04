import React, { useState } from "react";
import "./ai.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const AIAssignmentChecker = () => {
  const navigate = useNavigate();
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) return;

    setLoading(true);
    setResult(null);

    try {
      const { data } = await axios.post(
        `${server}/api/ai/check-assignment`,
        { title, content },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setResult(data);
      toast.success("Assignment graded successfully!");
    } catch (error) {
      toast.error("Failed to evaluate submission. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-workspace-container">
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "800px", alignItems: "center" }}>
        <h2>AI Assignment Grader</h2>
        <button className="common-btn" onClick={() => navigate("/ai")}>
          All AI Tools
        </button>
      </div>

      <div className="ai-glass-card">
        {!result && (
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "20px" }}>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "1rem" }}>Assignment Topic / Question</label>
              <input
                type="text"
                placeholder="e.g. Write a brief summary of asynchronous JavaScript actions."
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "12px",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1rem",
                }}
                required
              />
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              <label style={{ color: "#cbd5e1", fontSize: "1rem" }}>Your Submission Content</label>
              <textarea
                placeholder="Type or paste your response here..."
                rows={8}
                value={content}
                onChange={(e) => setContent(e.target.value)}
                style={{
                  background: "rgba(0,0,0,0.2)",
                  border: "1px solid rgba(255,255,255,0.1)",
                  padding: "12px",
                  borderRadius: "8px",
                  color: "#fff",
                  fontSize: "1rem",
                  resize: "vertical",
                  fontFamily: "inherit",
                }}
                required
              />
            </div>

            <button type="submit" className="common-btn" style={{ width: "100%" }} disabled={loading}>
              {loading ? "Checking and Grading..." : "Submit for Evaluation"}
            </button>
          </form>
        )}

        {result && (
          <div>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" }}>
              <h3 style={{ margin: 0, color: "#a855f7" }}>Evaluation Report</h3>
              <div style={{ fontSize: "2rem", fontWeight: "bold", color: result.score >= 50 ? "#10b981" : "#ef4444" }}>
                Score: {result.score}/100
              </div>
            </div>

            <div className="ai-output-display">
              <ReactMarkdown>{result.feedback}</ReactMarkdown>
            </div>

            <div style={{ display: "flex", gap: "10px", marginTop: "30px" }}>
              <button
                className="common-btn"
                onClick={() => {
                  setResult(null);
                  setContent("");
                  setTitle("");
                }}
              >
                Grade Another Assignment
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIAssignmentChecker;
