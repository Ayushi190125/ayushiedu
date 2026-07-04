import express from "express";
import dotenv from "dotenv";
import { connectDb } from "./database/db.js";
import cors from "cors";

dotenv.config();

const app = express();

// using middlewares
app.use(express.json());
app.use(cors());

const port = process.env.PORT || 3000;

app.get("/", (req, res) => {
  res.send("Server is working");
});

app.use("/uploads", express.static("uploads"));

// importing routes
import userRoutes from "./routes/user.js";
import courseRoutes from "./routes/course.js";
import adminRoutes from "./routes/admin.js";
import progressRoutes from "./routes/progress.js";
import quizRoutes from "./routes/quiz.js";
import certificateRoutes from "./routes/certificate.js";
import teacherRoutes from "./routes/teacher.js";
import aiRoutes from "./routes/ai.js";

// using routes
app.use("/api", userRoutes);
app.use("/api", courseRoutes);
app.use("/api", adminRoutes);
app.use("/api", progressRoutes);
app.use("/api", quizRoutes);
app.use("/api", certificateRoutes);
app.use("/api", teacherRoutes);
app.use("/api", aiRoutes);

app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
  connectDb();
});
