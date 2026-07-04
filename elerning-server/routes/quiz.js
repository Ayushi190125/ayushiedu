import express from "express";
import { isAuth, isTeacher } from "../middlewares/isAuth.js";
import {
  createQuiz,
  getQuizByCourse,
  submitQuiz,
  getQuizResults,
} from "../controllers/quiz.js";

const router = express.Router();

router.post("/quiz/new", isAuth, isTeacher, createQuiz);
router.get("/quiz/course/:courseId", isAuth, getQuizByCourse);
router.post("/quiz/submit", isAuth, submitQuiz);
router.get("/quiz/attempts", isAuth, getQuizResults);

export default router;
