import React, { useState } from "react";
import "./ai.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import ReactMarkdown from "react-markdown";
import toast from "react-hot-toast";

const AINotesGenerator = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setNotes("");

    try {
      const { data } = await axios.post(
        `${server}/api/ai/notes`,
        { topic },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setNotes(data.notes);
      toast.success("Study notes generated!");
    } catch (error) {
      toast.error("Failed to generate notes. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(notes);
    toast.success("Notes copied to clipboard!");
  };

  return (
    <div className="ai-workspace-container">
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "800px", alignItems: "center" }}>
        <h2>AI Study Notes Generator</h2>
        <button className="common-btn" onClick={() => navigate("/ai")}>
          All AI Tools
        </button>
      </div>

      <div className="ai-glass-card">
        <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
          <label style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
            Enter a topic to generate structured study summaries:
          </label>
          <div style={{ display: "flex", gap: "10px" }}>
            <input
              type="text"
              placeholder="e.g. Asynchronous execution in Node.js event loops"
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
              {loading ? "Generating..." : "Generate Notes"}
            </button>
          </div>
        </form>

        {notes && (
          <div>
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "20px" }}>
              <button className="common-btn" style={{ margin: 0 }} onClick={handleCopy}>
                📋 Copy Notes
              </button>
            </div>
            <div className="ai-output-display">
              <ReactMarkdown>{notes}</ReactMarkdown>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AINotesGenerator;
