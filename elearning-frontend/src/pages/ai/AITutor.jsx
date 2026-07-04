import React, { useState, useEffect, useRef } from "react";
import "./ai.css";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import ReactMarkdown from "react-markdown";

const AITutor = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const initialLectureId = location.state?.lectureId || "";

  const [question, setQuestion] = useState("");
  const [messages, setMessages] = useState([
    {
      role: "ai",
      content: "Hello! I am your AI Tutor. Ask me any questions you have about your courses, lectures, or homework!",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const chatEndRef = useRef(null);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e) => {
    e.preventDefault();
    if (!question.trim()) return;

    const userMessage = { role: "user", content: question };
    setMessages((prev) => [...prev, userMessage]);
    setQuestion("");
    setLoading(true);

    try {
      const { data } = await axios.post(
        `${server}/api/ai/tutor`,
        { question: userMessage.content, lectureId: initialLectureId },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setMessages((prev) => [...prev, { role: "ai", content: data.reply }]);
    } catch (error) {
      setMessages((prev) => [
        ...prev,
        { role: "ai", content: "Sorry, I had trouble processing that request. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="ai-workspace-container">
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "800px", alignItems: "center" }}>
        <h2>AI Tutor Hub</h2>
        <button className="common-btn" onClick={() => navigate("/ai")}>
          All AI Tools
        </button>
      </div>

      <div className="ai-glass-card">
        <div className="chat-window">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.role}`}>
              <ReactMarkdown>{msg.content}</ReactMarkdown>
            </div>
          ))}
          {loading && (
            <div className="chat-message ai">
              <em>Thinking...</em>
            </div>
          )}
          <div ref={chatEndRef} />
        </div>

        <form onSubmit={handleSend} className="chat-input-area">
          <input
            type="text"
            placeholder="Ask your question here..."
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            disabled={loading}
          />
          <button type="submit" className="common-btn" style={{ margin: 0 }} disabled={loading}>
            Send
          </button>
        </form>
      </div>
    </div>
  );
};

export default AITutor;
