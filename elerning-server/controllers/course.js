import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";

export const getAllCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find().sort({ createdAt: 1 });
  res.send({
    courses,
  });
});

export const getSingleCourse = TryCatch(async (req, res) => {
  const course = await Courses.findById(req.params.id);
  res.json({
    course,
  });
});

export const fetchLectures = TryCatch(async (req, res) => {
  const lectures = await Lecture.find({ course: req.params.id }).sort({ createdAt: 1 });
  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lectures });
  }

  if (!user.subscription.includes(req.params.id))
    return res.status(400).json({
      message: "You are not buy this course",
    });

  res.json({ lectures });
});

export const fetchLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findById(req.params.id);
  const user = await User.findById(req.user._id);

  if (user.role === "admin") {
    return res.json({ lecture });
  }

  if (!user.subscription.includes(lecture.course))
    return res.status(400).json({
      message: "You are not buy this course",
    });

  res.json({ lecture });
});

export const getMyCourses = TryCatch(async (req, res) => {
  const courses = await Courses.find({ _id: req.user.subscription }).sort({ createdAt: 1 });
  res.json({
    courses,
  });
});

export const checkout = TryCatch(async (req, res) => {
  const user = await User.findById(req.user._id);
  const course = await Courses.findById(req.params.id);

  if (user.subscription.includes(course._id)) {
    return res.status(400).json({
      message: "You already buy this course",
    });
  }

  // Directly add the course to the user's subscription
  user.subscription.push(course._id);
  await user.save();

  res.status(201).json({
    message: "Buy Course Successfully",
    course,
  });
});

export const getDemoLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findOne({ course: req.params.id }).sort({ createdAt: 1 });
  if (!lecture) {
    return res.status(404).json({ message: "No demo lecture available for this course" });
  }
  res.json({ lecture });
});
