import React, { useEffect, useState } from "react";
import "./quiz.css";
import { useParams, useNavigate } from "react-router-dom";
import axios from "axios";
import { server } from "../../main";
import Loading from "../../components/loading/Loading";
import toast from "react-hot-toast";
import Confetti from "react-confetti";

const Quiz = ({ user }) => {
  const { id } = useParams(); // Course ID
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswers, setSelectedAnswers] = useState({}); // { questionId: selectedIndex }
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [results, setResults] = useState(null);
  const [gradedAnswers, setGradedAnswers] = useState([]);
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  // For confetti
  const [windowSize, setWindowSize] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });

  const handleResize = () => {
    setWindowSize({ width: window.innerWidth, height: window.innerHeight });
  };

  useEffect(() => {
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  async function fetchQuiz() {
    try {
      const { data } = await axios.get(`${server}/api/quiz/course/${id}`, {
        headers: {
          token: localStorage.getItem("token"),
        },
      });
      setQuizzes(data.quizzes || []);
      setLoading(false);
    } catch (error) {
      console.log("Error fetching quiz:", error);
      setLoading(false);
    }
  }

  // Generate a practice quiz using AI
  async function generateAiQuiz() {
    setIsAiGenerating(true);
    try {
      // First let's get course details to know the course title
      const courseRes = await axios.get(`${server}/api/course/${id}`);
      const courseTitle = courseRes.data.course.title;

      const { data } = await axios.post(
        `${server}/api/ai/generate-quiz`,
        { topic: courseTitle, numQuestions: 5 },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      if (data.quiz && data.quiz.length > 0) {
        // Create this quiz temporarily or on the backend
        // For local practice, we can mock it directly into the state
        const generatedQuiz = {
          _id: "ai-temp-quiz",
          title: `AI Practice Quiz: ${courseTitle}`,
          course: id,
          questions: data.quiz,
          passingScore: 70,
        };
        setQuizzes([generatedQuiz]);
        toast.success("AI generated a practice quiz for you!");
      }
    } catch (error) {
      toast.error("Failed to generate quiz with AI");
    } finally {
      setIsAiGenerating(false);
    }
  }

  useEffect(() => {
    fetchQuiz();
  }, [id]);

  if (loading) return <Loading />;

  const currentQuiz = quizzes[currentQuizIndex];

  // Helper to handle answers selection
  const handleSelectOption = (questionId, optionIndex) => {
    setSelectedAnswers({
      ...selectedAnswers,
      [questionId]: optionIndex,
    });
  };

  // Submit quiz handler
  const handleSubmitQuiz = async () => {
    if (!currentQuiz) return;

    // Validate that all questions are answered
    const unanswered = currentQuiz.questions.some(
      (q) => selectedAnswers[q._id] === undefined
    );

    if (unanswered && currentQuiz._id !== "ai-temp-quiz") {
      toast.error("Please answer all questions before submitting.");
      return;
    }

    setIsSubmitting(true);
    try {
      const answersPayload = Object.keys(selectedAnswers).map((qId) => ({
        questionId: qId,
        selectedOption: selectedAnswers[qId],
      }));

      // If it's a mock AI quiz, grade it locally to avoid missing IDs in db
      if (currentQuiz._id === "ai-temp-quiz") {
        let correct = 0;
        const answersList = currentQuiz.questions.map((q, idx) => {
          const selected = selectedAnswers[idx];
          const isCorrect = selected === q.correctAnswer;
          if (isCorrect) correct++;
          return {
            ...q,
            selectedOption: selected,
            isCorrect,
          };
        });

        const score = Math.round((correct / currentQuiz.questions.length) * 100);
        setResults({
          score,
          passed: score >= currentQuiz.passingScore,
        });
        setGradedAnswers(answersList);
        setIsSubmitting(false);
        return;
      }

      const { data } = await axios.post(
        `${server}/api/quiz/submit`,
        {
          quizId: currentQuiz._id,
          answers: answersPayload,
        },
        {
          headers: {
            token: localStorage.getItem("token"),
          },
        }
      );

      setResults(data.attempt);
      // Map graded answers with full correct info
      const fullAnswers = currentQuiz.questions.map((q) => {
        const matchingAns = data.quizAnswers.find((qa) => qa._id === q._id) || q;
        return {
          ...q,
          correctAnswer: matchingAns.correctAnswer,
          explanation: matchingAns.explanation,
          selectedOption: selectedAnswers[q._id],
        };
      });
      setGradedAnswers(fullAnswers);
      toast.success(data.message);
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to submit quiz");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Render results screen
  if (results) {
    return (
      <div className="quiz-page-container">
        {results.passed && (
          <Confetti width={windowSize.width} height={windowSize.height} recycle={false} />
        )}
        <div className="quiz-card quiz-results-container">
          <h2>Quiz Results</h2>
          <div className={`results-score-badge ${results.passed ? "" : "failed"}`}>
            {results.score}%
          </div>
          <p style={{ fontSize: "1.2rem", fontWeight: "600", marginBottom: "20px" }}>
            {results.passed ? "🎉 Congratulations, you passed!" : "❌ You did not pass. Try again!"}
          </p>

          <div style={{ textAlign: "left", marginTop: "30px" }}>
            <h3>Review Answers:</h3>
            {gradedAnswers.map((q, idx) => {
              const isCorrect = q.selectedOption === q.correctAnswer;
              return (
                <div key={idx} className="quiz-explanation-card" style={{ borderLeft: `4px solid ${isCorrect ? "#10b981" : "#ef4444"}` }}>
                  <h4>
                    Question {idx + 1}: {q.questionText}
                  </h4>
                  <p><strong>Your Answer:</strong> {q.options[q.selectedOption] || "Not answered"}</p>
                  <p><strong>Correct Answer:</strong> {q.options[q.correctAnswer]}</p>
                  {q.explanation && (
                    <p style={{ marginTop: "10px", color: "#94a3b8", fontStyle: "italic" }}>
                      💡 <em>Explanation:</em> {q.explanation}
                    </p>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: "15px", marginTop: "40px", justifyContent: "center" }}>
            <button
              className="common-btn"
              onClick={() => {
                setResults(null);
                setSelectedAnswers({});
                setCurrentQuestionIndex(0);
              }}
            >
              Retry Quiz
            </button>
            <button
              className="secondary-btn"
              onClick={() => navigate(`/lectures/${id}`)}
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Render No Quiz state
  if (!currentQuiz) {
    return (
      <div className="quiz-page-container">
        <div className="quiz-card" style={{ textAlign: "center" }}>
          <h2>No Official Quiz Found</h2>
          <p style={{ color: "#94a3b8", margin: "20px 0" }}>
            This course doesn't have an official quiz uploaded by the instructor yet.
          </p>
          <button
            className="common-btn"
            disabled={isAiGenerating}
            onClick={generateAiQuiz}
            style={{ background: "linear-gradient(135deg, #a855f7 0%, #3b82f6 100%)" }}
          >
            {isAiGenerating ? "AI is Generating Quiz..." : "✨ Generate Practice Quiz with AI"}
          </button>
          <div style={{ marginTop: "20px" }}>
            <button
              className="secondary-btn"
              onClick={() => navigate(`/lectures/${id}`)}
            >
              Back to Course
            </button>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = currentQuiz.questions[currentQuestionIndex];
  const totalQuestions = currentQuiz.questions.length;

  return (
    <div className="quiz-page-container">
      <div className="quiz-card">
        <h2>{currentQuiz.title}</h2>
        <div className="quiz-meta-info">
          <span>
            Question {currentQuestionIndex + 1} of {totalQuestions}
          </span>
          <span>Passing Score: {currentQuiz.passingScore}%</span>
        </div>

        {currentQuestion && (
          <div>
            <div className="question-text">{currentQuestion.questionText}</div>
            <div className="options-list">
              {currentQuestion.options.map((option, idx) => {
                const questionIdKey = currentQuiz._id === "ai-temp-quiz" ? currentQuestionIndex : currentQuestion._id;
                const isSelected = selectedAnswers[questionIdKey] === idx;
                return (
                  <button
                    key={idx}
                    className={`option-button ${isSelected ? "selected" : ""}`}
                    onClick={() => handleSelectOption(questionIdKey, idx)}
                  >
                    {option}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        <div className="quiz-footer">
          <button
            className="secondary-btn"
            disabled={currentQuestionIndex === 0}
            onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
            style={{ margin: 0 }}
          >
            Previous
          </button>

          {currentQuestionIndex < totalQuestions - 1 ? (
            <button
              className="common-btn"
              onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
              style={{ margin: 0 }}
            >
              Next
            </button>
          ) : (
            <button
              className="common-btn"
              disabled={isSubmitting}
              onClick={handleSubmitQuiz}
              style={{ margin: 0, background: "linear-gradient(135deg, #10b981 0%, #059669 100%)" }}
            >
              {isSubmitting ? "Submitting..." : "Submit Quiz"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default Quiz;
