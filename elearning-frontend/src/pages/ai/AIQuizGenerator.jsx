import React, { useState } from "react";
import "./ai.css";
import { useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";

const AIQuizGenerator = () => {
  const navigate = useNavigate();
  const [topic, setTopic] = useState("");
  const [loading, setLoading] = useState(false);
  const [quizQuestions, setQuizQuestions] = useState(null);
  const [currentQuestionIdx, setCurrentQuestionIdx] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionIdx: optionIdx }
  const [score, setScore] = useState(null);
  const [showReview, setShowReview] = useState(false);

  const handleGenerate = async (e) => {
    e.preventDefault();
    if (!topic.trim()) return;

    setLoading(true);
    setQuizQuestions(null);
    setScore(null);
    setShowReview(false);
    setSelectedAnswers({});
    setCurrentQuestionIdx(0);

    try {
      const { data } = await axios.post(
        `${server}/api/ai/generate-quiz`,
        { topic, numQuestions: 5 },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );
      setQuizQuestions(data.quiz || []);
    } catch (error) {
      toast.error("Failed to generate quiz. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSelect = (idx) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [currentQuestionIdx]: idx,
    });
  };

  const handleSubmit = () => {
    let correct = 0;
    quizQuestions.forEach((q, index) => {
      if (selectedAnswers[index] === q.correctAnswer) {
        correct++;
      }
    });

    const finalScore = Math.round((correct / quizQuestions.length) * 100);
    setScore(finalScore);
    setShowReview(true);
  };

  return (
    <div className="ai-workspace-container">
      <div style={{ display: "flex", justifyContent: "space-between", width: "100%", maxWidth: "800px", alignItems: "center" }}>
        <h2>AI Practice Quiz Generator</h2>
        <button className="common-btn" onClick={() => navigate("/ai")}>
          All AI Tools
        </button>
      </div>

      <div className="ai-glass-card">
        {!quizQuestions && !loading && (
          <form onSubmit={handleGenerate} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
            <label style={{ fontSize: "1.1rem", color: "#94a3b8" }}>
              Enter a subject to generate a custom multiple-choice test:
            </label>
            <div style={{ display: "flex", gap: "10px" }}>
              <input
                type="text"
                placeholder="e.g. JavaScript Arrays and Scope"
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
              <button type="submit" className="common-btn" style={{ margin: 0 }}>
                Generate Quiz
              </button>
            </div>
          </form>
        )}

        {loading && <Loading />}

        {quizQuestions && !showReview && (
          <div>
            <h3 style={{ color: "#a855f7" }}>Practice Quiz: {topic}</h3>
            <p style={{ color: "#94a3b8", fontSize: "0.9rem" }}>
              Question {currentQuestionIdx + 1} of {quizQuestions.length}
            </p>

            <div style={{ margin: "20px 0", fontSize: "1.2rem", color: "#e2e8f0" }}>
              {quizQuestions[currentQuestionIdx].questionText}
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {quizQuestions[currentQuestionIdx].options.map((opt, i) => {
                const isSelected = selectedAnswers[currentQuestionIdx] === i;
                return (
                  <button
                    key={i}
                    onClick={() => handleSelect(i)}
                    style={{
                      background: isSelected ? "rgba(168, 85, 247, 0.2)" : "rgba(255, 255, 255, 0.03)",
                      border: isSelected ? "1px solid #a855f7" : "1px solid rgba(255,255,255,0.06)",
                      padding: "15px",
                      borderRadius: "10px",
                      color: "#fff",
                      cursor: "pointer",
                      textAlign: "left",
                      fontSize: "1rem",
                    }}
                  >
                    {opt}
                  </button>
                );
              })}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "30px" }}>
              <button
                className="common-btn"
                disabled={currentQuestionIdx === 0}
                onClick={() => setCurrentQuestionIdx(currentQuestionIdx - 1)}
                style={{ background: "rgba(255,255,255,0.05)" }}
              >
                Previous
              </button>

              {currentQuestionIdx < quizQuestions.length - 1 ? (
                <button
                  className="common-btn"
                  onClick={() => setCurrentQuestionIdx(currentQuestionIdx + 1)}
                >
                  Next
                </button>
              ) : (
                <button
                  className="common-btn"
                  style={{ background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
                  onClick={handleSubmit}
                >
                  Submit
                </button>
              )}
            </div>
          </div>
        )}

        {showReview && quizQuestions && (
          <div style={{ textAlign: "center" }}>
            <h3 style={{ fontSize: "1.8rem" }}>Quiz Complete!</h3>
            <div style={{ fontSize: "3rem", fontWeight: "bold", color: score >= 70 ? "#10b981" : "#ef4444", margin: "20px 0" }}>
              {score}%
            </div>

            <div style={{ textAlign: "left", marginTop: "30px" }}>
              <h4>Review Answers:</h4>
              {quizQuestions.map((q, index) => {
                const isCorrect = selectedAnswers[index] === q.correctAnswer;
                return (
                  <div
                    key={index}
                    style={{
                      background: "rgba(255,255,255,0.01)",
                      borderLeft: `4px solid ${isCorrect ? "#10b981" : "#ef4444"}`,
                      padding: "15px",
                      borderRadius: "8px",
                      marginBottom: "15px",
                    }}
                  >
                    <h5>{q.questionText}</h5>
                    <p style={{ margin: "5px 0" }}>
                      <strong>Your Answer:</strong> {q.options[selectedAnswers[index]] || "Not answered"}
                    </p>
                    <p style={{ margin: "5px 0" }}>
                      <strong>Correct Answer:</strong> {q.options[q.correctAnswer]}
                    </p>
                    {q.explanation && (
                      <p style={{ margin: "10px 0 0 0", color: "#94a3b8", fontSize: "0.9rem", fontStyle: "italic" }}>
                        💡 Explanation: {q.explanation}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>

            <button
              className="common-btn"
              style={{ marginTop: "30px" }}
              onClick={() => {
                setQuizQuestions(null);
                setScore(null);
                setTopic("");
              }}
            >
              Generate Another Quiz
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default AIQuizGenerator;
