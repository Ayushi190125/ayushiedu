import TryCatch from "../middlewares/TryCatch.js";
import { Courses } from "../models/Courses.js";
import { Lecture } from "../models/Lecture.js";
import { User } from "../models/User.js";
import { Payment } from "../models/Payment.js";
import Razorpay from "razorpay";
import crypto from "crypto";

let instance;
function getRazorpayInstance() {
  if (!instance) {
    instance = new Razorpay({
      key_id: process.env.Razorpay_Key,
      key_secret: process.env.Razorpay_Secret,
    });
  }
  return instance;
}

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

  const options = {
    amount: Number(course.price * 100), // Razorpay expects amount in paise
    currency: "INR",
    receipt: `rcpt_${course._id.toString().slice(-6)}_${Date.now()}`,
  };

  const order = await getRazorpayInstance().orders.create(options);

  res.status(201).json({
    order,
    course,
  });
});

export const paymentVerification = TryCatch(async (req, res) => {
  const { razorpay_order_id, razorpay_payment_id, razorpay_signature } =
    req.body;

  const body = razorpay_order_id + "|" + razorpay_payment_id;

  const expectedSignature = crypto
    .createHmac("sha256", process.env.Razorpay_Secret)
    .update(body.toString())
    .digest("hex");

  const isAuthentic = expectedSignature === razorpay_signature;

  if (isAuthentic) {
    // Store payment record
    await Payment.create({
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
    });

    // Add course to user's subscription
    const user = await User.findById(req.user._id);
    const course = await Courses.findById(req.params.id);

    if (!user.subscription.includes(course._id)) {
      user.subscription.push(course._id);
      await user.save();
    }

    res.status(200).json({
      message: "Course Purchased Successfully",
      paymentId: razorpay_payment_id,
    });
  } else {
    return res.status(400).json({
      message: "Payment verification failed",
    });
  }
});

export const getRazorpayKey = TryCatch(async (req, res) => {
  res.status(200).json({
    key: process.env.Razorpay_Key,
  });
});

export const getDemoLecture = TryCatch(async (req, res) => {
  const lecture = await Lecture.findOne({ course: req.params.id }).sort({ createdAt: 1 });
  if (!lecture) {
    return res.status(404).json({ message: "No demo lecture available for this course" });
  }
  res.json({ lecture });
});
