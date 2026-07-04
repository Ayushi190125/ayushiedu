import express from "express";
import { isAuth, isTeacher } from "../middlewares/isAuth.js";
import {
  getTeacherDashboard,
  getEnrolledStudents,
} from "../controllers/teacher.js";

const router = express.Router();

router.get("/teacher/dashboard", isAuth, isTeacher, getTeacherDashboard);
router.get("/teacher/students", isAuth, isTeacher, getEnrolledStudents);

export default router;
