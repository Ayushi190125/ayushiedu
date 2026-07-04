import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  aiTutor,
  aiExplainTopic,
  aiGenerateQuiz,
  aiCheckAssignment,
  aiGenerateNotes,
} from "../controllers/ai.js";

const router = express.Router();

router.post("/ai/tutor", isAuth, aiTutor);
router.post("/ai/explain", isAuth, aiExplainTopic);
router.post("/ai/generate-quiz", isAuth, aiGenerateQuiz);
router.post("/ai/check-assignment", isAuth, aiCheckAssignment);
router.post("/ai/notes", isAuth, aiGenerateNotes);

export default router;
