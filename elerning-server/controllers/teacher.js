import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { User } from "../models/User.js";
import { Lecture } from "../models/Lecture.js";

// Fetch teacher dashboard statistics
export const getTeacherDashboard = TryCatch(async (req, res) => {
  // Find courses created by this teacher/admin
  const courses = await Courses.find({ createdBy: req.user.name });
  const courseIds = courses.map((c) => c._id);

  // Find users who have subscribed to these courses
  const students = await User.find({
    subscription: { $in: courseIds },
  }).select("-password");

  const totalLectures = await Lecture.countDocuments({ course: { $in: courseIds } });

  // Calculate detailed course stats
  const courseStats = [];
  for (const course of courses) {
    const enrolledStudents = students.filter((s) =>
      s.subscription.includes(course._id)
    );
    courseStats.push({
      _id: course._id,
      title: course.title,
      price: course.price,
      duration: course.duration,
      category: course.category,
      enrolledCount: enrolledStudents.length,
    });
  }

  res.status(200).json({
    totalCourses: courses.length,
    totalStudents: students.length,
    totalLectures,
    courses: courseStats,
  });
});

// Fetch enrolled students and their detailed progress
export const getEnrolledStudents = TryCatch(async (req, res) => {
  const courses = await Courses.find({ createdBy: req.user.name });
  const courseIds = courses.map((c) => c._id);

  const students = await User.find({
    subscription: { $in: courseIds },
  })
    .select("name email subscription progress")
    .populate("subscription", "title");

  const studentDetails = students.map((student) => {
    // Filter progress info to only show courses relevant to this teacher
    const relevantProgress = student.progress?.filter((prog) =>
      courseIds.some((id) => id.toString() === prog.course.toString())
    ) || [];

    return {
      _id: student._id,
      name: student.name,
      email: student.email,
      coursesEnrolled: student.subscription.filter((sub) =>
        courseIds.some((id) => id.toString() === sub._id.toString())
      ),
      progress: relevantProgress,
    };
  });

  res.status(200).json({ students: studentDetails });
});
