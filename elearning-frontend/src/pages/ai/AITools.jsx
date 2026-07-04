import React from "react";
import "./ai.css";
import { useNavigate } from "react-router-dom";

const AITools = () => {
  const navigate = useNavigate();

  const tools = [
    {
      title: "AI Personal Tutor",
      description: "Ask questions, review course topics, and learn step-by-step with interactive contextual answers.",
      path: "/ai-tutor",
      icon: "🤖",
    },
    {
      title: "AI Topic Explainer",
      description: "Get detailed definitions, concepts, and real-world examples for any subject matter instantaneously.",
      path: "/ai-explain",
      icon: "💡",
    },
    {
      title: "AI Quiz Generator",
      description: "Generate a custom quiz dynamically to practice questions and test your learning depth.",
      path: "/ai-quiz",
      icon: "✍",
    },
    {
      title: "AI Assignment Checker",
      description: "Submit assignment write-ups to receive immediate grading reports, grammar alerts, and reviews.",
      path: "/ai-assignment",
      icon: "📝",
    },
    {
      title: "AI Notes Summarizer",
      description: "Quickly summarize complex course titles into key checkpoints, notes, and tables.",
      path: "/ai-notes",
      icon: "📚",
    },
  ];

  return (
    <div className="ai-workspace-container">
      <h2>AI Co-Pilot Study Workspace</h2>
      <p style={{ color: "#94a3b8", maxWidth: "600px", textAlign: "center", margin: "10px 0 20px 0" }}>
        Supercharge your e-learning experience using our state-of-the-art suite of AI study companions.
      </p>

      <div className="ai-grid-menu">
        {tools.map((tool, idx) => (
          <div key={idx} className="ai-menu-card" onClick={() => navigate(tool.path)}>
            <div className="icon">{tool.icon}</div>
            <h3>{tool.title}</h3>
            <p>{tool.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AITools;
