import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  markLectureComplete,
  getCourseProgress,
  getOverallProgress,
} from "../controllers/progress.js";

const router = express.Router();

router.post("/progress/complete", isAuth, markLectureComplete);
router.get("/progress/course/:courseId", isAuth, getCourseProgress);
router.get("/progress/overall", isAuth, getOverallProgress);

export default router;
