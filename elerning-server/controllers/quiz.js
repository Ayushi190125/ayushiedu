import TryCatch from "../middlewares/TryCatch.js";
import { Quiz } from "../models/Quiz.js";
import { QuizAttempt } from "../models/QuizAttempt.js";
import { User } from "../models/User.js";

// Create quiz (Teachers or Admin)
export const createQuiz = TryCatch(async (req, res) => {
  const { course, lecture, title, questions, passingScore } = req.body;

  const quiz = await Quiz.create({
    course,
    lecture: lecture || null,
    title,
    questions,
    passingScore: passingScore || 70,
    createdBy: req.user._id,
  });

  res.status(201).json({
    message: "Quiz created successfully",
    quiz,
  });
});

// Fetch quiz by course ID (safe for students - excludes correct answer indices)
export const getQuizByCourse = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const quizzes = await Quiz.find({ course: courseId });

  // Exclude correct answer index for students if role is user
  const sanitizedQuizzes = quizzes.map((quiz) => {
    if (req.user.role === "user") {
      const sanitizedQuestions = quiz.questions.map((q) => ({
        _id: q._id,
        questionText: q.questionText,
        options: q.options,
        // explanation is also excluded until they submit the quiz
      }));
      return {
        _id: quiz._id,
        title: quiz.title,
        course: quiz.course,
        lecture: quiz.lecture,
        passingScore: quiz.passingScore,
        questions: sanitizedQuestions,
      };
    }
    return quiz;
  });

  res.status(200).json({ quizzes: sanitizedQuizzes });
});

// Submit Quiz and grade it
export const submitQuiz = TryCatch(async (req, res) => {
  const { quizId, answers } = req.body; // answers is array of { questionId, selectedOption }
  const quiz = await Quiz.findById(quizId);

  if (!quiz) {
    return res.status(404).json({ message: "Quiz not found" });
  }

  let correctCount = 0;
  const gradedAnswers = [];

  quiz.questions.forEach((q) => {
    const studentAnswer = answers.find(
      (ans) => ans.questionId.toString() === q._id.toString()
    );

    const selectedOption = studentAnswer ? studentAnswer.selectedOption : -1;
    const isCorrect = selectedOption === q.correctAnswer;

    if (isCorrect) {
      correctCount++;
    }

    gradedAnswers.push({
      questionId: q._id,
      selectedOption,
      isCorrect,
    });
  });

  const score = Math.round((correctCount / quiz.questions.length) * 100);
  const passed = score >= quiz.passingScore;

  const attempt = await QuizAttempt.create({
    user: req.user._id,
    quiz: quizId,
    answers: gradedAnswers,
    score,
    passed,
  });

  // Optional: Record in user progress
  const user = await User.findById(req.user._id);
  if (user) {
    // If progress item exists, update or add the score
    let progressItem = user.progress.find(
      (p) => p.course.toString() === quiz.course.toString()
    );
    if (!progressItem) {
      progressItem = {
        course: quiz.course,
        completedLectures: [],
        completedAt: null,
      };
      user.progress.push(progressItem);
      progressItem = user.progress[user.progress.length - 1];
    }

    // Since we don't have separate quizScores field in the modified User schema,
    // let's verify if we need to store it. In User.js, we didn't add quizScores to the Schema.
    // Let's check User.js progress schema in previous replace_file_content:
    // progress: [ { course, completedLectures[], completedAt } ]
    // That means we don't store quiz scores in User schema progress, but we can query them from QuizAttempt.
    // Let's check if the user passes, we can issue a certificate if they completed all lectures as well.
  }

  res.status(200).json({
    message: passed ? "Congratulations, you passed!" : "You did not pass. Try again!",
    attempt,
    quizAnswers: quiz.questions, // Include explanations and correct answers for review
  });
});

// Fetch quiz attempts history for a user
export const getQuizResults = TryCatch(async (req, res) => {
  const attempts = await QuizAttempt.find({ user: req.user._id })
    .populate("quiz")
    .sort({ createdAt: -1 });

  res.status(200).json({ attempts });
});
