import TryCatch from "../middlewares/TryCatch.js";
import { User } from "../models/User.js";
import { Lecture } from "../models/Lecture.js";

// Mark lecture as completed
export const markLectureComplete = TryCatch(async (req, res) => {
  const { courseId, lectureId } = req.body;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  // Find if course is in user subscription
  if (!user.subscription.includes(courseId)) {
    return res.status(403).json({ message: "You are not enrolled in this course" });
  }

  // Initialize progress array if needed
  if (!user.progress) {
    user.progress = [];
  }

  let courseProgress = user.progress.find(
    (p) => p.course.toString() === courseId
  );

  if (!courseProgress) {
    courseProgress = {
      course: courseId,
      completedLectures: [],
      completedAt: null,
    };
    user.progress.push(courseProgress);
    // Find the reference again since push makes a copy or we can just find it
    courseProgress = user.progress[user.progress.length - 1];
  }

  // Add lecture to completed if not already there
  if (!courseProgress.completedLectures.includes(lectureId)) {
    courseProgress.completedLectures.push(lectureId);
  }

  // Check if all lectures in course are completed
  const totalLectures = await Lecture.countDocuments({ course: courseId });
  if (courseProgress.completedLectures.length === totalLectures && totalLectures > 0) {
    courseProgress.completedAt = new Date();
  }

  await user.save();

  res.status(200).json({
    message: "Lecture marked as completed",
    progress: courseProgress,
  });
});

// Get progress for a single course
export const getCourseProgress = TryCatch(async (req, res) => {
  const { courseId } = req.params;
  const user = await User.findById(req.user._id);

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const courseProgress = user.progress?.find(
    (p) => p.course.toString() === courseId
  );

  const totalLectures = await Lecture.countDocuments({ course: courseId });
  const completedCount = courseProgress ? courseProgress.completedLectures.length : 0;
  const percentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

  res.status(200).json({
    completedLectures: courseProgress ? courseProgress.completedLectures : [],
    completedCount,
    totalLectures,
    percentage,
    completedAt: courseProgress ? courseProgress.completedAt : null,
  });
});

// Get overall progress for student dashboard
export const getOverallProgress = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id).populate("subscription");

  if (!user) {
    return res.status(404).json({ message: "User not found" });
  }

  const overallProgress = [];

  for (const course of user.subscription) {
    const courseProgress = user.progress?.find(
      (p) => p.course.toString() === course._id.toString()
    );

    const totalLectures = await Lecture.countDocuments({ course: course._id });
    const completedCount = courseProgress ? courseProgress.completedLectures.length : 0;
    const percentage = totalLectures > 0 ? Math.round((completedCount / totalLectures) * 100) : 0;

    overallProgress.push({
      courseId: course._id,
      courseTitle: course.title,
      courseImage: course.image,
      completedCount,
      totalLectures,
      percentage,
      completedAt: courseProgress ? courseProgress.completedAt : null,
    });
  }

  res.status(200).json({
    overallProgress,
    totalEnrolled: user.subscription.length,
    completedCourses: user.progress?.filter((p) => p.completedAt !== null).length || 0,
  });
});
